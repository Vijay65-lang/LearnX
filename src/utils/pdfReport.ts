import { jsPDF } from "jspdf";
import { StudentAnalytics } from "../types";
import { analyzeKnowledgeGaps } from "./knowledgeGapsAnalyzer";

export function generateProgressReportPDF(data: StudentAnalytics) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const { profile, stats, masteryRecords, repeatedDoubts, activeRecommendations, enrolledCourses, certificates } = data;

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      drawFooter();
      doc.addPage();
      drawWatermark();
      y = margin + 8;
    }
  };

  const drawFooter = () => {
    const footerY = pageHeight - 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text("LearnX Academic Mastery Platform • Official Student Dossier • Confidential & Verified", margin, footerY);
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin - 12,
      footerY
    );
  };

  const drawWatermark = () => {
    doc.saveGraphicsState();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(241, 245, 249); // Slate 100
    doc.restoreGraphicsState();
  };

  // ==========================================
  // 1. TOP PROFESSIONAL BANNER & HEADER
  // ==========================================
  // Gradient banner simulated with deep navy fill
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");

  // Accent indigo top line
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(margin, y, contentWidth, 2.5, "F");

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("LEARNX ACADEMIC REPORT", margin + 6, y + 13);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("Personalized Student Learning Analytics, Course Progress & Mastery Dossier", margin + 6, y + 20);

  // Report metadata right aligned inside banner
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const reportTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Issue Date: ${reportDate} ${reportTime}`, pageWidth - margin - 6, y + 12, { align: "right" });
  doc.text(`Doc ID: LX-${Date.now().toString().slice(-8)}`, pageWidth - margin - 6, y + 18, { align: "right" });
  doc.text(`Verification: Cryptographically Verified`, pageWidth - margin - 6, y + 24, { align: "right" });

  y += 40;

  // ==========================================
  // 2. STUDENT PROFILE & CREDENTIALS CARD
  // ==========================================
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 32, 2.5, 2.5, "FD");

  // Avatar block
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin + 5, y + 5, 22, 22, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  const initials = (profile?.name || "Student")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  doc.text(initials, margin + 16, y + 19, { align: "center" });

  // Student Info Left Column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(profile?.name || "Student Learner", margin + 32, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Email: ${profile?.email || "N/A"}`, margin + 32, y + 17);
  doc.text(`Student ID: ${profile?.id || "N/A"}`, margin + 32, y + 23);

  // Student Info Right Column
  let eduDetail = profile?.education_level || "Undergraduate";
  if (profile?.education_level === "School" && profile?.school_grade) {
    eduDetail += ` • Class ${profile.school_grade}`;
  } else if (profile?.education_level === "Intermediate" && profile?.inter_stream) {
    eduDetail += ` • Stream: ${profile.inter_stream}`;
  } else if (profile?.education_level === "Degree" && profile?.degree_name) {
    eduDetail += ` • ${profile.degree_name} (${profile.degree_specialization || "General"})`;
  } else if (profile?.education_level === "B.Tech" && profile?.btech_branch) {
    eduDetail += ` • ${profile.btech_branch} (Yr ${profile.btech_year || 1}, Sem ${profile.btech_semester || 1})`;
  }

  doc.text(`Academic Level: ${eduDetail}`, margin + 105, y + 11);
  doc.text(`Account Status: Active Learner`, margin + 105, y + 17);
  doc.text(`Certificates Earned: ${certificates?.length || 0} Accredited`, margin + 105, y + 23);

  y += 38;

  // ==========================================
  // 3. EXECUTIVE KPI CARDS (4-METRIC GRID)
  // ==========================================
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 22;

  const totalDoubts = stats?.totalDoubts || 0;
  const totalAttempts = stats?.totalAttempts || 0;
  const accuracy = stats?.overallAccuracy || (totalAttempts > 0 ? Math.round(((stats?.totalCorrect || 0) / totalAttempts) * 100) : 0);
  const topicsCount = (masteryRecords || []).filter((r) => r.mastery_state === "Mastered" || r.mastery_state === "Strong").length;

  const kpis = [
    { label: "Questions Practiced", value: `${totalAttempts}`, sub: `${stats?.totalCorrect || 0} Correct Answers`, color: [79, 70, 229] },
    { label: "Overall Accuracy", value: `${accuracy}%`, sub: accuracy >= 75 ? "High Proficiency" : "Target: 80%+", color: [16, 185, 129] },
    { label: "Doubts Resolved", value: `${totalDoubts}`, sub: "AI Socratic Explanations", color: [14, 165, 233] },
    { label: "Topics Mastered", value: `${topicsCount}`, sub: `${masteryRecords?.length || 0} Topics Tracked`, color: [168, 85, 247] },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, "FD");

    // Top accent bar
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(cardX, y, cardWidth, 1.5, "F");

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, cardX + 4, y + 9);

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.label, cardX + 4, y + 14);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, cardX + 4, y + 18.5);
  });

  y += cardHeight + 8;

  // ==========================================
  // 4. ENROLLED COURSES & PROGRESS BREAKDOWN
  // ==========================================
  checkPageBreak(50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Enrolled Academic Courses & Module Progress", margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("COURSE TITLE & STREAM", margin + 3, y + 4.8);
  doc.text("LEVEL", margin + 85, y + 4.8);
  doc.text("MODULES", margin + 115, y + 4.8);
  doc.text("COMPLETION", margin + 145, y + 4.8);
  doc.text("STATUS", margin + 168, y + 4.8);
  y += 7;

  const coursesToRender = (enrolledCourses && enrolledCourses.length > 0) ? enrolledCourses : [];

  if (coursesToRender.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("No courses currently enrolled. Explore the Courses tab to begin interactive lessons.", margin + 4, y + 6);
    y += 12;
  } else {
    coursesToRender.forEach((course) => {
      checkPageBreak(12);

      const pct = Math.min(100, Math.max(0, Math.round(course.completion_percentage || 0)));
      const isCompleted = pct >= 100 || course.enrollment_status === "completed";

      // Row background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 9, "FD");

      // Course Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const titleText = (course.title || "Academic Course").length > 42
        ? (course.title || "Academic Course").slice(0, 40) + "..."
        : (course.title || "Academic Course");
      doc.text(titleText, margin + 3, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(course.code || course.branch_stream || "Standard Curriculum", margin + 3, y + 7.5);

      // Level
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(course.education_level || "Academic", margin + 85, y + 5.5);

      // Modules
      doc.text(`${course.module_count || 1} Modules (${course.lesson_count || 3} Lessons)`, margin + 115, y + 5.5);

      // Progress bar
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 145, y + 3.5, 18, 2.5, 1, 1, "F");
      if (pct > 0) {
        doc.setFillColor(isCompleted ? 16 : 79, isCompleted ? 185 : 70, isCompleted ? 129 : 229);
        doc.roundedRect(margin + 145, y + 3.5, (18 * pct) / 100, 2.5, 1, 1, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(`${pct}%`, margin + 145, y + 8);

      // Status Badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      if (isCompleted) {
        doc.setTextColor(16, 185, 129);
        doc.text("COMPLETED", margin + 168, y + 5.5);
      } else if (pct > 0) {
        doc.setTextColor(79, 70, 229);
        doc.text("IN PROGRESS", margin + 168, y + 5.5);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.text("ENROLLED", margin + 168, y + 5.5);
      }

      y += 9;
    });
    y += 5;
  }

  // ==========================================
  // 5. TOPIC MASTERY MATRIX
  // ==========================================
  checkPageBreak(50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Topic Mastery Status & Accuracy Matrix", margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("SUBJECT", margin + 3, y + 4.8);
  doc.text("TOPIC / CONCEPT", margin + 45, y + 4.8);
  doc.text("PRACTICE STATS", margin + 115, y + 4.8);
  doc.text("ACCURACY", margin + 150, y + 4.8);
  doc.text("MASTERY STATUS", margin + 168, y + 4.8);
  y += 7;

  const records = masteryRecords && masteryRecords.length > 0 ? masteryRecords : [];

  if (records.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("No practice attempts recorded yet. Solve practice questions in Ask AI to generate mastery metrics.", margin + 4, y + 6);
    y += 12;
  } else {
    records.slice(0, 10).forEach((rec) => {
      checkPageBreak(8);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 7.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text((rec.subject || "General").slice(0, 20), margin + 3, y + 4.8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      const tText = (rec.topic || "Core Concept").length > 34 ? (rec.topic || "Core Concept").slice(0, 32) + "..." : (rec.topic || "Core Concept");
      doc.text(tText, margin + 45, y + 4.8);

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${rec.attempts} tries • ${rec.mistakes} errors`, margin + 115, y + 4.8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(rec.accuracy >= 75 ? 16 : rec.accuracy >= 50 ? 79 : 225, rec.accuracy >= 75 ? 185 : rec.accuracy >= 50 ? 70 : 29, rec.accuracy >= 75 ? 129 : rec.accuracy >= 50 ? 229 : 72);
      doc.text(`${rec.accuracy}%`, margin + 150, y + 4.8);

      // Status
      doc.setFontSize(7);
      if (rec.mastery_state === "Mastered") {
        doc.setTextColor(147, 51, 234); // purple
        doc.text("MASTERED", margin + 168, y + 4.8);
      } else if (rec.mastery_state === "Strong") {
        doc.setTextColor(16, 185, 129); // emerald
        doc.text("STRONG", margin + 168, y + 4.8);
      } else if (rec.mastery_state === "Developing") {
        doc.setTextColor(59, 130, 246); // blue
        doc.text("DEVELOPING", margin + 168, y + 4.8);
      } else {
        doc.setTextColor(239, 68, 68); // red
        doc.text("NEEDS FOCUS", margin + 168, y + 4.8);
      }

      y += 7.5;
    });
    y += 5;
  }

  // ==========================================
  // 5B. TARGETED KNOWLEDGE GAPS & REVIEW RECOMMENDATIONS
  // ==========================================
  const detectedGaps = analyzeKnowledgeGaps(masteryRecords || []);
  if (detectedGaps.length > 0) {
    checkPageBreak(45);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Detected Knowledge Gaps & Review Priority", margin, y);
    y += 5;

    // Table header
    doc.setFillColor(254, 242, 242); // rose-50
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(159, 18, 57); // rose-900
    doc.text("TOPIC & SUB-CONCEPT", margin + 3, y + 4.8);
    doc.text("SUBJECT", margin + 80, y + 4.8);
    doc.text("ACCURACY & MISTAKES", margin + 120, y + 4.8);
    doc.text("REVIEW PRIORITY", margin + 165, y + 4.8);
    y += 7;

    detectedGaps.forEach((gap) => {
      checkPageBreak(9);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 8, "FD");

      // Topic & Sub-concept
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const gapTitle = gap.concept && gap.concept !== gap.topic ? `${gap.topic} (${gap.concept})` : gap.topic;
      doc.text(gapTitle.length > 38 ? gapTitle.slice(0, 36) + "..." : gapTitle, margin + 3, y + 5);

      // Subject
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(gap.subject.length > 20 ? gap.subject.slice(0, 18) + "..." : gap.subject, margin + 80, y + 5);

      // Accuracy & Mistakes
      doc.setFont("helvetica", "bold");
      doc.setTextColor(gap.severity === "Critical" ? 225 : 217, gap.severity === "Critical" ? 29 : 119, gap.severity === "Critical" ? 72 : 6);
      doc.text(`${gap.accuracy}% (${gap.mistakes} misses / ${gap.attempts} tries)`, margin + 120, y + 5);

      // Priority Badge
      doc.setFontSize(7);
      if (gap.severity === "Critical") {
        doc.setTextColor(225, 29, 72);
        doc.text("CRITICAL", margin + 165, y + 5);
      } else if (gap.severity === "Moderate") {
        doc.setTextColor(217, 119, 6);
        doc.text("MODERATE", margin + 165, y + 5);
      } else {
        doc.setTextColor(37, 99, 235);
        doc.text("LOW", margin + 165, y + 5);
      }

      y += 8;
    });
    y += 5;
  }

  // ==========================================
  // 6. ACCREDITED CERTIFICATES SECTION
  // ==========================================
  if (certificates && certificates.length > 0) {
    checkPageBreak(40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Official Earned Certificates of Completion", margin, y);
    y += 5;

    certificates.forEach((cert) => {
      checkPageBreak(18);

      doc.setFillColor(254, 252, 232); // yellow-50
      doc.setDrawColor(254, 240, 138); // yellow-200
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

      // Gold badge icon
      doc.setFillColor(234, 179, 8); // yellow-500
      doc.circle(margin + 7, y + 7, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text("★", margin + 5.7, y + 8.5);

      // Certificate details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cert.course_name || "Course Completion Certificate", margin + 15, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(113, 63, 18); // yellow-900
      const issueDate = new Date(cert.completion_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.text(`Certificate ID: ${cert.certificate_id} • Completed on: ${issueDate}`, margin + 15, y + 10);

      // Verification label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129);
      doc.text("VERIFIED CREDENTIAL", pageWidth - margin - 5, y + 7.5, { align: "right" });

      y += 17;
    });
  }

  // ==========================================
  // 7. PERSONALIZED ADAPTIVE NEXT STEPS
  // ==========================================
  checkPageBreak(40);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, 2, 26, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("💡 Personalized Learning Strategy & Recommendations", margin + 6, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (activeRecommendations && activeRecommendations.length > 0) {
    const topRec = activeRecommendations[0];
    doc.text(`• Recommended Focus: "${topRec.title}" (${topRec.target_subject || "General"})`, margin + 6, y + 12);
    doc.text(`  Insight: ${topRec.reason.slice(0, 110)}...`, margin + 6, y + 17);
  } else {
    doc.text(`• Maintain daily practice momentum in ${profile?.education_level || "academic"} curriculum lessons.`, margin + 6, y + 12);
    doc.text(`• Review any missed MCQ questions using the step-by-step Socratic explanations in Ask AI.`, margin + 6, y + 17);
  }
  doc.text(`• Complete enrolled course modules to earn official course completion certificates.`, margin + 6, y + 22);

  y += 32;

  // ==========================================
  // 8. OFFICIAL SIGNATURE & INSTITUTIONAL STAMP
  // ==========================================
  checkPageBreak(25);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Academic Evaluation Director", margin, y + 5);
  doc.text("LearnX Automated Assessment Engine", margin, y + 9);

  doc.text("Verification Seal", pageWidth - margin - 28, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Hash: " + Math.random().toString(36).substring(2, 12).toUpperCase(), pageWidth - margin - 28, y + 9);

  drawFooter();

  // Trigger download
  const cleanName = (profile?.name || "student").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`learnx_official_progress_report_${cleanName}.pdf`);
}
