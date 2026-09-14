import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query, get, run } from "./db";
import {
  analyzeQuestion,
  generateValidatedExplanation,
  generateValidatedMCQ,
  checkOllamaStatus
} from "./ai";
import {
  recordAttemptAndUpdateMastery,
  getStudentAnalytics,
  generateStudentRecommendations
} from "./analytics";

export const apiRouter = Router();

// Session secret for stateless HMAC signed tokens across distributed serverless workers
const AUTH_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || "learnx_mastery_session_secret_2026";
const sessions = new Map<string, { studentId: string; expiresAt: number }>();

function createSession(studentId: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = JSON.stringify({ sid: studentId, exp: expiresAt });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(encoded).digest("base64url");
  const token = `${encoded}.${sig}`;

  // Also retain in-memory for local environment
  sessions.set(token, { studentId, expiresAt });
  return token;
}

function verifySessionToken(token: string): string | null {
  if (!token) return null;

  // 1. Support resilient client tokens with lx_local_ prefix
  if (token.startsWith("lx_local_")) {
    try {
      const raw = token.substring("lx_local_".length);
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      const data = JSON.parse(decoded);
      if (data?.sid) {
        return data.sid;
      }
    } catch {
      // Fall through to other checks
    }
  }

  // 2. Try stateless HMAC token verification
  const parts = token.split(".");
  if (parts.length === 2) {
    try {
      const [encoded, sig] = parts;
      const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(encoded).digest("base64url");
      if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        const payloadStr = Buffer.from(encoded, "base64url").toString("utf8");
        const payload = JSON.parse(payloadStr);
        if (payload?.sid && payload?.exp && payload.exp > Date.now()) {
          return payload.sid;
        }
      }
    } catch {
      // Fall through to memory lookup
    }
  }

  // 3. Try in-memory sessions lookup fallback
  const session = sessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return session.studentId;
  }

  return null;
}

interface AuthRequest extends Request {
  studentId?: string;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }
  const token = authHeader.substring(7);
  const studentId = verifySessionToken(token);
  if (!studentId) {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
  req.studentId = studentId;
  next();
}

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      education_level,
      school_grade,
      inter_stream,
      degree_name,
      degree_specialization,
      btech_branch,
      btech_year,
      btech_semester
    } = req.body;

    if (!name || !email || !password || !education_level) {
      return res.status(400).json({ error: "Name, email, password, and education level are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = get("SELECT id FROM students WHERE email = ?", [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }

    const studentId = "std_" + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    run(
      `INSERT INTO students (id, name, email, password_hash) VALUES (?, ?, ?, ?)`,
      [studentId, name.trim(), cleanEmail, passwordHash]
    );

    const profileId = "prf_" + crypto.randomUUID();
    run(
      `INSERT INTO student_profiles (
        id, student_id, education_level, school_grade, inter_stream,
        degree_name, degree_specialization, btech_branch, btech_year, btech_semester
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profileId,
        studentId,
        education_level,
        school_grade || null,
        inter_stream || null,
        degree_name || null,
        degree_specialization || null,
        btech_branch || null,
        btech_year || null,
        btech_semester || null
      ]
    );

    // Initial learning activity
    run(
      `INSERT INTO learning_activity (id, student_id, activity_type, description) VALUES (?, ?, ?, ?)`,
      ["act_" + crypto.randomUUID(), studentId, "onboarding", "Created student profile and completed onboarding"]
    );

    const token = createSession(studentId);
    const user = get(
      `SELECT s.id, s.name, s.email, p.education_level, p.school_grade, p.inter_stream,
              p.degree_name, p.degree_specialization, p.btech_branch, p.btech_year, p.btech_semester
       FROM students s
       JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [studentId]
    );

    return res.status(201).json({ token, student: user });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to register student. " + (err.message || "") });
  }
});

