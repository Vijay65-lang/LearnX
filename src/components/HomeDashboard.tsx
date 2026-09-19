import React, { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  RefreshCw,
  Zap,
  ShieldCheck
} from "lucide-react";
import { StudentProfile, StudentAnalytics } from "../types";
import { getStudentData } from "../api";
import { Leaderboard } from "./Leaderboard";

interface HomeDashboardProps {
  student: StudentProfile;
  onNavigate: (tab: "home" | "ask" | "courses" | "progress" | "profile") => void;
  onAskTopic?: (topic: string) => void;
  onOpenSecurityTrust?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  student,
  onNavigate,
  onAskTopic,
  onOpenSecurityTrust,
}) => {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentData();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load learning data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-xs">Loading personalized student learning state...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-3">
        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-2xl text-rose-300 text-sm">
          {error}
        </div>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats;
  const weakTopics = data?.masteryRecords.filter((m) => m.mastery_state === "Needs Improvement") || [];
  const ongoingCourse = data?.enrolledCourses.find((c) => c.enrollment_status !== "completed");
  const recommendations = data?.activeRecommendations || [];
  const activities = data?.recentActivities || [];

  return (
    <div id="home-dashboard" className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Learning Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Hello, {student.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every question you ask and practice you complete trains LearnX to understand your exact mastery, misconceptions, and learning pace.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              id="dashboard-cta-ask"
              onClick={() => onNavigate("ask")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/30 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask a Study Doubt</span>
            </button>
            <button
              id="dashboard-cta-courses"
              onClick={() => onNavigate("courses")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Courses</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Continue Learning Card (Section 4) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Continue Learning
        </h2>
        {ongoingCourse ? (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Active Course
              </span>
              <h3 className="text-sm font-bold text-white">{ongoingCourse.title}</h3>
              <p className="text-xs text-slate-400">
                {Math.round(ongoingCourse.completion_percentage || 0)}% completed
              </p>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${ongoingCourse.completion_percentage || 5}%` }}
                />
              </div>
            </div>
            <button
              id="resume-course-btn"
              onClick={() => onNavigate("courses")}
              className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              <span>Resume Lessons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-5 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-400">
              No course currently in progress.
            </p>
            <button
              onClick={() => onNavigate("courses")}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Explore courses for {student.education_level}
            </button>
          </div>
        )}
      </div>

      {/* 2. Current Learning Progress (Section 4) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Current Learning Progress
        </h2>

        {!stats || stats.totalAttempts === 0 ? (
          <div className="p-5 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-1">
            <p className="text-xs text-slate-300 font-medium">
              Complete some practice to see your learning analysis.
            </p>
            <p className="text-[11px] text-slate-500">
              Ask a question in Ask AI to get an instant tailored practice question!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400">Overall Accuracy</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.overallAccuracy}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{stats.totalCorrect} / {stats.totalAttempts} correct</span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400">Doubts Solved</span>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">{stats.totalDoubts}</div>
              <span className="text-[10px] text-slate-500 font-mono">Real student queries</span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400">Topics Mastered</span>
              <div className="text-xl font-bold text-purple-400 mt-0.5">{stats.topicsMasteredCount}</div>
              <span className="text-[10px] text-slate-500 font-mono">≥90% with 3+ attempts</span>
            </div>

            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400">Avg Response Time</span>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{stats.avgResponseTime}s</div>
              <span className="text-[10px] text-slate-500 font-mono">Per practice attempt</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Topics Needing Improvement (Section 4) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Topics Needing Improvement
        </h2>
        {weakTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakTopics.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-900 border border-rose-900/40 rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{item.subject}</span>
                  <h4 className="text-xs font-bold text-white">{item.topic}</h4>
                  <p className="text-[11px] text-rose-400 font-medium mt-0.5">
                    {item.accuracy}% accuracy · {item.mistakes} mistakes
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onAskTopic) onAskTopic(item.topic);
                    onNavigate("ask");
                  }}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 text-[11px] font-semibold rounded-xl border border-rose-800/40 shrink-0"
                >
                  Revise Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
            {stats?.totalAttempts === 0
              ? "Complete some practice to see topics needing improvement."
              : "Great job! No topics currently categorized as needing improvement."}
          </div>
        )}
      </div>

      {/* Academic Mastery Leaderboard Component */}
      <Leaderboard currentStudent={student} />

      {/* 4. Recommended Next Activity (Section 4 & 16) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Recommended Next Activity
        </h2>
        {recommendations.length > 0 ? (
          <div className="space-y-2.5">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-900 border border-indigo-900/30 rounded-2xl space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-300">{rec.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {rec.difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">Reason:</span> {rec.reason}
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      if (rec.target_topic && onAskTopic) {
                        onAskTopic(rec.target_topic);
                        onNavigate("ask");
                      } else {
                        onNavigate("courses");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Start Activity</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
            Continue learning to receive personalized recommendations.
          </div>
        )}
      </div>

      {/* 5. Recent Activity (Section 4) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Recent Activity
        </h2>
        {activities.length > 0 ? (
          <div className="space-y-2">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-slate-200 font-medium">{act.description}</div>
                    {act.subject && (
                      <span className="text-[10px] text-slate-500">{act.subject} {act.topic ? `· ${act.topic}` : ""}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500 text-center">
            No recent activity recorded yet.
          </div>
        )}
      </div>

      {/* 6. Institutional Security & Privacy Shield Card */}
      <div
        id="home-security-trust-card"
        className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <span>Academic Data Privacy &amp; Security Shield</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero cross-account data leakage · Isolated local student storage · 256-bit TLS encryption
            </p>
          </div>
        </div>

        {onOpenSecurityTrust && (
          <button
            type="button"
            onClick={onOpenSecurityTrust}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition shrink-0 self-end sm:self-auto"
          >
            Trust Center
          </button>
        )}
      </div>
    </div>
  );
};
