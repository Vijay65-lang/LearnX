import React, { useState } from "react";
import {
  X,
  Cpu,
  Terminal,
  BookOpen,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award,
  FileText,
  TrendingUp,
  Download,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Sparkles
} from "lucide-react";
import { AIModelType, OllamaStatus } from "../types";

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: AIModelType;
  onSelectModel: (model: AIModelType) => void;
  ollamaEndpoint: string;
  onSaveEndpoint: (endpoint: string) => void;
  ollamaStatus: OllamaStatus | null;
  checkingOllama: boolean;
  onCheckOllama: () => void;
  pingMessage: string | null;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  ollamaEndpoint,
  onSaveEndpoint,
  ollamaStatus,
  checkingOllama,
  onCheckOllama,
  pingMessage,
}) => {
  const [tempEndpoint, setTempEndpoint] = useState(ollamaEndpoint);
  const [activeTab, setActiveTab] = useState<"models" | "guide" | "features">("models");

  if (!isOpen) return null;

  const handleSaveEndpoint = () => {
    if (tempEndpoint.trim()) {
      onSaveEndpoint(tempEndpoint.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="model-settings-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>AI Model Manager & Offline Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  100% Offline Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose your AI engine, connect local Qwen 2.5, or verify full offline features.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 sm:px-5">
          <button
            onClick={() => setActiveTab("models")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "models"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Select Model</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "guide"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download & Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === "features"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Feature Parity (MCQs & Certs)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: MODEL SELECTOR */}
          {activeTab === "models" && (
            <div className="space-y-3">
              {/* Option 1: Academic Knowledge Engine (Permanent & Built-in, 0 Download) */}
              <div
                onClick={() => onSelectModel("academic-engine")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "academic-engine"
                    ? "bg-emerald-950/40 border-emerald-500/70 shadow-sm shadow-emerald-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">LearnX Academic Engine (Built-in Permanent Offline)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          Default &bull; 0 Download
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          All Devices (Mobile/PC)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        The permanent, built-in offline educational intelligence engine. Works instantly across all mobile phones, tablets, and laptops without downloading large AI files. Provides verified, accurate explanations, step-by-step logic, code walkthroughs, and automatic mastery MCQs.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "academic-engine"
                          ? "border-emerald-500 bg-emerald-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "academic-engine" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Qwen 2.5 (Local LLM via Ollama) */}
              <div
                onClick={() => onSelectModel("qwen-2.5")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "qwen-2.5"
                    ? "bg-emerald-950/40 border-emerald-500/70 shadow-sm shadow-emerald-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Qwen 2.5 (Local Ollama LLM)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          Optional Local Model
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Alibaba&apos;s open reasoning model. If installed locally via Ollama (<code>ollama run qwen2.5</code>), LearnX connects directly via localhost for full neural generation.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "qwen-2.5"
                          ? "border-emerald-500 bg-emerald-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "qwen-2.5" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: DeepSeek R1 (Offline Chain-of-Thought Reasoning) */}
              <div
                onClick={() => onSelectModel("deepseek-r1")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "deepseek-r1"
                    ? "bg-blue-950/40 border-blue-500/70 shadow-sm shadow-blue-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">DeepSeek R1 (Offline Reasoning)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                          Deep Logic
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          Math &amp; Code
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Top-tier open reasoning model. Excels at complex mathematical derivations, computer science algorithms, step-by-step proofs, and deep conceptual breakdown.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "deepseek-r1"
                          ? "border-blue-500 bg-blue-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "deepseek-r1" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 3: Llama 3.2 (Offline Fast Tutor) */}
              <div
                onClick={() => onSelectModel("llama-3.2")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "llama-3.2"
                    ? "bg-violet-950/40 border-violet-500/70 shadow-sm shadow-violet-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Llama 3.2 (Offline Fast Tutor)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                          Meta Open AI
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          High Speed
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Meta&apos;s latest high-efficiency model. Delivers prompt, friendly, and structured student explanations with quick analogies and immediate takeaways.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "llama-3.2"
                          ? "border-violet-500 bg-violet-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "llama-3.2" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 4: Local Ollama Host */}
              <div
                onClick={() => onSelectModel("ollama")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "ollama"
                    ? "bg-cyan-950/40 border-cyan-500/70 shadow-sm shadow-cyan-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Local Ollama Runtime</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                          Local Host
                        </span>
                        {ollamaStatus?.online ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                            Auto-fallback ready
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Connect LearnX directly to your laptop's running Ollama daemon (e.g., <code>qwen2.5:1.5b</code>, <code>qwen2.5:7b</code>, or any local GGUF).
                      </p>

                      {/* Ollama Endpoint Configuration Bar */}
                      <div className="mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex-1 w-full flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-mono">Endpoint:</span>
                          <input
                            type="text"
                            value={tempEndpoint}
                            onChange={(e) => setTempEndpoint(e.target.value)}
                            placeholder="http://localhost:11434"
                            className="flex-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleSaveEndpoint}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={onCheckOllama}
                            disabled={checkingOllama}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${checkingOllama ? "animate-spin" : ""}`} />
                            <span>Ping</span>
                          </button>
                        </div>
                      </div>

                      {pingMessage && (
                        <div className="mt-2 text-[11px] text-slate-400 font-mono">
                          {pingMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "ollama"
                          ? "border-cyan-500 bg-cyan-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "ollama" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 5: Cloud Gemini */}
              <div
                onClick={() => onSelectModel("cloud-gemini")}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedModel === "cloud-gemini"
                    ? "bg-purple-950/40 border-purple-500/70 shadow-sm shadow-purple-500/10"
                    : "bg-slate-850/60 border-slate-750 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Cloud Gemini AI</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                          Cloud API
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Google Cloud Gemini model. Requires active cloud connection and unrestricted API quota.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedModel === "cloud-gemini"
                          ? "border-purple-500 bg-purple-500 text-slate-950"
                          : "border-slate-600"
                      }`}
                    >
                      {selectedModel === "cloud-gemini" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD & SETUP GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Why Qwen 2.5 is the Best Offline Model for You</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Qwen 2.5</strong> (created by Alibaba Cloud) is globally recognized as the highest-performing open-source family for academic mathematics, STEM reasoning, and coding. It outperforms similar-sized models (like LLaMA 3.2 and Gemma 2) on academic benchmarks like GSM8K and MATH.
                </p>
              </div>

              {/* Recommended Model Matrix */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Recommended Model Variants by Hardware
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-slate-800/80 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="text-emerald-400 font-bold">Qwen 2.5 - 1.5B (Best!)</div>
                    <div className="text-[11px] text-slate-400">RAM: ~1.8 GB</div>
                    <p className="text-[11px] text-slate-300">
                      Perfect balance of speed, high math comprehension, and university exam precision.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                    <div className="text-cyan-400 font-bold">Qwen 2.5 - 0.5B (Ultra-Light)</div>
                    <div className="text-[11px] text-slate-400">RAM: ~800 MB</div>
                    <p className="text-[11px] text-slate-300">
                      Ideal for older laptops, tablets, or low RAM configurations. Instant generation.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                    <div className="text-purple-400 font-bold">Qwen 2.5 - 7B (Deep Think)</div>
                    <div className="text-[11px] text-slate-400">RAM: ~6.0 GB</div>
                    <p className="text-[11px] text-slate-300">
                      For workstations with dedicated GPUs (NVIDIA/Apple M-Series) for research-level papers.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to run with Ollama */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Quick 1-Minute Setup via Ollama</span>
                  <span className="text-[10px] text-emerald-400 font-sans">Free & Open Source</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 font-sans text-xs">
                  <li>
                    Download Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">ollama.com</a> and install it.
                  </li>
                  <li>
                    Open your terminal (Command Prompt, PowerShell, or macOS Terminal) and choose your preferred model:
                    <div className="mt-2 space-y-1.5">
                      <div className="p-2 bg-slate-900 border border-emerald-800/40 rounded-lg text-emerald-400 font-mono text-xs flex items-center justify-between">
                        <code>ollama run qwen2.5:1.5b</code>
                        <span className="text-[10px] text-slate-400 font-sans"># High STEM accuracy</span>
                      </div>
                      <div className="p-2 bg-slate-900 border border-blue-800/40 rounded-lg text-blue-400 font-mono text-xs flex items-center justify-between">
                        <code>ollama run deepseek-r1:7b</code>
                        <span className="text-[10px] text-slate-400 font-sans"># Deep reasoning &amp; proofs</span>
                      </div>
                      <div className="p-2 bg-slate-900 border border-violet-800/40 rounded-lg text-violet-400 font-mono text-xs flex items-center justify-between">
                        <code>ollama run llama3.2</code>
                        <span className="text-[10px] text-slate-400 font-sans"># Meta fast lightweight</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    That&apos;s it! LearnX connects automatically to <code>http://localhost:11434</code> with zero cloud API keys.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE PARITY CHECKLIST */}
          {activeTab === "features" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
                <strong>100% Full Functionality Guarantee:</strong> Switching to an offline model never disables or degrades any part of LearnX. All core systems run independently on your local database.
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Concept Explanations & Strict Topic Classification",
                    desc: "Reads the entire student question without topic bleed. Formats with formulas, code, and exam takeaways.",
                    icon: Cpu,
                    status: "100% Operational Offline",
                  },
                  {
                    title: "Automatic Concept MCQs",
                    desc: "Immediately follows every doubt explanation with a concept-aligned 4-option quiz.",
                    icon: CheckCircle2,
                    status: "100% Operational Offline",
                  },
                  {
                    title: "Student Progress & Mastery Tracking",
                    desc: "Updates question attempts, accuracy, Weak Topics, and Mastery states (Needs Improvement -> Developing -> Mastered) in local database.",
                    icon: TrendingUp,
                    status: "100% Operational Offline",
                  },
                  {
                    title: "Academic PDF Report Generation",
                    desc: "Full PDF generation via jsPDF with syllabus breakdown, weak area diagnostics, and personalized study plans.",
                    icon: FileText,
                    status: "100% Operational Offline",
                  },
                  {
                    title: "Verified Course Certificates",
                    desc: "Completing 100% of course lessons with verified score unlocks downloadable signed academic completion certificates.",
                    icon: Award,
                    status: "100% Operational Offline",
                  },
                ].map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-850/70 border border-slate-800 rounded-xl flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            {feat.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Selected: <strong className="text-white capitalize">{selectedModel}</strong>
          </div>
          <button
            id="confirm-model-btn"
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
          >
            Done & Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};
