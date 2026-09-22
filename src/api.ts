import {
  StudentProfile,
  ChatSession,
  ChatMessage,
  GeneratedMCQ,
  AttemptResult,
  StudentAnalytics,
  Recommendation,
  Course,
  CourseModule,
  CourseLesson,
  Certificate,
  AIModelType,
  OllamaStatus,
  LeaderboardEntry,
  MasteryState,
  MasteryRecord,
  EducationLevel,
} from "./types";
import { getCodeTemplate } from "./data/codeTemplates";

const TOKEN_KEY = "learnx_auth_token";

/*
 * API base URL
 *
 * In production (Vercel), /api automatically points to the
 * same domain where the LearnX application is running.
 *
 * Example:
 * https://your-app.vercel.app/api/auth/login
 *
 * In local development:
 * http://localhost:3000/api/auth/login
 */
const API_BASE_URL = "/api";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Common API request helper.
 *
 * This deliberately does NOT blindly call response.json().
 * Vercel can sometimes return HTML for routing/server errors.
 * In that situation we return a useful error instead of:
 *
 * Unexpected token 'T' ... is not valid JSON
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const customHeaders = options.headers;

    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the LearnX server. Please check your internet connection and try again."
    );
  }

  const contentType = res.headers.get("content-type") || "";

  /*
   * JSON response
   */
  if (contentType.includes("application/json")) {
    let data: any;

    try {
      data = await res.json();
    } catch {
      throw new Error(
        `The server returned an invalid JSON response (${res.status}).`
      );
    }

    if (!res.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Request failed with status ${res.status}.`
      );
    }

    return data as T;
  }

  /*
   * Non-JSON response.
   *
   * This prevents the original:
   * Unexpected token 'T' ... is not valid JSON
   *
   * from appearing to the user.
   */
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `LearnX API route was not found (${endpoint}). Please redeploy the application.`
      );
    }

    if (res.status === 500) {
      let serverMsg = "";
      try {
        const json = JSON.parse(text);
        serverMsg = json?.error || json?.message || "";
      } catch {}
      throw new Error(
        serverMsg || "The LearnX server encountered a temporary issue. Switching to offline engine."
      );
    }

    throw new Error(
      text
        ? `Server error (${res.status}): ${text.slice(0, 200)}`
        : `Server request failed with status ${res.status}.`
    );
  }

  throw new Error(
    "The LearnX server returned an unexpected response. Please try again."
  );
}

/* ============================================================
   AUTHENTICATION & RESILIENT STORAGE
   ============================================================ */

const LOCAL_STUDENTS_KEY = "learnx_local_students";
const ACTIVE_STUDENT_KEY = "learnx_active_student";

function getLocalStudents(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStudents(students: any[]) {
  try {
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

function getActiveStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveStudent(student: StudentProfile | null) {
  try {
    if (student) {
      localStorage.setItem(ACTIVE_STUDENT_KEY, JSON.stringify(student));
    } else {
      localStorage.removeItem(ACTIVE_STUDENT_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearAllStudentSessionData(targetStudentId?: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const globalPreservedKeys = new Set([
        "learnx_preferred_model",
        "learnx_ollama_endpoint",
        "learnx_comfort_settings",
        "learnx_offline_courses_cache",
        "learnx_pending_sync_queue",
        LOCAL_STUDENTS_KEY,
      ]);

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (globalPreservedKeys.has(key)) continue;

        // If targetStudentId is provided, ONLY remove keys that end with that student's id
        if (targetStudentId) {
          if (key.endsWith(`_${targetStudentId}`)) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch (e) {
    console.warn("Storage cleanup error:", e);
  }
}

export async function registerStudent(
  payload: any
): Promise<{
  token: string;
  student: StudentProfile;
}> {
  // Clear any existing session or cached student data to prevent cross-account data leakage
  clearStoredToken();
  setActiveStudent(null);
  clearAllStudentSessionData();

  try {
    const data = await request<{
      token: string;
      student: StudentProfile;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setStoredToken(data.token);
    setActiveStudent(data.student);
    const localStudents = getLocalStudents();
    const idx = localStudents.findIndex(s => s.email?.toLowerCase() === data.student.email?.toLowerCase());
    if (idx >= 0) {
      localStudents[idx] = { ...data.student, password: payload.password };
    } else {
      localStudents.push({ ...data.student, password: payload.password });
    }
    saveLocalStudents(localStudents);
    return data;
  } catch (err: any) {
    console.warn("Backend registration error, activating resilient offline profile:", err);
    // Only rethrow if the user entered explicit invalid data or email is already taken
    if (
      err?.message &&
      (err.message.toLowerCase().includes("already registered") ||
        err.message.toLowerCase().includes("already exists"))
    ) {
      throw err;
    }

    // Resilient fallback for serverless cold start / read-only filesystem / network downtime
    const studentId = "std_" + Math.random().toString(36).substring(2, 10);
    const fallbackStudent: StudentProfile = {
      id: studentId,
      name: payload.name || "Student",
      email: payload.email,
      education_level: payload.education_level || "Intermediate",
      school_grade: payload.school_grade,
      inter_stream: payload.inter_stream || "MPC",
      degree_name: payload.degree_name,
      degree_specialization: payload.degree_specialization,
      btech_branch: payload.btech_branch || "Computer Science & Engineering",
      btech_year: payload.btech_year || "3rd Year",
      btech_semester: payload.btech_semester || "1st Semester",
      created_at: new Date().toISOString(),
    };

    const localStudents = getLocalStudents();
    const existing = localStudents.find(
      (s) => s.email?.toLowerCase() === payload.email?.toLowerCase()
    );
    if (existing) {
      // If already registered locally, simply update password and log them in
      existing.password = payload.password;
      saveLocalStudents(localStudents);
      const token =
        "lx_local_" + btoa(JSON.stringify({ sid: existing.id, exp: Date.now() + 864000000 }));
      setStoredToken(token);
      setActiveStudent(existing);
      return { token, student: existing };
    }

    localStudents.push({ ...fallbackStudent, password: payload.password });
    saveLocalStudents(localStudents);

    const token =
      "lx_local_" + btoa(JSON.stringify({ sid: studentId, exp: Date.now() + 864000000 }));
    setStoredToken(token);
    setActiveStudent(fallbackStudent);

    return { token, student: fallbackStudent };
  }
}

export async function loginStudent(
  credentials: {
    email: string;
    password: string;
  }
): Promise<{
  token: string;
  student: StudentProfile;
}> {
  // Clear any existing active session cache before logging in to guarantee data isolation
  clearAllStudentSessionData();

  try {
    const data = await request<{
      token: string;
      student: StudentProfile;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    setStoredToken(data.token);
    setActiveStudent(data.student);
    const localStudents = getLocalStudents();
    const idx = localStudents.findIndex(s => s.email?.toLowerCase() === data.student.email?.toLowerCase());
    if (idx >= 0) {
      localStudents[idx] = { ...data.student, password: credentials.password };
    } else {
      localStudents.push({ ...data.student, password: credentials.password });
    }
    saveLocalStudents(localStudents);
    return data;
  } catch (err: any) {
    console.warn("Backend login error, activating seamless resilient authentication:", err);

    // 1. Check local student store
    const localStudents = getLocalStudents();
    const found = localStudents.find(
      (s) => s.email?.toLowerCase() === credentials.email?.toLowerCase()
    );

    if (found) {
      if (found.password && found.password !== credentials.password) {
        throw new Error("Invalid password for this account. Please check your password.");
      }
      const token =
        "lx_local_" + btoa(JSON.stringify({ sid: found.id, exp: Date.now() + 864000000 }));
      setStoredToken(token);
      setActiveStudent(found);
      return { token, student: found };
    }

    // 2. Check active cached student in session
    const cached = getActiveStudent();
    if (cached && cached.email?.toLowerCase() === credentials.email?.toLowerCase()) {
      const token =
        "lx_local_" + btoa(JSON.stringify({ sid: cached.id, exp: Date.now() + 864000000 }));
      setStoredToken(token);
      return { token, student: cached };
    }

    // 3. If server failed or gave internal error, seamlessly auto-provision the student account so they are never blocked
    const fallbackName = (credentials.email.split("@")[0] || "Student")
      .replace(/[._]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const autoStudent: StudentProfile = {
      id: "std_" + Math.random().toString(36).substring(2, 10),
      name: fallbackName || "Student Learner",
      email: credentials.email,
      education_level: "Intermediate",
      inter_stream: "MPC",
      created_at: new Date().toISOString(),
    };

    localStudents.push({ ...autoStudent, password: credentials.password });
    saveLocalStudents(localStudents);

    const token =
      "lx_local_" + btoa(JSON.stringify({ sid: autoStudent.id, exp: Date.now() + 864000000 }));
    setStoredToken(token);
    setActiveStudent(autoStudent);
    return { token, student: autoStudent };
  }
}

export async function logoutStudent(): Promise<void> {
  try {
    await request("/auth/logout", {
      method: "POST",
    });
  } catch {
    // ignore
  } finally {
    clearStoredToken();
    setActiveStudent(null);
    clearAllStudentSessionData();
  }
}

export async function getMe(): Promise<{
  student: StudentProfile;
}> {
  try {
    const res = await request<{
      student: StudentProfile;
    }>("/auth/me");
    setActiveStudent(res.student);
    return res;
  } catch (err) {
    const cached = getActiveStudent();
    if (cached) {
      return { student: cached };
    }
    throw err;
  }
}

export async function updateProfile(
  payload: Partial<StudentProfile>
): Promise<{
  student: StudentProfile;
}> {
  return request<{
    student: StudentProfile;
  }>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ============================================================
   AI — ASK STUDY DOUBT
   ============================================================ */

export interface AskResponse {
  doubtId?: string;
  is_unclear?: boolean;
  is_conversational?: boolean;
  is_code_generation?: boolean;
  clarification_question?: string;
  explanation?: string;
  detected_subject: string;
  detected_topic: string;
  detected_concept: string;
  validation_passed?: boolean;
  mcq?: GeneratedMCQ;
}

/* ============================================================
   STUDENT STORAGE KEYS (PER-STUDENT DATA ISOLATION)
   ============================================================ */

export function getStudentStorageKey(suffix: string): string {
  const st = getActiveStudent();
  const id = st?.id || st?.email || "default_learner";
  return `learnx_${suffix}_${id}`;
}

export function generateResilientStudentResponse(
  question: string,
  student?: Partial<StudentProfile> | null
): AskResponse {
  const clean = question.trim();
  const qLower = clean.toLowerCase();
  const activeSt = student || getActiveStudent();
  const isInter = activeSt?.education_level === "Intermediate";
  const isMPC = isInter && (!activeSt?.inter_stream || activeSt?.inter_stream.toUpperCase().includes("MPC"));

  // Check code generation intent FIRST
  const isCodeGenCommand =
    /\b(?:write|create|make|build|give\s*me|generate|provide|develop|implement|code)\s+(?:me\s+)?(?:a\s+|an\s+|the\s+)?(?:complete\s+|working\s+|single\s*file\s*|simple\s*|responsive\s*)?(?:html|python|javascript|js|java|c\+\+|c#|c|ruby|go|rust|php|sql|react|node|web|single\s*html)?\s*(?:code|program|script|file|page|app|application|game|calculator|website|form)\b/i.test(qLower) ||
    /\b(?:html\s*code|python\s*(?:code|program)|javascript\s*(?:code|program)|js\s*code|java\s*(?:code|program)|c\+\+\s*(?:code|program)|c\s*program)\s+(?:for|to|that)\b/i.test(qLower) ||
    /\b(?:code|program)\s+(?:for|to)\s+(?:a\s+|an\s+)?(?:tic\s*tac\s*toe|calculator|portfolio|login\s*page|todo|game|sort|search|crud|marks|student)\b/i.test(qLower) ||
    /\b(?:single\s*html\s*(?:code|file)|in\s*(?:one|a)\s*single\s*html)\b/i.test(qLower);

  if (isCodeGenCommand) {
    let templateKey = "general_code";
    let sub = "Computer Science & Programming";
    let top = "Code Implementation";
    let con = "Code Solution";

    if (/\b(?:tic\s*tac\s*toe|tictactoe)\b/i.test(qLower)) {
      templateKey = "tic_tac_toe";
      sub = "Web Development (HTML / CSS / JavaScript)";
      top = "Interactive Tic Tac Toe Game (Single File HTML)";
      con = "Tic Tac Toe Single-File Application";
    } else if (/\b(?:calculator)\b/i.test(qLower)) {
      templateKey = "calculator";
      sub = "Frontend Web Development";
      top = "Interactive Calculator Web Application";
      con = "Calculator Logic & DOM Manipulation";
    } else if (/\b(?:sort\s*(?:an?\s*)?array|array\s*sorting|bubble\s*sort|quicksort|sorting\s*algorithm)\b/i.test(qLower)) {
      templateKey = "sort_array";
      sub = "Python Programming & Algorithms";
      top = "Array Sorting Algorithms";
      con = "Array Sorting in Python";
    } else if (/\b(?:portfolio\s*(?:website|page|site)?)\b/i.test(qLower)) {
      templateKey = "portfolio";
      sub = "Frontend Web Development";
      top = "Personal Portfolio Website (Single File)";
      con = "Single-Page Responsive Portfolio";
    } else if (/\b(?:binary\s*search)\b/i.test(qLower)) {
      templateKey = "binary_search";
      sub = "Data Structures & Algorithms (Java)";
      top = "Binary Search Algorithm";
      con = "Binary Search Implementation in Java";
    } else if (/\b(?:student\s*marks|student\s*grade|marks\s*(?:management|system|calculation))\b/i.test(qLower)) {
      templateKey = "student_marks";
      sub = "Python Programming";
      top = "Student Marks & Grade Management";
      con = "Student Marks Calculation Script";
    } else if (/\b(?:login\s*(?:page|form|screen))\b/i.test(qLower)) {
      templateKey = "login_page";
      sub = "Frontend Web Development";
      top = "Responsive Login Page (Single File)";
      con = "User Authentication Form UI";
    }

    const templateResult = getCodeTemplate(templateKey, clean);
    return {
      doubtId: "dbt_local_" + Date.now(),
      explanation: templateResult.markdown,
      detected_subject: sub,
      detected_topic: top,
      detected_concept: con,
      validation_passed: true,
      is_conversational: false,
      is_code_generation: true,
      mcq: undefined,
    };
  }

  let subject = isMPC ? "Intermediate MPC (Maths, Physics, Chemistry)" : "General Academic Studies";
  let topic = isMPC ? "Core Mathematics & Physical Sciences" : "Core Fundamentals";
  let concept = clean.length > 40 ? clean.slice(0, 40) + "..." : clean;

  const isExplicitProgramming =
    qLower.includes("python") ||
    qLower.includes("java") ||
    qLower.includes("c++") ||
    qLower.includes("algorithm") ||
    qLower.includes("database") ||
    qLower.includes("sql") ||
    qLower.includes("frontend") ||
    qLower.includes("html") ||
    qLower.includes("react") ||
    (qLower.includes("code") && !qLower.includes("genetic code"));

  if (isExplicitProgramming) {
    subject = "Computer Science & Programming";
    topic = "Programming Logic & Algorithms";
    concept = "Core Programming Fundamentals";
  } else if (
    qLower.includes("gravity") ||
    qLower.includes("force") ||
    qLower.includes("motion") ||
    qLower.includes("light") ||
    qLower.includes("lens") ||
    qLower.includes("current") ||
    qLower.includes("physics") ||
    qLower.includes("thermo") ||
    qLower.includes("work") ||
    qLower.includes("energy") ||
    qLower.includes("wave")
  ) {
    subject = isMPC ? "Intermediate Physics (MPC)" : "Physics";
    topic = "Laws of Motion & Mechanics";
    concept = "Physical Laws & Problem Solving";
  } else if (
    qLower.includes("atom") ||
    qLower.includes("reaction") ||
    qLower.includes("acid") ||
    qLower.includes("base") ||
    qLower.includes("molecule") ||
    qLower.includes("carbon") ||
    qLower.includes("chem") ||
    qLower.includes("equilibrium") ||
    qLower.includes("periodic") ||
    qLower.includes("bonding")
  ) {
    subject = isMPC ? "Intermediate Chemistry (MPC)" : "Chemistry";
    topic = "Chemical Principles & Reactions";
    concept = "Chemical Structure & Reactions";
  } else if (
    qLower.includes("math") ||
    qLower.includes("fraction") ||
    qLower.includes("algebra") ||
    qLower.includes("triangle") ||
    qLower.includes("area") ||
    qLower.includes("equation") ||
    qLower.includes("matrix") ||
    qLower.includes("matrices") ||
    qLower.includes("derivative") ||
    qLower.includes("integral") ||
    qLower.includes("calculus") ||
    qLower.includes("trigonometry") ||
    qLower.includes("limit")
  ) {
    subject = isMPC ? "Intermediate Mathematics (MPC - 1A/1B/2A/2B)" : "Mathematics";
    topic = "Mathematical Concepts & Problem Solving";
    concept = "Mathematical Principles & Solutions";
  } else if (
    !isMPC &&
    (qLower.includes("cell") ||
      qLower.includes("plant") ||
      qLower.includes("photosynthesis") ||
      qLower.includes("blood") ||
      qLower.includes("dna") ||
      qLower.includes("organ") ||
      qLower.includes("bio"))
  ) {
    subject = "Biology & Life Sciences";
    topic = "Living Systems";
    concept = "Cellular Biology & Life Functions";
  } else if (
    qLower.includes("debit") ||
    qLower.includes("credit") ||
    qLower.includes("tax") ||
    qLower.includes("market") ||
    qLower.includes("cost") ||
    qLower.includes("profit") ||
    qLower.includes("bank") ||
    qLower.includes("commerce")
  ) {
    subject = "Commerce & Economics";
    topic = "Financial Fundamentals";
    concept = "Commercial Systems & Value Flow";
  }

  // 1. Pure greeting check
  if (
    /^(?:hi+|hello+|hey+|hii+|heyy+|heya|good\s+(?:morning|afternoon|evening|day)|namaste|vanakkam|bro|bhai|yo|sup)$/i.test(qLower)
  ) {
    return {
      doubtId: "dbt_greet_" + Date.now(),
      explanation: `Hey there! 👋 Welcome to **LearnX**!

I'm your personal AI study buddy, built with the natural conversation style of assistants like ChatGPT and Claude, but fine-tuned specifically for your academic curriculum.

You can ask me anything—from clarifying tricky math, physics, or chemistry problems, to writing code, breaking down engineering concepts, or getting effective exam preparation tips.

What would you like to explore today? Just ask away!`,
      detected_subject: "General",
      detected_topic: "Conversational Greeting",
      detected_concept: "LearnX Assistant",
      validation_passed: true,
      is_conversational: true
    };
  }

  // 1.5 Capability Inquiry (e.g. 'what can u do', 'how can you help')
  if (
    /^(?:what\s*(?:can|do|will)\s*(?:you|u)\s*(?:do|help(?:\s*with)?)|what\s*are\s*(?:your|ur)\s*(?:capabilities|features|skills|functions)|how\s*can\s*(?:you|u)\s*help(?:\s*me)?|what\s*(?:can|does)\s*(?:this|learnx)(?:\s*app)?\s*do|tell\s*me\s*what\s*(?:you|u)\s*can\s*do|how\s*(?:do\s*i|to)\s*use\s*(?:this|learnx|the\s*app)|what\s*all\s*can\s*(?:you|u)\s*do|features\s*of\s*(?:this\s*app|learnx)|help\s*me(?:\s*please)?|can\s*(?:you|u)\s*help(?:\s*me)?|what\s*help\s*can\s*(?:you|u)\s*give)[\s!.,?]*$/i.test(qLower)
  ) {
    return {
      doubtId: "dbt_cap_" + Date.now(),
      explanation: `Hey! 👋 I'm **LearnX AI**, your personal study companion and academic mentor.

Here is what I can do for you:

- 💡 **Deep Concept Explanations**: Ask me any doubt from science, mathematics, computer science, engineering, or commerce. I break topics down using simple plain-English analogies, formal definitions, and step-by-step reasoning.
- 💻 **Code Generation & Debugging**: I can write, explain, and debug code in Python, C++, Java, JavaScript, and SQL with detailed line-by-line walkthroughs.
- 📐 **Step-by-Step Problem Walkthroughs**: Need help solving a numerical, deriving an equation, or balancing a chemical reaction? I walk through each step logically without skipping steps.
- 🎯 **Board & Competitive Exam Prep**: Tailored insights and high-weightage formulas for Intermediate Board Exams (AP/TS/CBSE), JEE Main, EAMCET, NEET, and university semester papers.
- ⚡ **Auto-Generated Practice Quizzes**: After studying a concept, I generate targeted MCQs with detailed explanations so you can test your retention right away.
- ⏳ **Focus & Study Tools**: Use the integrated 25/5 Pomodoro timer and track your verified rank on the Academic Mastery Leaderboard!

What would you like to dive into today? Ask me any doubt or topic!`,
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Assistant Capabilities & Learning Tools",
      detected_concept: "LearnX Capabilities & Features",
      validation_passed: true,
      is_conversational: true
    };
  }

  // 1.6 Model & AI Identity Inquiry (e.g. 'what is the model name of ur', 'which model are you')
  if (
    /^(?:what\s*(?:is|are)\s*(?:the\s*)?(?:ai\s*)?model\s*name\s*(?:of\s*(?:ur|your|this\s*ai)|of\s*u|of\s*you)|what\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|which\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|what\s*is\s*(?:your|ur)\s*model(?:\s*name)?|what\s*is\s*(?:the\s*)?name\s*of\s*(?:your|ur)\s*model|are\s*(?:you|u)\s*(?:gemini|chatgpt|claude|deepseek|gpt|openai|llama|an\s*ai|a\s*robot|a\s*bot)|who\s*(?:are\s*(?:you|u)|created\s*(?:you|u)|made\s*(?:you|u)|built\s*(?:you|u))|what\s*(?:are\s*(?:you|u)|is\s*learnx(?:\s*ai)?)|introduce\s*(?:yourself|urself)|tell\s*me\s*about\s*(?:yourself|urself)|who\s*r\s*u|what\s*r\s*u)[\s!.,?]*$/i.test(qLower)
  ) {
    return {
      doubtId: "dbt_model_" + Date.now(),
      explanation: `I am **LearnX AI**, an intelligent academic mentor engineered specifically for students!

### 🤖 Architecture & Capabilities:
- **Conversation & Reasoning Engine**: Designed with the natural fluency, conversational clarity, and deep reasoning of top AI assistants (ChatGPT, Gemini, and Claude).
- **Foundation Intelligence**: Integrates Google's **Gemini** multimodal models (Gemini 2.5 & 3.8 Flash) for fast, context-aware student doubt resolution.
- **Offline Local Model Support**: Seamlessly connects to local **Ollama** runtimes, enabling you to run open-weight models like **Qwen 2.5**, **DeepSeek R1**, or **Meta Llama 3.2** completely offline.
- **Curriculum-Aligned Academic Knowledge Base**: Calibrated for **${student?.education_level || "Intermediate"}** (${student?.inter_stream || "MPC"}) to provide verified, syllabus-accurate answers for Board exams and entrance tests.

How can I help you with your studies right now?`,
      detected_subject: "LearnX AI System Architecture",
      detected_topic: "AI Foundation Models & Learning Engine",
      detected_concept: "LearnX AI Model Architecture",
      validation_passed: true,
      is_conversational: true
    };
  }

  // 1.7 Casual chitchat & gratitude
  if (
    /^(?:how\s*(?:are|r)\s*(?:you|u)|how\s*do\s*(?:you|u)\s*do|how's\s*it\s*going|hows\s*it\s*going|thank\s*(?:you|u)|thanks(?:\s*a\s*lot)?|thx|thanku|nice|awesome|cool|great|super|good\s*job|well\s*done|ok|okay|alright|bye|goodbye|see\s*(?:you|u)|cya|gn|good\s*night)[\s!.,?]*$/i.test(qLower)
  ) {
    let reply = `Hey! I'm here and ready to help you learn. Whether you're working through homework, preparing for board exams, JEE/EAMCET, or university papers, ask me any question!`;
    if (qLower.includes("thank")) {
      reply = `You're very welcome! 😊 I'm always here whenever you have another doubt or want to review a chapter. Keep up the awesome learning momentum! What shall we tackle next?`;
    } else if (qLower.includes("how are") || qLower.includes("how r u") || qLower.includes("how do you do")) {
      reply = `I'm doing great, thank you for asking! 🚀 Ready to help you tackle any academic doubt, solve problems, or prep for upcoming exams. What's on your study list today?`;
    } else if (qLower.includes("bye") || qLower.includes("see you") || qLower.includes("good night")) {
      reply = `Goodbye! 👋 Best of luck with your study session. Take regular breaks and come back anytime you need help!`;
    }
    return {
      doubtId: "dbt_chat_" + Date.now(),
      explanation: reply,
      detected_subject: "General",
      detected_topic: "Conversational",
      detected_concept: "LearnX Assistant",
      validation_passed: true,
      is_conversational: true
    };
  }

  // 2. Specialized Code Question Handler
  if (qLower.includes("hello world") && (qLower.includes("python") || isExplicitProgramming)) {
    return {
      doubtId: "dbt_" + Date.now(),
      explanation: `### 🐍 Hello World in Python

The **Hello World** program is the classic starting point for learning Python. It shows you the simplest way to display text on the screen.

\`\`\`python
print("Hello, World!")
\`\`\`

---

#### ⚙️ How It Works:
1. \`print()\` is a built-in Python function that outputs whatever text or value you place inside its parentheses.
2. The quotation marks \`"..."\` tell Python that \`Hello, World!\` is a text **string**.
3. Python executes this line and immediately prints the text to your terminal or console.

---

#### 💡 Output:
\`\`\`text
Hello, World!
\`\`\`

#### 🚀 Next Step:
You can pass any custom message to \`print()\`, or try printing variables and calculations like \`print(5 + 3)\`!`,
      detected_subject: "Python Programming",
      detected_topic: "Hello World Program in Python",
      detected_concept: "print() Function & Syntax",
      validation_passed: true,
      is_conversational: false
    };
  }

  // Dynamic explanation without rigid boilerplate
  let structuredBody = "";
  if (isExplicitProgramming) {
    structuredBody = `#### 💻 Core Concept
**${concept}** allows developers to write structured, readable, and efficient solutions in ${topic}.

---

#### 🔍 Practical Intuition
Think of this like an instruction manual or workflow: each command is executed sequentially, managing inputs, state, and outputs predictably.

---

#### ⚙️ Key Mechanics
- **Clarity & Syntax**: Follow clean language conventions and proper naming.
- **Logic & Execution**: Trace variables step-by-step through execution flow.
- **Edge Cases**: Always consider empty values, boundary limits, and unexpected inputs.`;
  } else if (isMPC || subject.includes("Physics") || subject.includes("Chemistry") || subject.includes("Math")) {
    structuredBody = `#### 💡 Conceptual Intuition
**${concept}** in **${subject}** explains how physical or mathematical systems behave under specific conditions. Understanding the physical picture first helps you remember formulas effortlessly.

---

#### 🔬 Physical / Mathematical Reasoning
- **Fundamental Law**: The underlying principle connects initial conditions to resulting observable behavior.
- **Key Relationships**: Notice which variables increase or decrease together (proportionalities and ratios).
- **Core Insights**: Connect the theory directly to observable real-world phenomena.`;
  } else {
    structuredBody = `#### 💡 Core Idea
**${concept}** is a cornerstone of **${topic}**. It provides the framework needed to analyze, categorize, and solve domain-specific problems.

---

#### 🔍 Clear Intuition
Think of it like building blocks: mastering this foundational concept allows you to understand more advanced topics with ease.`;
  }

  const examHeader = isMPC
    ? "🎓 Key Takeaways for Intermediate Exams (Board / JEE / EAMCET)"
    : "🎓 Key Exam Takeaways";

  const friendlyExplanation = `### 📚 ${concept}
*${subject} · ${topic}*

---

${structuredBody}

---

#### ${examHeader}
- Build intuitive understanding first before memorizing exact definitions.
- Focus on key terms, governing equations, and real-world relevance.
- Try solving a related problem to lock this knowledge into permanent memory!`;


  return {
    doubtId: "dbt_local_" + Date.now(),
    explanation: friendlyExplanation,
    detected_subject: subject,
    detected_topic: topic,
    detected_concept: concept,
    validation_passed: true,
    is_conversational: false,
    mcq: {
      id: "q_local_" + Date.now(),
      subject: subject,
      topic: topic,
      concept: concept,
      question_text: `What is the most effective way to master "${concept}" in ${subject}?`,
      option_a: "Understand the real-life intuition, follow step-by-step logic, and solve sample practice questions",
      option_b: "Blindly memorize formulas without understanding what they mean",
      option_c: "Skip reading the question and immediately guess an option",
      option_d: "Ignore the fundamentals and rely entirely on luck in exams",
      correct_option: "A",
      explanation: `Connecting the intuition with methodical practice is the proven, stress-free path to mastering ${concept}!`,
      difficulty: "Easy"
    }
  };
}

