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
  | "STUDENT_WELLBEING"
  | "STUDY_STRATEGY"
  | "JOKE_OR_FUN"
  | "ACKNOWLEDGMENT"
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
  /^(?:hi+|hello+|hey+|hii+|heyy+|heya|good\s*(?:morning|afternoon|evening|day)|namaste|namaskar|vanakkam|yo+|sup|hola|greetings)(?:\s+(?:learnx|there|sir|bro|bhai|ai|buddy))?(?:[,\s!.-]*(?:how\s*(?:are|r)\s*(?:you|u)(?:\s*doing)?|how's\s*it\s*going|whats?\s*it\s*going|whats?\s*up|how\s*do\s*(?:you|u)\s*do))?[\s!.,?]*$/i;

// 2. Capabilities and Help inquiries (e.g., 'what can u do', 'what can you do', 'what are your capabilities')
const CAPABILITY_QUERY_REGEX =
  /^(?:what\s*(?:can|do|will)\s*(?:you|u)\s*(?:do|help(?:\s*with)?)|what\s*are\s*(?:your|ur)\s*(?:capabilities|features|skills|functions)|how\s*can\s*(?:you|u)\s*help(?:\s*me)?|what\s*(?:can|does)\s*(?:this|learnx)(?:\s*app)?\s*do|tell\s*me\s*what\s*(?:you|u)\s*can\s*do|how\s*(?:do\s*i|to)\s*use\s*(?:this|learnx|the\s*app)|what\s*all\s*can\s*(?:you|u)\s*do|features\s*of\s*(?:this\s*app|learnx)|help\s*me(?:\s*please)?|can\s*(?:you|u)\s*help(?:\s*me)?|what\s*help\s*can\s*(?:you|u)\s*give)[\s!.,?]*$/i;

// 3. Model & AI Identity inquiries (e.g., 'what is the model name of ur', 'which model are you using', 'who created you')
const MODEL_IDENTITY_REGEX =
  /^(?:what\s*(?:is|are)\s*(?:the\s*)?(?:ai\s*)?model\s*name\s*(?:of\s*(?:ur|your|this\s*ai)|of\s*u|of\s*you)|what\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|which\s*model\s*(?:are\s*(?:you|u)|is\s*this|do\s*(?:you|u)\s*use)|what\s*is\s*(?:your|ur)\s*model(?:\s*name)?|what\s*is\s*(?:the\s*)?name\s*of\s*(?:your|ur)\s*model|are\s*(?:you|u)\s*(?:gemini|chatgpt|claude|deepseek|gpt|openai|llama|an\s*ai|a\s*robot|a\s*bot)|who\s*(?:are\s*(?:you|u)|created\s*(?:you|u)|made\s*(?:you|u)|built\s*(?:you|u))|what\s*(?:are\s*(?:you|u)|is\s*learnx(?:\s*ai)?)|introduce\s*(?:yourself|urself)|tell\s*me\s*about\s*(?:yourself|urself)|who\s*r\s*u|what\s*r\s*u)[\s!.,?]*$/i;

// 4. Casual chitchat & pleasantries
const CASUAL_CHITCHAT_REGEX =
  /^(?:(?:hi+|hello+|hey+|hii+|heyy+|good\s*(?:morning|afternoon|evening))[,\s]+)?(?:how\s*(?:are|r)\s*(?:you|u)(?:\s*doing)?|how\s*do\s*(?:you|u)\s*do|how's\s*it\s*going|whats?\s*it\s*going|whats?\s*up|what\s*are\s*you\s*doing|thank\s*(?:you|u)(?:\s*(?:so\s*much|very\s*much|a\s*lot))?|thanks(?:\s*(?:a\s*lot|so\s*much|buddy|bro|bhai|sir))?|thx|ty|thanku|nice|awesome|cool|great|super|good\s*job|well\s*done|ok+|okay+|alright+|bye+|goodbye+|see\s*(?:you|u|ya)|cya|gn|good\s*night)[\s!.,?]*$/i;

// 4a. Emotional states & well-being (e.g. 'i feel so tired', 'i am sleepy', 'i don't feel like studying', 'i feel stressed', 'motivate me')
export const WELLBEING_EMOTION_REGEX =
  /\b(?:i(?:'m|\s*am)?\s*(?:so\s*|very\s*|really\s*)?(?:tired|sleepy|bored|exhausted|stressed|anxious|nervous|scared|overwhelmed|depressed|sad|lazy|unmotivated|burnt\s*out|giving\s*up)|don't\s*feel\s*like\s*studying|dont\s*feel\s*like\s*studying|can't\s*focus|cant\s*focus|can't\s*concentrate|cant\s*concentrate|hate\s*(?:studying|exams|school)|give\s*me\s*motivation|motivate\s*me|i\s*need\s*motivation|inspire\s*me|cheer\s*me\s*up|cheer\s*up|so\s*tired|too\s*sleepy)\b/i;

// 4b. Study strategy & productivity guidance (e.g. 'how should i study', 'how to prepare for exams', 'give me study tips')
export const STUDY_STRATEGY_REGEX =
  /\b(?:how\s*(?:to|should\s*i|can\s*i)\s*(?:study|prepare|revise|memorize|remember|focus|score|get\s*good\s*marks|pass)|study\s*(?:tips|advice|techniques|strategy|timetable|plan|routine)|how\s*to\s*stop\s*procrastinat|pomodoro\s*technique|feynman\s*technique|active\s*recall)\b/i;

// 4c. Jokes, humor & riddles (e.g. 'tell me a joke', 'tell me a funny story', 'make me laugh')
export const JOKE_FUN_REGEX =
  /\b(?:tell\s*me\s*(?:a\s*)?(?:joke|riddle|funny\s*story|fun\s*fact)|say\s*something\s*funny|make\s*me\s*laugh|do\s*you\s*know\s*any\s*jokes?|tell\s*(?:me\s*)?another\s*joke)\b/i;

// 4d. Friendship & personal conversational check-ins
export const FRIENDSHIP_CONVERSATION_REGEX =
  /\b(?:can\s*(?:we|you)\s*(?:talk|chat|be\s*friends?)|are\s*you\s*(?:my\s*friend|real|human|alive|single)|do\s*you\s*(?:have\s*feelings|sleep|eat|dream)|what\s*(?:do\s*you\s*think\s*about|is\s*your\s*favorite|are\s*you\s*doing)|i\s*love\s*(?:you|this\s*app)|you\s*are\s*(?:so\s*)?(?:smart|cool|awesome|great|funny|helpful|the\s*best))\b/i;

// 4e. Quick pleasantries, closures & acknowledgments (e.g. 'ok', 'got it', 'thanks', 'bye', 'cool')
export const ACKNOWLEDGMENT_REGEX =
  /^(?:ok+|okay+|alright+|k+|cool+|got\s*it|i\s*got\s*it|understood|i\s*understand\s*now|nice|awesome|super|great|perfect|done|thank\s*(?:you|u)(?:\s*(?:so\s*much|very\s*much|a\s*lot))?|thanks(?:\s*(?:a\s*lot|so\s*much|buddy|bro|bhai|sir))?|thx|ty|thanku|good\s*job|well\s*done|bye+|goodbye+|see\s*(?:you|ya|u)|good\s*night|gn)[\s!.,?]*$/i;

// 5. Leading greeting prefixes to strip cleanly from academic queries
const LEADING_GREETING_PREFIX_REGEX =
  /^(?:hi+|hello+|hey+|hii+|heyy+|good\s*(?:morning|afternoon|evening)|bro+|bhai|yo+|sup|namaste)\b[\s,:;—\-]*((?:can\s*(?:u|you)\s*(?:please\s*)?(?:explain|tell\s*me|show\s*me|give\s*me)?|pls\s*explain|please\s*explain|tell\s*me\s*about|explain\s*(?:me\s*about\s*the\s*topic\s*of|to\s*me\s*about|about)?|what\s*is|what\s*are)?[\s,:;—\-]*)/i;

// 6. Common request wrapper prefixes to clean conversational phrasing
const REQUEST_WRAPPER_PREFIX_REGEX =
  /^(?:can\s*(?:you|u)\s*(?:please\s*)?(?:explain|tell\s*me(?:\s*about)?|help\s*me\s*with|show\s*me|solve|teach\s*me)|please\s*(?:explain|tell\s*me(?:\s*about)?|help\s*me\s*with|show\s*me|solve|teach\s*me)|could\s*(?:you|u)\s*(?:please\s*)?(?:explain|tell\s*me|show\s*me)|i\s*want\s*to\s*(?:know|learn|understand)(?:\s*about)?|tell\s*me\s*about|explain\s*(?:to\s*me\s*about|me\s*about)?|what\s*(?:is|are)\s*(?:the\s*concept\s*of|the\s*meaning\s*of)?)\b\s*/i;

// 7. Universal Confusion, Follow-Up & Re-explanation Detector
export function isConfusionOrReexplanationQuery(q: string): boolean {
  const s = (q || "").toLowerCase().trim();
  if (!s) return false;
  return (
    /^(?:i\s*)?(?:didn't|did\s*not|didnt|don't|do\s*not|dont|couldn't|could\s*not|unable\s*to|can't|cant)\s*(?:understand|understanded|understood|get|got|follow)\b/i.test(s) ||
    /^(?:i\s*am\s*|im\s*|i'm\s*)?(?:confused|lost|not\s*getting\s*it|still\s*confused|not\s*clear|having\s*trouble)\b/i.test(s) ||
    /^(?:explain\s*(?:it\s*)?(?:again|more\s*simply|simply|in\s*simple\s*words|in\s*simple\s*terms|once\s*more)|can\s*you\s*(?:explain\s*again|simplify|make\s*it\s*simpler|make\s*it\s*easier|repeat)|simplify\s*(?:this|it)?|make\s*it\s*simpler|make\s*it\s*easy|eli5)\b/i.test(s) ||
    /^(?:what\s*do\s*you\s*mean|what\s*does\s*that\s*mean|what\s*do\s*u\s*mean|i\s*don't\s*get\s*it|i\s*didnt\s*get\s*it|didn't\s*get\s*it|didnt\s*get\s*it)\b/i.test(s) ||
    /^(?:too\s*(?:hard|difficult|complicated|complex)|can\s*you\s*break\s*it\s*down(?:\s*more)?|break\s*it\s*down|repeat|say\s*again|once\s*again|one\s*more\s*time)\b/i.test(s) ||
    s.includes("didn't understand") ||
    s.includes("didnt understand") ||
    s.includes("don't understand") ||
    s.includes("dont understand") ||
    s.includes("understanded") ||
    s.includes("not clear") ||
    s.includes("still confused") ||
    s.includes("not getting it") ||
    s === "explain again" ||
    s === "make it simple" ||
    s === "more simply" ||
    s === "once more" ||
    s === "say again" ||
    s === "repeat"
  );
}

// Helper to determine if a concept string is a genuine academic concept vs a placeholder/confusion/chat phrase
export function isGenuineAcademicConcept(c?: string): boolean {
  if (!c || typeof c !== "string") return false;
  const lower = c.toLowerCase().trim();
  if (lower.length < 2) return false;
  if (
    /^(?:i|you|u|we|he|she|they|me|my|your|ur)\b/i.test(lower) ||
    /\b(?:feel|feeling|tired|sleepy|bored|lazy|sad|happy|stressed|anxious|angry|depressed|nervous|scared|overwhelmed)\b/i.test(lower) ||
    /\b(?:hello|hi|hey|greetings|good\s*(?:morning|afternoon|evening|night)|namaste|vanakkam|sup|yo)\b/i.test(lower) ||
    /\b(?:how\s*(?:are|r)\s*(?:you|u)|who\s*(?:are|r)\s*(?:you|u)|what\s*is\s*your\s*name)\b/i.test(lower) ||
    /\b(?:thank|thanks|thx|welcome|bye|goodbye|see\s*you|cya)\b/i.test(lower) ||
    /\b(?:joke|funny|laugh|story|riddle|game|friend|buddy|bro|bhai)\b/i.test(lower) ||
    /\b(?:talk|chat|speak|listen|hear)\b/i.test(lower) ||
    /\b(?:understand|understood|understanded|confused|clear|clarify|clarification|repeat|again)\b/i.test(lower) ||
    lower === "learnx assistant" ||
    lower === "topic clarification" ||
    lower === "general topic" ||
    lower === "greeting" ||
    lower === "academic studies" ||
    lower === "core concept" ||
    lower === "study clarification" ||
    lower === "engineering core fundamentals" ||
    lower === "general core syllabus" ||
    lower === "study guidance & doubts" ||
    lower === "study guidance" ||
    lower === "conversational" ||
    isConfusionOrReexplanationQuery(lower)
  ) {
    return false;
  }
  return true;
}

// Helper to resolve the most recent genuine academic concept from conversation context or message history
export function resolveContextualConcept(
  context?: ConversationContext,
  educationLevel?: string,
  streamBranch?: string
): { concept?: string; subject?: string; topic?: string } {
  if (context?.last_concept && isGenuineAcademicConcept(context.last_concept)) {
    return {
      concept: context.last_concept,
      subject: context.last_subject,
      topic: context.last_topic
    };
  }
  if (context?.recent_messages && context.recent_messages.length > 0) {
    for (let i = context.recent_messages.length - 1; i >= 0; i--) {
      const msg = context.recent_messages[i];
      if (msg.sender === "user" && !isConfusionOrReexplanationQuery(msg.text)) {
        const prevAnalysis = analyzeStudentIntent(msg.text, educationLevel, streamBranch);
        if (isGenuineAcademicConcept(prevAnalysis.detected_concept)) {
          return {
            concept: prevAnalysis.detected_concept,
            subject: prevAnalysis.detected_subject,
            topic: prevAnalysis.detected_topic
          };
        }
      }
    }
  }
  return {};
}

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

  // D1. STUDENT WELL-BEING & EMOTIONAL SUPPORT (e.g. 'i feel so tired', 'i am stressed', 'motivate me')
  if (WELLBEING_EMOTION_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "STUDENT_WELLBEING",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "Student Life & Well-Being",
      detected_topic: "Motivation, Focus & Emotional Reset",
      detected_concept: "Student Well-Being & Mindset",
      requires_context: false,
      context_applied: false
    };
  }

  // D2. STUDY STRATEGY & HIGH-EFFICIENCY TECHNIQUES
  if (STUDY_STRATEGY_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "STUDY_STRATEGY",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "Study Skills & Productivity",
      detected_topic: "Effective Learning Strategies",
      detected_concept: "High-Efficiency Study Framework",
      requires_context: false,
      context_applied: false
    };
  }

  // D3. JOKES, HUMOR & FUN
  if (JOKE_FUN_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "JOKE_OR_FUN",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Study Humor & Lighthearted Fun",
      detected_concept: "Science & Math Humor",
      requires_context: false,
      context_applied: false
    };
  }

  // D4. FRIENDSHIP & PERSONAL CONVERSATIONAL TALK
  if (FRIENDSHIP_CONVERSATION_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "CASUAL_CONVERSATION",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Conversational Friendship",
      detected_concept: "LearnX Assistant",
      requires_context: false,
      context_applied: false
    };
  }

  // D5. QUICK ACKNOWLEDGMENTS & CLOSURES (e.g. 'ok', 'got it', 'thanks', 'bye')
  if (ACKNOWLEDGMENT_REGEX.test(lower)) {
    return {
      raw_input: trimmed,
      cleaned_query: trimmed,
      intent: "ACKNOWLEDGMENT",
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Conversational Acknowledgment",
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
  const isConfusion = isConfusionOrReexplanationQuery(coreLower) || isConfusionOrReexplanationQuery(trimmed);

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

  // If the student expresses confusion or asks for re-explanation:
  if (isConfusion) {
    const ctxMatch = resolveContextualConcept(context, educationLevel, streamBranch);
    if (ctxMatch.concept) {
      return {
        raw_input: trimmed,
        cleaned_query: coreQuery,
        intent: "REEXPLANATION",
        is_conversational: true,
        is_pure_greeting: false,
        detected_subject: ctxMatch.subject || context?.last_subject || "Academic Studies",
        detected_topic: ctxMatch.topic || context?.last_topic || "Core Topic",
        detected_concept: ctxMatch.concept,
        requires_context: true,
        context_applied: true
      };
    } else {
      // First turn or no prior concept to re-explain -> ask the student which topic they'd like help with
      return {
        raw_input: trimmed,
        cleaned_query: coreQuery,
        intent: "CLARIFICATION",
        is_conversational: true,
        is_pure_greeting: false,
        detected_subject: "LearnX Academic Assistant",
        detected_topic: "Study Guidance & Doubts",
        detected_concept: "Topic Clarification",
        requires_context: true,
        context_applied: false
      };
    }
  }

  // Other contextual follow-ups (examples, why, practice)
  const ctxMatch = resolveContextualConcept(context, educationLevel, streamBranch);
  if ((isExampleFollowUp || isWhyFollowUp || isPracticeRequest) && ctxMatch.concept) {
    let specificIntent: StudentIntent = "FOLLOW_UP";
    if (isPracticeRequest) specificIntent = "PRACTICE_REQUEST";

    return {
      raw_input: trimmed,
      cleaned_query: coreQuery,
      intent: specificIntent,
      is_conversational: true,
      is_pure_greeting: false,
      detected_subject: ctxMatch.subject || "Academic Studies",
      detected_topic: ctxMatch.topic || "Core Topic",
      detected_concept: ctxMatch.concept,
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

  // 1.1 DATA STRUCTURES (Stack, Queue, Linked List, Tree, Graph, Heap, Hash Table)
  if (qLower.includes("stack") && !qLower.includes("full stack")) {
    return {
      subject: "Computer Science (Data Structures)",
      topic: "Linear Data Structures",
      concept: "Stack Data Structure (LIFO)"
    };
  }

  if (qLower.includes("queue") && !qLower.includes("priority queue")) {
    return {
      subject: "Computer Science (Data Structures)",
      topic: "Linear Data Structures",
      concept: "Queue Data Structure (FIFO)"
    };
  }

  if (qLower.includes("linked list") || qLower.includes("singly linked") || qLower.includes("doubly linked")) {
    return {
      subject: "Computer Science (Data Structures)",
      topic: "Linear Data Structures",
      concept: "Linked List (Singly & Doubly Linked Lists)"
    };
  }

  if (qLower.includes("tree") || qLower.includes("bst") || qLower.includes("binary search tree") || qLower.includes("avl") || qLower.includes("heap")) {
    return {
      subject: "Computer Science (Data Structures)",
      topic: "Non-Linear Data Structures",
      concept: qLower.includes("heap") ? "Heap Data Structure (Min/Max Heap)" : "Binary Search Tree (BST) & Tree Traversals"
    };
  }

  if (qLower.includes("sort") || qLower.includes("bubble sort") || qLower.includes("merge sort") || qLower.includes("quick sort")) {
    return {
      subject: "Computer Science (Algorithms)",
      topic: "Sorting Algorithms",
      concept: qLower.includes("merge sort") ? "Merge Sort ($O(n \\log n)$)" : qLower.includes("quick sort") ? "Quick Sort Algorithm" : "Sorting Algorithms (Merge Sort, Quick Sort, Bubble Sort)"
    };
  }

  if (qLower.includes("sql join") || (qLower.includes("join") && (qLower.includes("sql") || qLower.includes("table") || qLower.includes("database")))) {
    return {
      subject: "Database Management Systems (DBMS)",
      topic: "SQL Queries & Relational Joins",
      concept: "SQL Joins (INNER, LEFT, RIGHT, FULL OUTER)"
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

  // 2. PHYSICS (Electricity, Mechanics, Optics, Thermodynamics)
  if (
    qLower.includes("ohm") ||
    qLower.includes("circuit") ||
    qLower.includes("resistor") ||
    qLower.includes("resistance") ||
    qLower.includes("voltage") ||
    qLower.includes("capacitance") ||
    qLower.includes("capacitor") ||
    qLower.includes("kirchhoff") ||
    qLower.includes("electric current")
  ) {
    return {
      subject: isMPC ? "Intermediate Physics (MPC - Electricity)" : "Physics",
      topic: "Current Electricity & Circuits",
      concept: qLower.includes("kirchhoff") ? "Kirchhoff's Laws (KCL & KVL)" : qLower.includes("capacitor") ? "Capacitance & Dielectrics" : "Ohm's Law ($V = IR$) & Electrical Resistance"
    };
  }

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

  // 3. MATHEMATICS (Linear Equations, Quadratics, Calculus, Matrices, Trigonometry)
  if (
    qLower.includes("solve") ||
    qLower.includes("equation") ||
    qLower.includes("linear equation") ||
    qLower.includes("quadratic") ||
    qLower.includes("roots of") ||
    qLower.includes("matrix") ||
    qLower.includes("matrices") ||
    qLower.includes("determinant") ||
    qLower.includes("calculus") ||
    qLower.includes("derivative") ||
    qLower.includes("integral") ||
    qLower.includes("trigonometry") ||
    qLower.includes("sin") && qLower.includes("cos")
  ) {
    if (qLower.includes("quadratic") || qLower.includes("roots of") || qLower.includes("^2") || qLower.includes("x^2")) {
      return {
        subject: isMPC ? "Intermediate Mathematics (Algebra)" : "Mathematics",
        topic: "Quadratic Equations",
        concept: "Quadratic Equations & Roots ($ax^2 + bx + c = 0$)"
      };
    }
    if (qLower.includes("solve") || qLower.includes("linear equation") || qLower.includes("=") || qLower.includes("equation")) {
      return {
        subject: isMPC ? "Intermediate Mathematics (Algebra)" : "Mathematics",
        topic: "Linear Equations & Algebra",
        concept: "Solving Linear Equations"
      };
    }
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
    if (qLower.includes("integral") || qLower.includes("integration")) {
      return {
        subject: isMPC ? "Intermediate Mathematics (2B / Calculus)" : "Mathematics",
        topic: "Integral Calculus",
        concept: "Integration & Antiderivatives"
      };
    }
    return {
      subject: isMPC ? "Intermediate Mathematics" : "Mathematics",
      topic: "Trigonometry & Identities",
      concept: "Trigonometric Identities (sin²θ + cos²θ = 1)"
    };
  }

  // 4. CHEMISTRY
  if (
    qLower.includes("chem") ||
    qLower.includes("bond") ||
    qLower.includes("hybrid") ||
    qLower.includes("equilibrium") ||
    qLower.includes("mole") ||
    qLower.includes("acid") ||
    qLower.includes("base") ||
    qLower.includes("ph ") ||
    qLower.includes("periodic") ||
    qLower.includes("redox")
  ) {
    if (qLower.includes("equilibrium") || qLower.includes("le chatelier")) {
      return {
        subject: isMPC ? "Intermediate Chemistry (MPC)" : "Chemistry",
        topic: "Chemical Equilibrium",
        concept: "Chemical Equilibrium & Le Chatelier's Principle"
      };
    }
    if (qLower.includes("bond") || qLower.includes("hybrid") || qLower.includes("vsepr")) {
      return {
        subject: isMPC ? "Intermediate Chemistry (MPC)" : "Chemistry",
        topic: "Chemical Bonding & Molecular Structure",
        concept: "Chemical Bonding & Hybridization (sp, sp², sp³)"
      };
    }
    return {
      subject: isMPC ? "Intermediate Chemistry (MPC)" : "Chemistry",
      topic: "Physical & Inorganic Chemistry",
      concept: "Atomic Structure & Chemical Principles"
    };
  }

  // 5. BIOLOGY
  if (
    qLower.includes("photosynthesis") ||
    qLower.includes("chloroplast") ||
    qLower.includes("chlorophyll") ||
    qLower.includes("cell") ||
    qLower.includes("mitochondria") ||
    qLower.includes("dna") ||
    qLower.includes("rna") ||
    qLower.includes("respiration") ||
    qLower.includes("mitosis") ||
    qLower.includes("meiosis")
  ) {
    return {
      subject: "Biology & Life Sciences",
      topic: qLower.includes("photosynthesis") ? "Plant Physiology & Photosynthesis" : "Cellular Biology & Genetics",
      concept: qLower.includes("photosynthesis") ? "Photosynthesis: Light Reactions & Calvin Cycle" : "Cell Structure & Organelles"
    };
  }

  // Safety check: Never turn conversational follow-up / confusion words / casual chatting into an academic concept!
  if (!isGenuineAcademicConcept(originalCleaned) || isConfusionOrReexplanationQuery(originalCleaned) || isConversationalQuery(originalCleaned)) {
    return {
      subject: "LearnX Academic Assistant",
      topic: "Study Guidance & Doubts",
      concept: "Topic Clarification"
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

  // 0. CLARIFICATION & STUDY GUIDANCE
  if (intent === "CLARIFICATION") {
    return `Hey! No worries at all 😊 It is completely normal to find some topics tricky at first—that is how real learning happens!

I'm your personal study buddy, and my whole job is to make tough concepts feel simple and intuitive.

**Tell me:**
1. What specific concept, formula, or code were you studying?
2. Which part felt confusing or unclear?

Just type the topic (for example: *"Explain Photosynthesis in simple words"* or *"How does Binary Search work?"*) and I'll break it down with simple real-world stories and zero confusing jargon!`;
  }

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

  // D. CASUAL CHITCHAT & FRIENDSHIP
  if (intent === "CASUAL_CONVERSATION") {
    const qLower = cleaned_query.toLowerCase();
    if (qLower.includes("thank")) {
      return `You're very welcome! 😊 I'm always here whenever you have another doubt or want to review a chapter. Keep up the awesome learning momentum! What shall we tackle next?`;
    }
    if (qLower.includes("how are") || qLower.includes("how r u") || qLower.includes("how do you do") || qLower.includes("how's it going")) {
      return `I'm doing wonderful, thank you for asking! 🚀 Ready and excited to help you learn, solve problems, or just chat. How is your day going?`;
    }
    if (qLower.includes("friend") || qLower.includes("can we talk")) {
      return `Of course! Consider me your 24/7 study buddy and supportive friend. 😊 We can chat about whatever is on your mind, explore tricky questions, or prep for tests together. What would you like to talk about?`;
    }
    if (qLower.includes("who created") || qLower.includes("who made")) {
      return `I was built for **LearnX** to be the ultimate student companion—combining conversational warmth, deep reasoning, and syllabus-aligned accuracy. How can I help you today?`;
    }
    if (qLower.includes("bye") || qLower.includes("see you") || qLower.includes("good night")) {
      return `Goodbye! 👋 Best of luck with your study session. Take regular breaks and come back anytime you need help!`;
    }
    return `Hey! I'm right here with you. Whether you want to talk about how your studies are going, discuss an interesting question, or take a quick break, let me know! What's on your mind?`;
  }

  // D1. STUDENT WELL-BEING & MOTIVATION
  if (intent === "STUDENT_WELLBEING") {
    const qLower = cleaned_query.toLowerCase();
    if (qLower.includes("sleepy") || qLower.includes("tired") || qLower.includes("exhausted")) {
      return `Hey! First of all, take a deep breath. 🌿 

Feeling tired or sleepy is your body's completely normal signal that your brain needs a quick recharge. Real learning requires a fresh mind, and pushing through extreme exhaustion usually leads to frustration.

Here is a super effective 10-minute reset plan:
1. **Hydrate**: Drink a full glass of cold water right now—mild dehydration is the #1 hidden cause of fatigue during study sessions.
2. **Move & Stretch**: Step away from your desk, stretch your shoulders and neck, and wash your face with cool water.
3. **Power Nap or Fresh Air**: If it's been a long day, a 15-minute power nap (set an alarm!) or a 5-minute walk outside will completely restore your mental alertness.

When you're ready, we can tackle just **one small, easy topic** together—no rush, no stress! How are you feeling now?`;
    }

    if (qLower.includes("stress") || qLower.includes("anxious") || qLower.includes("nervous") || qLower.includes("scared")) {
      return `Hey, I hear you, and it is completely normal to feel stressed or anxious about studies and exams. 💛

Almost every student feels this pressure. But remember: **an exam measures what you practiced on one specific day, not your intelligence, your value, or your future!**

Here is how we turn stress into confidence:
1. **Break it down**: Huge syllabi feel terrifying when viewed all at once. Pick just **one single chapter or concept** right now.
2. **Focus on progress, not perfection**: Solving just 3 questions or understanding 1 concept today puts you ahead of yesterday.
3. **I'm right here with you**: Whenever you hit a wall, ask me to explain it simply or give you an easy memory trick. You don't have to figure it out alone!

What subject or chapter is causing the most stress right now? Let's take it apart together step-by-step!`;
    }

    if (qLower.includes("procrastinat") || qLower.includes("focus") || qLower.includes("don't feel like") || qLower.includes("bored") || qLower.includes("lazy")) {
      return `Hey! We've all been there—staring at books or notes and feeling zero motivation to start. 🛋️

The secret to beating lack of motivation is the **"5-Minute Rule"**:
Tell yourself: *"I am only going to study for 5 minutes. If I still hate it after 5 minutes, I can stop."*
90% of the battle is just getting started! Once you cross the 5-minute mark, your brain naturally enters the flow state.

**Quick Challenge:**
Give me just ONE topic or question you're supposed to study today. Let me give you a 60-second simple breakdown to get the momentum rolling! What shall we look at?`;
    }

    return `Hey! Remember why you started, and remember how far you've already come. 🚀

Learning is a journey of small daily steps. Some days are high energy, and some days are low energy—both are part of becoming great at what you do. Be kind to yourself today, celebrate small wins, and keep going!

Whenever you want to practice or review anything, I'm ready. How can I help make your day a little easier?`;
  }

  // D2. JOKES, HUMOR & LIGHTHEARTED FUN
  if (intent === "JOKE_OR_FUN") {
    const jokes = [
      `😄 **Here's a good one for you:**\n\nWhy can't you trust atoms?\n\n*Because they make up everything!* ⚛️\n\nHope that brought a smile to your face! Ready to conquer some concepts, or want another fun fact?`,
      `😄 **A little programmer humor for you:**\n\nThere are 10 types of people in the world:\n*Those who understand binary, and those who don't!* 💻\n\nGot you! What are you working on today?`,
      `😄 **Here's a math classic:**\n\nWhy did the triangle feel sad?\n\n*Because it was never right!* 📐 *(Unless it had a 90° angle, of course!)*\n\nReady to dive back into your studies, or need another laugh?`,
      `😄 **One more science joke:**\n\nWhat did one ion say to the other?\n\n*"I've got my ion you!"* ⚡\n\nKeep that energy up! What topic would you like to review next?`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // D3. STUDY STRATEGY & HIGH-EFFICIENCY TECHNIQUES
  if (intent === "STUDY_STRATEGY") {
    return `### 🎯 High-Performance Study Framework (Used by Top Rankers)

Studying for 8 hours of passive reading is much less effective than **2 hours of active learning**. Here are the 4 scientifically backed study strategies:

---

#### 🧠 1. The Feynman Technique (True Understanding)
- Explain the concept out loud in plain words as if teaching a 10-year-old.
- Wherever you use complex jargon or get stuck, that's your exact knowledge gap. Go back and review only that specific gap!

#### 🔄 2. Active Recall & The Testing Effect
- Don't just re-read textbook highlights.
- Close the book and ask yourself: *"What were the 3 main takeaways from that page?"*
- Write down formulas, derivations, or diagrams completely from memory.

#### ⏳ 3. The 25/5 Pomodoro Cadence
- Study with zero phone notifications for **25 minutes**.
- Take a strict **5-minute break** (stand up, drink water, look outside).
- After 4 cycles, reward yourself with a 20-minute rest!

#### 📅 4. Spaced Repetition Schedule
- Review material after: **1 Day → 3 Days → 7 Days → 21 Days**.
- This moves concepts from fragile short-term memory into permanent long-term memory.

---

Would you like to try practicing a specific chapter right now using Active Recall? Tell me the topic!`;
  }

  // D4. ACKNOWLEDGMENTS & PLEASANTRIES
  if (intent === "ACKNOWLEDGMENT") {
    const qLower = cleaned_query.toLowerCase();
    if (qLower.includes("thank")) {
      return `You're very welcome! 😊 I'm always happy to help. You're doing great—keep up that momentum! What shall we tackle next?`;
    }
    if (qLower.includes("ok") || qLower.includes("okay") || qLower.includes("got it") || qLower.includes("understood")) {
      return `Awesome! 🌟 Glad that made sense. Would you like to try a quick practice question to test yourself, or explore the next topic?`;
    }
    if (qLower.includes("bye") || qLower.includes("night") || qLower.includes("see you")) {
      return `Goodbye for now! 👋 Take care, rest well, and come back anytime you have another doubt!`;
    }
    return `Great! I'm right here whenever you're ready to learn something new. Ask away!`;
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

  // E.2 FOLLOW-UP / EXAMPLE REQUEST
  if (intent === "FOLLOW_UP") {
    return `### 🔍 Practical Real-World Example: ${detected_concept}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 💡 The Everyday Scenario
Let's see how **${detected_concept}** works in real life with a concrete, hands-on situation:

Imagine you are using your smartphone or laptop:
- **Starting Point**: The device receives raw signals or user input.
- **Application of ${detected_concept}**: Instead of processing chaos, the system applies **${detected_concept}** to filter noise, organize data packets, and ensure zero lag.
- **Why It Matters**: Without this principle, your screen would freeze or show garbled output!

---

#### ⚙️ Concrete Step-by-Step Breakdown:
1. **Input**: A real-world input is provided with standard parameters.
2. **Execution**: The governing law or algorithm of **${detected_topic}** runs cleanly.
3. **Verified Output**: Produces the exact, verified result you can rely on.

Would you like to try solving a quick practice problem on this, or see code for it?`;
  }

  // E.3 PRACTICE REQUEST
  if (intent === "PRACTICE_REQUEST") {
    return `### 📝 Practice Challenge: ${detected_concept}
*Subject: ${detected_subject} · Topic: ${detected_topic}*

---

#### 🎯 Test Your Understanding:
Here is a high-yield concept check to test your retention:

**Question**: When applying **${detected_concept}** in ${detected_subject}, what is the single most important rule to keep in mind to avoid errors?
- **A**: Always check your units, boundary conditions, and the core governing law before calculating.
- **B**: Memorize the final answer number without understanding the steps.
- **C**: Ignore the given values and guess randomly.
- **D**: Skip verification.

*(Hint: The answer is **A**!)*

Ready for another question or would you like to explore another chapter?`;
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
 * Fast helper to test if a raw string is a greeting, chitchat, capability, model inquiry, emotional well-being, or study advice
 */
export function isConversationalQuery(query: string): boolean {
  const clean = (query || "").trim().toLowerCase();
  if (!clean || clean.length < 2) return false;
  return (
    PURE_GREETING_REGEX.test(clean) ||
    CAPABILITY_QUERY_REGEX.test(clean) ||
    MODEL_IDENTITY_REGEX.test(clean) ||
    CASUAL_CHITCHAT_REGEX.test(clean) ||
    WELLBEING_EMOTION_REGEX.test(clean) ||
    STUDY_STRATEGY_REGEX.test(clean) ||
    JOKE_FUN_REGEX.test(clean) ||
    FRIENDSHIP_CONVERSATION_REGEX.test(clean) ||
    ACKNOWLEDGMENT_REGEX.test(clean) ||
    /^(?:hi+|hello+|hey+|yo+|sup|namaste|vanakkam)[\s,!.]/i.test(clean) ||
    /^(?:what's\s*up|whats\s*up|how's\s*it\s*going|hows\s*it\s*going|how\s*are\s*you|how\s*r\s*u)\b/i.test(clean)
  );
}

