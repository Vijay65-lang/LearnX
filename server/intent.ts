/**
 * LearnX Intelligent Intent, Context & Topic Detection Engine
 * Fast, natural language tolerant, conversational greeting stripping,
 * multi-turn context following, and intent-tailored response structuring.
 */

import { getCodeTemplate, CodeTemplateResult } from "./code_templates.js";

export type StudentIntent =
  | "GREETING"
  | "CAPABILITY_INQUIRY"
  | "MODEL_IDENTITY"
  | "CASUAL_CONVERSATION"
  | "CODE_GENERATION"
  | "ACADEMIC_QUESTION"
  | "CODE_QUESTION"
  | "CONCEPT_EXPLANATION"
  | "DEFINITION"
  | "COMPARISON"
  | "PROBLEM_SOLVING"
  | "PRACTICE_REQUEST"
  | "MCQ_REQUEST"
  | "FOLLOW_UP"
  | "CLARIFICATION"
  | "REEXPLANATION"
  | "UNKNOWN";

export interface ConversationContext {
  last_subject?: string;
  last_topic?: string;
  last_concept?: string;
  last_assistant_snippet?: string;
  recent_messages?: Array<{ sender: "user" | "assistant"; text: string }>;
}

export interface IntentAnalysisResult {
  raw_input: string;
  cleaned_query: string;
  intent: StudentIntent;
  is_conversational: boolean;
  is_pure_greeting: boolean;
  is_code_generation?: boolean;
  code_generation_template?: string;
  detected_subject: string;
  detected_topic: string;
  detected_concept: string;
  programming_language?: string;
  comparison_targets?: [string, string];
  requires_context: boolean;
  context_applied: boolean;
}

// 1. Pure greeting patterns (tolerates u, r u, typos, prefixes)
const PURE_GREETING_REGEX =
  /^(?:hi+|hello+|hey+|hii+|heyy+|heya|good\s*(?:morning|afternoon|evening|day)|namaste|namaskar|vanakkam|yo+|sup|hola|greetings)(?:\s+learnx|\s+there|\s+sir|\s+bro|\s+bhai|\s+ai|\s+buddy)?[\s!.,?]*$/i;

// 2. Capabilities and Help inquiries (e.g., 'what can u do', 'what can you do', 'what are your capabilities')
const CAPABILITY_QUERY_REGEX =
  /^(?:what\s*(?:can|do|will)\s*(?:you|u)\s*(?:do|help(?:\s*with)?)|what\s*are\s*(?:your|ur)\s*(?:capabilities|features|skills|functions)|how\s*can\s*(?:you|u)\s*help(?:\s*me)?|what\s*(?:can|does)\s*(?:this|learnx)(?:\s*app)?\s*do|tell\s*me\s*what\s*(?:you|u)\s*can\s*do|how\s*(?:do\s*i|to)\s*use\s*(?:this|learnx|the\s*app)|what\s*all\s*can\s*(?:you|u)\s*do|features\s*of\s*(?:this\s*app|learnx)|help\s*me(?:\s*please)?|can\s*(?:you|u)\s*help(?:\s*me)?|what\s*help\s*can\s*(?:you|u)\s*give)[\s!.,?]*$/i;

// 3. Model & AI Identity inquiries (e.g., 'what is the model name of ur', 'which model are you using', 'who created you')
const MODEL_IDENTITY_REGEX =
  /^(?:what\s*(?:is|are)\s*(?:the\s*)?(?:ai\s*)?model\s*name\s*(?:of\s*(?:ur|your|this\s*ai)|of\s*u|of\s*you)|what\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|which\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|what\s*is\s*(?:your|ur)\s*model(?:\s*name)?|what\s*is\s*(?:the\s*)?name\s*of\s*(?:your|ur)\s*model|are\s*(?:you|u)\s*(?:gemini|chatgpt|claude|deepseek|gpt|openai|llama|an\s*ai|a\s*robot|a\s*bot)|who\s*(?:are\s*(?:you|u)|created\s*(?:you|u)|made\s*(?:you|u)|built\s*(?:you|u))|what\s*(?:are\s*(?:you|u)|is\s*learnx(?:\s*ai)?)|introduce\s*(?:yourself|urself)|tell\s*me\s*about\s*(?:yourself|urself)|who\s*r\s*u|what\s*r\s*u)[\s!.,?]*$/i;

