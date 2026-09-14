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
} from "./types";

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
      throw new Error(
        "LearnX server encountered an internal error. Please try again."
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
   AUTHENTICATION
   ============================================================ */

export async function registerStudent(
  payload: any
): Promise<{
  token: string;
  student: StudentProfile;
}> {
  const data = await request<{
    token: string;
    student: StudentProfile;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setStoredToken(data.token);

  return data;
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
  const data = await request<{
    token: string;
    student: StudentProfile;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  setStoredToken(data.token);

  return data;
}

export async function logoutStudent(): Promise<void> {
  try {
    await request("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearStoredToken();
  }
}

export async function getMe(): Promise<{
  student: StudentProfile;
}> {
  return request<{
    student: StudentProfile;
  }>("/auth/me");
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
      ollama_endpoint: ollamaEndpoint,
    }),
  });
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
}): Promise<{
  mcq: GeneratedMCQ & {
    id: string;
    question_number?: number;
  };
}> {
  return request<{
    mcq: GeneratedMCQ & {
      id: string;
      question_number?: number;
    };
  }>("/ai/mcq/generate-next", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOllamaStatus(
  endpoint?: string
): Promise<OllamaStatus> {
  const queryParam = endpoint
    ? `?endpoint=${encodeURIComponent(endpoint)}`
    : "";

  return request<OllamaStatus>(
    `/ai/ollama-status${queryParam}`
  );
}

/* ============================================================
   CHAT SESSIONS
   ============================================================ */

export async function getChatSessions(): Promise<{
  sessions: ChatSession[];
}> {
  return request<{
    sessions: ChatSession[];
  }>("/chat/sessions");
}

export async function createChatSession(
  title?: string
): Promise<{
  id: string;
  title: string;
}> {
  return request<{
    id: string;
    title: string;
  }>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
}

export async function getChatDetails(
  id: string
): Promise<{
  session: ChatSession;
  messages: ChatMessage[];
}> {
  return request<{
    session: ChatSession;
    messages: ChatMessage[];
  }>(`/chat/sessions/${id}`);
}

export async function renameChatSession(
  id: string,
  title: string
): Promise<{
  success: boolean;
  title: string;
}> {
  return request<{
    success: boolean;
    title: string;
  }>(`/chat/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
    }),
  });
}

export async function deleteChatSession(
  id: string
): Promise<{
  success: boolean;
}> {
  return request<{
    success: boolean;
  }>(`/chat/sessions/${id}`, {
    method: "DELETE",
  });
}

/* ============================================================
   LEARNING ATTEMPTS
   ============================================================ */

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

/* ============================================================
   ANALYTICS & DASHBOARD
   ============================================================ */

export async function getStudentData(): Promise<StudentAnalytics> {
  return request<StudentAnalytics>(
    "/analytics/student-data"
  );
}

export async function getRecommendations(): Promise<{
  recommendations: Recommendation[];
}> {
  return request<{
    recommendations: Recommendation[];
  }>("/analytics/recommendations");
}

/* ============================================================
   COURSES
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
  const query = new URLSearchParams();

  if (filters?.search) {
    query.set("search", filters.search);
  }

  if (filters?.level) {
    query.set("level", filters.level);
  }

  if (filters?.branch) {
    query.set("branch", filters.branch);
  }

  const queryString = query.toString();

  return request<{
    courses: Course[];
  }>(
    queryString
      ? `/courses?${queryString}`
      : "/courses"
  );
}

export async function getCourseDetails(
  id: string
): Promise<{
  course: Course;
  modules: CourseModule[];
  progress?: any;
}> {
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
  return request<{
    success: boolean;
  }>(`/courses/${id}/enroll`, {
    method: "POST",
  });
}

export async function getLesson(
  lessonId: string
): Promise<{
  lesson: CourseLesson;
  content: {
    body_markdown: string;
  };
  assessment?: any;
}> {
  return request<{
    lesson: CourseLesson;
    content: {
      body_markdown: string;
    };
    assessment?: any;
  }>(`/courses/lessons/${lessonId}`);
}

export async function completeLesson(
  lessonId: string
): Promise<{
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
  return request<{
    certificates: Certificate[];
  }>("/certificates");
}

export async function getCertificateDetails(
  id: string
): Promise<{
  certificate: Certificate;
}> {
  return request<{
    certificate: Certificate;
  }>(`/certificates/${id}`);
}