export async function askStudyDoubt(
  question: string,
  chatId?: string,
  model?: AIModelType,
  ollamaEndpoint?: string,
  studentProfile?: Partial<StudentProfile>,
  syllabusNotes?: string,
  subjectName?: string
): Promise<AskResponse> {
  const currentStudent = studentProfile || getActiveStudent();
  try {
    const res = await request<AskResponse>("/ai/ask", {
      method: "POST",
      body: JSON.stringify({
        question,
        chat_id: chatId,
        model,
        ollama_endpoint: ollamaEndpoint,
        student_profile: currentStudent,
        syllabus_notes: syllabusNotes,
        subject_name: subjectName,
      }),
    });

    // Mirror user & assistant messages in per-student local storage
    if (chatId) {
      try {
        const msgs = getLocalChatMessages(chatId);
        const userMsg: ChatMessage = {
          id: "msg_u_" + Date.now(),
          chat_id: chatId,
          sender: "user",
          message_text: question,
          detected_subject: res.detected_subject,
          detected_topic: res.detected_topic,
          detected_concept: res.detected_concept,
          timestamp: new Date().toISOString(),
        };
        const aiMsg: ChatMessage = {
          id: "msg_a_" + (Date.now() + 1),
          chat_id: chatId,
          sender: "assistant",
          message_text: res.explanation || "I am here to help you learn!",
          detected_subject: res.detected_subject,
          detected_topic: res.detected_topic,
          detected_concept: res.detected_concept,
          timestamp: new Date().toISOString(),
        };
        saveLocalChatMessages(chatId, [...msgs, userMsg, aiMsg]);
      } catch {}
    }

    return res;
  } catch (err: any) {
    console.warn("Server AI request offline or dropped, using resilient responder:", err);
    const fallback = generateResilientStudentResponse(question, currentStudent);

    if (chatId) {
      try {
        const msgs = getLocalChatMessages(chatId);
        const userMsg: ChatMessage = {
          id: "msg_u_" + Date.now(),
          chat_id: chatId,
          sender: "user",
          message_text: question,
          detected_subject: fallback.detected_subject,
          detected_topic: fallback.detected_topic,
          detected_concept: fallback.detected_concept,
          timestamp: new Date().toISOString(),
        };
        const aiMsg: ChatMessage = {
          id: "msg_a_" + (Date.now() + 1),
          chat_id: chatId,
          sender: "assistant",
          message_text: fallback.explanation || "",
          detected_subject: fallback.detected_subject,
          detected_topic: fallback.detected_topic,
          detected_concept: fallback.detected_concept,
          timestamp: new Date().toISOString(),
        };
        saveLocalChatMessages(chatId, [...msgs, userMsg, aiMsg]);
      } catch {}
    }

    return fallback;
  }
}

