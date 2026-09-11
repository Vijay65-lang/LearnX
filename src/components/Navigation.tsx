import React from "react";
import {
  Home,
  MessageSquare,
  BookOpen,
  BarChart2,
  User,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { StudentProfile } from "../types";

export type TabType = "home" | "ask" | "courses" | "progress" | "profile";

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  student: StudentProfile | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  student
}) => {
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

          {/* Profile Badge */}
          {student && (
            <div className="flex items-center gap-2">
              <div
                onClick={() => onSelectTab("profile")}
                className="cursor-pointer flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl transition"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-tight hidden xs:block">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{student.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{getLevelLabel()}</div>
                </div>
              </div>
            </div>
          )}
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
