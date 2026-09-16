import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Coffee,
  CheckCircle,
  Volume2,
  VolumeX,
  X,
  ChevronDown
} from "lucide-react";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  onSessionComplete?: (sessionsCount: number) => void;
  className?: string;
}

const MODE_CONFIG: Record<
  PomodoroMode,
  { label: string; defaultMinutes: number; color: string; bgBadge: string; textBadge: string; icon: React.ReactNode }
> = {
  focus: {
    label: "Focus Time",
    defaultMinutes: 25,
    color: "from-indigo-500 to-indigo-600",
    bgBadge: "bg-indigo-500/20 border-indigo-500/40",
    textBadge: "text-indigo-300",
    icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
  },
  shortBreak: {
    label: "Short Break",
    defaultMinutes: 5,
    color: "from-emerald-500 to-teal-600",
    bgBadge: "bg-emerald-500/20 border-emerald-500/40",
    textBadge: "text-emerald-300",
    icon: <Coffee className="w-3.5 h-3.5 text-emerald-400" />
  },
  longBreak: {
    label: "Long Break",
    defaultMinutes: 15,
    color: "from-purple-500 to-pink-600",
    bgBadge: "bg-purple-500/20 border-purple-500/40",
    textBadge: "text-purple-300",
    icon: <Clock className="w-3.5 h-3.5 text-purple-400" />
  }
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("learnx_pomodoro_completed") || 0);
    } catch {
      return 0;
    }
  });

  const totalTimeForMode = MODE_CONFIG[mode].defaultMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100));

  // Audio tone generator using Web Audio API (cross-browser, zero external files)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Gentle, harmonic chord
      const freqs = mode === "focus" ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.85);
      });
    } catch {
      // Audio context restricted or blocked
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft <= 0) {
      setIsRunning(false);
      playChime();
      if (mode === "focus") {
        const nextCount = completedSessions + 1;
        setCompletedSessions(nextCount);
        try {
          localStorage.setItem("learnx_pomodoro_completed", String(nextCount));
        } catch {}
        if (onSessionComplete) onSessionComplete(nextCount);
        // Switch to break
        if (nextCount % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        switchMode("focus");
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, completedSessions]);

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setTimeLeft(MODE_CONFIG[newMode].defaultMinutes * 60);
    setIsRunning(false);
  };

  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_CONFIG[mode].defaultMinutes * 60);
  };

  const setCustomMinutes = (mins: number) => {
    setIsRunning(false);
    setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className={`relative ${className}`}>
      {/* Compact Mini Bar Button in Toolbar */}
      <div className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 transition shadow-xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200"
          title="Open Pomodoro Learning Timer"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg className="w-5 h-5 transform -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-700"
                fill="none"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                className={
                  mode === "focus"
                    ? "text-indigo-400"
                    : mode === "shortBreak"
                    ? "text-emerald-400"
                    : "text-purple-400"
                }
                fill="none"
                strokeDasharray={2 * Math.PI * 8}
                strokeDashoffset={2 * Math.PI * 8 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <Clock className="w-2.5 h-2.5 absolute text-slate-300" />
          </div>
          <span className="font-mono tracking-tight text-white font-bold">{timeFormatted}</span>
          <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">
            ({MODE_CONFIG[mode].label})
          </span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Quick play/pause button without opening modal */}
        <button
          type="button"
          onClick={togglePlay}
          className={`p-1 rounded-lg transition ${
            isRunning
              ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
              : "bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50"
          }`}
          title={isRunning ? "Pause Study Timer" : "Start Study Timer"}
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Pomodoro Card Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pomodoro Study Timer</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
                title={soundEnabled ? "Mute chimes" : "Enable chimes"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-semibold">
            {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-1.5 rounded-lg transition text-center ${
                  mode === m
                    ? "bg-slate-800 text-white shadow-xs border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m === "focus" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
              </button>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div className="flex flex-col items-center justify-center my-4 space-y-2">
            <div className="relative flex items-center justify-center">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tighter text-white drop-shadow-md">
                {timeFormatted}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${MODE_CONFIG[mode].bgBadge} ${MODE_CONFIG[mode].textBadge}`}>
                {MODE_CONFIG[mode].icon}
                {MODE_CONFIG[mode].label}
              </span>
              <span>·</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {completedSessions} {completedSessions === 1 ? "session" : "sessions"} done
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full bg-gradient-to-r ${MODE_CONFIG[mode].color} transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Quick presets:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCustomMinutes(15)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded"
              >
                15m
              </button>
              <button
                type="button"
                onClick={() => setCustomMinutes(25)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded font-semibold text-indigo-300"
              >
                25m
              </button>
              <button
                type="button"
                onClick={() => setCustomMinutes(45)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded"
              >
                45m
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
