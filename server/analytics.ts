import { query, get, run } from "./db";
import crypto from "crypto";

export interface MasteryUpdateResult {
  subject: string;
  topic: string;
  attempts: number;
  correct_count: number;
  accuracy: number;
  mistakes: number;
  avg_response_time: number;
  mastery_state: "Not Started" | "Insufficient Data" | "Needs Improvement" | "Developing" | "Strong" | "Mastered";
  difficulty: "Easy" | "Medium" | "Hard";
}

/**
 * Updates mastery record deterministically after a question attempt.
 * Strict rules:
 * - < 2 attempts => Insufficient Data
 * - accuracy < 50% or >= 2 mistakes => Needs Improvement
 * - accuracy 50% - 74% => Developing
 * - accuracy 75% - 89% => Strong
 * - accuracy >= 90% and attempts >= 3 => Mastered
 */
export function recordAttemptAndUpdateMastery(
  studentId: string,
  questionId: string,
  subject: string,
  topic: string,
  concept: string,
  difficulty: string,
  selectedAnswer: string,
  correctAnswer: string,
  isCorrect: boolean,
  responseTime: number = 0,
  hintsUsed: number = 0
): MasteryUpdateResult {
  const attemptId = "att_" + crypto.randomUUID();
  const isCorrectInt = isCorrect ? 1 : 0;

  // Find previous attempts count for this student on this question
  const prevAttempts = query(
    `SELECT COUNT(*) as cnt FROM question_attempts WHERE student_id = ? AND question_id = ?`,
    [studentId, questionId]
  );
  const attemptNumber = (prevAttempts[0]?.cnt || 0) + 1;

  // Insert into question_attempts table
  run(
    `INSERT INTO question_attempts (
      id, student_id, question_id, subject, topic, concept, difficulty,
      selected_answer, correct_answer, is_correct, attempt_number, response_time, hints_used
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attemptId,
      studentId,
      questionId,
      subject,
      topic,
      concept,
      difficulty,
      selectedAnswer,
      correctAnswer,
      isCorrectInt,
      attemptNumber,
      responseTime,
      hintsUsed
    ]
  );

  // Log activity
  run(
    `INSERT INTO learning_activity (id, student_id, activity_type, description, subject, topic)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      "act_" + crypto.randomUUID(),
      studentId,
      "practice_attempt",
      `Answered practice question on ${concept} (${isCorrect ? "Correct" : "Incorrect"})`,
      subject,
      topic
    ]
  );

  // Fetch all attempts for this student, subject, topic
  const attempts = query(
    `SELECT is_correct, response_time FROM question_attempts WHERE student_id = ? AND subject = ? AND topic = ?`,
    [studentId, subject, topic]
  );

  const totalAttempts = attempts.length;
  const correctCount = attempts.filter(a => a.is_correct === 1).length;
  const mistakes = totalAttempts - correctCount;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const totalTime = attempts.reduce((acc, a) => acc + (a.response_time || 0), 0);
  const avgResponseTime = totalAttempts > 0 ? Number((totalTime / totalAttempts).toFixed(1)) : 0;

  // Determine mastery state deterministically
  let masteryState: MasteryUpdateResult["mastery_state"] = "Not Started";
  if (totalAttempts === 0) {
    masteryState = "Not Started";
  } else if (totalAttempts < 2) {
    masteryState = "Insufficient Data";
  } else if (accuracy < 50 || mistakes >= 2) {
    masteryState = "Needs Improvement";
  } else if (accuracy < 75) {
    masteryState = "Developing";
  } else if (accuracy < 90) {
    masteryState = "Strong";
  } else {
    // accuracy >= 90%
    masteryState = totalAttempts >= 3 ? "Mastered" : "Strong";
  }

  // Adaptive difficulty
  let adaptiveDiff: "Easy" | "Medium" | "Hard" = "Medium";
  if (accuracy < 50) {
    adaptiveDiff = "Easy";
  } else if (accuracy > 80 && totalAttempts >= 2) {
    adaptiveDiff = "Hard";
  }

  // Upsert into mastery_records
  const existingMastery = get(
    `SELECT id FROM mastery_records WHERE student_id = ? AND subject = ? AND topic = ?`,
    [studentId, subject, topic]
  );

  if (existingMastery) {
    run(
      `UPDATE mastery_records
       SET attempts = ?, correct_count = ?, accuracy = ?, mistakes = ?, avg_response_time = ?, mastery_state = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [totalAttempts, correctCount, accuracy, mistakes, avgResponseTime, masteryState, existingMastery.id]
    );
  } else {
    run(
      `INSERT INTO mastery_records (id, student_id, subject, topic, attempts, correct_count, accuracy, mistakes, avg_response_time, mastery_state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "mas_" + crypto.randomUUID(),
        studentId,
        subject,
        topic,
        totalAttempts,
        correctCount,
        accuracy,
        mistakes,
        avgResponseTime,
        masteryState
      ]
    );
  }

  // Refresh dynamic recommendations for this student
  generateStudentRecommendations(studentId);

  return {
    subject,
    topic,
    attempts: totalAttempts,
    correct_count: correctCount,
    accuracy,
    mistakes,
    avg_response_time: avgResponseTime,
    mastery_state: masteryState,
    difficulty: adaptiveDiff
  };
}