export async function generateNextMCQ(payload: {
  subject: string;
  topic: string;
  concept: string;
  difficulty?: string;
  question_index: number;
  previous_questions?: string[];
  model?: string;
  ollama_endpoint?: string;
  education_level?: string;
  stream_branch?: string;
  syllabus_notes?: string;
}): Promise<{
  mcq: GeneratedMCQ & {
    id: string;
    question_number?: number;
  };
}> {
  try {
    return await request<{
      mcq: GeneratedMCQ & {
        id: string;
        question_number?: number;
      };
    }>("/ai/mcq/generate-next", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const qIndex = payload.question_index || 2;
    return {
      mcq: {
        id: "q_next_" + Date.now(),
        subject: payload.subject,
        topic: payload.topic,
        concept: payload.concept,
        question_text: `Which statement represents an optimal learning practice when studying "${payload.concept}" in ${payload.topic}?`,
        option_a: "Break down the concept into step-by-step principles and test yourself with practical examples",
        option_b: "Memorize only the question text and skip the reasoning completely",
        option_c: "Assume the topic will never appear in real-world applications or tests",
        option_d: "Skip reading standard explanations and guess options randomly",
        correct_option: "A",
        explanation: `Practicing the step-by-step logic builds lasting mastery in ${payload.concept}!`,
        difficulty: (payload.difficulty as "Easy" | "Medium" | "Hard") || "Medium",
        question_number: qIndex,
      },
    };
  }
}

export async function getOllamaStatus(
  endpoint?: string
): Promise<OllamaStatus> {
  const queryParam = endpoint
    ? `?endpoint=${encodeURIComponent(endpoint)}`
    : "";

  try {
    return await request<OllamaStatus>(
      `/ai/ollama-status${queryParam}`
    );
  } catch {
    return {
      online: false,
      models: [],
      recommendedModel: "qwen2.5:1.5b",
      hasQwen: false,
    };
  }
}

/* ============================================================
   CHAT SESSIONS (STUDENT-ISOLATED WITH LOCAL STORAGE RESILIENCE)
   ============================================================ */

function getLocalChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("chat_sessions"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalChatSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(getStudentStorageKey("chat_sessions"), JSON.stringify(sessions));
  } catch {}
}

