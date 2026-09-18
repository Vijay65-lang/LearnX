import React from "react";
import {
  X,
  Sliders,
  Eye,
  Type,
  Code2,
  Wifi,
  CheckCircle,
  Download,
  Moon,
  Sparkles
} from "lucide-react";
import { cacheAllCoursesLocally, areCoursesCachedOffline } from "../utils/offlineManager";
import { ACADEMIC_COURSES } from "../data/coursesData";

export interface ComfortSettings {
  fontSize: "normal" | "large" | "xl";
  contrastMode: "slate" | "warm" | "black";
  codeWrap: boolean;
  offlineAutoCache: boolean;
}

interface ComfortSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ComfortSettings;
  onUpdateSettings: (newSettings: Partial<ComfortSettings>) => void;
}

export const ComfortSettingsModal: React.FC<ComfortSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [cacheStatus, setCacheStatus] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCacheAll = () => {
    cacheAllCoursesLocally(ACADEMIC_COURSES);
    setCacheStatus("Saved all 20 courses & 60+ lessons locally!");
    setTimeout(() => setCacheStatus(null), 3500);
  };

  const isCached = areCoursesCachedOffline();

  return (
    <div
      id="comfort-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Study Comfort &amp; Preferences</h2>
              <p className="text-xs text-slate-400">
                Tailor your display, text scale, and offline learning options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Reading Font Scale */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-400" />
              <span>Lesson Reading Text Size</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Adjust comfortable text scaling for long study sessions and textbooks.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "normal", label: "Standard", desc: "15px body" },
                { id: "large", label: "Comfortable", desc: "17px relaxed" },
                { id: "xl", label: "Spacious", desc: "19px large" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ fontSize: opt.id as any })}
                  className={`p-3 rounded-xl border text-left transition ${
                    settings.fontSize === opt.id
                      ? "border-indigo-500 bg-indigo-600/20 text-white"
                      : "border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Eye-Safe Contrast Tint */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Display Palette &amp; Contrast</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "slate", label: "Slate Blue", desc: "Standard LearnX" },
                { id: "warm", label: "Warm Twilight", desc: "Reduced blue light" },
                { id: "black", label: "OLED Midnight", desc: "Deep pure contrast" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ contrastMode: opt.id as any })}
                  className={`p-3 rounded-xl border text-left transition ${
                    settings.contrastMode === opt.id
                      ? "border-emerald-500 bg-emerald-600/20 text-white"
                      : "border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Code Sandbox Preferences */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Interactive Code Sandbox</span>
            </label>
            <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-200">Soft Line Wrapping</div>
                <div className="text-[11px] text-slate-400">Wrap long Python/JavaScript lines to avoid horizontal scrolling</div>
              </div>
              <input
                type="checkbox"
                checked={settings.codeWrap}
                onChange={(e) => onUpdateSettings({ codeWrap: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
              />
            </div>
          </div>

          {/* 4. Offline Storage Resilience */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>Offline &amp; Low-Bandwidth Storage</span>
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When connection is unstable, LearnX serves courses, lessons, and code runners directly from local storage and service worker cache.
            </p>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Local Courses Cache:</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isCached ? "20 Courses & Lessons Ready" : "Pre-bundled Available"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCacheAll}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Download / Refresh All Courses for Offline</span>
              </button>

              {cacheStatus && (
                <div className="text-center text-[11px] text-emerald-400 font-medium animate-in fade-in">
                  {cacheStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