/**
 * Generates deterministic personalized recommendations based on actual database records.
 * Sections 16 & 17:
 * Every recommendation must have a reason derived from real student performance.
 */
export function generateStudentRecommendations(studentId: string) {
  // Mark old recommendations inactive
  run(`UPDATE recommendations SET is_active = 0 WHERE student_id = ?`, [studentId]);

  // Check topics needing improvement
  const weakTopics = query(
    `SELECT subject, topic, accuracy, mistakes, attempts
     FROM mastery_records
     WHERE student_id = ? AND mastery_state = 'Needs Improvement'
     ORDER BY mistakes DESC LIMIT 2`,
    [studentId]
  );

  for (const item of weakTopics) {
    run(
      `INSERT INTO recommendations (id, student_id, recommendation_type, title, reason, target_subject, target_topic, difficulty, is_active)
       VALUES (?, ?, 'revise', ?, ?, ?, ?, 'Easy', 1)`,
      [
        "rec_" + crypto.randomUUID(),
        studentId,
        `Revise ${item.topic}`,
        `Your recent performance in ${item.subject} shows ${item.mistakes} mistakes with ${item.accuracy}% accuracy. Practice fundamental questions to solidify core definitions.`,
        item.subject,
        item.topic
      ]
    );
  }

  // Check developing topics
  const developingTopics = query(
    `SELECT subject, topic, accuracy, attempts
     FROM mastery_records
     WHERE student_id = ? AND mastery_state = 'Developing'
     ORDER BY attempts ASC LIMIT 2`,
    [studentId]
  );

  for (const item of developingTopics) {
    run(
      `INSERT INTO recommendations (id, student_id, recommendation_type, title, reason, target_subject, target_topic, difficulty, is_active)
       VALUES (?, ?, 'practice', ?, ?, ?, ?, 'Medium', 1)`,
      [
        "rec_" + crypto.randomUUID(),
        studentId,
        `Practice ${item.topic}`,
        `You have an accuracy of ${item.accuracy}% over ${item.attempts} attempts. Completing 2 more questions will advance you to Strong mastery.`,
        item.subject,
        item.topic
      ]
    );
  }

  // Check mastered topics to suggest next concept
  const masteredTopics = query(
    `SELECT subject, topic, accuracy
     FROM mastery_records
     WHERE student_id = ? AND mastery_state = 'Mastered'
     ORDER BY updated_at DESC LIMIT 1`,
    [studentId]
  );

  for (const item of masteredTopics) {
    run(
      `INSERT INTO recommendations (id, student_id, recommendation_type, title, reason, target_subject, target_topic, difficulty, is_active)
       VALUES (?, ?, 'advance', ?, ?, ?, ?, 'Hard', 1)`,
      [
        "rec_" + crypto.randomUUID(),
        studentId,
        `Advance from ${item.topic}`,
        `You achieved ${item.accuracy}% mastery on ${item.topic}. Challenge yourself with comprehensive application questions.`,
        item.subject,
        item.topic
      ]
    );
  }

  // Check course progress for continuing learning
  const ongoingCourses = query(
    `SELECT c.id, c.title, cp.completion_percentage
     FROM course_progress cp
     JOIN courses c ON c.id = cp.course_id
     WHERE cp.student_id = ? AND cp.status != 'completed'
     ORDER BY cp.updated_at DESC LIMIT 1`,
    [studentId]
  );

  for (const c of ongoingCourses) {
    run(
      `INSERT INTO recommendations (id, student_id, recommendation_type, title, reason, target_subject, target_topic, difficulty, is_active)
       VALUES (?, ?, 'course', ?, ?, ?, NULL, 'Medium', 1)`,
      [
        "rec_" + crypto.randomUUID(),
        studentId,
        `Continue ${c.title}`,
        `You have completed ${Math.round(c.completion_percentage)}% of this course. Resume the next module to earn your certificate.`,
        c.title
      ]
    );
  }
}

