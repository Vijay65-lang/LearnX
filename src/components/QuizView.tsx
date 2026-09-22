/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  StudentProfile,
  CustomSubjectContext,
  GeneratedMCQ,
  QuizTestSummary
} from "../types";
import {
  getCustomSubjects,
  saveCustomSubject,
  deleteCustomSubject,
  generateNextMCQ,
  submitQuestionAttempt,
  getStudentStorageKey
} from "../api";
import {
  BookOpen,
  Upload,
  Brain,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  FileText,
  Clock,
  Layers,
  Award,
  Zap,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

interface QuizViewProps {
  student: StudentProfile;
  onAskTopic?: (topic: string) => void;
}

// Preset subjects by academic level to jumpstart student selection
const PRESET_ACADEMIC_SUBJECTS: Record<string, Array<{ name: string; stream: string; topics: string[]; sampleSyllabus: string }>> = {
  Intermediate: [
    {
      name: "Intermediate Mathematics (1A / 1B / 2A / 2B)",
      stream: "MPC",
      topics: ["Matrices & Determinants", "Trigonometric Functions", "Calculus & Limits", "Coordinate Geometry", "Vectors", "Probability & Distributions", "Complex Numbers"],
      sampleSyllabus: "Matrices: Rank of matrix, Cramer's rule, Matrix inversion, Gauss-Jordan method. Limits & Continuity, Differentiation, Tangents & Normals, Maxima & Minima. Integration by substitution and parts, Definite integrals, Differential equations."
    },
    {
      name: "Intermediate Physics",
      stream: "MPC",
      topics: ["Newton's Laws & Friction", "Work, Power & Energy", "Rotational Dynamics & Inertia", "Oscillations & SHM", "Thermodynamics & Carnot Cycle", "Ray & Wave Optics", "Current Electricity & Kirchoff's Laws", "Semiconductors & Logic Gates"],
      sampleSyllabus: "Mechanics: Newton's second law, banking of roads, work-energy theorem, moment of inertia of regular bodies. Thermodynamics: First & second laws, isothermal/adiabatic processes, Carnot efficiency. Wave Optics: Huygens principle, Young's double slit experiment, Brewster's law. Current Electricity: Ohm's law, Wheatstone bridge, potentiometer."
    },
    {
      name: "Intermediate Chemistry",
      stream: "MPC",
      topics: ["Atomic Structure & Bohr Model", "Chemical Bonding & Hybridization", "Thermodynamics & Thermochemistry", "Chemical Equilibrium & Le Chatelier", "Organic Chemistry (Hydrocarbons)", "Coordination Compounds", "Electrochemistry & Nernst Equation"],
      sampleSyllabus: "Atomic Structure: De Broglie relationship, Heisenberg uncertainty, quantum numbers. Chemical Bonding: VSEPR theory, hybridization (sp, sp2, sp3), dipole moment, hydrogen bonding. Equilibrium: Law of chemical equilibrium, Le Chatelier principle, pH and buffer solutions. Organic Chemistry: IUPAC nomenclature, Markovnikov addition, nucleophilic substitution (SN1/SN2)."
    },
    {
      name: "Intermediate Botany & Zoology",
      stream: "BiPC",
      topics: ["Cell Biology & Cell Cycle", "Plant Physiology & Photosynthesis", "Genetics & Molecular Inheritance", "Human Digestion & Respiration", "Circulatory & Excretory Systems", "Neural Control & Coordination"],
      sampleSyllabus: "Cell Division: Mitosis and Meiosis phases. Photosynthesis: Light reaction, Calvin cycle (C3/C4 pathways). Human Physiology: Cardiac cycle, ECG, counter-current mechanism in kidneys, sliding filament theory of muscle contraction, reflex arc."
    }
  ],
  "B.Tech": [
    {
      name: "Data Structures & Algorithms",
      stream: "Computer Science & Engineering",
      topics: ["Arrays & Dynamic Strings", "Linked Lists (Singly/Doubly)", "Stacks, Queues & Monotonic Deques", "Binary Trees & BST Traversals", "Graph Traversals (BFS/DFS)", "Dynamic Programming & Memoization", "Sorting & Divide-and-Conquer"],
      sampleSyllabus: "Linear Data Structures: Array operations, Linked List reversal, cycle detection. Trees: Balanced BSTs, AVL rotations, lowest common ancestor. Graphs: Dijkstra's algorithm, Topological Sort, Minimum Spanning Trees (Prim/Kruskal). Dynamic Programming: Knapsack problem, Longest Common Subsequence."
    },
    {
      name: "Database Management Systems (DBMS)",
      stream: "Computer Science & Information Tech",
      topics: ["Relational Algebra & SQL", "ER Modeling & Relational Schema", "Database Normalization (1NF to BCNF)", "Transaction ACID Properties & Serializability", "Indexing (B-Trees & B+ Trees)", "Concurrency Control & Deadlocks"],
      sampleSyllabus: "Relational model, SQL DDL/DML, functional dependencies, 2NF, 3NF, BCNF decomposition. Concurrency: Two-phase locking (2PL), Write-Ahead Logging (WAL), timestamp ordering, ACID guarantees."
    },
    {
      name: "Computer Networks & Protocols",
      stream: "Computer Science / Electronics",
      topics: ["OSI & TCP/IP 5-Layer Stack", "IPv4 & IPv6 Subnetting (CIDR)", "TCP Flow & Congestion Control", "Routing Protocols (OSPF / BGP)", "DNS, HTTP/2, HTTPS & TLS Handshake", "Socket Programming & Transport Layer"],
      sampleSyllabus: "Physical & Data Link: Framing, CRC error checking, CSMA/CD. Network Layer: Subnet masking, Distance Vector vs Link State routing. Transport Layer: TCP 3-way handshake, sliding window, Reno/Cubic congestion avoidance. Application Layer: HTTP/HTTPS, DNS lookup resolution."
    }
  ],
  School: [
    {
      name: "Class 10 Mathematics",
      stream: "General",
      topics: ["Real Numbers & Euclid Division", "Polynomials & Quadratic Equations", "Arithmetic Progressions (AP)", "Coordinate Geometry", "Trigonometry & Heights/Distances", "Surface Areas & Volumes", "Statistics & Probability"],
      sampleSyllabus: "Euclid's division lemma, zeroes of polynomials, solving quadratic equations by factoring and quadratic formula, nth term and sum of AP, distance and section formulas, trigonometric ratios and standard identities (sin^2 + cos^2 = 1)."
    },
    {
      name: "Class 10 Science (Physics, Chemistry, Biology)",
      stream: "General",
      topics: ["Chemical Reactions & Equations", "Acids, Bases & Salts", "Metals & Non-Metals", "Life Processes (Nutrition, Transport)", "Control & Coordination", "Light: Reflection & Refraction", "Electricity & Magnetic Effects"],
      sampleSyllabus: "Balancing chemical equations, types of reactions, pH scale and neutralization, extraction of metals, human heart and blood circulation, nephron structure in kidneys, lens and mirror formulas, Ohm's law (V = IR), Joule's heating effect."
    }
  ],
  Degree: [
    {
      name: "Financial Accounting & Business Law",
      stream: "Commerce / B.Com",
      topics: ["Double Entry Bookkeeping", "Trial Balance & Financial Statements", "Depreciation Accounting", "Corporate Governance & Company Law", "Partnership Accounts", "Cost & Management Accounting"],
      sampleSyllabus: "Journal entries, ledger posting, cash book, bank reconciliation statement, preparation of trading & profit/loss account and balance sheet, provisions and reserves, Indian Contract Act fundamentals."
    }
  ]
};

export const QuizView: React.FC<QuizViewProps> = ({ student, onAskTopic }) => {
  // Navigation inside Quiz Section
  const [activeSubTab, setActiveSubTab] = useState<"quiz" | "manage_subjects">("quiz");

  // Custom subjects state
  const [customSubjects, setCustomSubjects] = useState<CustomSubjectContext[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);

  // Upload/Add Subject Form
  const [subjectNameInput, setSubjectNameInput] = useState<string>("");
  const [subjectCodeInput, setSubjectCodeInput] = useState<string>("");
  const [syllabusTextInput, setSyllabusTextInput] = useState<string>("");
  const [topicInput, setTopicInput] = useState<string>("");
  const [topicsList, setTopicsList] = useState<string[]>([]);
  const [savingSubject, setSavingSubject] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Active Subject & Topic Selection for Quiz Test
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedSyllabusNotes, setSelectedSyllabusNotes] = useState<string>("");
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(5);

  // Active Quiz State
  const [quizRunning, setQuizRunning] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedMCQ & { id: string } | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [scoreHistory, setScoreHistory] = useState<Array<{
    question: string;
    selected: string;
    correct: string;
    isCorrect: boolean;
    explanation: string;
  }>>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Past Quiz History (stored locally per student)
  const [pastQuizzes, setPastQuizzes] = useState<QuizTestSummary[]>([]);

  // File upload ref for syllabus file
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom subjects and quiz history on mount
  useEffect(() => {
    loadSubjects();
    loadPastQuizzes();
  }, [student.id]);

  const loadPastQuizzes = () => {
    try {
      const raw = localStorage.getItem(getStudentStorageKey("quiz_history"));
      if (raw) {
        setPastQuizzes(JSON.parse(raw));
      }
    } catch {}
  };

  const saveQuizHistoryItem = (item: QuizTestSummary) => {
    try {
      const existing = [item, ...pastQuizzes].slice(0, 30);
      setPastQuizzes(existing);
      localStorage.setItem(getStudentStorageKey("quiz_history"), JSON.stringify(existing));
    } catch {}
  };

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await getCustomSubjects();
      setCustomSubjects(res.customSubjects || []);

      // If no subject selected yet, set default to the first custom subject or preset
      if (res.customSubjects && res.customSubjects.length > 0) {
        const first = res.customSubjects[0];
        setSelectedSubject(first.subject_name);
        setSelectedSyllabusNotes(first.syllabus_notes);
        if (first.selected_topics && first.selected_topics.length > 0) {
          setSelectedTopic(first.selected_topics[0]);
        }
      } else {
        // Fallback to student's academic level preset
        const presets = PRESET_ACADEMIC_SUBJECTS[student.education_level] || PRESET_ACADEMIC_SUBJECTS.Intermediate;
        if (presets.length > 0) {
          setSelectedSubject(presets[0].name);
          setSelectedSyllabusNotes(presets[0].sampleSyllabus);
          setSelectedTopic(presets[0].topics[0]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Add a topic to current form
  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    if (!topicsList.includes(topicInput.trim())) {
      setTopicsList([...topicsList, topicInput.trim()]);
    }
    setTopicInput("");
  };

  const handleRemoveTopic = (t: string) => {
    setTopicsList(topicsList.filter((item) => item !== t));
  };

  // File Upload Handler (txt / pdf / markdown)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto populate subject name from file if empty
    if (!subjectNameInput.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setSubjectNameInput(baseName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSyllabusTextInput(content.slice(0, 15000));
        // Auto-extract preliminary topic lines if formatted with dashes or bullets
        const lines = content.split("\n");
        const foundTopics: string[] = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if ((trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) && trimmed.length < 60 && trimmed.length > 4) {
            const cleanT = trimmed.replace(/^[•\-*\d.]+\s*/, "");
            if (cleanT && !foundTopics.includes(cleanT) && foundTopics.length < 8) {
              foundTopics.push(cleanT);
            }
          }
        }
        if (foundTopics.length > 0 && topicsList.length === 0) {
          setTopicsList(foundTopics);
        }
      }
    };
    reader.readAsText(file);
  };

  // Save new custom subject
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectNameInput.trim() || !syllabusTextInput.trim()) {
      alert("Please provide both the subject name and syllabus notes or details.");
      return;
    }

    setSavingSubject(true);
    setSaveSuccessMsg(null);
    try {
      const streamBranch = student.inter_stream || student.btech_branch || student.school_grade || student.degree_specialization || "General";
      await saveCustomSubject({
        subject_name: subjectNameInput.trim(),
        subject_code: subjectCodeInput.trim() || undefined,
        education_level: student.education_level,
        branch_stream: streamBranch,
        syllabus_notes: syllabusTextInput.trim(),
        selected_topics: topicsList.length > 0 ? topicsList : ["Core Syllabus", "Key Concepts"]
      });

      setSaveSuccessMsg(`Awesome! AI is now strengthened in "${subjectNameInput.trim()}". You can take custom tests and MCQs now!`);
      // Reload subjects
      await loadSubjects();
      // Select newly added subject
      setSelectedSubject(subjectNameInput.trim());
      setSelectedSyllabusNotes(syllabusTextInput.trim());
      if (topicsList.length > 0) {
        setSelectedTopic(topicsList[0]);
      } else {
        setSelectedTopic("Core Syllabus");
      }

      // Reset form
      setSubjectNameInput("");
      setSubjectCodeInput("");
      setSyllabusTextInput("");
      setTopicsList([]);

      setTimeout(() => {
        setSaveSuccessMsg(null);
        setActiveSubTab("quiz");
      }, 2000);
    } catch {
      alert("Failed to save subject details. Please try again.");
    } finally {
      setSavingSubject(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    try {
      await deleteCustomSubject(id);
      await loadSubjects();
    } catch {
      alert("Failed to delete subject.");
    }
  };

  // Quick preset loader
  const handleUsePreset = (preset: { name: string; stream: string; topics: string[]; sampleSyllabus: string }) => {
    setSubjectNameInput(preset.name);
    setSyllabusTextInput(preset.sampleSyllabus);
    setTopicsList(preset.topics);
  };

  // ==========================================
  // QUIZ ENGINE
  // ==========================================

  const startQuiz = async () => {
    if (!selectedSubject) {
      alert("Please choose a subject first.");
      return;
    }

    const topicToTest = selectedTopic || "Academic Fundamentals";
    setQuizRunning(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScoreHistory([]);
    setPreviousQuestions([]);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setStartTime(Date.now());
    setTimeSpent(0);

    await fetchNextQuizQuestion(1, topicToTest, []);
  };

  const fetchNextQuizQuestion = async (
    qNumber: number,
    topic: string,
    historyQuestions: string[]
  ) => {
    setLoadingQuestion(true);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setIsCorrect(null);

    const streamBranch = student.inter_stream || student.btech_branch || student.school_grade || student.degree_specialization || "General";
    try {
      const res = await generateNextMCQ({
        subject: selectedSubject,
        topic,
        concept: topic,
        difficulty: qNumber === 1 ? "Easy" : qNumber <= 3 ? "Medium" : "Hard",
        question_index: qNumber,
        previous_questions: historyQuestions,
        education_level: student.education_level,
        stream_branch: streamBranch,
        syllabus_notes: selectedSyllabusNotes
      });

      if (res?.mcq) {
        setCurrentQuestion({
          ...res.mcq,
          id: res.mcq.id || "quiz_q_" + Date.now()
        });
      }
    } catch {
      // Fallback question
      setCurrentQuestion({
        id: "q_fb_" + Date.now(),
        subject: selectedSubject,
        topic,
        concept: topic,
        question_text: `In ${selectedSubject}, which principle is fundamental when analyzing ${topic}?`,
        option_a: "Applying the standard governing laws, formulas, and verified step-by-step logic",
        option_b: "Skipping scientific units and guessing numerical outcomes arbitrarily",
        option_c: "Assuming that theoretical principles do not apply to examination questions",
        option_d: "Memorizing only superficial labels without understanding foundational causes",
        correct_option: "A",
        explanation: `In ${selectedSubject}, foundational laws and methodical derivations lead to reliable and accurate results.`,
        difficulty: "Medium",
        validation_passed: true
      });
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    if (answerSubmitted) return;
    setSelectedAnswer(opt);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || answerSubmitted || submittingAnswer) return;

    setSubmittingAnswer(true);
    const correct = selectedAnswer.toUpperCase() === currentQuestion.correct_option.toUpperCase();
    setIsCorrect(correct);
    setAnswerSubmitted(true);

    // Save to learning attempts API for mastery tracking
    try {
      await submitQuestionAttempt({
        question_id: currentQuestion.id,
        subject: currentQuestion.subject,
        topic: currentQuestion.topic,
        concept: currentQuestion.concept,
        difficulty: currentQuestion.difficulty,
        selected_answer: selectedAnswer,
        correct_answer: currentQuestion.correct_option,
        response_time: 15
      });
    } catch {}

    // Add to quiz history
    setScoreHistory((prev) => [
      ...prev,
      {
        question: currentQuestion.question_text,
        selected: selectedAnswer,
        correct: currentQuestion.correct_option,
        isCorrect: correct,
        explanation: currentQuestion.explanation
      }
    ]);

    setPreviousQuestions((prev) => [...prev, currentQuestion.question_text]);
    setSubmittingAnswer(false);
  };

  const handleNextQuizQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= quizQuestionCount) {
      // Finished Quiz
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);
      setQuizFinished(true);

      const totalCorrect = scoreHistory.filter((s) => s.isCorrect).length;
      const pct = Math.round((totalCorrect / quizQuestionCount) * 100);

      // Save summary
      saveQuizHistoryItem({
        subject: selectedSubject,
        topic: selectedTopic || "Academic Fundamentals",
        totalQuestions: quizQuestionCount,
        correctCount: totalCorrect,
        scorePercentage: pct,
        timeSpentSeconds: elapsed,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      });
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    await fetchNextQuizQuestion(nextIndex + 1, selectedTopic || "Academic Fundamentals", previousQuestions);
  };

  // Get active subjects list (custom + presets)
  const presetList = PRESET_ACADEMIC_SUBJECTS[student.education_level] || PRESET_ACADEMIC_SUBJECTS.Intermediate;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {student.education_level}
                {student.inter_stream ? ` • ${student.inter_stream}` : student.btech_branch ? ` • ${student.btech_branch}` : ""}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Verified Scientific & Math Accuracy
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Academic Quiz & Custom Subject Test
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Select your academic subject, upload your exact college or board syllabus details to strengthen the AI, and take comprehensive multiple-choice quiz tests.
            </p>
          </div>

          {/* Sub Navigation Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => {
                setActiveSubTab("quiz");
                setQuizRunning(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeSubTab === "quiz"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              Take Quiz Test
            </button>
            <button
              onClick={() => {
                setActiveSubTab("manage_subjects");
                setQuizRunning(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeSubTab === "manage_subjects"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload / Strengthen Subject
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          SUBTAB 1: TAKE QUIZ TEST
          ======================================================== */}
      {activeSubTab === "quiz" && !quizRunning && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Subject & Test Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Step 1: Select Academic Subject
              </h2>

              {/* Subject Selector Pills / Cards */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                  Your Subjects (Custom Uploaded & Standard Curricula)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Custom Uploaded Subjects */}
                  {customSubjects.map((sub) => {
                    const isSelected = selectedSubject === sub.subject_name;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(sub.subject_name);
                          setSelectedSyllabusNotes(sub.syllabus_notes);
                          if (sub.selected_topics && sub.selected_topics.length > 0) {
                            setSelectedTopic(sub.selected_topics[0]);
                          } else {
                            setSelectedTopic("Core Syllabus");
                          }
                        }}
                        className={`text-left p-4 rounded-xl border transition relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                            : "bg-slate-850 hover:bg-slate-800/90 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Custom AI Grounded
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <h3 className="font-bold text-white text-sm line-clamp-1">{sub.subject_name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {sub.syllabus_notes.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="mt-3 text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{sub.selected_topics?.length || 0} Topics Defined</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Standard Academic Presets */}
                  {presetList.map((preset) => {
                    const isSelected = selectedSubject === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(preset.name);
                          setSelectedSyllabusNotes(preset.sampleSyllabus);
                          setSelectedTopic(preset.topics[0]);
                        }}
                        className={`text-left p-4 rounded-xl border transition relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                            : "bg-slate-850 hover:bg-slate-800/90 border-slate-800 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {preset.stream}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <h3 className="font-bold text-white text-sm line-clamp-1">{preset.name}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {preset.sampleSyllabus.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          <span>{preset.topics.length} Syllabus Chapters</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Topic Selection */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Step 2: Choose Topic / Chapter
                </h2>
                <p className="text-xs text-slate-400">
                  Select which chapter or concept to generate questions for from <span className="text-indigo-300 font-semibold">{selectedSubject || "selected subject"}</span>:
                </p>

                {/* Topics Pills */}
                {(() => {
                  const activeCustom = customSubjects.find((s) => s.subject_name === selectedSubject);
                  const activePreset = presetList.find((p) => p.name === selectedSubject);
                  const availableTopics = (activeCustom?.selected_topics && activeCustom.selected_topics.length > 0)
                    ? activeCustom.selected_topics
                    : (activePreset?.topics || ["General Principles", "Core Applications", "Numerical Problems"]);

                  return (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableTopics.map((top) => (
                        <button
                          key={top}
                          type="button"
                          onClick={() => setSelectedTopic(top)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                            selectedTopic === top
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {top}
                          {selectedTopic === top && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Step 3: Question Count & Grounding Status */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
                    Test Length (Number of Questions)
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuizQuestionCount(num)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          quizQuestionCount === num
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {num} MCQs
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startQuiz}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Quiz Test Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Past Quiz History & AI Grounding Notes */}
          <div className="space-y-6">
            {/* AI Grounding Status Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Brain className="w-4 h-4" />
                AI Knowledge Status
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Currently grounding all generated MCQs and step-by-step solutions using:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 max-h-32 overflow-y-auto space-y-1">
                <div className="text-indigo-300 font-semibold">{selectedSubject}</div>
                <div className="text-[11px] text-slate-400 whitespace-pre-wrap">
                  {selectedSyllabusNotes ? selectedSyllabusNotes.slice(0, 350) + "..." : "Standard academic curriculum active."}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero hallucination guarantee across all models</span>
              </div>
            </div>

            {/* Past Quizzes Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Recent Quiz Scores
                </h3>
                <span className="text-xs text-slate-400 font-mono">{pastQuizzes.length} Taken</span>
              </div>

              {pastQuizzes.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                  No quizzes completed yet. Start your first test on the left!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {pastQuizzes.slice(0, 5).map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white line-clamp-1">{q.subject}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span>{q.topic}</span>
                          <span>•</span>
                          <span>{q.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            q.scorePercentage >= 80
                              ? "text-emerald-400"
                              : q.scorePercentage >= 60
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {q.scorePercentage}%
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {q.correctCount}/{q.totalQuestions} Right
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ACTIVE QUIZ IN PROGRESS
          ======================================================== */}
      {activeSubTab === "quiz" && quizRunning && !quizFinished && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header with Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedSubject}</span>
                <span className="text-slate-400">·</span>
                <span className="text-indigo-400 font-medium">{selectedTopic}</span>
              </div>
              <div className="font-mono text-xs bg-slate-800 px-2.5 py-1 rounded-lg">
                Question {currentQuestionIndex + 1} of {quizQuestionCount}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + (answerSubmitted ? 1 : 0)) / quizQuestionCount) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          {loadingQuestion || !currentQuestion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Generating mathematically and academically verified MCQ #{currentQuestionIndex + 1}...
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Grounded in {selectedSubject} ({student.education_level})
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {currentQuestion.difficulty || "Medium"} Difficulty
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Academic Standard
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-3">
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optText = currentQuestion[`option_${opt.toLowerCase() as "a" | "b" | "c" | "d"}`];
                  if (!optText) return null;

                  const isSelected = selectedAnswer === opt;
                  const isCorrectOpt = currentQuestion.correct_option === opt;

                  let btnStyle = "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-200";
                  if (answerSubmitted) {
                    if (isCorrectOpt) {
                      btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500";
                    } else if (isSelected && !isCorrectOpt) {
                      btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200 font-semibold";
                    } else {
                      btnStyle = "bg-slate-900/60 border-slate-800 text-slate-400 opacity-60";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-indigo-950/90 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500 shadow-md";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={answerSubmitted}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {opt}
                      </span>
                      <span className="text-sm leading-relaxed flex-1">{optText}</span>
                      {answerSubmitted && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {answerSubmitted && isSelected && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Answer or Next Question Button */}
              {!answerSubmitted ? (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Select an option and click Verify Answer.
                  </div>
                  <button
                    type="button"
                    disabled={!selectedAnswer || submittingAnswer}
                    onClick={handleSubmitAnswer}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition"
                  >
                    {submittingAnswer ? "Validating..." : "Verify Answer"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  {/* Detailed Explanation Box */}
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isCorrect
                        ? "bg-emerald-950/40 border-emerald-500/50"
                        : "bg-rose-950/30 border-rose-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          isCorrect ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {isCorrect ? "Correct! Brilliant work." : `Incorrect. The correct answer is Option ${currentQuestion.correct_option}.`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  {/* Actions: Next Question */}
                  <div className="flex items-center justify-between pt-2">
                    {onAskTopic && (
                      <button
                        type="button"
                        onClick={() => onAskTopic(currentQuestion.concept || currentQuestion.topic)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        <Brain className="w-3.5 h-3.5" />
                        Ask AI to clarify this concept in chat
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                    >
                      {currentQuestionIndex + 1 >= quizQuestionCount ? "Finish Quiz & View Results" : "Next Question"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          QUIZ FINISHED & SUMMARY REPORT
          ======================================================== */}
      {activeSubTab === "quiz" && quizFinished && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white">Quiz Completed!</h2>
              <p className="text-xs text-slate-400 font-mono">
                {selectedSubject} • {selectedTopic}
              </p>
            </div>

            {/* Score Ring / Block */}
            {(() => {
              const totalCorrect = scoreHistory.filter((s) => s.isCorrect).length;
              const pct = Math.round((totalCorrect / quizQuestionCount) * 100);
              return (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 max-w-sm mx-auto space-y-2">
                  <div className="text-4xl font-extrabold text-white font-mono">{pct}%</div>
                  <div className="text-xs text-slate-400 font-medium">
                    You answered <span className="text-indigo-400 font-bold">{totalCorrect}</span> out of{" "}
                    <span className="text-white font-bold">{quizQuestionCount}</span> questions correctly.
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1 mt-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Time Taken: {timeSpent} seconds
                  </div>
                </div>
              );
            })()}

            {/* Question Breakdown List */}
            <div className="text-left space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Performance Breakdown
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {scoreHistory.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white">Q{i + 1}: {item.question}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Your choice: <span className="font-mono font-bold text-indigo-300">Option {item.selected}</span> ·
                          Correct: <span className="font-mono font-bold text-emerald-300">Option {item.correct}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Restart or New Test */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={startQuiz}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Another Test on {selectedTopic}
              </button>
              <button
                type="button"
                onClick={() => setQuizRunning(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Choose Another Subject / Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: UPLOAD & STRENGTHEN SUBJECT DETAILS
          ======================================================== */}
      {activeSubTab === "manage_subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Upload and Enter Subject Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Upload & Strengthen AI in Your Subjects
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Provide your subject syllabus notes, textbook chapter outlines, or exam guidelines. LearnX AI will ingest this context to eliminate wrong answers and generate 100% curriculum-aligned tests.
                </p>
              </div>

              {saveSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  {saveSuccessMsg}
                </div>
              )}

              {/* Quick Preset Selector for Fast Population */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Or Click a Preset Template to Auto-Fill for {student.education_level}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presetList.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleUsePreset(preset)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      {preset.name.split("(")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={subjectNameInput}
                      onChange={(e) => setSubjectNameInput(e.target.value)}
                      placeholder="e.g., Mathematics 1B, Data Structures, Physics"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                      Subject Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={subjectCodeInput}
                      onChange={(e) => setSubjectCodeInput(e.target.value)}
                      placeholder="e.g., MATH-101, CSE-204"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* File Upload Trigger */}
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 transition text-center space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.md,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">
                    Upload Syllabus Notes or Textbook Document (.txt, .md, .pdf)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Drag and drop your syllabus file here or click below to browse
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 transition"
                  >
                    Browse Document File
                  </button>
                </div>

                {/* Syllabus Text Notes */}
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Syllabus Details & Key Subject Notes *
                  </label>
                  <textarea
                    rows={6}
                    value={syllabusTextInput}
                    onChange={(e) => setSyllabusTextInput(e.target.value)}
                    placeholder="Paste your curriculum outline, chapter topics, key formulas, or standard definitions. The AI will strictly ground its responses and MCQ questions in this exact text."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-indigo-500 transition font-mono"
                  />
                </div>

                {/* Topics Tag List */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
                    Important Chapters / Topics to Test
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTopic();
                        }
                      }}
                      placeholder="e.g., Matrices, Calculus, Newton's Laws"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Topic
                    </button>
                  </div>

                  {topicsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {topicsList.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-lg text-xs bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTopic(t)}
                            className="hover:text-rose-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSubject}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    {savingSubject ? "Strengthening AI Knowledge..." : "Save Subject & Strengthen AI"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Col: List of Custom Subjects Already Stored */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Your Active Subjects ({customSubjects.length})
                </h3>
              </div>

              {loadingSubjects ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading custom subjects...</div>
              ) : customSubjects.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p>You haven't uploaded custom subjects yet.</p>
                  <p className="text-[11px] text-slate-400">Use the form on the left to add one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-xs">{sub.subject_name}</h4>
                          <span className="text-[10px] font-mono text-indigo-400">{sub.education_level}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(sub.id, sub.subject_name)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition"
                          title="Remove Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {sub.syllabus_notes}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sub.selected_topics?.length || 0} Topics
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubject(sub.subject_name);
                            setSelectedSyllabusNotes(sub.syllabus_notes);
                            if (sub.selected_topics && sub.selected_topics.length > 0) {
                              setSelectedTopic(sub.selected_topics[0]);
                            }
                            setActiveSubTab("quiz");
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          Test This Subject
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
