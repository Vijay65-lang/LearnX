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
  OllamaStatus
} from "./types";

const TOKEN_KEY = "learnx_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "An unexpected error occurred.");
  }
  return data;
}

// Authentication
export async function registerStudent(payload: any): Promise<{ token: string; student: StudentProfile }> {
  const data = await request<{ token: string; student: StudentProfile }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setStoredToken(data.token);
  return data;
}

export async function loginStudent(credentials: { email: string; password: string }): Promise<{ token: string; student: StudentProfile }> {
  const data = await request<{ token: string; student: StudentProfile }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  setStoredToken(data.token);
  return data;
}

export async function logoutStudent(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearStoredToken();
  }
}

export async function getMe(): Promise<{ student: StudentProfile }> {
  return request<{ student: StudentProfile }>("/auth/me");
}

export async function updateProfile(payload: Partial<StudentProfile>): Promise<{ student: StudentProfile }> {
  return request<{ student: StudentProfile }>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Ask AI Doubt Pipeline
export interface AskResponse {
  doubtId?: string;
  is_unclear?: boolean;
  clarification_question?: string;
  explanation?: string;
  detected_subject: string;
  detected_topic: string;
  detected_concept: string;
  validation_passed?: boolean;
  mcq?: GeneratedMCQ;
}

export async function askStudyDoubt(
  question: string,
  chatId?: string,
  model?: AIModelType,
  ollamaEndpoint?: string
): Promise<AskResponse> {
  return request<AskResponse>("/ai/ask", {
    method: "POST",
    body: JSON.stringify({
      question,
      chat_id: chatId,
      model,
      ollama_endpoint: ollamaEndpoint
    }),
  });
}

export async function getOllamaStatus(endpoint?: string): Promise<OllamaStatus> {
  const queryParam = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : "";
  return request<OllamaStatus>(`/ai/ollama-status${queryParam}`);
}

// Chat Sessions
export async function getChatSessions(): Promise<{ sessions: ChatSession[] }> {
  return request<{ sessions: ChatSession[] }>("/chat/sessions");
}

export async function createChatSession(title?: string): Promise<{ id: string; title: string }> {
  return request<{ id: string; title: string }>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function getChatDetails(id: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  return request<{ session: ChatSession; messages: ChatMessage[] }>(`/chat/sessions/${id}`);
}

export async function renameChatSession(id: string, title: string): Promise<{ success: boolean; title: string }> {
  return request<{ success: boolean; title: string }>(`/chat/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function deleteChatSession(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/chat/sessions/${id}`, {
    method: "DELETE",
  });
}

// Learning attempts & mastery
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
  return request<AttemptResult>("/learning/attempts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Analytics & Dashboard
export async function getStudentData(): Promise<StudentAnalytics> {
  return request<StudentAnalytics>("/analytics/student-data");
}

export async function getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
  return request<{ recommendations: Recommendation[] }>("/analytics/recommendations");
}

// Courses
export async function getCourses(filters?: { search?: string; level?: string; branch?: string }): Promise<{ courses: Course[] }> {
  const query = new URLSearchParams();
  if (filters?.search) query.set("search", filters.search);
  if (filters?.level) query.set("level", filters.level);
  if (filters?.branch) query.set("branch", filters.branch);
  return request<{ courses: Course[] }>(`/courses?${query.toString()}`);
}

export async function getCourseDetails(id: string): Promise<{
  course: Course;
  modules: CourseModule[];
  progress?: any;
}> {
  return request<{ course: Course; modules: CourseModule[]; progress?: any }>(`/courses/${id}`);
}

export async function enrollInCourse(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/courses/${id}/enroll`, {
    method: "POST",
  });
}

export async function getLesson(lessonId: string): Promise<{
  lesson: CourseLesson;
  content: { body_markdown: string };
  assessment?: any;
}> {
  return request<{
    lesson: CourseLesson;
    content: { body_markdown: string };
    assessment?: any;
  }>(`/courses/lessons/${lessonId}`);
}

export async function completeLesson(lessonId: string): Promise<{
  completed_lessons: string[];
  completion_percentage: number;
  status: string;
  certificate?: Certificate;
}> {
  return request<{
    completed_lessons: string[];
    completion_percentage: number;
    status: string;
    certificate?: Certificate;
  }>(`/courses/lessons/${lessonId}/complete`, {
    method: "POST",
  });
}

export async function createCourse(payload: any): Promise<{ id: string; message: string }> {
  return request<{ id: string; message: string }>("/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Certificates
export async function getCertificates(): Promise<{ certificates: Certificate[] }> {
  return request<{ certificates: Certificate[] }>("/certificates");
}

export async function getCertificateDetails(id: string): Promise<{ certificate: Certificate }> {
  return request<{ certificate: Certificate }>(`/certificates/${id}`);
}
