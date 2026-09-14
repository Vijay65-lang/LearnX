export type EducationLevel = "School" | "Intermediate" | "Degree" | "B.Tech";

export type AIModelType =
  | "qwen-2.5"
  | "deepseek-r1"
  | "llama-3.2"
  | "academic-engine"
  | "ollama"
  | "cloud-gemini";

export interface OllamaStatus {
  online: boolean;
  models: string[];
  recommendedModel: string;
  hasQwen: boolean;
  hasDeepSeek?: boolean;
  hasLlama?: boolean;
}

export type MasteryState =
  | "Not Started"
  | "Insufficient Data"
  | "Needs Improvement"
  | "Developing"
  | "Strong"
  | "Mastered";

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  education_level: EducationLevel;
  school_grade?: string;
  inter_stream?: string;
  degree_name?: string;
  degree_specialization?: string;
  btech_branch?: string;
  btech_year?: string;
  btech_semester?: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender: "user" | "assistant";
  message_text: string;
  detected_subject?: string;
  detected_topic?: string;
  detected_concept?: string;
  timestamp: string;
  mcq?: GeneratedMCQ;
  attempt_result?: AttemptResult;
}

export interface GeneratedMCQ {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  topic: string;
  concept: string;
  validation_passed?: boolean;
}

export interface AttemptResult {
  is_correct: boolean;
  correct_answer: string;
  selected_answer?: string;
  mastery: {
    subject: string;
    topic: string;
    attempts: number;
    correct_count: number;
    accuracy: number;
    mistakes: number;
    avg_response_time: number;
    mastery_state: MasteryState;
    difficulty: "Easy" | "Medium" | "Hard";
  };
}

export interface MasteryRecord {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  attempts: number;
  correct_count: number;
  accuracy: number;
  mistakes: number;
  avg_response_time: number;
  mastery_state: MasteryState;
  updated_at: string;
}

export interface Recommendation {
  id: string;
  student_id: string;
  recommendation_type: "revise" | "practice" | "advance" | "course";
  title: string;
  reason: string;
  target_subject?: string;
  target_topic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  is_active: number;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  code?: string;
  education_level: EducationLevel;
  branch_stream?: string;
  description?: string;
  estimated_hours: number;
  module_count?: number;
  lesson_count?: number;
  completion_percentage?: number;
  enrollment_status?: "enrolled" | "in_progress" | "completed";
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  description?: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  reading_time_min: number;
  has_assessment?: number;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  certificate_id: string;
  issued_at: string;
}

export interface LearningActivity {
  id: string;
  student_id: string;
  activity_type: string;
  description: string;
  subject?: string;
  topic?: string;
  timestamp: string;
}

export interface StudentAnalytics {
  profile: StudentProfile;
  stats: {
    totalDoubts: number;
    totalAttempts: number;
    totalCorrect: number;
    overallAccuracy: number;
    avgResponseTime: number;
    topicsMasteredCount: number;
    topicsNeedsImprovementCount: number;
  };
  masteryRecords: MasteryRecord[];
  repeatedDoubts: Array<{ subject: string; topic: string; count: number }>;
  activeRecommendations: Recommendation[];
  enrolledCourses: Course[];
  certificates: Certificate[];
  recentActivities: LearningActivity[];
}