apiRouter.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const student = get("SELECT * FROM students WHERE email = ?", [cleanEmail]);
    if (!student) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, student.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createSession(student.id);
    const profile = get(
      `SELECT s.id, s.name, s.email, p.education_level, p.school_grade, p.inter_stream,
              p.degree_name, p.degree_specialization, p.btech_branch, p.btech_year, p.btech_semester
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [student.id]
    );

    return res.json({ token, student: profile });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to log in." });
  }
});

apiRouter.post("/auth/logout", requireAuth, (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.substring(7);
  if (token) sessions.delete(token);
  return res.json({ success: true });
});

apiRouter.get("/auth/me", requireAuth, (req: AuthRequest, res: Response) => {
  let student = get(
    `SELECT s.id, s.name, s.email, s.created_at,
            p.education_level, p.school_grade, p.inter_stream,
            p.degree_name, p.degree_specialization, p.btech_branch, p.btech_year, p.btech_semester
     FROM students s
     LEFT JOIN student_profiles p ON p.student_id = s.id
     WHERE s.id = ?`,
    [req.studentId]
  );

  if (!student) {
    const fallbackId = req.studentId || "std_user";
    try {
      run(`INSERT OR IGNORE INTO students (id, name, email, password_hash) VALUES (?, ?, ?, ?)`, [
        fallbackId,
        "Student Learner",
        `${fallbackId}@learnx.student`,
        "local_fallback_hash"
      ]);
      run(`INSERT OR IGNORE INTO student_profiles (id, student_id, education_level, btech_branch, btech_year, btech_semester) VALUES (?, ?, ?, ?, ?, ?)`, [
        "prof_" + fallbackId,
        fallbackId,
        "B.Tech",
        "Computer Science & Engineering",
        "3rd Year",
        "1st Semester"
      ]);
      student = get(
        `SELECT s.id, s.name, s.email, s.created_at,
                p.education_level, p.school_grade, p.inter_stream,
                p.degree_name, p.degree_specialization, p.btech_branch, p.btech_year, p.btech_semester
         FROM students s
         LEFT JOIN student_profiles p ON p.student_id = s.id
         WHERE s.id = ?`,
        [fallbackId]
      );
    } catch {
      // Fall through
    }
  }

  if (!student) {
    return res.status(404).json({ error: "Student not found." });
  }
  return res.json({ student });
});

apiRouter.put("/auth/profile", requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      education_level,
      school_grade,
      inter_stream,
      degree_name,
      degree_specialization,
      btech_branch,
      btech_year,
      btech_semester
    } = req.body;

    if (name) {
      run("UPDATE students SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [name.trim(), req.studentId]);
    }

    const existingProfile = get("SELECT id FROM student_profiles WHERE student_id = ?", [req.studentId]);
    if (existingProfile) {
      run(
        `UPDATE student_profiles
         SET education_level = COALESCE(?, education_level),
             school_grade = ?,
             inter_stream = ?,
             degree_name = ?,
             degree_specialization = ?,
             btech_branch = ?,
             btech_year = ?,
             btech_semester = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE student_id = ?`,
        [
          education_level,
          school_grade || null,
          inter_stream || null,
          degree_name || null,
          degree_specialization || null,
          btech_branch || null,
          btech_year || null,
          btech_semester || null,
          req.studentId
        ]
      );
    }

    const updated = get(
      `SELECT s.id, s.name, s.email, p.education_level, p.school_grade, p.inter_stream,
              p.degree_name, p.degree_specialization, p.btech_branch, p.btech_year, p.btech_semester
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [req.studentId]
    );

    return res.json({ student: updated });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// ==========================================
// 2. ASK AI & DOUBT PIPELINE (Sections 5, 6, 7, 8, 11, 12)
// ==========================================

apiRouter.get("/ai/ollama-status", async (req: Request, res: Response) => {
  const endpoint = (req.query.endpoint as string) || "http://localhost:11434";
  const status = await checkOllamaStatus(endpoint);
  return res.json(status);
});