/**
 * Returns comprehensive student learning analytics and profile.
 */
export function getStudentAnalytics(studentId: string) {
  const profile = get(
    `SELECT s.id, s.name, s.email, s.created_at,
            p.education_level, p.school_grade, p.inter_stream,
            p.degree_name, p.degree_specialization,
            p.btech_branch, p.btech_year, p.btech_semester
     FROM students s
     LEFT JOIN student_profiles p ON p.student_id = s.id
     WHERE s.id = ?`,
    [studentId]
  );

  const masteryRecords = query(
    `SELECT * FROM mastery_records WHERE student_id = ? ORDER BY updated_at DESC`,
    [studentId]
  );

  const doubts = query(
    `SELECT * FROM doubts WHERE student_id = ? ORDER BY timestamp DESC`,
    [studentId]
  );

  const attempts = query(
    `SELECT * FROM question_attempts WHERE student_id = ? ORDER BY timestamp DESC LIMIT 50`,
    [studentId]
  );

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter(a => a.is_correct === 1).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const totalResponseTime = attempts.reduce((sum, a) => sum + (a.response_time || 0), 0);
  const avgResponseTime = totalAttempts > 0 ? Number((totalResponseTime / totalAttempts).toFixed(1)) : 0;

  // Doubt frequencies
  const doubtTopicMap = new Map<string, { subject: string; topic: string; count: number }>();
  for (const d of doubts) {
    const key = `${d.detected_subject}:::${d.detected_topic}`;
    const cur = doubtTopicMap.get(key) || { subject: d.detected_subject, topic: d.detected_topic, count: 0 };
    cur.count++;
    doubtTopicMap.set(key, cur);
  }
  const repeatedDoubts = Array.from(doubtTopicMap.values())
    .filter(d => d.count > 1)
    .sort((a, b) => b.count - a.count);

  // Recommendations
  const activeRecommendations = query(
    `SELECT * FROM recommendations WHERE student_id = ? AND is_active = 1 ORDER BY created_at DESC`,
    [studentId]
  );

  // Course Progress & Certificates
  const enrolledCourses = query(
    `SELECT cp.*, c.title as course_title, c.education_level, c.branch_stream, c.estimated_hours
     FROM course_progress cp
     JOIN courses c ON c.id = cp.course_id
     WHERE cp.student_id = ?
     ORDER BY cp.updated_at DESC`,
    [studentId]
  );

  const certificates = query(
    `SELECT * FROM certificates WHERE student_id = ? ORDER BY issued_at DESC`,
    [studentId]
  );

  // Recent activity
  const recentActivities = query(
    `SELECT * FROM learning_activity WHERE student_id = ? ORDER BY timestamp DESC LIMIT 10`,
    [studentId]
  );

  return {
    profile,
    stats: {
      totalDoubts: doubts.length,
      totalAttempts,
      totalCorrect,
      overallAccuracy,
      avgResponseTime,
      topicsMasteredCount: masteryRecords.filter(m => m.mastery_state === "Mastered").length,
      topicsNeedsImprovementCount: masteryRecords.filter(m => m.mastery_state === "Needs Improvement").length,
    },
    masteryRecords,
    repeatedDoubts,
    activeRecommendations,
    enrolledCourses,
    certificates,
    recentActivities
  };
}
