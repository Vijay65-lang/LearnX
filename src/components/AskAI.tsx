import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Award,
  FileText,
  Settings,
  Terminal,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  StopCircle
} from "lucide-react";
import {
  StudentProfile,
  ChatSession,
  ChatMessage,
  GeneratedMCQ,
  AttemptResult,
  AIModelType,
  OllamaStatus
} from "../types";
import { FormattedMessage } from "./FormattedMessage";
import {
  getChatSessions,
  createChatSession,
  getChatDetails,
  renameChatSession,
  deleteChatSession,
  askStudyDoubt,
  submitQuestionAttempt,
  getOllamaStatus,
  generateNextMCQ,
  generateResilientStudentResponse
} from "../api";
import { ModelSettingsModal } from "./ModelSettingsModal";
import { PomodoroTimer } from "./PomodoroTimer";

interface AskAIProps {
  student: StudentProfile;
  initialTopic?: string;
}

export const AskAI: React.FC<AskAIProps> = ({ student, initialTopic }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [inputQuestion, setInputQuestion] = useState(initialTopic ? `Explain ${initialTopic}` : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Model Selection & Offline Model State
  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    return (localStorage.getItem("learnx_preferred_model") as AIModelType) || "gemini";
  });
  const [easyMode, setEasyMode] = useState<boolean>(() => {
    const raw = localStorage.getItem("learnx_easy_mode");
    return raw !== null ? raw === "true" : true;
  });

  const handleToggleEasyMode = () => {
    const nextVal = !easyMode;
    setEasyMode(nextVal);
    localStorage.setItem("learnx_easy_mode", String(nextVal));
  };
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(() => {
    return localStorage.getItem("learnx_ollama_endpoint") || "http://localhost:11434";
  });
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  // Active MCQ state per message
  const [mcqsByMessage, setMcqsByMessage] = useState<Record<string, GeneratedMCQ & { id: string; question_number?: number }>>({});
  const [mcqQuestionNumbers, setMcqQuestionNumbers] = useState<Record<string, number>>({});
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [mcqResults, setMcqResults] = useState<Record<string, AttemptResult>>({});
  const [submittingMcq, setSubmittingMcq] = useState<Record<string, boolean>>({});
  const [generatingNextMcq, setGeneratingNextMcq] = useState<Record<string, boolean>>({});
  const [stoppedMcq, setStoppedMcq] = useState<Record<string, boolean>>({});
  const [mcqStats, setMcqStats] = useState<
    Record<string, { total: number; correct: number; previousQuestions: string[] }>
  >({});

  // Renaming chat state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");

  // Mobile drawer toggle for chat list
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadSessions();
  }, [student.id]);

  useEffect(() => {
    if (initialTopic) {
      setInputQuestion(`Explain ${initialTopic}`);
    }
  }, [initialTopic]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadSessions = async () => {
    // Reset state so new student never sees previous student's questions or sessions
    setMessages([]);
    setCurrentSessionId(null);
    setMcqsByMessage({});
    setMcqAnswers({});
    setMcqResults({});
    setError(null);

    try {
      const res = await getChatSessions();
      setSessions(res.sessions);
      if (res.sessions.length > 0) {
        selectSession(res.sessions[0].id);
      } else {
        // Automatically create first clean conversation for this student
        startNewChat("Study Session 1");
      }
    } catch (err: any) {
      console.error("Failed to load chat sessions:", err);
    }
  };

  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistoryDrawer(false);
    setError(null);
    try {
      const res = await getChatDetails(sessionId);
      setMessages(res.messages);
    } catch (err: any) {
      setError("Failed to load conversation messages.");
    }
  };

  const checkOllama = async (customEndpoint?: string) => {
    const target = customEndpoint || ollamaEndpoint;
    setCheckingOllama(true);
    setPingMessage(null);
    try {
      const status = await getOllamaStatus(target);
      setOllamaStatus(status);
      if (status.online) {
        setPingMessage(`Connected! Found ${status.models.length} model(s): ${status.models.slice(0, 3).join(", ") || "Ready"}`);
      } else {
        setPingMessage("Ollama not detected at this address. LearnX built-in Qwen 2.5 engine will run locally.");
      }
    } catch {
      setOllamaStatus({ online: false, models: [], recommendedModel: "qwen2.5:1.5b", hasQwen: false });
      setPingMessage("Ollama offline. Built-in Qwen 2.5 academic offline engine will be used.");
    } finally {
      setCheckingOllama(false);
    }
  };

  const handleSelectModel = (m: AIModelType) => {
    setSelectedModel(m);
    localStorage.setItem("learnx_preferred_model", m);
    if (m === "ollama" && !ollamaStatus) {
      checkOllama();
    }
  };

  const handleSaveEndpoint = (newEp: string) => {
    setOllamaEndpoint(newEp);
    localStorage.setItem("learnx_ollama_endpoint", newEp);
    checkOllama(newEp);
  };

  const startNewChat = async (customTitle?: string) => {
    setError(null);
    try {
      const title = customTitle || `Study Session ${sessions.length + 1}`;
      const newSession = await createChatSession(title);
      setSessions((prev) => [
        {
          id: newSession.id,
          title: newSession.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 0,
        },
        ...prev,
      ]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setShowHistoryDrawer(false);
    } catch (err: any) {
      setError("Could not create new chat session.");
    }
  };

  const handleRename = async (sessionId: string) => {
    if (!editingTitleText.trim()) return;
    try {
      await renameChatSession(sessionId, editingTitleText.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s))
      );
      setEditingTitleId(null);
    } catch {
      setError("Failed to rename chat.");
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          startNewChat();
        }
      }
    } catch {
      setError("Failed to delete chat.");
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const questionText = inputQuestion.trim();
    setInputQuestion("");
    setError(null);

    // Make sure a chat session exists
    let activeChatId = currentSessionId;
    if (!activeChatId) {
      const newSession = await createChatSession(questionText.substring(0, 30));
      activeChatId = newSession.id;
      setCurrentSessionId(activeChatId);
      setSessions((prev) => [
        {
          id: newSession.id,
          title: newSession.title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    // Add student question to local state immediately
    const tempUserMsg: ChatMessage = {
      id: "temp_user_" + Date.now(),
      chat_id: activeChatId,
      sender: "user",
      message_text: questionText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setLoading(true);
    questionStartTimeRef.current = Date.now();

    try {
      // Step 1 to 8: Run strict question understanding & validated explanation with selected model
      const isMobile = typeof window !== "undefined" && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);
      const effectiveModel: AIModelType = (isMobile && selectedModel === "ollama") ? "academic-engine" : selectedModel;
      const effectiveEndpoint = isMobile ? undefined : ollamaEndpoint;

      const res = await askStudyDoubt(
        questionText,
        activeChatId,
        effectiveModel,
        effectiveEndpoint,
        student,
        undefined,
        undefined,
        easyMode
      );

      if (res.is_unclear) {
        const clarificationMsg: ChatMessage = {
          id: "clarify_" + Date.now(),
          chat_id: activeChatId,
          sender: "assistant",
          message_text: `🤔 ${res.clarification_question || "Could you please specify your question in more detail?"}`,
          detected_subject: res.detected_subject,
          detected_topic: res.detected_topic,
          detected_concept: res.detected_concept,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, clarificationMsg]);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        chat_id: activeChatId,
        sender: "assistant",
        message_text: res.explanation || "Concept explanation generated.",
        detected_subject: res.detected_subject,
        detected_topic: res.detected_topic,
        detected_concept: res.detected_concept,
        timestamp: new Date().toISOString(),
        mcq: res.mcq,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If this was first message, update title
      if (messages.length === 0) {
        const autoTitle = res.is_conversational
          ? questionText.slice(0, 24)
          : `${res.detected_topic}: ${res.detected_concept.slice(0, 20)}`;
        renameChatSession(activeChatId, autoTitle);
        setSessions((prev) =>
          prev.map((s) => (s.id === activeChatId ? { ...s, title: autoTitle } : s))
        );
      }
    } catch (err: any) {
      console.warn("AI Ask encountered error, deploying resilient student response:", err);
      try {
        const fallbackRes = generateResilientStudentResponse(questionText, student);
        const fallbackMsg: ChatMessage = {
          id: "msg_fallback_" + Date.now(),
          chat_id: activeChatId,
          sender: "assistant",
          message_text: fallbackRes.explanation || "Concept explanation ready.",
          detected_subject: fallbackRes.detected_subject,
          detected_topic: fallbackRes.detected_topic,
          detected_concept: fallbackRes.detected_concept,
          timestamp: new Date().toISOString(),
          mcq: fallbackRes.mcq,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } catch {
        setError(err.message || "Failed to process question. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Student submits the auto-generated MCQ
  const handleMcqSubmit = async (msgId: string, mcq: GeneratedMCQ & { id: string }) => {
    const selected = mcqAnswers[msgId];
    if (!selected || submittingMcq[msgId]) return;

    setSubmittingMcq((prev) => ({ ...prev, [msgId]: true }));
    const responseTimeSec = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    try {
      const result = await submitQuestionAttempt({
        question_id: mcq.id,
        subject: mcq.subject,
        topic: mcq.topic,
        concept: mcq.concept,
        difficulty: mcq.difficulty,
        selected_answer: selected,
        correct_answer: mcq.correct_option,
        response_time: Math.min(300, Math.max(2, responseTimeSec)),
      });

      setMcqResults((prev) => ({ ...prev, [msgId]: result }));
      setMcqStats((prev) => {
        const current = prev[msgId] || { total: 0, correct: 0, previousQuestions: [] };
        return {
          ...prev,
          [msgId]: {
            total: current.total + 1,
            correct: current.correct + (result.is_correct ? 1 : 0),
            previousQuestions: [...current.previousQuestions, mcq.question_text],
          },
        };
      });
    } catch (err: any) {
      setError("Failed to record answer attempt.");
    } finally {
      setSubmittingMcq((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  // Generate next continuous MCQ for this doubt/topic (Infinite MCQs)
  const handleNextQuestion = async (msgId: string, currentMcq: GeneratedMCQ & { id: string }) => {
    if (generatingNextMcq[msgId]) return;
    setGeneratingNextMcq((prev) => ({ ...prev, [msgId]: true }));
    setError(null);

    const currentQNum = mcqQuestionNumbers[msgId] || 1;
    const nextQNum = currentQNum + 1;
    const previousQuestions = mcqStats[msgId]?.previousQuestions || [currentMcq.question_text];

    try {
      const streamBranch = student.inter_stream || student.btech_branch || student.degree_specialization;
      const res = await generateNextMCQ({
        subject: currentMcq.subject,
        topic: currentMcq.topic,
        concept: currentMcq.concept,
        difficulty: nextQNum <= 2 ? "Medium" : nextQNum <= 4 ? "Hard" : "Medium",
        question_index: nextQNum,
        previous_questions: previousQuestions,
        model: selectedModel,
        ollama_endpoint: ollamaEndpoint,
        education_level: student.education_level,
        stream_branch: streamBranch,
      });

      if (res.mcq) {
        setMcqsByMessage((prev) => ({ ...prev, [msgId]: res.mcq }));
        setMcqQuestionNumbers((prev) => ({ ...prev, [msgId]: nextQNum }));
        // Reset answer and result for the new question
        setMcqAnswers((prev) => {
          const copy = { ...prev };
          delete copy[msgId];
          return copy;
        });
        setMcqResults((prev) => {
          const copy = { ...prev };
          delete copy[msgId];
          return copy;
        });
        questionStartTimeRef.current = Date.now();
      }
    } catch (err: any) {
      setError("Failed to generate next practice question. Please try again.");
    } finally {
      setGeneratingNextMcq((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  const handleStopMcq = (msgId: string) => {
    setStoppedMcq((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleResumeMcq = (msgId: string) => {
    setStoppedMcq((prev) => ({ ...prev, [msgId]: false }));
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="ask-ai-view" className="max-w-6xl mx-auto h-full w-full flex flex-col md:flex-row overflow-hidden text-slate-100 relative">
      {/* Mobile Drawer Backdrop */}
      {showHistoryDrawer && (
        <div
          onClick={() => setShowHistoryDrawer(false)}
          className="md:hidden fixed inset-0 z-20 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* SIDEBAR: Chat History (Section 9) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          showHistoryDrawer ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold tracking-tight text-white uppercase">Study Chats</h2>
          </div>
          <button
            id="start-new-chat-btn"
            onClick={() => startNewChat()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Chat History (Section 9) */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              Your conversations will appear here.
            </div>
          ) : (
            filteredSessions.map((s) => {
              const active = currentSessionId === s.id;
              const isEditing = editingTitleId === s.id;

              return (
                <div
                  key={s.id}
                  id={`chat-item-${s.id}`}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${
                    active
                      ? "bg-indigo-950/60 text-indigo-200 border border-indigo-800/40 font-medium"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                  onClick={() => !isEditing && selectSession(s.id)}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitleText}
                        onChange={(e) => setEditingTitleText(e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-800 border border-indigo-500 rounded text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(s.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTitleId(null)}
                        className="p-1 text-slate-400 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="truncate pr-2">
                        <div className="truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(s.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(s.id);
                            setEditingTitleText(s.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Close Drawer on Mobile */}
        <div className="p-2 border-t border-slate-800 md:hidden">
          <button
            onClick={() => setShowHistoryDrawer(false)}
            className="w-full py-2 bg-slate-800 text-xs text-slate-300 rounded-lg text-center"
          >
            Close History
          </button>
        </div>
      </aside>

      {/* MAIN CHAT CONVERSATION AREA */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        {/* Chat Header Bar */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              title="Toggle History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{sessions.find((s) => s.id === currentSessionId)?.title || "Study Session"}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span>Clean Context</span>
                <span>·</span>
                <span>Independent Validation</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Model Badge & Switcher Button */}
            <button
              id="model-selector-btn"
              type="button"
              onClick={() => setShowModelModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition shadow-xs"
              title="Change AI Model or Configure Offline Qwen 2.5"
            >
              {selectedModel === "qwen-2.5" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Qwen 2.5 (Offline)</span>
                </>
              )}
              {selectedModel === "deepseek-r1" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-blue-300">DeepSeek R1 (Offline)</span>
                </>
              )}
              {selectedModel === "llama-3.2" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-semibold text-violet-300">Llama 3.2 (Offline)</span>
                </>
              )}
              {selectedModel === "ollama" && (
                <>
                  <span className={`w-2 h-2 rounded-full ${ollamaStatus?.online ? "bg-cyan-400" : "bg-amber-400"}`}></span>
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-cyan-300">Ollama Local</span>
                </>
              )}
              {selectedModel === "academic-engine" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-amber-300">Academic Engine</span>
                </>
              )}
              {(selectedModel === "cloud-gemini" || selectedModel === "gemini") && (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-indigo-300">Gemini AI Tutor</span>
                </>
              )}
              <Settings className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Easy Student Mode Toggle Button */}
            <button
              id="easy-mode-toggle-btn"
              type="button"
              onClick={handleToggleEasyMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                easyMode
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-900/30"
                  : "bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400"
              }`}
              title={easyMode ? "Easy Student Mode active: AI explains using simple words, fun analogies, and clear steps" : "Click to enable Easy Student Mode"}
            >
              <Sparkles className={`w-3.5 h-3.5 ${easyMode ? "text-emerald-400" : "text-slate-500"}`} />
              <span>Easy Mode</span>
              {easyMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Pomodoro Study Timer Widget */}
            <PomodoroTimer />

            {/* Prominent New Chat Button (requested by user) */}
            <button
              id="new-chat-header-btn"
              type="button"
              onClick={() => startNewChat()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="Start a new chat conversation with a fresh context"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Chat</span>
            </button>
          </div>
        </div>

        {/* Offline AI Status Notice Strip */}
        <div className="px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-900/40 text-[11px] text-emerald-300/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {selectedModel === "qwen-2.5" ? (
                <><strong>Offline AI Mode Active:</strong> Running Qwen 2.5 locally. MCQs, progress tracking, certificates, and PDF reports work 100%.</>
              ) : selectedModel === "deepseek-r1" ? (
                <><strong>DeepSeek R1 Offline:</strong> Advanced chain-of-thought reasoning active for mathematics, algorithms, and proofs.</>
              ) : selectedModel === "llama-3.2" ? (
                <><strong>Llama 3.2 Offline:</strong> Fast Meta tutor model active for swift conceptual explanations.</>
              ) : selectedModel === "ollama" ? (
                <><strong>Ollama Bridge Active:</strong> Connected to local host at <code>{ollamaEndpoint}</code>. All features operational.</>
              ) : selectedModel === "academic-engine" ? (
                <><strong>Academic Knowledge Engine:</strong> High-yield exam syllabus database active with verified curriculum MCQs.</>
              ) : (
                <><strong>Cloud Mode:</strong> Cloud-connected AI analysis enabled.</>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowModelModal(true)}
            className="text-[10px] text-emerald-400 hover:underline shrink-0 ml-2 font-medium"
          >
            Guide & Setup &rarr;
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="m-3 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Ask Any Study Doubt
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Type any concept from your syllabus. LearnX reads the entire question, validates the exact Subject &rarr; Topic &rarr; Concept, provides a tailored explanation, and tests your mastery with an automatic quiz.
                </p>
              </div>

              {/* Quick Inspiration Pills */}
              <div className="w-full pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Try asking (Easy Student Topics):
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Newton's 3 Laws with simple examples",
                    "How Photosynthesis works step-by-step",
                    "What is Ohm's Law (V = IR)?",
                    "How to solve Quadratic Equations easily",
                    "Difference between Speed and Velocity",
                    "Explain Python Loops for beginners",
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setInputQuestion(`Explain ${sample}`)}
                      className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl transition hover:border-indigo-500/50 text-left"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id || index}
                  id={`msg-${msg.id}`}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1 font-mono">
                    <span>{isUser ? student.name : "LearnX AI"}</span>
                    <span>·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-md ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-br-xs"
                        : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs"
                    }`}
                  >
                    {/* Curriculum Badge (Only for academic concepts) */}
                    {!isUser && msg.detected_subject && msg.detected_subject !== "General" && msg.detected_subject !== "Conversational" && (
                      <div className="mb-3.5 flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px]">
                        <span className="font-semibold text-indigo-400">Curriculum:</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                          {msg.detected_subject}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                          {msg.detected_topic}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/50">
                          {msg.detected_concept}
                        </span>
                      </div>
                    )}

                    {/* Message Body */}
                    {isUser ? (
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {msg.message_text}
                      </div>
                    ) : (
                      <FormattedMessage content={msg.message_text} />
                    )}

                    {/* Automatic & Infinite MCQ Engine After Doubt (Sections 11 & 12) */}
                    {!isUser && msg.mcq && (() => {
                      const activeMcq = mcqsByMessage[msg.id] || msg.mcq;
                      const qNum = mcqQuestionNumbers[msg.id] || 1;
                      const isStopped = Boolean(stoppedMcq[msg.id]);
                      const stats = mcqStats[msg.id] || { total: 0, correct: 0, previousQuestions: [] };
                      const selectedAnswer = mcqAnswers[msg.id];
                      const result = mcqResults[msg.id];
                      const isSubmitted = Boolean(result);
                      const isGeneratingNext = Boolean(generatingNextMcq[msg.id]);

                      if (isStopped) {
                        return (
                          <div className="mt-4 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
                                <StopCircle className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-200 flex items-center gap-2">
                                  <span>MCQ Practice Stopped for this Doubt</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-800 font-mono">
                                    {activeMcq.concept}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {stats.total > 0
                                    ? `Completed ${stats.total} question${stats.total > 1 ? "s" : ""} • Score: ${stats.correct}/${stats.total} correct (${Math.round((stats.correct / stats.total) * 100)}% accuracy).`
                                    : "Practice questions were stopped for this topic. Click resume to continue practicing anytime!"}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleResumeMcq(msg.id)}
                              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Resume Practice</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                          {/* Header Bar */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <HelpCircle className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                                Concept Comprehension Check
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
                                Question #{qNum}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {activeMcq.difficulty}
                              </span>
                              {stats.total > 0 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                  Score: {stats.correct}/{stats.total}
                                </span>
                              )}
                            </div>

                            {/* Stop Option Button */}
                            <button
                              type="button"
                              onClick={() => handleStopMcq(msg.id)}
                              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-rose-900/60 hover:bg-rose-950/30 transition"
                              title="Stop MCQ practice for this doubt/topic"
                            >
                              <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Stop MCQ for this doubt</span>
                            </button>
                          </div>

                          <p className="text-xs font-semibold text-slate-200">
                            {activeMcq.question_text}
                          </p>

                          {/* Options */}
                          <div className="space-y-2">
                            {[
                              { key: "A", text: activeMcq.option_a },
                              { key: "B", text: activeMcq.option_b },
                              { key: "C", text: activeMcq.option_c },
                              { key: "D", text: activeMcq.option_d },
                            ].map((opt) => {
                              const selected = selectedAnswer === opt.key;
                              const isCorrectOption = activeMcq.correct_option === opt.key;

                              let optStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750";
                              if (isSubmitted) {
                                if (isCorrectOption) {
                                  optStyle = "bg-emerald-950/60 border-emerald-500/60 text-emerald-200";
                                } else if (selected) {
                                  optStyle = "bg-rose-950/60 border-rose-500/60 text-rose-200";
                                } else {
                                  optStyle = "bg-slate-850/40 border-slate-800 text-slate-500 opacity-60";
                                }
                              } else if (selected) {
                                optStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-100 font-semibold";
                              }

                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() =>
                                    setMcqAnswers((prev) => ({
                                      ...prev,
                                      [msg.id]: opt.key as "A" | "B" | "C" | "D",
                                    }))
                                  }
                                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${optStyle}`}
                                >
                                  <span className="font-mono font-bold w-5 h-5 rounded-full bg-slate-900/60 flex items-center justify-center shrink-0 text-[11px]">
                                    {opt.key}
                                  </span>
                                  <span className="flex-1">{opt.text}</span>
                                  {isSubmitted && isCorrectOption && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  )}
                                  {isSubmitted && selected && !isCorrectOption && (
                                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit or Result & Next Question Actions */}
                          {!result ? (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                disabled={!selectedAnswer || submittingMcq[msg.id]}
                                onClick={() => handleMcqSubmit(msg.id, activeMcq)}
                                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                              >
                                {submittingMcq[msg.id] ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <span>Submit Answer</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStopMcq(msg.id)}
                                className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 rounded-xl text-xs transition"
                                title="Stop questions for this doubt"
                              >
                                Stop MCQ
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 pt-1">
                              <div
                                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                                  result.is_correct
                                    ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                                    : "bg-rose-950/40 border-rose-800/50 text-rose-300"
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span>
                                    {result.is_correct
                                      ? "✓ Correct Answer!"
                                      : `✗ Incorrect. Correct option was ${activeMcq.correct_option}`}
                                  </span>
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-white">
                                    Mastery: {result.mastery.mastery_state}
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-300">
                                  {activeMcq.explanation}
                                </p>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                                  <span>
                                    Accuracy: {result.mastery.accuracy}% ({result.mastery.correct_count}/{result.mastery.attempts} attempts)
                                  </span>
                                  <span>
                                    Session: {stats.correct}/{stats.total} correct
                                  </span>
                                </div>
                              </div>

                              {/* Strong Concept Teaching Box for Wrong Answers */}
                              {!result.is_correct && (
                                <div
                                  id={`concept-coach-${msg.id}`}
                                  className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-3 animate-in fade-in duration-200"
                                >
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                      <Sparkles className="w-4 h-4 text-amber-400" />
                                      <span>Team LearnX Deep Concept Recovery Coach</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                                      Mastery Reinforcement
                                    </span>
                                  </div>

                                  <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-900/50 space-y-2 text-xs">
                                    <div className="flex items-start gap-2">
                                      <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 font-mono text-[10px] font-bold shrink-0">
                                        Selected Trap: Option {selectedAnswer}
                                      </span>
                                      <span className="text-slate-300 text-xs">
                                        {selectedAnswer === "A" && activeMcq.option_a}
                                        {selectedAnswer === "B" && activeMcq.option_b}
                                        {selectedAnswer === "C" && activeMcq.option_c}
                                        {selectedAnswer === "D" && activeMcq.option_d}
                                      </span>
                                    </div>
                                    <div className="flex items-start gap-2 pt-1.5 border-t border-slate-800">
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                                        Ground Truth: Option {activeMcq.correct_option}
                                      </span>
                                      <span className="text-emerald-200 text-xs font-semibold">
                                        {activeMcq.correct_option === "A" && activeMcq.option_a}
                                        {activeMcq.correct_option === "B" && activeMcq.option_b}
                                        {activeMcq.correct_option === "C" && activeMcq.option_c}
                                        {activeMcq.correct_option === "D" && activeMcq.option_d}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                                      <span>💡 Core Conceptual Principle &amp; Mental Anchor:</span>
                                    </div>
                                    <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5">
                                      <p>{activeMcq.explanation}</p>
                                      <p className="text-indigo-300 text-[11px] font-medium pt-1 border-t border-slate-800/80">
                                        Key Takeaway: Focus on the fundamental definition of {activeMcq.concept || activeMcq.topic || "this topic"} rather than memorizing option patterns.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                                    <p className="text-[11px] text-amber-200/85 italic">
                                      Remember: Team LearnX will study with you until your doubt is completely cleared!
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInputQuestion(
                                          `I made a mistake on this question about "${activeMcq.concept || activeMcq.topic}". Can you teach me this concept strongly from first principles with a clear analogy and step-by-step real-world examples?`
                                        );
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                                      <span>Coach Me On This Doubt</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Infinite Next Question / Stop Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isGeneratingNext}
                                  onClick={() => handleNextQuestion(msg.id, activeMcq)}
                                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
                                >
                                  {isGeneratingNext ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      <span>Generating Next Question...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                                      <span>Next Question (#{qNum + 1}) →</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStopMcq(msg.id)}
                                  className="py-2.5 px-3.5 bg-slate-850 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60 rounded-xl text-xs transition flex items-center gap-1.5"
                                >
                                  <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Stop MCQ</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}

          {/* AI Generating Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                <span>Reading complete question &rarr; Validating concept &rarr; Generating explanation...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Question Input Form (Fixed at Bottom of Chat) */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur">
          {messages.length > 0 && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                Current: <strong className="text-slate-300">{sessions.find((s) => s.id === currentSessionId)?.title || "Study Session"}</strong>
              </span>
              <button
                id="new-chat-inline-btn"
                type="button"
                onClick={() => startNewChat()}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition hover:underline shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>+ New Chat</span>
              </button>
            </div>
          )}
          {/* Quick Concept Suggestions (Helps students get easy, accurate answers instantly) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Easy topics:
            </span>
            {[
              "Explain Newton's 3 Laws with simple examples",
              "How Photosynthesis works step-by-step",
              "What is Ohm's Law (V = IR)?",
              "How to solve Quadratic Equations easily",
              "Difference between Speed and Velocity",
              "Explain Python Loops for beginners",
            ].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setInputQuestion(`Explain ${topic}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700/80 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 shrink-0 transition text-left text-[11px]"
              >
                {topic}
              </button>
            ))}
          </div>

          <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
            <input
              id="ask-question-input"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={easyMode ? "Ask any study doubt (Explained simply with easy examples & steps)..." : "Ask any study question..."}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              id="ask-submit-button"
              type="submit"
              disabled={!inputQuestion.trim() || loading}
              className="p-3 sm:px-5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </main>

      {/* Model Settings & Offline AI Guide Modal */}
      <ModelSettingsModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        ollamaEndpoint={ollamaEndpoint}
        onSaveEndpoint={handleSaveEndpoint}
        ollamaStatus={ollamaStatus}
        checkingOllama={checkingOllama}
        onCheckOllama={() => checkOllama()}
        pingMessage={pingMessage}
      />
    </div>
  );
};
