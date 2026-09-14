import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  Award,
  PlayCircle,
  FileText,
  AlertCircle,
  Plus,
  Sparkles,
  ChevronRight,
  Code2
} from "lucide-react";
import { Course, CourseModule, CourseLesson, StudentProfile, Certificate } from "../types";
import {
  getCourses,
  getCourseDetails,
  enrollInCourse,
  getLesson,
  completeLesson,
  createCourse,
  getLocalCertificates
} from "../api";
import { W3CodeRunner } from "./W3CodeRunner";
import { CertificateModal } from "./CertificateModal";

interface CoursesViewProps {
  student: StudentProfile;
  onViewCertificate?: (cert: Certificate) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ student, onViewCertificate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>(student.education_level || "All");

  // Selected Course Details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Active Lesson View
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [lessonContent, setLessonContent] = useState<{ body_markdown: string } | null>(null);
  const [lessonAssessment, setLessonAssessment] = useState<any | null>(null);
  const [selectedAssessmentOption, setSelectedAssessmentOption] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<any | null>(null);

  // Earned certificate modal popup
  const [earnedCert, setEarnedCert] = useState<Certificate | null>(null);

  const [importingCurriculum, setImportingCurriculum] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [levelFilter]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await getCourses({
        search: search.trim() || undefined,
        level: levelFilter !== "All" ? levelFilter : undefined,
      });
      setCourses(res.courses);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const handleSelectCourse = async (courseId: string) => {
    setLoadingDetails(true);
    setActiveLesson(null);
    setLessonContent(null);
    setLessonAssessment(null);
    setActiveCodeSnippet(null);
    try {
      const res = await getCourseDetails(courseId);
      setSelectedCourse(res.course);
      setModules(res.modules);
      setProgress(res.progress);
    } catch (err) {
      console.error("Failed to load course details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
      handleSelectCourse(courseId);
      loadCourses();
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  const handleOpenLesson = async (lesson: CourseLesson) => {
    try {
      const res = await getLesson(lesson.id);
      setActiveLesson(res.lesson);
      setLessonContent(res.content);
      setLessonAssessment(res.assessment);
      setSelectedAssessmentOption(null);
      setAssessmentResult(null);

      // Setup interactive W3-Style Code Runner
      if (res.codeSnippet) {
        setActiveCodeSnippet(res.codeSnippet);
      } else if (selectedCourse) {
        const textToAnalyze = `${selectedCourse.title} ${lesson.title}`.toLowerCase();
        if (textToAnalyze.includes("python") || textToAnalyze.includes("data structure") || textToAnalyze.includes("algorithm")) {
          setActiveCodeSnippet({
            language: "python",
            initialCode: `# Interactive Python Lab: ${lesson.title}\n# Try modifying this code and click 'Run Code'!\n\ndef practice():\n    topic = "${lesson.title}"\n    items = [10, 20, 30, 40, 50]\n    print(f"Practicing: {topic}")\n    print("Items:", items)\n    print("Total Sum:", sum(items))\n    print("Average:", sum(items) / len(items))\n\npractice()`,
            description: "Instant Python interpreter running in your browser.",
            expectedOutput: `Practicing: ${lesson.title}`
          });
        } else if (textToAnalyze.includes("sql") || textToAnalyze.includes("database") || textToAnalyze.includes("dbms")) {
          setActiveCodeSnippet({
            language: "sql",
            initialCode: `-- Interactive SQL Query Console\nSELECT name, department, gpa FROM students WHERE gpa >= 3.5 ORDER BY gpa DESC;`,
            description: "Interactive SQL query sandbox with pre-loaded mock tables."
          });
        } else if (textToAnalyze.includes("html") || textToAnalyze.includes("css") || textToAnalyze.includes("web")) {
          setActiveCodeSnippet({
            language: "html",
            initialCode: `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: white; border-radius: 12px; border: 1px solid #334155;">\n  <h2 style="color: #6366f1; margin: 0 0 8px 0;">Interactive Web Preview</h2>\n  <p style="color: #94a3b8; font-size: 14px;">Edit this HTML code and click Run to see the live rendering!</p>\n  <button style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">LearnX Action</button>\n</div>`,
            description: "Live HTML and CSS rendering sandbox."
          });
        } else {
          setActiveCodeSnippet({
            language: "javascript",
            initialCode: `// Interactive JavaScript Lab: ${lesson.title}\nconsole.log("Starting Lesson Lab: ${lesson.title}");\n\nconst testScores = [85, 92, 78, 96, 88];\nconst highestScore = Math.max(...testScores);\nconsole.log("Highest Score Achieved:", highestScore);`,
            description: "Safe JavaScript runtime sandbox."
          });
        }
      } else {
        setActiveCodeSnippet(null);
      }
    } catch (err) {
      console.error("Failed to load lesson:", err);
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    setCompletingLesson(true);
    try {
      const res = await completeLesson(lessonId);
      if (res.certificate) {
        setEarnedCert(res.certificate);
      }
      // Refresh course state
      if (selectedCourse) {
        handleSelectCourse(selectedCourse.id);
      }
      loadCourses();
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    } finally {
      setCompletingLesson(false);
    }
  };

  // Allows student to load verified standard curriculum for their level
  const handleLoadStandardCurriculum = async () => {
    setImportingCurriculum(true);
    try {
      // Create a comprehensive real curriculum course for student's level
      if (student.education_level === "B.Tech") {
        await createCourse({
          title: "Data Structures & Algorithms Mastery",
          code: "CS201",
          education_level: "B.Tech",
          branch_stream: "Computer Science & Engineering",
          description: "Comprehensive foundational curriculum covering Linear Data Structures, Trees, Graphs, Sorting algorithms, and asymptotic complexity analysis.",
          estimated_hours: 12,
          modules: [
            {
              title: "Module 1: Linear Data Structures",
              description: "Arrays, Singly & Doubly Linked Lists, Stacks and Queues.",
              lessons: [
                {
                  title: "Introduction to Dynamic Arrays & Memory Layout",
                  reading_time_min: 8,
                  content: "# Dynamic Arrays & Memory Layout\n\nArrays store contiguous memory blocks where index lookup is O(1). Dynamic arrays automatically double capacity when full.\n\n### Key Concepts:\n- **Contiguous Allocation**: Elements stored side-by-side in cache lines.\n- **Amortized Analysis**: Appending takes O(1) amortized time despite periodic O(N) reallocation.",
                  assessment: {
                    question: "What is the amortized time complexity of appending an element to a dynamically resizing array?",
                    option_a: "O(1)",
                    option_b: "O(N)",
                    option_c: "O(log N)",
                    option_d: "O(N^2)",
                    correct_option: "A",
                    explanation: "While individual resizing takes O(N), resizing occurs with geometric doubling, resulting in O(1) amortized cost per append operation."
                  }
                },
                {
                  title: "Singly vs Doubly Linked Lists",
                  reading_time_min: 10,
                  content: "# Linked Lists Architecture\n\nLinked lists store elements as disconnected nodes containing pointers to the next node.\n\n### Singly vs Doubly:\n- **Singly Linked**: Each node holds data and a `next` pointer.\n- **Doubly Linked**: Each node holds data, a `next` pointer, and a `prev` pointer, enabling bidirectional traversal at the expense of extra memory.",
                  assessment: {
                    question: "What is the primary memory overhead in a Doubly Linked List compared to a Singly Linked List?",
                    option_a: "An extra data field per node",
                    option_b: "An extra pointer field (prev) per node",
                    option_c: "Hash table metadata",
                    option_d: "Fixed buffer allocation",
                    correct_option: "B",
                    explanation: "Doubly linked lists require an extra pointer reference (prev) in every single node to support backwards traversal."
                  }
                }
              ]
            },
            {
              title: "Module 2: Non-Linear Structures & Trees",
              description: "Binary Search Trees, Traversal algorithms, and Balanced Trees.",
              lessons: [
                {
                  title: "Binary Search Tree Properties and Inorder Traversal",
                  reading_time_min: 12,
                  content: "# Binary Search Trees (BST)\n\nA binary search tree enforces that all keys in the left subtree are smaller than the node, and all keys in the right subtree are larger.\n\n### Inorder Traversal:\nTraversing `Left -> Root -> Right` yields keys in strictly ascending sorted order.",
                  assessment: {
                    question: "Which traversal of a Binary Search Tree (BST) produces keys in ascending sorted order?",
                    option_a: "Preorder Traversal",
                    option_b: "Postorder Traversal",
                    option_c: "Inorder Traversal",
                    option_d: "Level Order Traversal",
                    correct_option: "C",
                    explanation: "An inorder traversal (Left, Root, Right) of any valid BST visits nodes in strictly increasing numerical sequence."
                  }
                }
              ]
            }
          ]
        });
      } else if (student.education_level === "Intermediate") {
        await createCourse({
          title: "Intermediate Physics: Mechanics & Wave Dynamics",
          code: "PHY101",
          education_level: "Intermediate",
          branch_stream: "MPC",
          description: "Curriculum aligned to Intermediate / Senior Secondary physics covering Newton's Laws, Work-Energy Theorem, and Simple Harmonic Motion.",
          estimated_hours: 10,
          modules: [
            {
              title: "Module 1: Laws of Motion",
              description: "Inertia, Momentum, and Friction dynamics.",
              lessons: [
                {
                  title: "Newton's Second Law & Momentum Conservation",
                  reading_time_min: 8,
                  content: "# Newton's Second Law of Motion\n\nNewton's second law states that the rate of change of momentum of a body is directly proportional to the applied net external force and occurs in the direction of the force: **F = dp/dt = m*a**.",
                  assessment: {
                    question: "According to Newton's Second Law, what is force mathematically defined as?",
                    option_a: "Mass divided by acceleration",
                    option_b: "Rate of change of linear momentum",
                    option_c: "Work done per unit time",
                    option_d: "Potential energy gradient squared",
                    correct_option: "B",
                    explanation: "Force is formally defined as the time derivative of linear momentum: F = dp/dt."
                  }
                }
              ]
            }
          ]
        });
      } else {
        await createCourse({
          title: "Foundations of Mathematics: Algebra & Geometry",
          code: "MTH100",
          education_level: student.education_level,
          description: "Standard curriculum covering Linear Equations, Polynomials, and Coordinate Geometry.",
          estimated_hours: 8,
          modules: [
            {
              title: "Module 1: Algebraic Expressions & Equations",
              description: "Variables, linear equations, and quadratic formulas.",
              lessons: [
                {
                  title: "Solving Linear Equations in One Variable",
                  reading_time_min: 7,
                  content: "# Linear Equations in One Variable\n\nAn equation of the form **ax + b = 0** where a ≠ 0 has exactly one unique solution: **x = -b / a**.",
                  assessment: {
                    question: "What is the solution to the linear equation 2x + 6 = 14?",
                    option_a: "x = 4",
                    option_b: "x = 6",
                    option_c: "x = 10",
                    option_d: "x = 3",
                    correct_option: "A",
                    explanation: "Subtract 6 from both sides: 2x = 8. Divide by 2: x = 4."
                  }
                }
              ]
            }
          ]
        });
      }

      await loadCourses();
    } catch (err) {
      console.error("Failed to import curriculum:", err);
    } finally {
      setImportingCurriculum(false);
    }
  };

  // Check which lessons are completed
  const completedLessonIds: string[] = [];
  if (progress && progress.completed_lessons) {
    if (Array.isArray(progress.completed_lessons)) {
      completedLessonIds.push(...progress.completed_lessons);
    } else {
      try {
        const parsed = JSON.parse(progress.completed_lessons);
        if (Array.isArray(parsed)) {
          completedLessonIds.push(...parsed);
        }
      } catch {}
    }
  }

  // Course lessons navigation list
  const allCourseLessons = modules.flatMap((m) => m.lessons || []);
  const activeLessonIndex = activeLesson
    ? allCourseLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const prevLesson = activeLessonIndex > 0 ? allCourseLessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex < allCourseLessons.length - 1
      ? allCourseLessons[activeLessonIndex + 1]
      : null;

  return (
    <div id="courses-view" className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6 pb-24 md:pb-12 text-slate-100">
      {/* Earned Certificate Modal with Instant Download */}
      {earnedCert && (
        <CertificateModal
          certificate={earnedCert}
          student={student}
          onClose={() => setEarnedCert(null)}
        />
      )}

      {/* Header & Search */}
      {!selectedCourse && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Academic Courses
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic curriculum mapped to education levels and branches.
              </p>
            </div>

            {/* Curriculum Import Button */}
            <button
              onClick={handleLoadStandardCurriculum}
              disabled={importingCurriculum}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{importingCurriculum ? "Loading Curriculum..." : `Add ${student.education_level} Curriculum`}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses by topic, title, or code..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Education Levels</option>
                <option value="School">School</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Degree">Degree</option>
                <option value="B.Tech">B.Tech</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail View */}
      {selectedCourse ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCourse(null)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                  {selectedCourse.code || selectedCourse.education_level}
                </span>
                {selectedCourse.branch_stream && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    {selectedCourse.branch_stream}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedCourse.estimated_hours} Hours Est.</span>
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{selectedCourse.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                {selectedCourse.description}
              </p>
            </div>

            {/* Progress status */}
            {progress ? (
              <div className="space-y-3">
                <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      Status: <span className="capitalize text-indigo-400">{progress.status}</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-300">
                      {progress.completion_percentage}% Completed
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Certificate Banner if 100% complete */}
                {progress.completion_percentage >= 100 && (
                  <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-300 block">
                          Course Completed — Official Certificate Ready
                        </span>
                        <span className="text-[11px] text-slate-300">
                          Download high-resolution certificate with cryptographic verification.
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const certs = getLocalCertificates();
                        const existing = certs.find(
                          (c) =>
                            c.course_id === selectedCourse.id ||
                            c.course_name?.toLowerCase() === selectedCourse.title?.toLowerCase()
                        );
                        if (existing) {
                          setEarnedCert(existing);
                        } else if (onViewCertificate) {
                          onViewCertificate({
                            id: "cert_" + selectedCourse.id,
                            certificate_id: "LX-" + Date.now().toString(36).toUpperCase(),
                            student_id: student.id,
                            student_name: student.name,
                            course_id: selectedCourse.id,
                            course_name: selectedCourse.title,
                            completion_date: new Date().toISOString().split("T")[0],
                            issued_at: new Date().toISOString(),
                          });
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 shadow"
                    >
                      <Award className="w-4 h-4" />
                      <span>View &amp; Download</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleEnroll(selectedCourse.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Enroll in Course
              </button>
            )}
          </div>

          {/* Active Lesson Modal / View */}
          {activeLesson && lessonContent && (
            <div className="p-5 sm:p-6 bg-slate-900 border border-indigo-900/40 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                  Lesson View
                </span>
                <button
                  onClick={() => setActiveLesson(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Lesson
                </button>
              </div>

              <h3 className="text-base font-bold text-white">{activeLesson.title}</h3>

              {/* Lesson Body Content */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {lessonContent.body_markdown}
              </div>

              {/* Interactive W3-Style Code Lab */}
              {activeCodeSnippet && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300">
                      Interactive Code Lab (W3Schools Style)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono font-semibold">
                      {activeCodeSnippet.language?.toUpperCase() || "CODE"}
                    </span>
                  </div>
                  <W3CodeRunner
                    language={activeCodeSnippet.language || "javascript"}
                    initialCode={activeCodeSnippet.initialCode || activeCodeSnippet.code || ""}
                    description={activeCodeSnippet.description}
                    expectedOutput={activeCodeSnippet.expectedOutput}
                  />
                </div>
              )}

              {/* Lesson Assessment Quiz */}
              {lessonAssessment && (
                <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">Lesson Mastery Check</span>
                  </div>
                  <p className="text-xs font-medium text-slate-100">{lessonAssessment.question}</p>

                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((optKey) => {
                      const optText = lessonAssessment[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const selected = selectedAssessmentOption === optKey;
                      const isCorrect = lessonAssessment.correct_option === optKey;
                      const hasSubmitted = Boolean(assessmentResult);

                      let style = "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750";
                      if (hasSubmitted) {
                        if (isCorrect) style = "bg-emerald-950/70 border-emerald-500 text-emerald-200";
                        else if (selected) style = "bg-rose-950/70 border-rose-500 text-rose-200";
                        else style = "opacity-50";
                      } else if (selected) {
                        style = "bg-indigo-600/30 border-indigo-500 text-indigo-100";
                      }

                      return (
                        <button
                          key={optKey}
                          disabled={hasSubmitted}
                          onClick={() => setSelectedAssessmentOption(optKey)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${style}`}
                        >
                          <span className="font-mono font-bold w-5 h-5 rounded-full bg-slate-900/60 flex items-center justify-center shrink-0">
                            {optKey}
                          </span>
                          <span>{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!assessmentResult ? (
                    <button
                      disabled={!selectedAssessmentOption}
                      onClick={() => {
                        const correct = selectedAssessmentOption === lessonAssessment.correct_option;
                        setAssessmentResult({ is_correct: correct });
                        if (correct) {
                          handleCompleteLesson(activeLesson.id);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <div className={`text-xs font-bold ${assessmentResult.is_correct ? "text-emerald-400" : "text-rose-400"}`}>
                        {assessmentResult.is_correct ? "✓ Correct! Lesson Completed." : "✗ Incorrect. Review the lesson and retry."}
                      </div>
                      <p className="text-[11px] text-slate-400">{lessonAssessment.explanation}</p>
                      {!assessmentResult.is_correct && (
                        <button
                          onClick={() => {
                            setAssessmentResult(null);
                            setSelectedAssessmentOption(null);
                          }}
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          Retry Assessment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Complete Lesson Button if no assessment */}
              {!lessonAssessment && (
                <button
                  disabled={completingLesson || completedLessonIds.includes(activeLesson.id)}
                  onClick={() => handleCompleteLesson(activeLesson.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedLessonIds.includes(activeLesson.id) ? "Lesson Completed" : "Mark as Completed"}</span>
                </button>
              )}

              {/* Lesson Navigation Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && handleOpenLesson(prevLesson)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous:</span>
                  <span className="truncate max-w-[140px]">{prevLesson ? prevLesson.title : "Start"}</span>
                </button>

                <div className="text-[11px] text-slate-400 font-mono font-medium">
                  Lesson {activeLessonIndex + 1} of {allCourseLessons.length}
                </div>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleOpenLesson(nextLesson)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next</span>
                  <span className="hidden sm:inline truncate max-w-[140px]">
                    {nextLesson ? `: ${nextLesson.title}` : "Course End"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Modules and Lessons List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Course Curriculum &amp; Lessons
            </h3>

            {modules.length === 0 ? (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
                No modules loaded for this course yet.
              </div>
            ) : (
              modules.map((mod) => (
                <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-800/80 bg-slate-850/50">
                    <h4 className="text-xs font-bold text-indigo-300">{mod.title}</h4>
                    {mod.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{mod.description}</p>
                    )}
                  </div>

                  <div className="p-2 space-y-1">
                    {mod.lessons?.map((les) => {
                      const isCompleted = completedLessonIds.includes(les.id);
                      return (
                        <div
                          key={les.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition cursor-pointer text-xs"
                          onClick={() => handleOpenLesson(les)}
                        >
                          <div className="flex items-center gap-2.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span className={isCompleted ? "text-slate-300 line-through" : "text-slate-100 font-medium"}>
                              {les.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>{les.reading_time_min} mins</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Courses Grid */
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <div className="w-7 h-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs">Fetching courses from database...</p>
            </div>
          ) : courses.length === 0 ? (
            /* Strict Section 18 & 28 Empty State Mandate */
            <div className="p-10 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                No courses available yet.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Load official syllabus modules for {student.education_level} into the database to begin learning.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleLoadStandardCurriculum}
                  disabled={importingCurriculum}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  {importingCurriculum ? "Adding Curriculum..." : `Load Curriculum for ${student.education_level}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  id={`course-card-${course.id}`}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-semibold border border-indigo-500/30">
                        {course.code || course.education_level}
                      </span>
                      {course.completion_percentage !== undefined && course.completion_percentage > 0 && (
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {course.completion_percentage}% done
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {course.module_count || 0} modules · {course.lesson_count || 0} lessons
                    </span>
                    <button
                      onClick={() => handleSelectCourse(course.id)}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <span>Open Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
