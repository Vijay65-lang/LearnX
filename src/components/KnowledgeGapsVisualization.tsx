import React, { useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Target,
  CheckCircle,
  HelpCircle,
  Clock,
  Filter,
  Layers
} from "lucide-react";
import { KnowledgeGap, GapSeverity } from "../types";

interface KnowledgeGapsVisualizationProps {
  gaps: KnowledgeGap[];
  totalAttempts: number;
  overallAccuracy: number;
  onReviewTopic?: (prompt: string, topic: string) => void;
  onNavigateToCourses?: () => void;
}

export const KnowledgeGapsVisualization: React.FC<KnowledgeGapsVisualizationProps> = ({
  gaps,
  totalAttempts,
  overallAccuracy,
  onReviewTopic,
  onNavigateToCourses,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<GapSeverity | "All">("All");
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null);

  const filteredGaps = gaps.filter((g) => {
    if (filterSeverity === "All") return true;
    return g.severity === filterSeverity;
  });

  const criticalCount = gaps.filter((g) => g.severity === "Critical").length;
  const moderateCount = gaps.filter((g) => g.severity === "Moderate").length;
  const lowCount = gaps.filter((g) => g.severity === "Low").length;

  const getSeverityBadge = (severity: GapSeverity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-950/70 border-rose-700/60 text-rose-300";
      case "Moderate":
        return "bg-amber-950/70 border-amber-700/60 text-amber-300";
      case "Low":
        return "bg-blue-950/70 border-blue-700/60 text-blue-300";
    }
  };

  const getSeverityBar = (severity: GapSeverity) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500";
      case "Moderate":
        return "bg-amber-500";
      case "Low":
        return "bg-blue-500";
    }
  };

  return (
    <div id="knowledge-gaps-section" className="space-y-4">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Knowledge Gaps &amp; Targeted Review
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Analyzed from past quiz attempts, highlighting specific sub-topics and error patterns requiring reinforcement.
          </p>
        </div>

        {/* Severity Count Pills */}
        {gaps.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                {criticalCount} Critical
              </span>
            )}
            {moderateCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                {moderateCount} Moderate
              </span>
            )}
            {lowCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                {lowCount} Attention
              </span>
            )}
          </div>
        )}
      </div>

      {/* When no knowledge gaps are detected */}
      {gaps.length === 0 ? (
        <div className="p-6 bg-slate-900/60 border border-dashed border-emerald-900/40 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-emerald-300">
            {totalAttempts > 0
              ? "All Assessed Topics in Good Standing!"
              : "No Quiz Data Recorded Yet"}
          </h3>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
            {totalAttempts > 0
              ? `You have answered ${totalAttempts} questions with an overall accuracy of ${overallAccuracy}%. No critical knowledge gaps were detected. Continue regular practice to maintain mastery!`
              : "Complete course quizzes or test yourself with continuous AI-generated MCQs to track your specific knowledge gaps and get targeted review recommendations."}
          </p>
          {onNavigateToCourses && (
            <button
              onClick={onNavigateToCourses}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 rounded-xl text-xs font-semibold mt-2 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Course Quizzes</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Severity Filter Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {(["All", "Critical", "Moderate", "Low"] as const).map((sev) => {
                const count =
                  sev === "All"
                    ? gaps.length
                    : sev === "Critical"
                    ? criticalCount
                    : sev === "Moderate"
                    ? moderateCount
                    : lowCount;

                if (sev !== "All" && count === 0) return null;

                const active = filterSeverity === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1.5 ${
                      active
                        ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <span>{sev}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              Showing {filteredGaps.length} of {gaps.length} gaps
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGaps.map((gap) => {
              const isExpanded = selectedGapId === gap.id;

              return (
                <div
                  key={gap.id}
                  id={`knowledge-gap-${gap.id}`}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl space-y-3 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header: Subject, Subtopic & Severity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase text-slate-500">
                            {gap.subject}
                          </span>
                          {gap.concept && gap.concept !== gap.topic && (
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">
                              Subtopic: {gap.concept}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {gap.topic}
                        </h3>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold shrink-0 ${getSeverityBadge(
                          gap.severity
                        )}`}
                      >
                        {gap.severity} Priority
                      </span>
                    </div>

                    {/* Accuracy metric & Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                          <span>Accuracy:</span>
                          <strong className="text-white ml-0.5">{gap.accuracy}%</strong>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {gap.mistakes} mistake{gap.mistakes !== 1 ? "s" : ""} / {gap.attempts} attempt{gap.attempts !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getSeverityBar(
                            gap.severity
                          )}`}
                          style={{ width: `${Math.max(5, gap.accuracy)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recent mistake hint or subtopic review snippet */}
                    {gap.recentMistakeSnippet && (
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                        <span className="text-rose-400 font-semibold mr-1">Error Pattern:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {gap.recentMistakeSnippet}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Instant Review with AI Tutor & Details Toggle */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGapId(isExpanded ? null : gap.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{isExpanded ? "Hide Guidance" : "View Review Note"}</span>
                    </button>

                    {onReviewTopic && (
                      <button
                        type="button"
                        id={`review-topic-btn-${gap.id}`}
                        onClick={() => onReviewTopic(gap.reviewPrompt, gap.topic)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Review with AI Tutor</span>
                        <ArrowRight className="w-3 h-3 text-indigo-300" />
                      </button>
                    )}
                  </div>

                  {/* Expanded Guidance Drawer */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-950/90 rounded-xl border border-indigo-900/40 text-xs space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Recommended Review Strategy</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Focus on understanding the core principles of <strong className="text-white">{gap.topic}</strong>. Review how edge conditions are evaluated and test yourself with 2-3 focused practice questions.
                      </p>
                      {gap.lastAttemptedAt && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Last quiz attempt: {new Date(gap.lastAttemptedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
