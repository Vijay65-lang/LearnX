import React, { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
  ShieldCheck,
  Trophy,
  Flame,
  ChevronRight
} from "lucide-react";
import { StudentProfile, StudentAnalytics, Certificate } from "../types";
import { getStudentData } from "../api";
import { Leaderboard } from "./Leaderboard";

interface HomeDashboardProps {
  student: StudentProfile;
  onNavigate: (tab: "home" | "ask" | "quiz" | "courses" | "progress" | "profile") => void;
  onAskTopic?: (topic: string) => void;
  onViewCertificate?: (cert: Certificate) => void;
  onOpenSecurityTrust?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  student,
  onNavigate,
  onAskTopic,
  onViewCertificate,
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
              id="dashboard-cta-quiz"
              onClick={() => onNavigate("quiz")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-md shadow-purple-600/30 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Take Quiz Test</span>
            </button>
            <button
              id="dashboard-cta-courses"
              onClick={() => onNavigate("courses")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Courses</span>
            </button>
            <button
              id="dashboard-cta-milestones"
              onClick={() => onNavigate("progress")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 text-xs font-semibold transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Mastery Milestones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Certificate & Live Mastery Showcase (Special Highlight for New & Existing Learners) */}
      {(() => {
        const demoCourseName =
          student.education_level === "Intermediate"
            ? `Intermediate ${student.inter_stream || "MPC"} Academic Mastery & Science Problem Solving`
            : student.education_level === "School"
            ? `School ${student.school_grade || "Class 10"} Mathematics & General Science Honors`
            : student.education_level === "Degree"
            ? `Degree ${student.degree_specialization || "Commerce"} Analytical Studies Mastery`
            : `B.Tech ${student.btech_branch || "Computer Science"} Advanced Engineering & AI Mastery`;

        const demoCertificate: Certificate = {
          id: "cert_demo_showcase",
          student_id: student.id,
          course_id: "crs_demo_mastery",
          student_name: student.name || "Student Learner",
          course_name: demoCourseName,
          completion_date: new Date().toISOString().split("T")[0],
          certificate_id: `LX-VERIFIED-${student.education_level?.replace(/[^a-zA-Z0-9]/g, "") || "MASTER"}-2026`,
          issued_at: new Date().toISOString(),
        };

        return (
          <div
            id="demo-certificate-showcase"
            className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-amber-500/35 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl shadow-amber-950/10"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Accredited Student Certificate Demo
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Sample Preview for New Users
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Official LearnX Academic Certificate &amp; Learning Progress
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                    Every quiz you pass, practice problem you solve, and study doubt you clarify directly builds your verified academic transcript and credentials. Here is a live demo of the credentials and progress tracking you earn:
                  </p>
                </div>

                {/* Demo Progress Highlights (Attracts new students) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Demo Accuracy</span>
                    <div className="text-lg font-bold text-emerald-400 mt-0.5">94.2%</div>
                    <span className="text-[10px] text-slate-500 font-mono">38/40 mastered</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Active Streak</span>
                    <div className="text-lg font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                      7 Days
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Top 5% consistency</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Concepts Cleared</span>
                    <div className="text-lg font-bold text-purple-400 mt-0.5">18 Chapters</div>
                    <span className="text-[10px] text-slate-500 font-mono">Zero knowledge gaps</span>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Class Standing</span>
                    <div className="text-lg font-bold text-indigo-400 mt-0.5">Rank #3</div>
                    <span className="text-[10px] text-slate-500 font-mono">Gold Mastery Tier</span>
                  </div>
                </div>
              </div>

              {/* Certificate Preview Card with Preview Button */}
              <div className="w-full lg:w-72 bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between shrink-0 space-y-3 relative group">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-mono rounded font-bold uppercase tracking-wider">
                  SAMPLE
                </div>

                <div className="space-y-1.5 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300 font-semibold">LEARNX ACCREDITATION</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate pt-0.5">{student.name}</div>
                  <div className="text-[11px] text-slate-300 line-clamp-2 leading-snug">{demoCourseName}</div>
                  <div className="text-[9px] font-mono text-slate-500">{demoCertificate.certificate_id}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    id="demo-certificate-preview-btn"
                    type="button"
                    onClick={() => {
                      if (onViewCertificate) {
                        onViewCertificate(demoCertificate);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/30 active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Demo Certificate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate("quiz")}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <span>Start Practice to Earn Points</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Topics Needing Improvement
          </h2>
          <button
            onClick={() => onNavigate("progress")}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
          >
            <span>Detailed Knowledge Gaps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
