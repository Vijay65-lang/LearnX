import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let db: any = null;

// Determine writable SQLite file path (Vercel Serverless environment requires /tmp)
function getDbFilePath(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    return path.join('/tmp', 'learnx.sqlite');
  }

  try {
    const testPath = path.join(process.cwd(), '.write_test');
    fs.writeFileSync(testPath, 'ok');
    fs.unlinkSync(testPath);
    return path.join(process.cwd(), 'learnx.sqlite');
  } catch {
    return path.join('/tmp', 'learnx.sqlite');
  }
}

const DB_FILE = getDbFilePath();

export async function initDatabase() {
  if (db) return db;

  try {
    let SQL: any;
    try {
      SQL = await initSqlJs({
        locateFile: (file: string) => {
          const candidates = [
            path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
            path.join(process.cwd(), 'dist', file),
            path.join('/tmp', file),
            path.join(process.cwd(), file),
          ];
          for (const cand of candidates) {
            if (fs.existsSync(cand)) return cand;
          }
          return file;
        },
      });
    } catch {
      // Fallback standard call
      SQL = await initSqlJs();
    }

    // If source DB file exists in process.cwd(), but we need to run in /tmp, copy it
    const cwdDbFile = path.join(process.cwd(), 'learnx.sqlite');
    if (DB_FILE !== cwdDbFile && fs.existsSync(cwdDbFile) && !fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(cwdDbFile, DB_FILE);
      } catch (copyErr) {
        console.warn("Notice: could not copy initial sqlite to /tmp:", copyErr);
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileBuffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(fileBuffer);
      } catch {
        db = new SQL.Database();
      }
    } else {
      db = new SQL.Database();
    }
  } catch (sqlInitErr) {
    console.error("Warning: sql.js initialization failed, initializing memory database:", sqlInitErr);
    // Try in-memory fresh SQL database
    try {
      const SQL = await initSqlJs();
      db = new SQL.Database();
    } catch {
      console.error("Critical: Could not initialize sql.js WASM. Continuing with in-memory store.");
    }
  }

  if (!db) {
    // If db couldn't be created via WASM, mock a minimal memory runner to prevent 500 crash
    db = createFallbackDb();
  }

  // Enable foreign keys
  try {
    db.run("PRAGMA foreign_keys = ON;");
  } catch {
    // ignore
  }

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
  if (!db || typeof db.export !== 'function') return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    // If primary DB_FILE write fails, attempt /tmp fallback
    try {
      const tmpFile = path.join('/tmp', 'learnx.sqlite');
      if (DB_FILE !== tmpFile) {
        const data = db.export();
        fs.writeFileSync(tmpFile, Buffer.from(data));
      }
    } catch {
      // In-memory data will continue safely
    }
  }
}

export function query<T = any>(sqlStr: string, params: any[] = []): T[] {
  if (!db) {
    return [];
  }
  try {
    const stmt = db.prepare(sqlStr);
    stmt.bind(params);
    const rows: T[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return rows;
  } catch (err) {
    console.warn("SQL query error:", err, "for SQL:", sqlStr);
    return [];
  }
}

export function get<T = any>(sqlStr: string, params: any[] = []): T | null {
  const rows = query<T>(sqlStr, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sqlStr: string, params: any[] = []): void {
  if (!db) return;
  try {
    const stmt = db.prepare(sqlStr);
    stmt.run(params);
    stmt.free();
    saveDatabase();
  } catch (err) {
    console.warn("SQL run error:", err, "for SQL:", sqlStr);
  }
}

// In-memory fallback database runner in case WASM is blocked on cloud serverless
function createFallbackDb() {
  const tables: Record<string, any[]> = {
    students: [],
    student_profiles: [],
    doubts: [],
    doubt_topics: [],
    chat_sessions: [],
    chat_messages: [],
    mastery_records: [],
    recommendations: [],
    questions: [],
    question_attempts: [],
    courses: [],
    course_modules: [],
    course_lessons: [],
    course_content: [],
    course_assessments: [],
    course_progress: [],
    certificates: [],
    learning_activity: [],
    assessments: []
  };

  return {
    run: (sql: string) => {},
    prepare: (sql: string) => {
      let boundParams: any[] = [];
      let rows: any[] = [];
      let currentIndex = 0;

      return {
        bind: (params: any[]) => {
          boundParams = params || [];
          // Minimal handler for key tables to ensure zero crash
          const lower = sql.toLowerCase();
          if (lower.includes("from students") && lower.includes("where email =")) {
            const email = boundParams[0]?.toString().toLowerCase();
            rows = tables.students.filter(s => s.email?.toLowerCase() === email);
          } else if (lower.includes("from students") && lower.includes("where id =")) {
            const id = boundParams[0];
            rows = tables.students.filter(s => s.id === id);
          } else if (lower.includes("from student_profiles") && lower.includes("where student_id =")) {
            const sid = boundParams[0];
            rows = tables.student_profiles.filter(p => p.student_id === sid);
          } else if (lower.includes("from chat_sessions")) {
            const sid = boundParams[0];
            rows = tables.chat_sessions.filter(c => c.student_id === sid);
          } else if (lower.includes("from chat_messages")) {
            const cid = boundParams[0];
            rows = tables.chat_messages.filter(m => m.chat_id === cid);
          } else {
            rows = [];
          }
        },
        step: () => {
          return currentIndex < rows.length;
        },
        getAsObject: () => {
          const item = rows[currentIndex];
          currentIndex++;
          return item || {};
        },
        run: (params: any[]) => {
          boundParams = params || [];
          const lower = sql.toLowerCase();
          if (lower.includes("insert into students")) {
            tables.students.push({
              id: boundParams[0],
              name: boundParams[1],
              email: boundParams[2],
              password_hash: boundParams[3],
              created_at: new Date().toISOString()
            });
          } else if (lower.includes("insert into student_profiles")) {
            tables.student_profiles.push({
              id: boundParams[0],
              student_id: boundParams[1],
              education_level: boundParams[2],
              school_grade: boundParams[3],
              inter_stream: boundParams[4],
              degree_name: boundParams[5],
              degree_specialization: boundParams[6],
              btech_branch: boundParams[7],
              btech_year: boundParams[8],
              btech_semester: boundParams[9],
              updated_at: new Date().toISOString()
            });
          }
        },
        free: () => {}
      };
    },
    export: () => new Uint8Array()
  };
}