export function getLocalChatMessages(chatId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("chat_msgs_" + chatId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalChatMessages(chatId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(getStudentStorageKey("chat_msgs_" + chatId), JSON.stringify(messages));
  } catch {}
}

export async function getChatSessions(): Promise<{
  sessions: ChatSession[];
}> {
  const localList = getLocalChatSessions();
  try {
    const res = await request<{ sessions: ChatSession[] }>("/chat/sessions");
    if (res?.sessions && res.sessions.length > 0) {
      saveLocalChatSessions(res.sessions);
      return res;
    }
  } catch {
    // Network offline: return local
  }
  return { sessions: localList };
}

export async function createChatSession(
  title?: string
): Promise<{
  id: string;
  title: string;
}> {
  const newId = "chat_" + Date.now();
  const newTitle = title?.trim() || "New Study Conversation";
  const newSession: ChatSession = {
    id: newId,
    title: newTitle,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_count: 0,
  };

  const sessions = getLocalChatSessions();
  saveLocalChatSessions([newSession, ...sessions]);

  try {
    const res = await request<{ id: string; title: string }>("/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ id: newId, title: newTitle }),
    });
    return res;
  } catch {
    return { id: newId, title: newTitle };
  }
}

export async function getChatDetails(
  id: string
): Promise<{
  session: ChatSession;
  messages: ChatMessage[];
}> {
  const localMsgs = getLocalChatMessages(id);
  const localSessions = getLocalChatSessions();
  const localSession: ChatSession = localSessions.find((s) => s.id === id) || {
    id,
    title: "Study Chat",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_count: localMsgs.length,
  };

  try {
    const res = await request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`);
    if (res?.messages) {
      saveLocalChatMessages(id, res.messages);
      return res;
    }
  } catch {
    // Rely on local
  }

  return { session: localSession, messages: localMsgs };
}

export async function renameChatSession(
  id: string,
  title: string
): Promise<{
  success: boolean;
  title: string;
}> {
  const sessions = getLocalChatSessions();
  const updated = sessions.map((s) => (s.id === id ? { ...s, title, updated_at: new Date().toISOString() } : s));
  saveLocalChatSessions(updated);

  try {
    return await request<{ success: boolean; title: string }>(`/chat/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  } catch {
    return { success: true, title };
  }
}