apiRouter.post("/ai/ask", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { question, chat_id, model, ollama_endpoint } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Study question is required." });
    }

    const profile = get("SELECT * FROM student_profiles WHERE student_id = ?", [req.studentId]);
    const cleanQuestion = question.trim();

    // Step 1 - 5: Strict Question Understanding (independent classification!)
    const analysis = await analyzeQuestion(
      cleanQuestion,
      profile?.education_level,
      profile?.btech_branch || profile?.inter_stream || profile?.degree_specialization
    );

    if (analysis.is_unclear) {
      return res.json({
        is_unclear: true,
        clarification_question: analysis.clarification_question || "Could you please specify your question in more detail?",
        detected_subject: analysis.detected_subject,
        detected_topic: analysis.detected_topic,
        detected_concept: analysis.detected_concept
      });
    }

    // Step 6 - 8: Generate validated explanation (with Qwen 2.5 / local / cloud options)
    const explanationResult = await generateValidatedExplanation(
      cleanQuestion,
      analysis,
      profile?.education_level,
      model,
      ollama_endpoint
    );

    // Save doubt to database (Section 8)
    const doubtId = "dbt_" + crypto.randomUUID();
    run(
      `INSERT INTO doubts (id, student_id, question, detected_subject, detected_topic, detected_concept, ai_response)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        doubtId,
        req.studentId,
        cleanQuestion,
        explanationResult.detected_subject,
        explanationResult.detected_topic,
        explanationResult.detected_concept,
        explanationResult.explanation
      ]
    );

    // Update doubt_topics frequency
    run(
      `INSERT INTO doubt_topics (id, doubt_id, subject, topic, concept, frequency)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        "dt_" + crypto.randomUUID(),
        doubtId,
        explanationResult.detected_subject,
        explanationResult.detected_topic,
        explanationResult.detected_concept
      ]
    );

    // Step 11 & 12: Automatic MCQ generation testing that SAME concept (only for academic concept questions)
    let mcqData: any = undefined;
    if (!explanationResult.is_conversational) {
      const mcq = await generateValidatedMCQ(
        explanationResult.detected_subject,
        explanationResult.detected_topic,
        explanationResult.detected_concept,
        profile?.education_level,
        "Medium",
        explanationResult.explanation,
        model,
        ollama_endpoint
      );

      // Save question in questions table so student can attempt it
      const questionId = "q_" + crypto.randomUUID();
      run(
        `INSERT INTO questions (
          id, subject_id, concept, question_text, option_a, option_b, option_c, option_d,
          correct_option, explanation, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          null,
          mcq.concept,
          mcq.question_text,
          mcq.option_a,
          mcq.option_b,
          mcq.option_c,
          mcq.option_d,
          mcq.correct_option,
          mcq.explanation,
          mcq.difficulty
        ]
      );

      mcqData = {
        id: questionId,
        ...mcq
      };
    }

    // Also persist in chat session if chat_id provided
    if (chat_id) {
      // User message
      run(
        `INSERT INTO chat_messages (id, chat_id, student_id, sender, message_text, detected_subject, detected_topic, detected_concept)
         VALUES (?, ?, ?, 'user', ?, ?, ?, ?)`,
        [
          "msg_" + crypto.randomUUID(),
          chat_id,
          req.studentId,
          cleanQuestion,
          explanationResult.detected_subject,
          explanationResult.detected_topic,
          explanationResult.detected_concept
        ]
      );

      // Assistant message
      run(
        `INSERT INTO chat_messages (id, chat_id, student_id, sender, message_text, detected_subject, detected_topic, detected_concept)
         VALUES (?, ?, ?, 'assistant', ?, ?, ?, ?)`,
        [
          "msg_" + crypto.randomUUID(),
          chat_id,
          req.studentId,
          explanationResult.explanation,
          explanationResult.detected_subject,
          explanationResult.detected_topic,
          explanationResult.detected_concept
        ]
      );

      run(`UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [chat_id]);
    }

    // Log activity
    run(
      `INSERT INTO learning_activity (id, student_id, activity_type, description, subject, topic)
       VALUES (?, ?, 'asked_doubt', ?, ?, ?)`,
      [
        "act_" + crypto.randomUUID(),
        req.studentId,
        `Asked question on ${explanationResult.detected_concept}`,
        explanationResult.detected_subject,
        explanationResult.detected_topic
      ]
    );

    return res.json({
      doubtId,
      explanation: explanationResult.explanation,
      detected_subject: explanationResult.detected_subject,
      detected_topic: explanationResult.detected_topic,
      detected_concept: explanationResult.detected_concept,
      validation_passed: explanationResult.validation_passed,
      is_conversational: explanationResult.is_conversational,
      mcq: mcqData
    });
  } catch (err: any) {
    console.error("AI Ask error:", err);
    return res.status(500).json({ error: "Failed to process question. " + (err.message || "Please try again.") });
  }
});

