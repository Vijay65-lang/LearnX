import React from "react";
import {
  Home,
  MessageSquare,
  BookOpen,
  BarChart2,
  User,
  Sparkles,
  GraduationCap,
  Users,
  Sliders,
  Wifi,
  WifiOff,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { StudentProfile } from "../types";
import { useOfflineStatus } from "../utils/offlineManager";

export type TabType = "home" | "ask" | "courses" | "progress" | "profile";

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  student: StudentProfile | null;
  onOpenManifesto?: () => void;
  onOpenComfortSettings?: () => void;
  onOpenSecurityTrust?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  student,
  onOpenManifesto,
  onOpenComfortSettings,
  onOpenSecurityTrust
}) => {
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOfflineStatus(student?.id);

  const getLevelLabel = () => {
    if (!student) return "";
    if (student.education_level === "B.Tech" && student.btech_branch) {
      return `B.Tech · ${student.btech_branch}`;
    }
    if (student.education_level === "Intermediate" && student.inter_stream) {
      return `Inter · ${student.inter_stream}`;
    }
    if (student.education_level === "Degree" && student.degree_name) {
      return `${student.degree_name}`;
    }
    if (student.education_level === "School" && student.school_grade) {
      return `Grade ${student.school_grade}`;
    }
    return student.education_level;
  };

  const navItems: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "ask", label: "Ask AI", icon: <Sparkles className="w-5 h-5" /> },
    { id: "courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
    { id: "progress", label: "Progress", icon: <BarChart2 className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Header */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-4 py-3 sm:px-6 transition-all"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              LX
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base sm:text-lg text-slate-100">LearnX</span>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student Mastery
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                General AI answers questions. LearnX understands the learner.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-desktop-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster: Offline Status, Comfort Settings & Profile */}
          <div className="flex items-center gap-2">
            {/* Offline / Cloud Status Indicator */}
            {isOnline ? (
              <button
                type="button"
                onClick={triggerSync}
                title={pendingCount > 0 ? `${pendingCount} offline actions pending sync. Click to sync now.` : "Connected to LearnX Cloud"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/50 text-[11px] font-medium transition"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span className="hidden lg:inline">{isSyncing ? "Syncing..." : pendingCount > 0 ? `Sync (${pendingCount})` : "Cloud Active"}</span>
              </button>
            ) : (
              <div
                title="Operating in resilient offline mode with local storage cache"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 text-[11px] font-medium"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline Mode</span>
              </div>
            )}

            {/* Verified Safe & Security Trust Center Trigger */}
            {onOpenSecurityTrust && (
              <button
                id="header-security-trust-btn"
                onClick={onOpenSecurityTrust}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-400 text-[11px] font-medium transition"
                title="LearnX Verified Safe: 256-Bit TLS & Zero-Leakage Privacy Protection"
                aria-label="Security & Privacy Trust Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Verified Safe</span>
              </button>
            )}

            {/* Comfort Settings Button */}
            {onOpenComfortSettings && (
              <button
                id="comfort-settings-trigger"
                onClick={onOpenComfortSettings}
                className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
                title="Study Comfort & Display Preferences"
                aria-label="Study Comfort Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {/* Team LearnX Manifesto */}
            {onOpenManifesto && (
              <button
                id="header-team-manifesto-btn"
                onClick={onOpenManifesto}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 hover:text-white hover:bg-indigo-900/70 text-xs font-semibold transition"
                title="Read Team LearnX Mission & Standard"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Team LearnX</span>
              </button>
            )}

            {/* Student Profile Badge */}
            {student && (
              <div
                onClick={() => onSelectTab("profile")}
                className="cursor-pointer flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-tight hidden xs:block">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[110px]">{student.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{getLevelLabel()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav
        id="app-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 shadow-2xl safe-area-bottom"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
                  active
                    ? "text-indigo-400 bg-indigo-950/40 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-normal"
                }`}
              >
                <div className={`transition-transform ${active ? "scale-110 text-indigo-400" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
