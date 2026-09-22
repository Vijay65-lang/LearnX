import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Download,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { StudentProfile, StudentAnalytics, MasteryRecord, Certificate } from "../types";
import { getStudentData } from "../api";
import { generateProgressReportPDF } from "../utils/pdfReport";
import { MasteryMilestones } from "./MasteryMilestones";
import { KnowledgeGapsVisualization } from "./KnowledgeGapsVisualization";
import { analyzeKnowledgeGaps } from "../utils/knowledgeGapsAnalyzer";

interface ProgressViewProps {
  student: StudentProfile;
  onViewCertificate?: (cert: Certificate) => void;
  onAskTopic?: (topic: string) => void;
  onNavigateTab?: (tab: "home" | "ask" | "courses" | "progress" | "profile") => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  student,
  onViewCertificate,
  onAskTopic,
  onNavigateTab,
}) => {
  const [data, setData] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStudentData();
      setData(res);
    } catch (err) {
      console.error("Failed to load progress data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    setDownloadingPdf(true);
    try {
      generateProgressReportPDF(data);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getBadgeStyle = (state: string) => {
    switch (state) {
      case "Mastered":
        return "bg-purple-950/60 text-purple-300 border-purple-800/50";
      case "Strong":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/50";
      case "Developing":
        return "bg-blue-950/60 text-blue-300 border-blue-800/50";
      case "Needs Improvement":
        return "bg-rose-950/60 text-rose-300 border-rose-800/50";
      case "Insufficient Data":
        return "bg-amber-950/60 text-amber-300 border-amber-800/50";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-xs">Compiling real-time mastery analytics from database...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const masteryRecords = data?.masteryRecords || [];
  const repeatedDoubts = data?.repeatedDoubts || [];
  const certificates = data?.certificates || [];

  // Analyze knowledge gaps from student's past quiz results and attempts
  const knowledgeGaps = React.useMemo(() => {
    return analyzeKnowledgeGaps(masteryRecords);
  }, [masteryRecords]);

  const handleReviewKnowledgeGap = (prompt: string, topic: string) => {
    if (onAskTopic) {
      onAskTopic(topic);
    } else if (onNavigateTab) {
      onNavigateTab("ask");
    }
  };

  return (
    <div id="progress-view" className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Header & PDF Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
            Learning Analytics &amp; Mastery
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic learning profile computed from student attempts and doubt signals.
          </p>
        </div>

        <button
          id="download-pdf-report-btn"
          onClick={handleDownloadPDF}
          disabled={downloadingPdf || !data}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{downloadingPdf ? "Generating PDF..." : "Download Official Progress Report (PDF)"}</span>
        </button>
      </div>

      {/* Dynamic Student Learning Profile Summary (Section 21) */}
      <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Verified Student Profile
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">ID: {student.id}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px]">Student Name</span>
            <div className="font-bold text-white mt-0.5">{student.name}</div>
            <span className="text-[10px] text-slate-400">{student.email}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px]">Academic Level</span>
            <div className="font-bold text-indigo-300 mt-0.5">{student.education_level}</div>
            <span className="text-[10px] text-slate-400">
              {student.btech_branch || student.inter_stream || student.school_grade || student.degree_specialization || "Standard"}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px]">System Status</span>
            <div className="font-bold text-emerald-400 mt-0.5">Continuous Modeling</div>
            <span className="text-[10px] text-slate-400">Deterministic mastery rules</span>
          </div>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Practice Attempts</span>
          <div className="text-2xl font-bold text-white mt-1">{stats?.totalAttempts || 0}</div>
          <span className="text-[10px] text-slate-500 font-mono">
            {stats && stats.totalAttempts > 0 ? `${stats.totalCorrect} correct` : "No attempts yet"}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Overall Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats?.overallAccuracy || 0}%</div>
          <span className="text-[10px] text-slate-500 font-mono">Across all topics</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Doubts Solved</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{stats?.totalDoubts || 0}</div>
          <span className="text-[10px] text-slate-500 font-mono">Real inquiry sessions</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Avg Time / Answer</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats?.avgResponseTime || 0}s</div>
          <span className="text-[10px] text-slate-500 font-mono">Response speed</span>
        </div>
      </div>

      {/* Mastery Milestones & Digital Badges Component */}
      {data && (
        <MasteryMilestones
          analytics={data}
          onNavigateTab={onNavigateTab}
          onDataRefresh={loadData}
        />
      )}

      {/* Knowledge Gaps & Targeted Review Visualization */}
      <KnowledgeGapsVisualization
        gaps={knowledgeGaps}
        totalAttempts={stats?.totalAttempts || 0}
        overallAccuracy={stats?.overallAccuracy || 0}
        onReviewTopic={handleReviewKnowledgeGap}
        onNavigateToCourses={() => onNavigateTab && onNavigateTab("courses")}
      />

      {/* Topic Mastery Grid (Section 15) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Topic Mastery Matrix
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Deterministic: Attempts, Accuracy, Mistakes
          </span>
        </div>

        {masteryRecords.length === 0 ? (
          <div className="p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-1">
            <p className="text-xs font-semibold text-slate-300">
              Complete some practice to see your learning analysis.
            </p>
            <p className="text-[11px] text-slate-500">
              No topic records found in database. Ask a question or complete a course lesson.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {masteryRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {rec.subject}
                    </span>
                    <h3 className="text-xs font-bold text-white">{rec.topic}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getBadgeStyle(
                      rec.mastery_state
                    )}`}
                  >
                    {rec.mastery_state}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Accuracy: <strong className="text-white">{rec.accuracy}%</strong>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {rec.correct_count} / {rec.attempts} attempts ({rec.mistakes} mistakes)
                  </span>
                </div>

                {/* Accuracy progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rec.accuracy >= 90
                        ? "bg-purple-500"
                        : rec.accuracy >= 75
                        ? "bg-emerald-500"
                        : rec.accuracy >= 60
                        ? "bg-blue-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${rec.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Repeated Doubts & Learning Signals (Section 14) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Repeated Doubts &amp; Learning Signals
        </h2>

        {repeatedDoubts.length > 0 ? (
          <div className="p-4 bg-slate-900 border border-amber-900/30 rounded-2xl space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              When a student asks multiple doubts on the same topic, LearnX detects learning friction and adjusts the curriculum:
            </p>
            <div className="space-y-2">
              {repeatedDoubts.map((rd, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{rd.topic}</span>
                    <span className="text-slate-500 text-[10px] ml-1.5 font-mono">({rd.subject})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-950/50 border border-amber-800/40 text-amber-300 text-[10px] font-mono rounded-lg">
                    Asked {rd.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
            {stats?.totalDoubts === 0
              ? "No doubt history yet. Your inquiry patterns will appear here."
              : "No repeated doubt friction detected. Inquiries are well-distributed."}
          </div>
        )}
      </div>

      {/* Earned Certificates (Section 20) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Verified Accreditations &amp; Certificates
        </h2>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 bg-slate-900 border border-emerald-900/30 rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {cert.certificate_id}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">{cert.course_name}</h4>
                  <p className="text-[10px] text-slate-500">
                    Awarded: {new Date(cert.completion_date).toLocaleDateString()}
                  </p>
                </div>
                {onViewCertificate && (
                  <button
                    onClick={() => onViewCertificate(cert)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 rounded-xl text-xs font-semibold shrink-0 border border-slate-700"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
            No certificates earned yet. Complete all lessons in a course to earn verified credentials.
          </div>
        )}
      </div>
    </div>
  );
};