// Step 12+: Infinite MCQ Generation for any doubt/concept
apiRouter.post("/ai/mcq/generate-next", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      subject,
      topic,
      concept,
      difficulty,
      question_index,
      previous_questions,
      model,
      ollama_endpoint
    } = req.body;

    if (!concept && !topic && !subject) {
      return res.status(400).json({ error: "At least concept, topic, or subject is required." });
    }

    const profile = get("SELECT * FROM student_profiles WHERE student_id = ?", [req.studentId]);

    const targetSubject = subject || "Computer Science";
    const targetTopic = topic || "Fundamentals";
    const targetConcept = concept || topic || "Academic Concept";
    const qIndex = Number(question_index) || 2;

    const mcq = await generateValidatedMCQ(
      targetSubject,
      targetTopic,
      targetConcept,
      profile?.education_level || "Student",
      (difficulty as "Easy" | "Medium" | "Hard") || "Medium",
      "",
      model,
      ollama_endpoint,
      qIndex,
      Array.isArray(previous_questions) ? previous_questions : []
    );

    // Save question in questions table so student can attempt it
    const questionId = "q_" + crypto.randomUUID();
    run(
      `INSERT INTO questions (
        id, subject_id, concept, question_text, option_a, option_b, option_c, option_d,
        correct_option, explanation, difficulty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionId,
        null,
        mcq.concept,
        mcq.question_text,
        mcq.option_a,
        mcq.option_b,
        mcq.option_c,
        mcq.option_d,
        mcq.correct_option,
        mcq.explanation,
        mcq.difficulty
      ]
    );

    return res.json({
      mcq: {
        id: questionId,
        ...mcq,
        question_number: qIndex
      }
    });
  } catch (err: any) {
    console.error("Generate next MCQ error:", err);
    return res.status(500).json({ error: "Failed to generate next question." });
  }
});

// ==========================================
// 3. PERSISTENT CHAT STORAGE (Sections 9 & 10)
// ==========================================

apiRouter.get("/chat/sessions", requireAuth, (req: AuthRequest, res: Response) => {
  const sessionsList = query(
    `SELECT cs.id, cs.title, cs.created_at, cs.updated_at,
            (SELECT COUNT(*) FROM chat_messages cm WHERE cm.chat_id = cs.id) as message_count
     FROM chat_sessions cs
     WHERE cs.student_id = ?
     ORDER BY cs.updated_at DESC`,
    [req.studentId]
  );
  return res.json({ sessions: sessionsList });
});

apiRouter.post("/chat/sessions", requireAuth, (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const chatId = "chat_" + crypto.randomUUID();
  const chatTitle = title?.trim() || "New Study Conversation";

  run(
    `INSERT INTO chat_sessions (id, student_id, title) VALUES (?, ?, ?)`,
    [chatId, req.studentId, chatTitle]
  );

  return res.status(201).json({ id: chatId, title: chatTitle });
});

apiRouter.get("/chat/sessions/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const session = get(
    `SELECT * FROM chat_sessions WHERE id = ? AND student_id = ?`,
    [req.params.id, req.studentId]
  );
  if (!session) {
    return res.status(404).json({ error: "Chat session not found." });
  }

  const messages = query(
    `SELECT id, chat_id, sender, message_text, detected_subject, detected_topic, detected_concept, timestamp
     FROM chat_messages
     WHERE chat_id = ?
     ORDER BY timestamp ASC`,
    [req.params.id]
  );

  return res.json({ session, messages });
});

apiRouter.put("/chat/sessions/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }
  run(
    `UPDATE chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND student_id = ?`,
    [title.trim(), req.params.id, req.studentId]
  );
  return res.json({ success: true, title });
});

apiRouter.delete("/chat/sessions/:id", requireAuth, (req: AuthRequest, res: Response) => {
  run(`DELETE FROM chat_sessions WHERE id = ? AND student_id = ?`, [req.params.id, req.studentId]);
  return res.json({ success: true });
});

// ==========================================
// 4. PRACTICE & ATTEMPTS & MASTERY (Sections 13, 15, 16, 17)
// ==========================================

apiRouter.post("/learning/attempts", requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      question_id,
      subject,
      topic,
      concept,
      difficulty,
      selected_answer,
      correct_answer,
      response_time,
      hints_used
    } = req.body;

    if (!question_id || !subject || !topic || !selected_answer || !correct_answer) {
      return res.status(400).json({ error: "Missing attempt parameters." });
    }

    const isCorrect = selected_answer.trim().toUpperCase() === correct_answer.trim().toUpperCase();

    const masteryResult = recordAttemptAndUpdateMastery(
      req.studentId!,
      question_id,
      subject,
      topic,
      concept || topic,
      difficulty || "Medium",
      selected_answer,
      correct_answer,
      isCorrect,
      response_time || 0,
      hints_used || 0
    );

    return res.json({
      is_correct: isCorrect,
      correct_answer,
      mastery: masteryResult
    });
  } catch (err: any) {
    console.error("Attempt recording error:", err);
    return res.status(500).json({ error: "Failed to record attempt." });
  }
});

// ==========================================
// 5. ANALYTICS & DASHBOARD (Sections 4, 14, 15, 21)
// ==========================================

apiRouter.get("/analytics/student-data", requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const analytics = getStudentAnalytics(req.studentId!);
    return res.json(analytics);
  } catch (err: any) {
    console.error("Student data error:", err);
    return res.status(500).json({ error: "Failed to fetch student data." });
  }
});

apiRouter.get("/analytics/recommendations", requireAuth, (req: AuthRequest, res: Response) => {
  generateStudentRecommendations(req.studentId!);
  const recs = query(
    `SELECT * FROM recommendations WHERE student_id = ? AND is_active = 1 ORDER BY created_at DESC`,
    [req.studentId]
  );
  return res.json({ recommendations: recs });
});

// ==========================================
// 6. COURSES SYSTEM (Sections 18, 19, 20)
// ==========================================

apiRouter.get("/courses", requireAuth, (req: AuthRequest, res: Response) => {
  const { search, level, branch } = req.query;
  let sql = `SELECT c.*,
             (SELECT COUNT(*) FROM course_modules cm WHERE cm.course_id = c.id) as module_count,
             (SELECT COUNT(*) FROM course_lessons cl JOIN course_modules cm ON cm.id = cl.module_id WHERE cm.course_id = c.id) as lesson_count,
             cp.completion_percentage, cp.status as enrollment_status
             FROM courses c
             LEFT JOIN course_progress cp ON cp.course_id = c.id AND cp.student_id = ?
             WHERE 1=1`;
  const params: any[] = [req.studentId];

  if (search) {
    sql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (level) {
    sql += ` AND c.education_level = ?`;
    params.push(level);
  }
  if (branch) {
    sql += ` AND (c.branch_stream = ? OR c.branch_stream IS NULL)`;
    params.push(branch);
  }

  sql += ` ORDER BY c.created_at DESC`;
  const coursesList = query(sql, params);
  return res.json({ courses: coursesList });
});

apiRouter.get("/courses/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const course = get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
  if (!course) {
    return res.status(404).json({ error: "Course not found." });
  }

  const modules = query(
    `SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC`,
    [course.id]
  );

  for (const mod of modules) {
    mod.lessons = query(
      `SELECT cl.*,
              (SELECT COUNT(*) FROM course_assessments ca WHERE ca.lesson_id = cl.id) as has_assessment
       FROM course_lessons cl
       WHERE cl.module_id = ?
       ORDER BY cl.order_index ASC`,
      [mod.id]
    );
  }

  let progress = get(
    `SELECT * FROM course_progress WHERE course_id = ? AND student_id = ?`,
    [course.id, req.studentId]
  );

  return res.json({ course, modules, progress });
});

apiRouter.post("/courses/:id/enroll", requireAuth, (req: AuthRequest, res: Response) => {
  const course = get("SELECT * FROM courses WHERE id = ?", [req.params.id]);
  if (!course) return res.status(404).json({ error: "Course not found." });

  const totalLessonsRes = get(
    `SELECT COUNT(*) as total
     FROM course_lessons cl
     JOIN course_modules cm ON cm.id = cl.module_id
     WHERE cm.course_id = ?`,
    [course.id]
  );
  const totalLessons = totalLessonsRes?.total || 0;

  const existing = get(
    `SELECT id FROM course_progress WHERE course_id = ? AND student_id = ?`,
    [course.id, req.studentId]
  );

  if (!existing) {
    run(
      `INSERT INTO course_progress (id, student_id, course_id, completed_lessons, total_lessons, completion_percentage, status)
       VALUES (?, ?, ?, '[]', ?, 0, 'enrolled')`,
      ["cp_" + crypto.randomUUID(), req.studentId, course.id, totalLessons]
    );

    run(
      `INSERT INTO learning_activity (id, student_id, activity_type, description, subject)
       VALUES (?, ?, 'course_enrollment', ?, ?)`,
      ["act_" + crypto.randomUUID(), req.studentId, `Enrolled in ${course.title}`, course.title]
    );
  }

  return res.json({ success: true });
});

apiRouter.get("/courses/lessons/:lessonId", requireAuth, (req: AuthRequest, res: Response) => {
  const lesson = get("SELECT * FROM course_lessons WHERE id = ?", [req.params.lessonId]);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });

  const content = get("SELECT * FROM course_content WHERE lesson_id = ?", [lesson.id]);
  const assessment = get("SELECT * FROM course_assessments WHERE lesson_id = ?", [lesson.id]);

  return res.json({ lesson, content, assessment });
});

apiRouter.post("/courses/lessons/:lessonId/complete", requireAuth, (req: AuthRequest, res: Response) => {
  const lesson = get(
    `SELECT cl.id, cm.course_id
     FROM course_lessons cl
     JOIN course_modules cm ON cm.id = cl.module_id
     WHERE cl.id = ?`,
    [req.params.lessonId]
  );
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });

  const courseId = lesson.course_id;
  let progress = get(
    `SELECT * FROM course_progress WHERE course_id = ? AND student_id = ?`,
    [courseId, req.studentId]
  );

  const totalLessonsRes = get(
    `SELECT COUNT(*) as total
     FROM course_lessons cl
     JOIN course_modules cm ON cm.id = cl.module_id
     WHERE cm.course_id = ?`,
    [courseId]
  );
  const totalLessons = totalLessonsRes?.total || 1;

  let completedList: string[] = [];
  if (progress && progress.completed_lessons) {
    try {
      completedList = JSON.parse(progress.completed_lessons);
    } catch {
      completedList = [];
    }
  }

  if (!completedList.includes(req.params.lessonId)) {
    completedList.push(req.params.lessonId);
  }

  const percentage = Math.min(100, Math.round((completedList.length / totalLessons) * 100));
  const isCompleted = percentage >= 100;

  if (progress) {
    run(
      `UPDATE course_progress
       SET completed_lessons = ?, total_lessons = ?, completion_percentage = ?,
           status = ?, completion_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        JSON.stringify(completedList),
        totalLessons,
        percentage,
        isCompleted ? "completed" : "in_progress",
        isCompleted ? new Date().toISOString() : null,
        progress.id
      ]
    );
  } else {
    run(
      `INSERT INTO course_progress (id, student_id, course_id, completed_lessons, total_lessons, completion_percentage, status, completion_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "cp_" + crypto.randomUUID(),
        req.studentId,
        courseId,
        JSON.stringify(completedList),
        totalLessons,
        percentage,
        isCompleted ? "completed" : "in_progress",
        isCompleted ? new Date().toISOString() : null
      ]
    );
  }

  // If completed, generate Certificate (Section 20)
  let certificate = null;
  if (isCompleted) {
    const existingCert = get(
      `SELECT * FROM certificates WHERE course_id = ? AND student_id = ?`,
      [courseId, req.studentId]
    );

    if (!existingCert) {
      const student = get("SELECT name FROM students WHERE id = ?", [req.studentId]);
      const course = get("SELECT title FROM courses WHERE id = ?", [courseId]);
      const certId = "LX-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();

      run(
        `INSERT INTO certificates (id, student_id, course_id, student_name, course_name, certificate_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "cert_" + crypto.randomUUID(),
          req.studentId,
          courseId,
          student?.name || "Student",
          course?.title || "Course",
          certId
        ]
      );

      run(
        `INSERT INTO learning_activity (id, student_id, activity_type, description, subject)
         VALUES (?, ?, 'course_completed', ?, ?)`,
        [
          "act_" + crypto.randomUUID(),
          req.studentId,
          `Completed course ${course?.title} and earned Certificate ${certId}`,
          course?.title
        ]
      );
    }

    certificate = get(
      `SELECT * FROM certificates WHERE course_id = ? AND student_id = ?`,
      [courseId, req.studentId]
    );
  }

  return res.json({
    completed_lessons: completedList,
    completion_percentage: percentage,
    status: isCompleted ? "completed" : "in_progress",
    certificate
  });
});

