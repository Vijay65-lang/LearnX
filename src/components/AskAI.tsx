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
  ShieldCheck
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
import {
  getChatSessions,
  createChatSession,
  getChatDetails,
  renameChatSession,
  deleteChatSession,
  askStudyDoubt,
  submitQuestionAttempt,
  getOllamaStatus
} from "../api";
import { ModelSettingsModal } from "./ModelSettingsModal";

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
    return (localStorage.getItem("learnx_preferred_model") as AIModelType) || "qwen-2.5";
  });
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(() => {
    return localStorage.getItem("learnx_ollama_endpoint") || "http://localhost:11434";
  });
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  // Active MCQ state per message
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [mcqResults, setMcqResults] = useState<Record<string, AttemptResult>>({});
  const [submittingMcq, setSubmittingMcq] = useState<Record<string, boolean>>({});

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
  }, []);

  useEffect(() => {
    if (initialTopic) {
      setInputQuestion(`Explain ${initialTopic}`);
    }
  }, [initialTopic]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const res = await getChatSessions();
      setSessions(res.sessions);
      if (res.sessions.length > 0 && !currentSessionId) {
        selectSession(res.sessions[0].id);
      } else if (res.sessions.length === 0) {
        // Automatically create first clean conversation
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
      const res = await askStudyDoubt(questionText, activeChatId, selectedModel, ollamaEndpoint);

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
        const autoTitle = `${res.detected_topic}: ${res.detected_concept.slice(0, 20)}`;
        renameChatSession(activeChatId, autoTitle);
        setSessions((prev) =>
          prev.map((s) => (s.id === activeChatId ? { ...s, title: autoTitle } : s))
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to process question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Student submits the auto-generated MCQ
  const handleMcqSubmit = async (msgId: string, mcq: GeneratedMCQ) => {
    const selected = mcqAnswers[msgId];
    if (!selected) return;

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
    } catch (err: any) {
      setError("Failed to record answer attempt.");
    } finally {
      setSubmittingMcq((prev) => ({ ...prev, [msgId]: false }));
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="ask-ai-view" className="max-w-6xl mx-auto h-[calc(100vh-65px)] flex flex-col md:flex-row pb-16 md:pb-0 overflow-hidden text-slate-100">
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
              {selectedModel === "cloud-gemini" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <Wifi className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold text-purple-300">Cloud Gemini</span>
                </>
              )}
              <Settings className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

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
                  Sample Topics:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "LL(1) Parser in Compiler Design",
                    "Binary Search Tree Traversal",
                    "Newton's Laws of Motion",
                    "Bernoulli's Principle",
                    "Mendelian Inheritance in Biology",
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
                    {/* Classification Badges (Sections 6 & 8) */}
                    {!isUser && msg.detected_subject && (
                      <div className="mb-3.5 flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px]">
                        <span className="font-semibold text-indigo-400">Validated:</span>
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
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {msg.message_text}
                    </div>

                    {/* Automatic MCQ After Doubt (Sections 11 & 12) */}
                    {!isUser && msg.mcq && (
                      <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                              Concept Comprehension Check
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {msg.mcq.difficulty}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-200">
                          {msg.mcq.question_text}
                        </p>

                        {/* Options */}
                        <div className="space-y-2">
                          {[
                            { key: "A", text: msg.mcq.option_a },
                            { key: "B", text: msg.mcq.option_b },
                            { key: "C", text: msg.mcq.option_c },
                            { key: "D", text: msg.mcq.option_d },
                          ].map((opt) => {
                            const selected = mcqAnswers[msg.id] === opt.key;
                            const result = mcqResults[msg.id];
                            const isSubmitted = Boolean(result);
                            const isCorrectOption = msg.mcq?.correct_option === opt.key;

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

                        {/* Submit Button or Result Card */}
                        {!mcqResults[msg.id] ? (
                          <button
                            type="button"
                            disabled={!mcqAnswers[msg.id] || submittingMcq[msg.id]}
                            onClick={() => handleMcqSubmit(msg.id, msg.mcq!)}
                            className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
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
                        ) : (
                          <div
                            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                              mcqResults[msg.id].is_correct
                                ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                                : "bg-rose-950/40 border-rose-800/50 text-rose-300"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>
                                {mcqResults[msg.id].is_correct
                                  ? "✓ Correct Answer!"
                                  : `✗ Incorrect. Correct option was ${msg.mcq.correct_option}`}
                              </span>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-white">
                                Mastery: {mcqResults[msg.id].mastery.mastery_state}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-300">
                              {msg.mcq.explanation}
                            </p>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Topic Accuracy: {mcqResults[msg.id].mastery.accuracy}% ({mcqResults[msg.id].mastery.correct_count}/{mcqResults[msg.id].mastery.attempts} attempts)
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
          <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
            <input
              id="ask-question-input"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask any study question (e.g., 'What is an LL(1) parser?' or 'Explain photosynthesis')..."
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
