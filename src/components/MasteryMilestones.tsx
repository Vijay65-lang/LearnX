import React, { useState } from "react";
import {
  Flame,
  Zap,
  Sparkles,
  Trophy,
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Target,
  Star,
  HelpCircle,
  Lock,
  Calendar,
  ChevronRight,
  Info,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  Clock
} from "lucide-react";
import { MilestoneBadge, MilestoneCategory, MilestoneTier, StudentAnalytics } from "../types";
import {
  computeMasteryMilestones,
  addSimulatedStudyDays,
  recordActiveStudyDay,
  getLocalDateString
} from "../utils/milestonesManager";

interface MasteryMilestonesProps {
  analytics: StudentAnalytics;
  onNavigateTab?: (tab: "home" | "ask" | "courses" | "progress" | "profile") => void;
  onDataRefresh?: () => void;
}

export const MasteryMilestones: React.FC<MasteryMilestonesProps> = ({
  analytics,
  onNavigateTab,
  onDataRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | MilestoneCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Compute live milestones and streaks
  const { badges, streakInfo, stats } = computeMasteryMilestones(analytics);

  // Filtered badges
  const filteredBadges = badges.filter((b) => {
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unlocked" && b.unlocked) ||
      (statusFilter === "locked" && !b.unlocked);
    return matchesCategory && matchesStatus;
  });

  // Calculate nearest locked badge to motivate student
  const nextMilestone = badges.find((b) => !b.unlocked);

  // Helper for Tier styling
  const getTierTheme = (tier: MilestoneTier, unlocked: boolean) => {
    if (!unlocked) {
      return {
        cardBorder: "border-slate-800 hover:border-slate-700",
        badgeBg: "bg-slate-900/90",
        iconBg: "bg-slate-800/80 border-slate-700/60 text-slate-500",
        accentText: "text-slate-400",
        tagBg: "bg-slate-800/90 text-slate-400 border-slate-700",
        progressColor: "bg-slate-700",
        glow: "",
      };
    }

    switch (tier) {
      case "Bronze":
        return {
          cardBorder: "border-amber-700/40 hover:border-amber-600/60",
          badgeBg: "bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900",
          iconBg: "bg-amber-950/70 border-amber-600/40 text-amber-400 shadow-sm shadow-amber-950",
          accentText: "text-amber-300",
          tagBg: "bg-amber-950/80 text-amber-300 border-amber-700/50",
          progressColor: "bg-amber-500",
          glow: "hover:shadow-lg hover:shadow-amber-950/40",
        };
      case "Silver":
        return {
          cardBorder: "border-slate-500/40 hover:border-slate-400/60",
          badgeBg: "bg-gradient-to-br from-slate-900 via-slate-800/30 to-slate-900",
          iconBg: "bg-slate-800 border-slate-500/50 text-slate-200 shadow-sm shadow-slate-950",
          accentText: "text-slate-200",
          tagBg: "bg-slate-800 text-slate-200 border-slate-600",
          progressColor: "bg-slate-400",
          glow: "hover:shadow-lg hover:shadow-slate-800/40",
        };
      case "Gold":
        return {
          cardBorder: "border-yellow-600/40 hover:border-yellow-500/60",
          badgeBg: "bg-gradient-to-br from-slate-900 via-yellow-950/20 to-slate-900",
          iconBg: "bg-yellow-950/70 border-yellow-500/50 text-yellow-400 shadow-sm shadow-yellow-950",
          accentText: "text-yellow-300",
          tagBg: "bg-yellow-950/80 text-yellow-300 border-yellow-600/50",
          progressColor: "bg-yellow-400",
          glow: "hover:shadow-lg hover:shadow-yellow-950/50",
        };
      case "Diamond":
        return {
          cardBorder: "border-cyan-500/50 hover:border-cyan-400/70",
          badgeBg: "bg-gradient-to-br from-slate-900 via-cyan-950/25 to-slate-900",
          iconBg: "bg-cyan-950/70 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-950",
          accentText: "text-cyan-300",
          tagBg: "bg-cyan-950/80 text-cyan-200 border-cyan-600/50",
          progressColor: "bg-cyan-400",
          glow: "hover:shadow-lg hover:shadow-cyan-950/60",
        };
    }
  };

  // Icon Resolver
  const renderIcon = (name: string, className: string = "w-5 h-5") => {
    switch (name) {
      case "Flame":
        return <Flame className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Trophy":
        return <Trophy className={className} />;
      case "Award":
        return <Award className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "Target":
        return <Target className={className} />;
      case "Star":
        return <Star className={className} />;
      case "HelpCircle":
        return <HelpCircle className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Weekday Strip Calculation (Past 7 Days)
  const getRecentWeekDays = () => {
    const days = [];
    const studySet = new Set(streakInfo.studyDates);
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const isStudied = studySet.has(dateStr);
      const isToday = i === 0;

      days.push({
        dateStr,
        dayName,
        dayNum,
        isStudied,
        isToday,
      });
    }
    return days;
  };

  const weekDays = getRecentWeekDays();

  // Handler for simulating streak demo
  const handleSimulateDay = () => {
    addSimulatedStudyDays(1);
    recordActiveStudyDay();
    if (onDataRefresh) onDataRefresh();
  };

  const handleOpenBadge = (badge: MilestoneBadge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      setShowCelebration(true);
    } else {
      setShowCelebration(false);
    }
  };

  return (
    <section
      id="mastery-milestones-section"
      aria-labelledby="mastery-milestones-heading"
      className="space-y-4"
    >
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2
              id="mastery-milestones-heading"
              className="text-base sm:text-lg font-bold tracking-tight text-white"
            >
              Mastery Milestones &amp; Digital Badges
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {stats.unlockedBadges} / {stats.totalBadges} Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Earn unlockable accreditations for consecutive study streaks, course completions, and conceptual retention.
          </p>
        </div>

        {/* Demo streak increment button for interactive testing */}
        <button
          type="button"
          onClick={handleSimulateDay}
          title="Simulate active study day to test streak milestones"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-[11px] font-medium transition self-start sm:self-auto"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>+1 Study Day (Demo)</span>
        </button>
      </div>

      {/* 2. ENGAGEMENT HIGHLIGHT BANNER: STREAK & PROGRESS OVERVIEW */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Streak Metric */}
        <div className="md:col-span-4 flex items-center gap-3.5 border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/50 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {streakInfo.currentStreak} Day{streakInfo.currentStreak === 1 ? "" : "s"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                STREAK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {streakInfo.studiedToday
                ? "Active today! Keep the habit burning."
                : "Log a question or lesson today to maintain streak!"}
            </p>
          </div>
        </div>

        {/* 7-Day Mini Calendar Strip */}
        <div className="md:col-span-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800/80 pb-3 md:pb-0 md:pr-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Past 7 Days Consistency
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {streakInfo.totalStudyDays} total days logged
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className={`py-1 px-0.5 rounded-lg border flex flex-col items-center justify-center transition ${
                  day.isStudied
                    ? "bg-amber-950/40 border-amber-600/40 text-amber-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-600"
                } ${day.isToday ? "ring-1 ring-indigo-500/80" : ""}`}
              >
                <span className="text-[9px] font-semibold uppercase">{day.dayName}</span>
                <div className="w-4 h-4 my-0.5 flex items-center justify-center">
                  {day.isStudied ? (
                    <Check className="w-3 h-3 text-amber-400 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">{day.dayNum}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Target / Completion Stat */}
        <div className="md:col-span-3 flex flex-col justify-center text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Badge Unlocks</span>
            <span className="text-white font-bold font-mono">
              {stats.completionPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(stats.completionPercentage, 6)}%` }}
            />
          </div>

          {nextMilestone && (
            <p className="text-[11px] text-slate-400 truncate">
              Next: <strong className="text-indigo-300">{nextMilestone.title}</strong>
            </p>
          )}
        </div>
      </div>

      {/* 3. FILTER TABS & CATEGORIES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("streak")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              selectedCategory === "streak"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Study Streaks</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("courses")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              selectedCategory === "courses"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Courses Cleared</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("mastery")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              selectedCategory === "mastery"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mastery &amp; Practice</span>
          </button>
        </div>

        {/* Status Switcher (All / Unlocked / Locked) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
              statusFilter === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unlocked")}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
              statusFilter === "unlocked"
                ? "bg-slate-800 text-emerald-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unlocked ({stats.unlockedBadges})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("locked")}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-medium ${
              statusFilter === "locked"
                ? "bg-slate-800 text-slate-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Locked ({stats.totalBadges - stats.unlockedBadges})
          </button>
        </div>
      </div>

      {/* 4. BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const theme = getTierTheme(badge.tier, badge.unlocked);
          const pct = Math.min(
            100,
            Math.round((badge.currentValue / badge.targetValue) * 100)
          );

          return (
            <div
              key={badge.id}
              onClick={() => handleOpenBadge(badge)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${theme.badgeBg} ${theme.cardBorder} ${theme.glow}`}
            >
              {/* Top Row: Icon & Tier Tag */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${theme.iconBg}`}
                >
                  {badge.unlocked ? (
                    renderIcon(badge.iconName, "w-5 h-5")
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${theme.tagBg}`}
                  >
                    {badge.tier}
                  </span>

                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Title & Description */}
              <div className="space-y-1 mb-3">
                <h3 className={`text-sm font-bold tracking-tight ${badge.unlocked ? "text-white" : "text-slate-300"}`}>
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Bottom: Progress Bar & Unlock Metric */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {badge.unlocked ? "Goal Met" : "Progress"}
                  </span>
                  <span className={`font-mono font-semibold ${badge.unlocked ? "text-emerald-400" : "text-slate-300"}`}>
                    {badge.currentValue} / {badge.targetValue} {badge.unit}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${theme.progressColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-300">No badges match the selected filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setStatusFilter("all");
            }}
            className="text-xs text-indigo-400 hover:underline"
          >
            Reset filters to show all badges
          </button>
        </div>
      )}

      {/* 5. BADGE DETAIL & CELEBRATION MODAL */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Emblem / Badge Presentation */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div
                className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center text-3xl shadow-xl transition-all ${
                  selectedBadge.unlocked
                    ? selectedBadge.tier === "Diamond"
                      ? "bg-cyan-950 border-cyan-400 text-cyan-300 shadow-cyan-950/80"
                      : selectedBadge.tier === "Gold"
                      ? "bg-yellow-950 border-yellow-400 text-yellow-400 shadow-yellow-950/80"
                      : selectedBadge.tier === "Silver"
                      ? "bg-slate-800 border-slate-400 text-slate-200 shadow-slate-900"
                      : "bg-amber-950 border-amber-500 text-amber-300 shadow-amber-950/80"
                    : "bg-slate-950 border-slate-800 text-slate-600 shadow-none"
                }`}
              >
                {selectedBadge.unlocked ? (
                  renderIcon(selectedBadge.iconName, "w-10 h-10")
                ) : (
                  <Lock className="w-8 h-8 text-slate-500" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedBadge.tier} Tier · {selectedBadge.category.toUpperCase()}
                  </span>
                  {selectedBadge.unlocked && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Earned
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white pt-1">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>
            </div>

            {/* Criteria & Progress Box */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Milestone Criteria:</span>
                <span className="font-bold text-white">
                  {selectedBadge.targetValue} {selectedBadge.unit}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your Current Status:</span>
                <span
                  className={`font-mono font-bold ${
                    selectedBadge.unlocked ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedBadge.unlocked ? "bg-emerald-400" : "bg-indigo-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((selectedBadge.currentValue / selectedBadge.targetValue) * 100)
                    )}%`,
                  }}
                />
              </div>

              {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Accreditation Date</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(selectedBadge.unlockedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {!selectedBadge.unlocked && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBadge(null);
                    if (onNavigateTab) {
                      if (selectedBadge.category === "courses") onNavigateTab("courses");
                      else if (selectedBadge.category === "inquiry") onNavigateTab("ask");
                      else onNavigateTab("home");
                    }
                  }}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <span>
                    {selectedBadge.category === "courses"
                      ? "Go to Courses"
                      : selectedBadge.category === "inquiry"
                      ? "Ask a Doubt"
                      : "Continue Study"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