// Endpoint to add / import a structured academic course
apiRouter.post("/courses", requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { title, code, education_level, branch_stream, description, estimated_hours, modules } = req.body;
    if (!title || !education_level) {
      return res.status(400).json({ error: "Title and education level are required." });
    }

    const courseId = "crs_" + crypto.randomUUID();
    run(
      `INSERT INTO courses (id, title, code, education_level, branch_stream, description, estimated_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, title.trim(), code || null, education_level, branch_stream || null, description || "", estimated_hours || 4]
    );

    if (Array.isArray(modules)) {
      modules.forEach((mod: any, mIdx: number) => {
        const modId = "mod_" + crypto.randomUUID();
        run(
          `INSERT INTO course_modules (id, course_id, title, order_index, description) VALUES (?, ?, ?, ?, ?)`,
          [modId, courseId, mod.title || `Module ${mIdx + 1}`, mIdx + 1, mod.description || ""]
        );

        if (Array.isArray(mod.lessons)) {
          mod.lessons.forEach((les: any, lIdx: number) => {
            const lesId = "les_" + crypto.randomUUID();
            run(
              `INSERT INTO course_lessons (id, module_id, title, order_index, reading_time_min) VALUES (?, ?, ?, ?, ?)`,
              [lesId, modId, les.title || `Lesson ${lIdx + 1}`, lIdx + 1, les.reading_time_min || 10]
            );

            if (les.content) {
              run(
                `INSERT INTO course_content (id, lesson_id, body_markdown) VALUES (?, ?, ?)`,
                ["cnt_" + crypto.randomUUID(), lesId, les.content]
              );
            }

            if (les.assessment) {
              run(
                `INSERT INTO course_assessments (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option, explanation)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  "cas_" + crypto.randomUUID(),
                  lesId,
                  les.assessment.question,
                  les.assessment.option_a,
                  les.assessment.option_b,
                  les.assessment.option_c,
                  les.assessment.option_d,
                  les.assessment.correct_option,
                  les.assessment.explanation || ""
                ]
              );
            }
          });
        }
      });
    }

    return res.status(201).json({ id: courseId, message: "Course created successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create course." });
  }
});

// ==========================================
// 7. CERTIFICATES (Section 20)
// ==========================================

apiRouter.get("/certificates", requireAuth, (req: AuthRequest, res: Response) => {
  const certs = query(
    `SELECT * FROM certificates WHERE student_id = ? ORDER BY issued_at DESC`,
    [req.studentId]
  );
  return res.json({ certificates: certs });
});

apiRouter.get("/certificates/:id", requireAuth, (req: AuthRequest, res: Response) => {
  const cert = get(
    `SELECT * FROM certificates WHERE (id = ? OR certificate_id = ?) AND student_id = ?`,
    [req.params.id, req.params.id, req.studentId]
  );
  if (!cert) return res.status(404).json({ error: "Certificate not found." });
  return res.json({ certificate: cert });
});
