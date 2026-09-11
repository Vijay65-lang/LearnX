import { jsPDF } from "jspdf";
import { StudentAnalytics } from "../types";

export function generateProgressReportPDF(data: StudentAnalytics) {
  const doc = new jsPDF();
  const { profile, stats, masteryRecords, repeatedDoubts, activeRecommendations, enrolledCourses, certificates } = data;

  let y = 20;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("LearnX Mastery Platform", 20, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Official Student Personalized Learning & Mastery Report", 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Positioning: "General AI answers questions. LearnX understands the learner."`, 20, y);
  y += 10;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 8;

  // Section 1: Student Profile
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Student Profile", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  doc.text(`Student Name: ${profile?.name || "Student"}`, 25, y);
  doc.text(`Email: ${profile?.email || "N/A"}`, 110, y);
  y += 6;

  let eduDetail = profile?.education_level || "Not specified";
  if (profile?.education_level === "School" && profile?.school_grade) {
    eduDetail += ` (Grade/Class: ${profile.school_grade})`;
  } else if (profile?.education_level === "Intermediate" && profile?.inter_stream) {
    eduDetail += ` (Stream: ${profile.inter_stream})`;
  } else if (profile?.education_level === "Degree" && profile?.degree_name) {
    eduDetail += ` (${profile.degree_name}${profile.degree_specialization ? ` - ${profile.degree_specialization}` : ""})`;
  } else if (profile?.education_level === "B.Tech" && profile?.btech_branch) {
    eduDetail += ` (Branch: ${profile.btech_branch}, Year: ${profile.btech_year || "N/A"}, Sem: ${profile.btech_semester || "N/A"})`;
  }
  doc.text(`Education Level: ${eduDetail}`, 25, y);
  y += 10;

  // Section 2: Learning Performance & Statistics
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Assessment & Learning Summary", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  if (!stats || stats.totalAttempts === 0) {
    doc.text("Assessment Performance: Insufficient data. Complete practice questions to generate statistics.", 25, y);
    y += 8;
  } else {
    doc.text(`Total Questions Attempted: ${stats.totalAttempts}`, 25, y);
    doc.text(`Accuracy Rate: ${stats.overallAccuracy}%`, 110, y);
    y += 6;
    doc.text(`Total Correct: ${stats.totalCorrect}`, 25, y);
    doc.text(`Average Response Time: ${stats.avgResponseTime} seconds`, 110, y);
    y += 6;
    doc.text(`Topics Mastered: ${stats.topicsMasteredCount}`, 25, y);
    doc.text(`Topics Needing Improvement: ${stats.topicsNeedsImprovementCount}`, 110, y);
    y += 8;
  }

  // Section 3: Topic Mastery Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("3. Dynamic Topic Mastery Status", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  if (!masteryRecords || masteryRecords.length === 0) {
    doc.text("Topic Mastery: Insufficient data. No topics practiced yet.", 25, y);
    y += 8;
  } else {
    masteryRecords.slice(0, 6).forEach((rec) => {
      doc.text(`• [${rec.mastery_state.toUpperCase()}] ${rec.subject} → ${rec.topic}: ${rec.accuracy}% accuracy (${rec.attempts} attempts, ${rec.mistakes} mistakes)`, 25, y);
      y += 5.5;
    });
    if (masteryRecords.length > 6) {
      doc.text(`  (...and ${masteryRecords.length - 6} more topic records in database)`, 25, y);
      y += 5.5;
    }
    y += 3;
  }

  // Section 4: Doubt Analytics & Learning Signals
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("4. Doubt Analysis & Learning Signals", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  if (!stats || stats.totalDoubts === 0) {
    doc.text("Doubt History: Insufficient data. No study doubts asked yet.", 25, y);
    y += 8;
  } else {
    doc.text(`Total Study Doubts Solved: ${stats.totalDoubts}`, 25, y);
    y += 5;
    if (repeatedDoubts && repeatedDoubts.length > 0) {
      doc.text("Repeated Doubt Areas (Identified Learning Friction):", 25, y);
      y += 5;
      repeatedDoubts.slice(0, 3).forEach((rd) => {
        doc.text(`  - ${rd.subject} / ${rd.topic}: Asked ${rd.count} times`, 28, y);
        y += 4.5;
      });
    } else {
      doc.text("Repeated Doubts: None detected (Diverse inquiry pattern across topics).", 25, y);
      y += 5;
    }
    y += 3;
  }

  // Section 5: Course Progress & Certificates
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("5. Course Progress & Accreditations", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  if (!enrolledCourses || enrolledCourses.length === 0) {
    doc.text("Course Progress: Insufficient data. No enrolled courses yet.", 25, y);
    y += 6;
  } else {
    enrolledCourses.forEach((c) => {
      doc.text(`• ${c.title}: ${Math.round(c.completion_percentage || 0)}% completed (${c.enrollment_status || "enrolled"})`, 25, y);
      y += 5;
    });
  }

  if (certificates && certificates.length > 0) {
    doc.text(`Verified Certificates Earned:`, 25, y);
    y += 5;
    certificates.forEach((cert) => {
      doc.text(`  - Certificate ID: ${cert.certificate_id} for "${cert.course_name}" (Completed: ${new Date(cert.completion_date).toLocaleDateString()})`, 28, y);
      y += 4.5;
    });
  }
  y += 3;

  // Section 6: Personalization Engine & Recommendations
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("6. Personalized Next Steps (Adaptive Recommendations)", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  if (!activeRecommendations || activeRecommendations.length === 0) {
    doc.text("Recommendations: Continue learning to receive personalized recommendations.", 25, y);
    y += 6;
  } else {
    activeRecommendations.forEach((rec) => {
      doc.setFont("helvetica", "bold");
      doc.text(`• ${rec.title} [Target: ${rec.target_subject || "General"} | Diff: ${rec.difficulty}]`, 25, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.text(`  Reason: ${rec.reason}`, 28, y);
      y += 5.5;
    });
  }

  // Footer stamp
  y += 8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("This report is dynamically calculated from verified student database records in LearnX.", 20, y);

  const cleanName = (profile?.name || "student").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`learnx_progress_report_${cleanName}.pdf`);
}