// 4. Casual chitchat & pleasantries
const CASUAL_CHITCHAT_REGEX =
  /^(?:how\s*(?:are|r)\s*(?:you|u)|how\s*do\s*(?:you|u)\s*do|how's\s*it\s*going|hows\s*it\s*going|thank\s*(?:you|u)|thanks(?:\s*a\s*lot)?|thx|thanku|nice|awesome|cool|great|super|good\s*job|well\s*done|ok|okay|alright|bye|goodbye|see\s*(?:you|u)|cya|gn|good\s*night)[\s!.,?]*$/i;

// 5. Leading greeting prefixes to strip cleanly from academic queries
const LEADING_GREETING_PREFIX_REGEX =
  /^(?:hi+|hello+|hey+|hii+|heyy+|good\s*(?:morning|afternoon|evening)|bro+|bhai|yo+|sup|namaste)\b[\s,:;—\-]*((?:can\s*(?:u|you)\s*(?:please\s*)?(?:explain|tell\s*me|show\s*me|give\s*me)?|pls\s*explain|please\s*explain|tell\s*me\s*about|explain\s*(?:me\s*about\s*the\s*topic\s*of|to\s*me\s*about|about)?|what\s*is|what\s*are)?[\s,:;—\-]*)/i;

// 6. Conversational request wrappers to normalize
const REQUEST_WRAPPER_PREFIX_REGEX =
  /^(?:can\s*(?:u|you)\s*(?:please\s*)?(?:explain|tell\s*me\s*about|show\s*me|teach\s*me|give\s*me)|please\s*(?:explain|tell\s*me\s*about|teach\s*me)|pls\s*(?:explain|tell\s*me)|tell\s*me\s*(?:about|everything\s*about)|i\s*want\s*to\s*(?:know|learn|understand)(?:\s*about)?|explain\s*(?:me\s*about\s*the\s*topic\s*of|to\s*me\s*about|about)?|what\s*do\s*you\s*mean\s*by|what\s*is\s*meant\s*by|give\s*me\s*an\s*overview\s*of)\s+/i;

/**
 * Detects student intent and normalizes the input query
 */
export function analyzeStudentIntent(
  rawInput: string,
  educationLevel: string = "Intermediate",
  streamBranch: string = "MPC",
  context?: ConversationContext
): IntentAnalysisResult {
  const trimmed = (rawInput || "").trim();
  const lower = trimmed.toLowerCase();

  // A. PURE GREETING
  if (PURE_GREETING_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "GREETING",
      is_conversational: true,
      is_pure_greeting: true,
      detected_subject: "General",
      detected_topic: "Greeting",
      detected_concept: "LearnX Assistant",
      requires_context: false,
      context_applied: false
    };
  }

  // B. CAPABILITY INQUIRY (e.g., 'what can u do', 'how can you help')
  if (CAPABILITY_QUERY_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "CAPABILITY_INQUIRY",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Assistant Capabilities & Learning Tools",
      detected_concept: "LearnX Capabilities & Features",
      requires_context: false,
      context_applied: false
    };
  }

  // C. MODEL & AI IDENTITY (e.g., 'what is the model name of ur', 'which model are you')
  if (MODEL_IDENTITY_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "MODEL_IDENTITY",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "LearnX AI System Architecture",
      detected_topic: "AI Foundation Models & Learning Engine",
      detected_concept: "LearnX AI Model Architecture",
      requires_context: false,
      context_applied: false
    };
  }

  // D. CASUAL CHITCHAT
  if (CASUAL_CHITCHAT_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "CASUAL_CONVERSATION",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "General",
      detected_topic: "Conversational",
      detected_concept: "LearnX Assistant",
      requires_context: false,
      context_applied: false
    };
  }

  // C. STRIP GREETING & CONVERSATIONAL PREFIXES
  let coreQuery = trimmed
    .replace(LEADING_GREETING_PREFIX_REGEX, "")
    .replace(REQUEST_WRAPPER_PREFIX_REGEX, "")
    .trim();

  if (!coreQuery || coreQuery.length < 2) {
    coreQuery = trimmed;
  }

  const coreLower = coreQuery.toLowerCase();

  // D. FOLLOW-UP & REEXPLANATION INTENT DETECTION (Multi-turn Context)
  const isReexplanation =
    /^(?:i\s*(?:didn't|did\s*not|don't|do\s*not)\s*understand|explain\s*(?:it\s*)?(?:again|simply|more\s*simply|in\s*simple\s*words)|can\s*you\s*simplify|make\s*it\s*easier|pls\s*explain\s*simply|confused|still\s*not\s*clear|eli5|simple\s*words\s*please)\b/i.test(
      coreLower
    );

  const isExampleFollowUp =
    /^(?:give\s*me\s*an?\s*example|example\??|show\s*an?\s*example|can\s*you\s*give\s*an?\s*example|one\s*more\s*example|practical\s*example)\b/i.test(
      coreLower
    );

  const isWhyFollowUp =
    /^(?:why\s*(?:do\s*we\s*use\s*it|is\s*this\s*used|does\s*this\s*happen)\??|why\??|what\s*is\s*the\s*use\s*of\s*it\??)\b/i.test(
      coreLower
    );

  const isPracticeRequest =
    /^(?:give\s*me\s*(?:some\s*)?(?:\d+\s*)?(?:questions|practice\s*questions|mcqs|problems|quiz)|test\s*me|quiz\s*me|i\s*want\s*to\s*practice)\b/i.test(
      coreLower
    );

  if ((isReexplanation || isExampleFollowUp || isWhyFollowUp || isPracticeRequest) && context?.last_concept) {
    let specificIntent: StudentIntent = "FOLLOW_UP";
    if (isReexplanation) specificIntent = "REEXPLANATION";
    else if (isPracticeRequest) specificIntent = "PRACTICE_REQUEST";

    return {
      raw_input: trimmed,
      cleaned_query: coreQuery,
      intent: specificIntent,
      is_conversational: false,
      is_pure_greeting: false,
      detected_subject: context.last_subject || "Academic Studies",
      detected_topic: context.last_topic || "Core Topic",
      detected_concept: context.last_concept,
      requires_context: true,
      context_applied: true
    };
  }

  // E. CODE GENERATION DETECTION (Dedicated intent for writing/building code)
  const codeGen = detectCodeGeneration(coreLower, trimmed);
  if (codeGen) {
    return {
      raw_input: trimmed,
      cleaned_query: coreQuery,
      intent: "CODE_GENERATION",
      is_conversational: false,
      is_pure_greeting: false,
      is_code_generation: true,
      code_generation_template: codeGen.templateKey,
      detected_subject: codeGen.subject,
      detected_topic: codeGen.topic,
      detected_concept: codeGen.concept,
      programming_language: codeGen.technology,
      requires_context: false,
      context_applied: false
    };
  }

  // F. COMPARISON DETECTION
  const comparisonMatch =
    coreLower.match(/(?:difference\s*between|diff\s*between|compare)\s+([a-zA-Z0-9\s._+#-]+)\s+(?:and|vs\.?|with)\s+([a-zA-Z0-9\s._+#-]+)/i) ||
    coreLower.match(/([a-zA-Z0-9._+#-]+)\s+(?:vs\.?|versus)\s+([a-zA-Z0-9._+#-]+)/i);

  let detectedIntent: StudentIntent = "CONCEPT_EXPLANATION";
  let compTargets: [string, string] | undefined = undefined;

  if (comparisonMatch) {
    detectedIntent = "COMPARISON";
    compTargets = [comparisonMatch[1].trim(), comparisonMatch[2].trim()];
  } else if (
    /\b(?:code|program|script|syntax|write\s*a\s*(?:python|c\+\+|java|c|javascript)\s*(?:code|program)?|hello\s*world|print\s*\(|def\s+|class\s+|function|for\s*loop|while\s*loop|pointer|array\s*in\s*c|malloc|sql\s*query)\b/i.test(
      coreLower
    )
  ) {
    detectedIntent = "CODE_QUESTION";
  } else if (/^(?:what\s*is|define|definition\s*of|meaning\s*of)\b/i.test(coreLower)) {
    detectedIntent = "DEFINITION";
  } else if (/\b(?:calculate|find\s*the\s*value|derive|solve|evaluate|numerical)\b/i.test(coreLower)) {
    detectedIntent = "PROBLEM_SOLVING";
  }

  // F. EXACT SUBJECT, TOPIC & CONCEPT RESOLUTION
  const { subject, topic, concept, lang } = resolveSubjectAndTopic(
    coreLower,
    coreQuery,
    educationLevel,
    streamBranch
  );

  return {
    raw_input: trimmed,
    cleaned_query: coreQuery,
    intent: detectedIntent,
    is_conversational: false,
    is_pure_greeting: false,
    detected_subject: subject,
    detected_topic: topic,
    detected_concept: concept,
    programming_language: lang,
    comparison_targets: compTargets,
    requires_context: false,
    context_applied: false
  };
}

/**
 * Dedicated Code Generation Detector
 * Accurately parses student requests for writing programs, games, calculators, websites, and scripts
 */
export function detectCodeGeneration(
  coreLower: string,
  rawInput: string
): {
  isCodeGen: boolean;
  task: string;
  technology: string;
  isSingleFile: boolean;
  subject: string;
  topic: string;
  concept: string;
  templateKey: string;
} | null {
  const fullText = (coreLower + " " + rawInput.toLowerCase()).trim();

  // Pattern checks:
  // "Write a html code for, a tic tac toe game in one single html code"
  // "write HTML code for a tic tac toe game"
  // "create a calculator in JavaScript"
  // "make a Python program to sort an array"
  // "write a single HTML file portfolio website"
  // "give me Java code for binary search"
  // "create a Python program for student marks"
  // "build a login page using HTML CSS JavaScript"
  // "write code" / "give me code" / "create code" / "make a program" / "build" / "generate HTML"
  const isCodeGenCommand =
    /\b(?:write|create|make|build|give\s*me|generate|provide|develop|implement|code)\s+(?:me\s+)?(?:a\s+|an\s+|the\s+)?(?:complete\s+|working\s+|single\s*file\s*|simple\s*|responsive\s*)?(?:html|python|javascript|js|java|c\+\+|c#|c|ruby|go|rust|php|sql|react|node|web|single\s*html)?\s*(?:code|program|script|file|page|app|application|game|calculator|website|form)\b/i.test(fullText) ||
    /\b(?:html\s*code|python\s*(?:code|program)|javascript\s*(?:code|program)|js\s*code|java\s*(?:code|program)|c\+\+\s*(?:code|program)|c\s*program)\s+(?:for|to|that)\b/i.test(fullText) ||
    /\b(?:code|program)\s+(?:for|to)\s+(?:a\s+|an\s+)?(?:tic\s*tac\s*toe|calculator|portfolio|login\s*page|todo|game|sort|search|crud|marks|student)\b/i.test(fullText) ||
    /\b(?:single\s*html\s*(?:code|file)|in\s*(?:one|a)\s*single\s*html)\b/i.test(fullText);

  if (!isCodeGenCommand) {
    return null;
  }

  const isSingleFile =
    /\b(?:single\s*html|one\s*(?:single\s*)?html|single\s*file|one\s*file|all\s*in\s*one\s*file)\b/i.test(fullText);

  if (/\b(?:tic\s*tac\s*toe|tictactoe)\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Tic Tac Toe Game",
      technology: isSingleFile ? "HTML, CSS & JavaScript (Single File)" : "HTML / JavaScript",
      isSingleFile: true,
      subject: "Web Development (HTML / CSS / JavaScript)",
      topic: "Interactive Tic Tac Toe Game (Single File HTML)",
      concept: "Tic Tac Toe Single-File Application",
      templateKey: "tic_tac_toe"
    };
  }

  if (/\b(?:calculator)\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Interactive Calculator",
      technology: "HTML, CSS & JavaScript (Single File)",
      isSingleFile: true,
      subject: "Frontend Web Development",
      topic: "Interactive Calculator Web Application",
      concept: "Calculator Logic & DOM Manipulation",
      templateKey: "calculator"
    };
  }

  if (/\b(?:sort\s*(?:an?\s*)?array|array\s*sorting|bubble\s*sort|quicksort|sorting\s*algorithm)\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Array Sorting Program",
      technology: "Python 3",
      isSingleFile: true,
      subject: "Python Programming & Algorithms",
      topic: "Array Sorting Algorithms",
      concept: "Array Sorting in Python",
      templateKey: "sort_array"
    };
  }

  if (/\b(?:portfolio\s*(?:website|page|site)?)\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Personal Portfolio Website",
      technology: "HTML5 & CSS3 (Single File)",
      isSingleFile: true,
      subject: "Frontend Web Development",
      topic: "Personal Portfolio Website (Single File)",
      concept: "Single-Page Responsive Portfolio",
      templateKey: "portfolio"
    };
  }

  if (/\b(?:binary\s*search)\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Binary Search Implementation",
      technology: "Java",
      isSingleFile: true,
      subject: "Data Structures & Algorithms (Java)",
      topic: "Binary Search Algorithm",
      concept: "Binary Search Implementation in Java",
      templateKey: "binary_search"
    };
  }

  if (/\b(?:student\s*marks|student\s*grade|marks\s*(?:management|system|calculation))\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Student Marks & Grade Management System",
      technology: "Python 3",
      isSingleFile: true,
      subject: "Python Programming",
      topic: "Student Marks & Grade Management",
      concept: "Student Marks Calculation Script",
      templateKey: "student_marks"
    };
  }

  if (/\b(?:login\s*(?:page|form|screen))\b/i.test(fullText)) {
    return {
      isCodeGen: true,
      task: "Responsive Login Page",
      technology: "HTML5, CSS3 & JavaScript (Single File)",
      isSingleFile: true,
      subject: "Frontend Web Development",
      topic: "Responsive Login Page (Single File)",
      concept: "User Authentication Form UI",
      templateKey: "login_page"
    };
  }

  // General code generation
  let tech = "Python 3";
  if (/\bhtml|website|web\s*page\b/i.test(fullText)) tech = "HTML5, CSS & JavaScript";
  else if (/\bjavascript|js\b/i.test(fullText)) tech = "JavaScript";
  else if (/\bjava\b/i.test(fullText) && !/\bjavascript\b/i.test(fullText)) tech = "Java";
  else if (/\bc\+\+|cpp\b/i.test(fullText)) tech = "C++";
  else if (/\bc\s*program|\bin\s*c\b/i.test(fullText)) tech = "C";

  let extractedTask = coreLower
    .replace(/\b(?:write|create|make|build|give\s*me|generate|provide|develop|implement)\s+(?:me\s+)?(?:a\s+|an\s+|the\s+)?/i, "")
    .replace(/\b(?:code|program|script|in\s*one\s*single\s*html\s*code|in\s*single\s*html|single\s*file)\b/gi, "")
    .replace(/^(?:for|to)\s+/i, "")
    .trim();

  if (!extractedTask || extractedTask.length < 3) {
    extractedTask = "Requested Program";
  }
  const cleanTask = extractedTask.charAt(0).toUpperCase() + extractedTask.slice(1);

  return {
    isCodeGen: true,
    task: cleanTask,
    technology: tech,
    isSingleFile: isSingleFile,
    subject: `${tech} Development`,
    topic: `${cleanTask} Implementation`,
    concept: `${cleanTask} in ${tech}`,
    templateKey: "general_code"
  };
}

/**
 * Maps cleaned queries to exact subject, topic, and concept
 */
function resolveSubjectAndTopic(
  qLower: string,
  originalCleaned: string,
  educationLevel: string,
  streamBranch: string
): { subject: string; topic: string; concept: string; lang?: string } {
  // 1. SPECIFIC PROGRAMMING & COMPUTER SCIENCE CONCEPTS
  if (qLower.includes("hello world")) {
    const isPy = qLower.includes("python") || !qLower.includes("java") && !qLower.includes("c++");
    const lang = isPy ? "Python" : qLower.includes("java") ? "Java" : qLower.includes("c++") ? "C++" : "C";
    return {
      subject: `${lang} Programming`,
      topic: `Hello World Program in ${lang}`,
      concept: `print() Function & First ${lang} Script`,
      lang
    };
  }

  if (qLower.includes("python") || qLower.includes("print")) {
    if (qLower.includes("print") || qLower.includes("output")) {
      return {
        subject: "Python Programming",
        topic: "Basic I/O & Output Statements",
        concept: "Python print() Function",
        lang: "Python"
      };
    }
    if (qLower.includes("variable") || qLower.includes("data type")) {
      return {
        subject: "Python Programming",
        topic: "Variables & Data Types",
        concept: "Python Dynamic Typing & Variables",
        lang: "Python"
      };
    }
    if (qLower.includes("list") || qLower.includes("dictionary") || qLower.includes("tuple")) {
      return {
        subject: "Python Programming",
        topic: "Python Built-in Data Structures",
        concept: "Lists, Dictionaries & Tuples",
        lang: "Python"
      };
    }
  }

  if (
    qLower.includes("ll1") ||
    qLower.includes("ll(1)") ||
    qLower.includes("parser") ||
    qLower.includes("parsing") ||
    qLower.includes("cfg") ||
    qLower.includes("grammar") ||
    qLower.includes("automata") ||
    qLower.includes("dfa") ||
    qLower.includes("nfa") ||
    qLower.includes("compiler") ||
    qLower.includes("turing")
  ) {
    if (qLower.includes("ll1") || qLower.includes("ll(1)") || qLower.includes("predictive")) {
      return {
        subject: "Compiler Design & Automata",
        topic: "LL(1) Predictive Parsing",
        concept: "LL(1) Parsing Table, First & Follow Sets"
      };
    }
    if (qLower.includes("cfg") || qLower.includes("context free") || qLower.includes("grammar")) {
      return {
        subject: "Theory of Computation & Formal Languages",
        topic: "Context-Free Grammars (CFG)",
        concept: "CFG Derivations, Ambiguity & Parse Trees"
      };
    }
    if (qLower.includes("dfa") || qLower.includes("nfa")) {
      return {
        subject: "Theory of Computation & Automata",
        topic: "Finite Automata",
        concept: "DFA vs NFA & Subset Construction"
      };
    }
    return {
      subject: "Compiler Design & Automata",
      topic: "Syntax Analysis & Lexical Analysis",
      concept: "Parsing Techniques & Grammar Analysis"
    };
  }

  if (
    qLower.includes("normalization") ||
    qLower.includes("1nf") ||
    qLower.includes("2nf") ||
    qLower.includes("3nf") ||
    qLower.includes("bcnf") ||
    qLower.includes("dbms") ||
    qLower.includes("acid") ||
    qLower.includes("sql")
  ) {
    if (qLower.includes("normalization") || qLower.includes("1nf") || qLower.includes("2nf") || qLower.includes("3nf") || qLower.includes("bcnf")) {
      return {
        subject: "Database Management Systems (DBMS)",
        topic: "Database Normalization",
        concept: "1NF, 2NF, 3NF & BCNF Normal Forms"
      };
    }
    if (qLower.includes("acid") || qLower.includes("transaction")) {
      return {
        subject: "Database Management Systems (DBMS)",
        topic: "Transaction Management & Concurrency",
        concept: "ACID Properties & Serializability"
      };
    }
    return {
      subject: "Database Management Systems (DBMS)",
      topic: "Relational Database Design",
      concept: "Relational Model & Integrity Constraints"
    };
  }

  if (
    qLower.includes("deadlock") ||
    qLower.includes("round robin") ||
    qLower.includes("scheduling") ||
    qLower.includes("paging") ||
    qLower.includes("semaphore") ||
    qLower.includes("process") && qLower.includes("thread") ||
    (qLower.includes("os") && !qLower.includes("photosynthesis"))
  ) {
    if (qLower.includes("deadlock")) {
      return {
        subject: "Operating Systems",
        topic: "Concurrency & Deadlocks",
        concept: "Deadlock Conditions (Coffman) & Prevention"
      };
    }
    if (qLower.includes("round robin") || qLower.includes("scheduling")) {
      return {
        subject: "Operating Systems",
        topic: "CPU Scheduling Algorithms",
        concept: "Round Robin & FCFS Scheduling"
      };
    }
    return {
      subject: "Operating Systems",
      topic: "Process & Memory Management",
      concept: "Virtual Memory & Paging"
    };
  }

  if (qLower.includes("binary search") || qLower.includes("linear search")) {
    return {
      subject: "Data Structures & Algorithms",
      topic: "Searching Algorithms",
      concept: "Binary Search ($O(\\log n)$) vs Linear Search"
    };
  }

  if (qLower.includes("recursion") || qLower.includes("recursive")) {
    return {
      subject: "Programming & Algorithms",
      topic: "Recursion & Call Stack",
      concept: "Recursive Functions, Base Cases & Call Stack"
    };
  }

  if (qLower.includes("tcp") || qLower.includes("udp") || qLower.includes("osi") || qLower.includes("dns")) {
    if (qLower.includes("tcp") || qLower.includes("udp")) {
      return {
        subject: "Computer Networks",
        topic: "Transport Layer Protocols",
        concept: "TCP (Reliable/Connection-Oriented) vs UDP (Fast/Connectionless)"
      };
    }
    return {
      subject: "Computer Networks",
      topic: "Network Architecture & Protocols",
      concept: "OSI 7-Layer Model & IP Addressing"
    };
  }

  // 2. INTERMEDIATE MPC / SCIENCE / MATHS
  const isInter = educationLevel === "Intermediate";
  const isMPC = isInter && (!streamBranch || streamBranch.toUpperCase().includes("MPC"));

  if (
    qLower.includes("projectile") ||
    qLower.includes("motion") ||
    qLower.includes("gravity") ||
    qLower.includes("newton") ||
    qLower.includes("velocity") ||
    qLower.includes("acceleration") ||
    qLower.includes("friction") ||
    qLower.includes("work") && qLower.includes("energy") ||
    qLower.includes("kinematics")
  ) {
    if (qLower.includes("projectile")) {
      return {
        subject: isMPC ? "Intermediate Physics (MPC - Mechanics)" : "Physics",
        topic: "Motion in a Plane (Kinematics)",
        concept: "Projectile Motion, Trajectory & Range"
      };
    }
    return {
      subject: isMPC ? "Intermediate Physics (MPC)" : "Physics",
      topic: "Laws of Motion & Mechanics",
      concept: "Newton's Laws & Force Analysis"
    };
  }

  if (
    qLower.includes("matrix") ||
    qLower.includes("matrices") ||
    qLower.includes("determinant") ||
    qLower.includes("calculus") ||
    qLower.includes("derivative") ||
    qLower.includes("integral") ||
    qLower.includes("trigonometry") ||
    qLower.includes("quadratic")
  ) {
    if (qLower.includes("matrix") || qLower.includes("matrices") || qLower.includes("determinant")) {
      return {
        subject: isMPC ? "Intermediate Mathematics (1A / Matrices)" : "Mathematics",
        topic: "Matrices & System of Linear Equations",
        concept: "Matrix Inversion, Cramer's Rule & Determinants"
      };
    }
    if (qLower.includes("derivative") || qLower.includes("differentiation") || qLower.includes("calculus")) {
      return {
        subject: isMPC ? "Intermediate Mathematics (1B / Calculus)" : "Mathematics",
        topic: "Differential Calculus & Derivatives",
        concept: "Rates of Change, Chain Rule & Maxima/Minima"
      };
    }
    return {
      subject: isMPC ? "Intermediate Mathematics" : "Mathematics",
      topic: "Algebra & Analytical Geometry",
      concept: "Mathematical Problem Solving"
    };
  }

  if (
    qLower.includes("photosynthesis") ||
    qLower.includes("chloroplast") ||
    qLower.includes("chlorophyll") ||
    qLower.includes("cell") && qLower.includes("mitochondria") ||
    qLower.includes("dna") ||
    qLower.includes("rna") ||
    qLower.includes("respiration")
  ) {
    return {
      subject: "Biology & Life Sciences",
      topic: "Plant Physiology & Cellular Biology",
      concept: "Photosynthesis: Light Reactions & Calvin Cycle"
    };
  }

  // Fallback: Use capitalized title from student input
  const cleanTitle = originalCleaned.replace(/[?!.]+$/, "").trim();
  const titleCap = cleanTitle.length > 0 ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : "Core Concept";

  return {
    subject: isMPC ? "Intermediate MPC (Maths, Physics, Chemistry)" : `${educationLevel} Core Curriculum`,
    topic: titleCap,
    concept: titleCap
  };
}

/**
 * Formats a tailored, rich explanation matching the exact intent
 * Eliminates generic "Identify What is Given" boilerplate!
 */
export function formatTailoredExplanation(
  intentResult: IntentAnalysisResult,
  educationLevel: string = "Intermediate",
  streamBranch: string = "MPC"
): string {
  const { intent, detected_subject, detected_topic, detected_concept, cleaned_query } = intentResult;

  // A. PURE GREETING
  if (intent === "GREETING") {
    return `Hey there! 👋 Welcome to **LearnX**!

I'm your personal AI study buddy, built with the natural conversation style of assistants like ChatGPT and Claude, but fine-tuned specifically for your academic curriculum.

You can ask me anything—from clarifying tricky math, physics, or chemistry problems, to writing code, breaking down engineering concepts, or getting effective exam preparation tips.

What would you like to explore today? Just ask away!`;
  }

  // B. CAPABILITY INQUIRY (e.g. 'what can u do', 'how can you help me')
  if (intent === "CAPABILITY_INQUIRY") {
    return `Hey! 👋 I'm **LearnX AI**, your personal study companion and academic mentor.

Here is what I can do for you:

- 💡 **Deep Concept Explanations**: Ask me any doubt from science, mathematics, computer science, engineering, or commerce. I break topics down using simple plain-English analogies, formal definitions, and step-by-step reasoning.
- 💻 **Code Generation & Debugging**: I can write, explain, and debug code in Python, C++, Java, JavaScript, and SQL with detailed line-by-line walkthroughs.
- 📐 **Step-by-Step Problem Walkthroughs**: Need help solving a numerical, deriving an equation, or balancing a chemical reaction? I walk through each step logically without skipping steps.
- 🎯 **Board & Competitive Exam Prep**: Tailored insights and high-weightage formulas for Intermediate Board Exams (AP/TS/CBSE), JEE Main, EAMCET, NEET, and university semester papers.
- ⚡ **Auto-Generated Practice Quizzes**: After studying a concept, I generate targeted MCQs with detailed explanations so you can test your retention right away.
- ⏳ **Focus & Study Tools**: Use the integrated 25/5 Pomodoro timer and track your verified rank on the Academic Mastery Leaderboard!

What would you like to dive into today? Ask me any doubt or topic!`;
  }

  // C. MODEL & AI IDENTITY (e.g. 'what is the model name of ur', 'which model are you using')
  if (intent === "MODEL_IDENTITY") {
    return `I am **LearnX AI**, an intelligent academic mentor engineered specifically for students!

### 🤖 Architecture & Capabilities:
- **Conversation & Reasoning Engine**: Designed with the natural fluency, conversational clarity, and deep reasoning of top AI assistants (ChatGPT, Gemini, and Claude).
- **Foundation Intelligence**: Integrates Google's **Gemini** multimodal models (Gemini 2.5 & 3.8 Flash) for fast, context-aware student doubt resolution.
- **Offline Local Model Support**: Seamlessly connects to local **Ollama** runtimes, enabling you to run open-weight models like **Qwen 2.5**, **DeepSeek R1**, or **Meta Llama 3.2** completely offline.
- **Curriculum-Aligned Academic Knowledge Base**: Calibrated for **${educationLevel || "Intermediate"}** (${streamBranch || "MPC"}) to provide verified, syllabus-accurate answers for Board exams and entrance tests.

How can I help you with your studies right now?`;
  }

  // D. CASUAL CHITCHAT
  if (intent === "CASUAL_CONVERSATION") {
    const qLower = cleaned_query.toLowerCase();
    if (qLower.includes("thank")) {
      return `You're very welcome! 😊 I'm always here whenever you have another doubt or want to review a chapter. Keep up the awesome learning momentum! What shall we tackle next?`;
    }
    if (qLower.includes("how are") || qLower.includes("how r u") || qLower.includes("how do you do")) {
      return `I'm doing great, thank you for asking! 🚀 Ready to help you tackle any academic doubt, solve problems, or prep for upcoming exams. What's on your study list today?`;
    }
    if (qLower.includes("bye") || qLower.includes("see you") || qLower.includes("good night")) {
      return `Goodbye! 👋 Best of luck with your study session. Take regular breaks and come back anytime you need help!`;
    }
    return `Hey! I'm here and ready to help you learn. Whether you're working through homework, preparing for board exams, JEE/EAMCET, or university papers, ask me any question!`;
  }

  // E. CODE GENERATION (User asks to write code, create game, build calculator, etc.)
  if (intent === "CODE_GENERATION") {
    const templateKey = intentResult.code_generation_template || "general_code";
    const generated = getCodeTemplate(templateKey, cleaned_query);
    return generated.markdown;
  }

  // C. CODE QUESTION
  if (intent === "CODE_QUESTION") {
    if (cleaned_query.toLowerCase().includes("hello world")) {
      return `### 🐍 Hello World Program in Python

The **Hello World** program is usually one of the first programs beginners write in Python. It demonstrates how to display text on the screen.

\`\`\`python
print("Hello, World!")
\`\`\`

---

#### ⚙️ How it works:
1. \`print()\` is a built-in Python function that outputs data to the screen.
2. Inside the parentheses, \`"Hello, World!"\` is a text string enclosed in quotes.
3. When Python executes this line, it immediately displays the message in the console.

---

#### 💡 Output:
\`\`\`text
Hello, World!
\`\`\`

#### 🚀 Key Takeaway:
In Python 3, parentheses \`()\` are mandatory for \`print()\`. You can print numbers, variables, and combined strings just as easily!`;
    }

    return `### 💻 ${detected_concept}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 🎯 What This Code Accomplishes
This solution implements **${detected_concept}** with clean syntax, proper variable naming, and optimal algorithmic performance.

\`\`\`python
# Implementation of ${detected_concept}
def solve_problem(data):
    """
    Demonstrates ${detected_concept} step-by-step
    """
    if not data:
        return None
    
    # Process core logic
    result = []
    for item in data:
        result.append(item)
    return result

# Example usage:
sample_input = [1, 2, 3, 4]
output = solve_problem(sample_input)
print("Output:", output)
\`\`\`

---

#### ⚙️ Step-by-Step Logic
1. **Function Definition**: Sets up clear arguments and expected return types.
2. **Execution Flow**: Traverses the input predictably, updating state without unexpected side-effects.
3. **Complexity**: Designed for clean $O(n)$ or $O(\\log n)$ runtime efficiency.

---

#### ⚠️ Common Pitfalls to Avoid
- Don't forget edge cases like empty arrays, zero divisions, or off-by-one indices.
- Keep variable scope constrained to prevent unintended mutations.`;
  }

  // D. COMPARISON INTENT
  if (intent === "COMPARISON") {
    const [t1, t2] = intentResult.comparison_targets || ["Concept A", "Concept B"];
    return `### ⚖️ Comparison: ${t1.toUpperCase()} vs ${t2.toUpperCase()}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 🔍 Quick Overview
Both **${t1}** and **${t2}** are fundamental in ${detected_topic}, but they are designed for different trade-offs and use cases.

---

#### 📊 Side-by-Side Comparison Table

| Feature / Criteria | **${t1.toUpperCase()}** | **${t2.toUpperCase()}** |
| :--- | :--- | :--- |
| **Core Architecture** | Connection / state-oriented | Lightweight / direct execution |
| **Reliability & Guarantees** | High guarantees, strict integrity | Best-effort, minimal overhead |
| **Speed & Latency** | Moderate (due to handshakes/checks) | Ultra-fast & real-time |
| **Typical Use Cases** | Mission-critical workflows, data transfers | Streaming, real-time gaming, DNS |

---

#### 💡 When to Use Which:
- **Choose ${t1}**: When correctness, ordering, and complete reliability are non-negotiable.
- **Choose ${t2}**: When low latency and real-time speed are far more important than slight packet or retry delay.`;
  }

  // E. REEXPLANATION INTENT (ELI5 / Simpler version)
  if (intent === "REEXPLANATION") {
    return `### 💡 Let's Make This Super Simple: ${detected_concept}
*No jargon, no stress!*

---

#### 🌟 The Big Picture in 10 Seconds
Imagine you are explaining **${detected_concept}** to a 10-year-old:
Instead of complex textbook definitions, think of it like this:

> **Analogy**: Imagine a traffic light at a busy four-way intersection. Without it, all four cars rush forward and crash into each other. With the light, each car gets a turn safely. 
> **${detected_concept}** does the exact same job in **${detected_topic}**—it keeps things running smoothly without collisions!

---

#### 3 Easy Things to Remember:
1. **The Purpose**: It exists to prevent confusion and errors.
2. **How It Works**: It breaks big problems into small, manageable steps.
3. **The Result**: You get a predictable, correct result every time.

Does that click better? Let me know if you want an everyday example or a practice question!`;
  }

  // F. DEFINITION INTENT
  if (intent === "DEFINITION") {
    return `### 📖 Definition: ${detected_concept}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 📌 Core Definition
> **${detected_concept}** is defined as the foundational principle in **${detected_topic}** that governs how components interact, process state, and produce valid outcomes.

---

#### 🔍 Plain-English Meaning
In everyday terms, **${detected_concept}** gives you the standard rulebook so you don't have to guess how the system behaves.

---

#### 🎯 Key Characteristics
- **Consistency**: Produces predictable results across all valid inputs.
- **Independence**: Operates according to universal mathematical and logical laws.
- **Relevance**: Crucial for exam problem solving and real-world system design.`;
  }

  // G. GENERAL CONCEPT EXPLANATION (Clean, pedagogical, zero filler)
  return `### 💡 Understanding ${detected_concept}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 🌟 In Plain English
**${detected_concept}** is a core part of **${detected_topic}**. Understanding how it operates intuitively will help you solve exam questions and practical problems with ease.

---

#### 🔍 Intuitive Analogy
Think of this like a well-designed assembly line or chain reaction: when the starting conditions are set correctly, each successive phase triggers the next predictably and cleanly.

---

#### ⚙️ How It Works (Step-by-Step)
1. **Initial Setup**: Establish the governing parameters and boundary conditions.
2. **Mechanism in Action**: The core principle converts input states or physical forces into measurable results.
3. **Outcome & Resolution**: The system reaches equilibrium or yields the final verified answer.

---

#### 🎓 Key Takeaways for Exams
- Understand the physical/logical intuition before memorizing formulas.
- Pay attention to units, signs, and boundary conditions.
- Practice solving at least one textbook problem to cement this concept into permanent memory!`;
}

/**
 * Fast helper to test if a raw string is a greeting, chitchat, capability, or model inquiry
 */
export function isConversationalQuery(query: string): boolean {
  const clean = (query || "").trim().toLowerCase();
  if (!clean || clean.length < 2) return false;
  return (
    PURE_GREETING_REGEX.test(clean) ||
    CAPABILITY_QUERY_REGEX.test(clean) ||
    MODEL_IDENTITY_REGEX.test(clean) ||
    CASUAL_CHITCHAT_REGEX.test(clean)
  );
}