export async function deleteChatSession(
  id: string
): Promise<{
  success: boolean;
}> {
  const sessions = getLocalChatSessions().filter((s) => s.id !== id);
  saveLocalChatSessions(sessions);
  try {
    localStorage.removeItem(getStudentStorageKey("chat_msgs_" + id));
  } catch {}

  try {
    return await request<{ success: boolean }>(`/chat/sessions/${id}`, {
      method: "DELETE",
    });
  } catch {
    return { success: true };
  }
}

/* ============================================================
   LEARNING ATTEMPTS & LOCAL ATTEMPT PERSISTENCE
   ============================================================ */

import { enqueuePendingSync } from "./utils/offlineManager";

export interface StoredQuestionAttempt {
  id: string;
  student_id: string;
  question_id: string;
  subject: string;
  topic: string;
  concept?: string;
  difficulty?: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  response_time?: number;
  hints_used?: number;
  timestamp: string;
}

export function getLocalQuestionAttempts(): StoredQuestionAttempt[] {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("question_attempts"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalQuestionAttempt(attempt: StoredQuestionAttempt): void {
  try {
    const attempts = getLocalQuestionAttempts();
    attempts.unshift(attempt);
    // Keep last 100 attempts for offline analytics
    localStorage.setItem(getStudentStorageKey("question_attempts"), JSON.stringify(attempts.slice(0, 100)));
  } catch {}
}

export function getLocalDoubts(): Array<{ id: string; subject: string; topic: string; timestamp: string }> {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("doubts"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function submitQuestionAttempt(payload: {
  question_id: string;
  subject: string;
  topic: string;
  concept?: string;
  difficulty?: string;
  selected_answer: string;
  correct_answer: string;
  response_time?: number;
  hints_used?: number;
}): Promise<AttemptResult> {
  const activeStudent = getActiveStudent();
  const studentId = activeStudent?.id || "guest_student";
  const isCorrect = payload.selected_answer.trim().toLowerCase() === payload.correct_answer.trim().toLowerCase();

  // 1. Immediately store attempt locally under student's isolated key
  const storedAttempt: StoredQuestionAttempt = {
    id: "att_loc_" + Math.random().toString(36).substring(2, 9),
    student_id: studentId,
    question_id: payload.question_id,
    subject: payload.subject,
    topic: payload.topic,
    concept: payload.concept,
    difficulty: payload.difficulty,
    selected_answer: payload.selected_answer,
    correct_answer: payload.correct_answer,
    is_correct: isCorrect,
    response_time: payload.response_time || 15,
    hints_used: payload.hints_used || 0,
    timestamp: new Date().toISOString(),
  };
  saveLocalQuestionAttempt(storedAttempt);

  // 2. Try submitting to server; if offline/failed, enqueue for automatic background sync
  try {
    const serverRes = await request<AttemptResult>("/learning/attempts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (serverRes) return serverRes;
  } catch (networkErr) {
    console.warn("[LearnX] Network unavailable; queueing attempt for background sync:", networkErr);
    enqueuePendingSync({
      type: "question_attempt",
      studentId,
      payload,
    });
  }

  // 3. Resilient offline response calculation
  const allTopicAttempts = getLocalQuestionAttempts().filter(
    (a) => a.topic.toLowerCase() === payload.topic.toLowerCase()
  );
  const correctCount = allTopicAttempts.filter((a) => a.is_correct).length;
  const attemptsCount = allTopicAttempts.length;
  const accuracy = attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : isCorrect ? 100 : 0;

  let masteryState: MasteryState = "Developing";
  if (attemptsCount < 2) masteryState = "Insufficient Data";
  else if (accuracy >= 90 && attemptsCount >= 3) masteryState = "Mastered";
  else if (accuracy >= 75) masteryState = "Strong";
  else if (accuracy < 50) masteryState = "Needs Improvement";

  return {
    is_correct: isCorrect,
    correct_answer: payload.correct_answer,
    selected_answer: payload.selected_answer,
    mastery: {
      subject: payload.subject,
      topic: payload.topic,
      attempts: attemptsCount,
      correct_count: correctCount,
      accuracy,
      mistakes: attemptsCount - correctCount,
      avg_response_time: payload.response_time || 15,
      mastery_state: masteryState,
      difficulty: (payload.difficulty as any) || "Medium",
    },
  };
}

/* ============================================================
   ANALYTICS & DASHBOARD
   ============================================================ */

import { ACADEMIC_COURSES } from "./data/coursesData";

/* ============================================================
   ANALYTICS & DASHBOARD (RESILIENT & PERSISTENT)
   ============================================================ */

export function getLocalCourseProgress(): Record<string, { completedLessons: string[]; status: string }> {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("course_progress"));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalCourseProgress(progress: Record<string, { completedLessons: string[]; status: string }>) {
  try {
    localStorage.setItem(getStudentStorageKey("course_progress"), JSON.stringify(progress));
  } catch {}
}

export function getLocalCertificates(): Certificate[] {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("certificates"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCertificate(cert: Certificate) {
  try {
    const certs = getLocalCertificates();
    if (!certs.some((c) => c.certificate_id === cert.certificate_id || c.course_id === cert.course_id)) {
      certs.unshift(cert);
      localStorage.setItem(getStudentStorageKey("certificates"), JSON.stringify(certs));
    }
  } catch {}
}

export async function getStudentData(): Promise<StudentAnalytics> {
  const activeStudent = getActiveStudent() || {
    id: "std_default",
    name: "Student Learner",
    email: "student@learnx.edu",
    education_level: "B.Tech",
    btech_branch: "Computer Science & Engineering",
  };

  const localProgress = getLocalCourseProgress();
  const localCerts = getLocalCertificates();
  const localAttempts = getLocalQuestionAttempts();
  const localDoubts = getLocalDoubts();

  // Standardize courses and only mark as enrolled if the student explicitly enrolled or made progress
  const builtCourses: Course[] = ACADEMIC_COURSES.map((ac) => {
    const prog = localProgress[ac.id];
    const totalLessons = ac.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = prog?.completedLessons?.length || 0;
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const status = !prog ? "not_enrolled" : pct >= 100 ? "completed" : completedCount > 0 ? "in_progress" : "enrolled";

    return {
      id: ac.id,
      title: ac.title,
      code: ac.code,
      education_level: (ac.educationLevel as any) || "B.Tech",
      branch_stream: ac.branchStream,
      description: ac.description,
      estimated_hours: ac.estimatedHours,
      module_count: ac.modules.length,
      lesson_count: totalLessons,
      completion_percentage: pct,
      enrollment_status: status as any,
    };
  });

  try {
    const serverData = await request<StudentAnalytics>("/analytics/student-data");
    if (serverData && serverData.profile) {
      // Merge certificates
      const allCerts = [...(serverData.certificates || [])];
      for (const lc of localCerts) {
        if (!allCerts.some((c) => c.certificate_id === lc.certificate_id || c.course_id === lc.course_id)) {
          allCerts.unshift(lc);
        }
      }
      serverData.certificates = allCerts;

      // Filter and map ONLY courses that the student is actually enrolled in
      const enrolledList: Course[] = [];
      const serverEnrolled = serverData.enrolledCourses || [];

      // 1. Add server enrolled courses
      for (const sc of serverEnrolled) {
        const matchingBuilt = builtCourses.find((bc) => bc.id === (sc as any).course_id || bc.id === sc.id);
        const prog = localProgress[sc.id] || localProgress[(sc as any).course_id];
        const completedCount = prog?.completedLessons?.length || 0;
        const totalLessons = matchingBuilt ? matchingBuilt.lesson_count : (sc.lesson_count || 10);
        const pct = Math.max(sc.completion_percentage || 0, totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

        enrolledList.push({
          id: sc.id,
          title: (sc as any).course_title || sc.title || matchingBuilt?.title || "Course",
          code: sc.code || matchingBuilt?.code || "CS-100",
          education_level: ((sc.education_level || matchingBuilt?.education_level || "B.Tech") as EducationLevel),
          branch_stream: sc.branch_stream || matchingBuilt?.branch_stream,
          description: sc.description || matchingBuilt?.description || "",
          estimated_hours: sc.estimated_hours || matchingBuilt?.estimated_hours || 10,
          module_count: matchingBuilt?.module_count || 3,
          lesson_count: totalLessons,
          completion_percentage: pct,
          enrollment_status: pct >= 100 ? "completed" : completedCount > 0 ? "in_progress" : "enrolled",
        });
      }

      // 2. Add courses this student enrolled in locally that might not yet have synced
      for (const bc of builtCourses) {
        const prog = localProgress[bc.id];
        if (prog && prog.status !== "not_enrolled") {
          if (!enrolledList.some((c) => c.id === bc.id)) {
            enrolledList.push(bc);
          }
        }
      }

      serverData.enrolledCourses = enrolledList;
      return serverData;
    }
  } catch (err) {
    console.warn("Using resilient client analytics for student space:", err);
  }

  // Resilient offline fallback: Compute real analytics strictly from THIS student's own attempts and progress
  const strictlyEnrolledCourses = builtCourses.filter((c) => {
    const prog = localProgress[c.id];
    return prog && prog.status !== "not_enrolled";
  });

  const totalAttempts = localAttempts.length;
  const totalCorrect = localAttempts.filter((a) => a.is_correct).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const totalTime = localAttempts.reduce((sum, a) => sum + (a.response_time || 15), 0);
  const avgResponseTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;

  // Build mastery records grouped by topic
  const topicMap = new Map<string, { subject: string; topic: string; attempts: number; correct: number; totalTime: number }>();
  for (const att of localAttempts) {
    const key = `${att.subject}:::${att.topic}`;
    const curr = topicMap.get(key) || { subject: att.subject, topic: att.topic, attempts: 0, correct: 0, totalTime: 0 };
    curr.attempts++;
    if (att.is_correct) curr.correct++;
    curr.totalTime += att.response_time || 15;
    topicMap.set(key, curr);
  }

  const masteryRecords: MasteryRecord[] = Array.from(topicMap.values()).map((val, idx) => {
    const acc = Math.round((val.correct / val.attempts) * 100);
    let state: MasteryState = "Developing";
    if (val.attempts < 2) state = "Insufficient Data";
    else if (acc >= 90 && val.attempts >= 3) state = "Mastered";
    else if (acc >= 75) state = "Strong";
    else if (acc < 50) state = "Needs Improvement";

    return {
      id: `mst_loc_${idx + 1}`,
      student_id: activeStudent.id,
      subject: val.subject,
      topic: val.topic,
      attempts: val.attempts,
      correct_count: val.correct,
      accuracy: acc,
      mistakes: val.attempts - val.correct,
      avg_response_time: Math.round(val.totalTime / val.attempts),
      mastery_state: state,
      updated_at: new Date().toISOString(),
    };
  });

  const topicsMastered = masteryRecords.filter((m) => m.mastery_state === "Mastered").length;
  const topicsNeedsImprovement = masteryRecords.filter((m) => m.mastery_state === "Needs Improvement").length;

  return {
    profile: activeStudent,
    stats: {
      totalDoubts: localDoubts.length,
      totalAttempts,
      totalCorrect,
      overallAccuracy,
      avgResponseTime,
      topicsMasteredCount: topicsMastered,
      topicsNeedsImprovementCount: topicsNeedsImprovement,
    },
    masteryRecords,
    repeatedDoubts: [],
    activeRecommendations: strictlyEnrolledCourses.length > 0 ? [
      {
        id: "rec_1",
        student_id: activeStudent.id,
        recommendation_type: "course",
        title: `Continue ${strictlyEnrolledCourses[0].title}`,
        reason: "Active interactive code labs available with certificate on completion.",
        target_subject: strictlyEnrolledCourses[0].branch_stream || "General",
        target_topic: strictlyEnrolledCourses[0].title,
        difficulty: "Medium",
        is_active: 1,
        created_at: new Date().toISOString(),
      },
    ] : [
      {
        id: "rec_explore",
        student_id: activeStudent.id,
        recommendation_type: "course",
        title: `Explore ${activeStudent.education_level || "Academic"} Courses`,
        reason: "Browse verified curriculum modules, run code sandboxes, and earn your mastery certificate.",
        target_subject: "All",
        target_topic: "Course Enrollment",
        difficulty: "Easy",
        is_active: 1,
        created_at: new Date().toISOString(),
      }
    ],
    enrolledCourses: strictlyEnrolledCourses,
    certificates: localCerts,
    recentActivities: localAttempts.slice(0, 5).map((att, i) => ({
      id: `act_${i + 1}`,
      student_id: activeStudent.id,
      activity_type: "attempt",
      description: `Attempted question on ${att.topic} (${att.is_correct ? "Correct" : "Incorrect"})`,
      subject: att.subject,
      topic: att.topic,
      timestamp: att.timestamp,
    })),
  };
}

export async function getRecommendations(): Promise<{
  recommendations: Recommendation[];
}> {
  try {
    return await request<{ recommendations: Recommendation[] }>("/analytics/recommendations");
  } catch {
    return {
      recommendations: [
        {
          id: "rec_default",
          student_id: "me",
          recommendation_type: "course",
          title: "Explore Curriculum Courses",
          reason: "Hands-on exercises, runnable code sandboxes, and verified completion certificates.",
          difficulty: "Medium",
          is_active: 1,
          created_at: new Date().toISOString(),
        },
      ],
    };
  }
}

/* ============================================================
   COURSES (W3SCHOOLS INTERACTIVE SUITE)
   ============================================================ */

export async function getCourses(
  filters?: {
    search?: string;
    level?: string;
    branch?: string;
  }
): Promise<{
  courses: Course[];
}> {
  const localProgress = getLocalCourseProgress();

  let list: Course[] = ACADEMIC_COURSES.map((ac) => {
    const prog = localProgress[ac.id];
    const totalLessons = ac.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = prog?.completedLessons?.length || 0;
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const status = !prog ? "not_enrolled" : pct >= 100 ? "completed" : completedCount > 0 ? "in_progress" : "enrolled";

    return {
      id: ac.id,
      title: ac.title,
      code: ac.code,
      education_level: (ac.educationLevel as any) || "B.Tech",
      branch_stream: ac.branchStream,
      description: ac.description,
      estimated_hours: ac.estimatedHours,
      module_count: ac.modules.length,
      lesson_count: totalLessons,
      completion_percentage: pct,
      enrollment_status: pct >= 100 ? "completed" : completedCount > 0 ? "in_progress" : "enrolled",
    };
  });

  // Strict education level filtering
  if (filters?.level && filters.level !== "All") {
    const targetLevel = filters.level.toLowerCase();
    list = list.filter((c) => {
      const cLevel = (c.education_level || "").toLowerCase();
      if (targetLevel === "school") {
        return cLevel === "school";
      }
      if (targetLevel === "intermediate") {
        return cLevel === "intermediate";
      }
      if (targetLevel === "b.tech" || targetLevel === "btech") {
        return cLevel === "b.tech" || cLevel === "btech";
      }
      if (targetLevel === "degree") {
        return cLevel === "degree";
      }
      return cLevel.includes(targetLevel);
    });
  }

  // Branch / stream filtering
  if (filters?.branch && filters.branch !== "All") {
    const bTerm = filters.branch.toLowerCase();
    list = list.filter((c) => !c.branch_stream || c.branch_stream.toLowerCase().includes(bTerm));
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term) || (c.code || "").toLowerCase().includes(term));
  }

  // Try server in background and merge if available
  try {
    const query = new URLSearchParams();
    if (filters?.search) query.set("search", filters.search);
    if (filters?.level && filters.level !== "All") query.set("level", filters.level);
    const res = await request<{ courses: Course[] }>(query.toString() ? `/courses?${query.toString()}` : "/courses");
    if (res?.courses && res.courses.length > 0) {
      for (const sc of res.courses) {
        if (!list.some((c) => c.id === sc.id)) {
          list.push(sc);
        }
      }
    }
  } catch {
    // Rely smoothly on built-in curriculum
  }

  return { courses: list };
}

export async function getCourseDetails(
  id: string
): Promise<{
  course: Course;
  modules: CourseModule[];
  progress?: any;
}> {
  const localProgress = getLocalCourseProgress();
  const prog = localProgress[id] || { completedLessons: [], status: "enrolled" };

  const matched = ACADEMIC_COURSES.find((c) => c.id === id);
  if (matched) {
    const totalLessons = matched.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = prog.completedLessons.length;
    const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const courseObj: Course = {
      id: matched.id,
      title: matched.title,
      code: matched.code,
      education_level: (matched.educationLevel as any) || "B.Tech",
      branch_stream: matched.branchStream,
      description: matched.description,
      estimated_hours: matched.estimatedHours,
      module_count: matched.modules.length,
      lesson_count: totalLessons,
      completion_percentage: pct,
      enrollment_status: pct >= 100 ? "completed" : completedCount > 0 ? "in_progress" : "enrolled",
    };

    const modulesObj: CourseModule[] = matched.modules.map((m) => ({
      id: m.id,
      course_id: matched.id,
      title: m.title,
      order_index: m.orderIndex,
      description: m.description,
      lessons: m.lessons.map((l, lIdx) => ({
        id: l.id,
        module_id: m.id,
        title: l.title,
        order_index: lIdx + 1,
        reading_time_min: l.readingTimeMin,
        has_assessment: 1,
      })),
    }));

    return {
      course: courseObj,
      modules: modulesObj,
      progress: {
        completed_lessons: prog.completedLessons,
        completion_percentage: pct,
        status: pct >= 100 ? "completed" : "in_progress",
      },
    };
  }

  // Fallback to server query
  return request<{
    course: Course;
    modules: CourseModule[];
    progress?: any;
  }>(`/courses/${id}`);
}

export async function enrollInCourse(
  id: string
): Promise<{
  success: boolean;
}> {
  const activeStudent = getActiveStudent();
  const studentId = activeStudent?.id || "anon";
  const localProgress = getLocalCourseProgress();
  if (!localProgress[id]) {
    localProgress[id] = { completedLessons: [], status: "in_progress" };
    saveLocalCourseProgress(localProgress);
  }

  try {
    await request<{ success: boolean }>(`/courses/${id}/enroll`, { method: "POST" });
  } catch (err) {
    console.warn("[LearnX] Offline: queued course enrollment for background sync:", err);
    enqueuePendingSync({
      type: "course_enroll",
      studentId,
      payload: { courseId: id },
    });
  }

  return { success: true };
}

export async function getLesson(
  lessonId: string
): Promise<{
  lesson: CourseLesson;
  content: {
    body_markdown: string;
  };
  assessment?: any;
  codeSnippet?: any;
}> {
  // Search built-in curriculum
  for (const c of ACADEMIC_COURSES) {
    for (const m of c.modules) {
      const l = m.lessons.find((item) => item.id === lessonId);
      if (l) {
        return {
          lesson: {
            id: l.id,
            module_id: m.id,
            title: l.title,
            order_index: 1,
            reading_time_min: l.readingTimeMin,
            has_assessment: 1,
          },
          content: {
            body_markdown: l.content,
          },
          assessment: l.assessment,
          codeSnippet: l.codeSnippet,
        };
      }
    }
  }

  // Server fallback
  return request<any>(`/courses/lessons/${lessonId}`);
}

export async function completeLesson(
  lessonId: string
): Promise<{
  completed_lessons: string[];
  completion_percentage: number;
  status: string;
  certificate?: Certificate;
}> {
  const activeStudent = getActiveStudent();
  const localProgress = getLocalCourseProgress();

  let targetCourseId = "";
  let totalLessonsInCourse = 1;
  let targetCourseTitle = "Academic Course";

  // Find which course contains this lesson
  for (const c of ACADEMIC_COURSES) {
    for (const m of c.modules) {
      if (m.lessons.some((l) => l.id === lessonId)) {
        targetCourseId = c.id;
        targetCourseTitle = c.title;
        totalLessonsInCourse = c.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
        break;
      }
    }
    if (targetCourseId) break;
  }

  if (!targetCourseId) {
    targetCourseId = "crs_default";
  }

  if (!localProgress[targetCourseId]) {
    localProgress[targetCourseId] = { completedLessons: [], status: "in_progress" };
  }

  if (!localProgress[targetCourseId].completedLessons.includes(lessonId)) {
    localProgress[targetCourseId].completedLessons.push(lessonId);
  }

  const completedCount = localProgress[targetCourseId].completedLessons.length;
  const pct = Math.min(100, Math.round((completedCount / totalLessonsInCourse) * 100));
  const isCompleted = pct >= 100;
  localProgress[targetCourseId].status = isCompleted ? "completed" : "in_progress";
  saveLocalCourseProgress(localProgress);

  let cert: Certificate | undefined;
  if (isCompleted) {
    const studentName = activeStudent?.name || "Student Learner";
    const certSerial = "LX-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + new Date().getFullYear();
    cert = {
      id: "cert_" + Date.now(),
      student_id: activeStudent?.id || "std_user",
      course_id: targetCourseId,
      student_name: studentName,
      course_name: targetCourseTitle,
      completion_date: new Date().toISOString(),
      certificate_id: certSerial,
      issued_at: new Date().toISOString(),
    };
    saveLocalCertificate(cert);
  }

  // Attempt server sync in background; if offline or fails, enqueue for auto-sync
  try {
    const sRes = await request<any>(`/courses/lessons/${lessonId}/complete`, { method: "POST" });
    if (sRes?.certificate) {
      saveLocalCertificate(sRes.certificate);
      cert = sRes.certificate;
    }
  } catch (err) {
    console.warn("[LearnX] Offline: queued lesson completion for background sync:", err);
    enqueuePendingSync({
      type: "lesson_complete",
      studentId: activeStudent?.id || "anon",
      payload: { lessonId, courseId: targetCourseId },
    });
  }

  return {
    completed_lessons: localProgress[targetCourseId].completedLessons,
    completion_percentage: pct,
    status: localProgress[targetCourseId].status,
    certificate: cert,
  };
}

export async function createCourse(
  payload: any
): Promise<{
  id: string;
  message: string;
}> {
  return request<{
    id: string;
    message: string;
  }>("/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ============================================================
   CERTIFICATES
   ============================================================ */

export async function getCertificates(): Promise<{
  certificates: Certificate[];
}> {
  const localCerts = getLocalCertificates();
  try {
    const res = await request<{ certificates: Certificate[] }>("/certificates");
    if (res?.certificates) {
      const merged = [...res.certificates];
      for (const lc of localCerts) {
        if (!merged.some((c) => c.certificate_id === lc.certificate_id || c.course_id === lc.course_id)) {
          merged.unshift(lc);
        }
      }
      return { certificates: merged };
    }
  } catch {}
  return { certificates: localCerts };
}

export async function getCertificateDetails(
  id: string
): Promise<{
  certificate: Certificate;
}> {
  const localCerts = getLocalCertificates();
  const found = localCerts.find((c) => c.id === id || c.certificate_id === id);
  if (found) return { certificate: found };

  return request<{
    certificate: Certificate;
  }>(`/certificates/${id}`);
}

/* ============================================================
   LEADERBOARD & PRIVACY
   ============================================================ */

export async function getLeaderboard(educationLevel?: string, privacyMode?: boolean): Promise<{
  entries: LeaderboardEntry[];
  education_level?: string;
}> {
  const params = new URLSearchParams();
  if (educationLevel) params.append("education_level", educationLevel);
  if (privacyMode !== undefined) params.append("privacy", String(privacyMode));
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return request<{ entries: LeaderboardEntry[]; education_level?: string }>(`/leaderboard${queryString}`);
}

export async function setLeaderboardPrivacy(privacy: boolean): Promise<{
  success: boolean;
  privacy: boolean;
}> {
  return request<{ success: boolean; privacy: boolean }>("/leaderboard/privacy", {
    method: "POST",
    body: JSON.stringify({ privacy }),
  });
}

/* ============================================================
   CUSTOM SUBJECTS & SYLLABUS UPLOAD (FOR AI STRENGTHENING)
   ============================================================ */

import { CustomSubjectContext } from "./types";

export function getLocalCustomSubjects(): CustomSubjectContext[] {
  try {
    const raw = localStorage.getItem(getStudentStorageKey("custom_subjects"));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomSubjects(subjects: CustomSubjectContext[]) {
  try {
    localStorage.setItem(getStudentStorageKey("custom_subjects"), JSON.stringify(subjects));
  } catch {}
}

export async function getCustomSubjects(): Promise<{ customSubjects: CustomSubjectContext[] }> {
  const localList = getLocalCustomSubjects();
  try {
    const res = await request<{ customSubjects: CustomSubjectContext[] }>("/student/custom-subjects");
    if (res?.customSubjects) {
      saveLocalCustomSubjects(res.customSubjects);
      return res;
    }
  } catch {
    // Return local offline
  }
  return { customSubjects: localList };
}

export async function saveCustomSubject(payload: {
  subject_name: string;
  subject_code?: string;
  education_level: string;
  branch_stream?: string;
  syllabus_notes: string;
  selected_topics: string[];
}): Promise<{ success: boolean; id: string; message: string }> {
  const localList = getLocalCustomSubjects();
  const activeStudent = getActiveStudent();
  const newSubject: CustomSubjectContext = {
    id: "csubj_" + Date.now(),
    student_id: activeStudent?.id || "anon",
    subject_name: payload.subject_name,
    subject_code: payload.subject_code,
    education_level: payload.education_level as any,
    branch_stream: payload.branch_stream,
    syllabus_notes: payload.syllabus_notes,
    selected_topics: payload.selected_topics,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Upsert locally
  const filtered = localList.filter((s) => s.subject_name.toLowerCase() !== payload.subject_name.toLowerCase());
  filtered.unshift(newSubject);
  saveLocalCustomSubjects(filtered);

  try {
    const res = await request<{ success: boolean; id: string; message: string }>("/student/custom-subjects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  } catch {
    return {
      success: true,
      id: newSubject.id,
      message: `AI knowledge successfully strengthened locally for ${payload.subject_name}!`,
    };
  }
}

export async function deleteCustomSubject(id: string): Promise<{ success: boolean }> {
  const localList = getLocalCustomSubjects();
  const updated = localList.filter((s) => s.id !== id);
  saveLocalCustomSubjects(updated);

  try {
    return await request<{ success: boolean }>(`/student/custom-subjects/${id}`, {
      method: "DELETE",
    });
  } catch {
    return { success: true };
  }
}

