import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: any = null;
const DB_FILE = path.join(process.cwd(), 'learnx.sqlite');

export async function initDatabase() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  // Create tables according to requirement
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      student_id TEXT UNIQUE NOT NULL,
      education_level TEXT NOT NULL,
      school_grade TEXT,
      inter_stream TEXT,
      degree_name TEXT,
      degree_specialization TEXT,
      btech_branch TEXT,
      btech_year TEXT,
      btech_semester TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      education_level TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      topic_id TEXT,
      subject_id TEXT,
      concept TEXT,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS question_attempts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      concept TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      selected_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      attempt_number INTEGER DEFAULT 1,
      response_time REAL DEFAULT 0,
      hints_used INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doubts (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      question TEXT NOT NULL,
      detected_subject TEXT NOT NULL,
      detected_topic TEXT NOT NULL,
      detected_concept TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS doubt_topics (
      id TEXT PRIMARY KEY,
      doubt_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      concept TEXT NOT NULL,
      frequency INTEGER DEFAULT 1,
      FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message_text TEXT NOT NULL,
      detected_subject TEXT,
      detected_topic TEXT,
      detected_concept TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mastery_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      accuracy REAL DEFAULT 0,
      mistakes INTEGER DEFAULT 0,
      avg_response_time REAL DEFAULT 0,
      mastery_state TEXT DEFAULT 'Not Started',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, subject, topic)
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      recommendation_type TEXT NOT NULL,
      title TEXT NOT NULL,
      reason TEXT NOT NULL,
      target_subject TEXT,
      target_topic TEXT,
      difficulty TEXT DEFAULT 'Medium',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      code TEXT,
      education_level TEXT NOT NULL,
      branch_stream TEXT,
      description TEXT,
      estimated_hours REAL DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      description TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      reading_time_min INTEGER DEFAULT 10,
      FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_content (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      content_type TEXT DEFAULT 'markdown',
      body_markdown TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_assessments (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      question TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      completed_lessons TEXT DEFAULT '[]',
      total_lessons INTEGER DEFAULT 0,
      completion_percentage REAL DEFAULT 0,
      status TEXT DEFAULT 'enrolled',
      completion_date DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_name TEXT NOT NULL,
      completion_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      certificate_id TEXT UNIQUE NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_activity (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      subject TEXT,
      topic TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      score REAL NOT NULL,
      total_questions INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  saveDatabase();
  return db;
}

export function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error("Failed to save sqlite database:", err);
  }
}

export function query<T = any>(sqlStr: string, params: any[] = []): T[] {
  if (!db) throw new Error("Database not initialized");
  const stmt = db.prepare(sqlStr);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export function get<T = any>(sqlStr: string, params: any[] = []): T | null {
  const rows = query<T>(sqlStr, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sqlStr: string, params: any[] = []): void {
  if (!db) throw new Error("Database not initialized");
  const stmt = db.prepare(sqlStr);
  stmt.run(params);
  stmt.free();
  saveDatabase();
}
