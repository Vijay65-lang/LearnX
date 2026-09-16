import { GoogleGenAI, Type } from "@google/genai";
import {
  analyzeStudentIntent,
  formatTailoredExplanation,
  isConversationalQuery,
  ConversationContext,
  IntentAnalysisResult
} from "./intent.js";

let aiClient: GoogleGenAI | null = null;
let cloudApiBlockedOrRestricted = false;

// ============================================================================
// OLLAMA & LOCAL MODEL DETECTION
// ============================================================================

export async function checkOllamaStatus(endpoint: string = "http://localhost:11434"): Promise<{
  online: boolean;
  models: string[];
  recommendedModel: string;
  hasQwen: boolean;
  hasDeepSeek: boolean;
  hasLlama: boolean;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const cleanEndpoint = endpoint.replace(/\/+$/, "");
    const res = await fetch(`${cleanEndpoint}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name) : [];
      const hasQwen = models.some((m: string) => m.toLowerCase().includes("qwen"));
      const hasDeepSeek = models.some((m: string) => m.toLowerCase().includes("deepseek"));
      const hasLlama = models.some((m: string) => m.toLowerCase().includes("llama"));
      const recommendedModel =
        models.find((m: string) => m.toLowerCase().includes("deepseek")) ||
        models.find((m: string) => m.toLowerCase().includes("qwen")) ||
        models.find((m: string) => m.toLowerCase().includes("llama")) ||
        models[0] ||
        "qwen2.5:1.5b";
      return { online: true, models, recommendedModel, hasQwen, hasDeepSeek, hasLlama };
    }
  } catch {
    // Offline or unreachable
  }
  return { online: false, models: [], recommendedModel: "qwen2.5:1.5b", hasQwen: false, hasDeepSeek: false, hasLlama: false };
}

export async function queryOllama(
  endpoint: string = "http://localhost:11434",
  model: string = "qwen2.5:1.5b",
  prompt: string,
  systemPrompt?: string
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const cleanEndpoint = endpoint.replace(/\/+$/, "");
    const res = await fetch(`${cleanEndpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "qwen2.5:1.5b",
        prompt,
        system: systemPrompt || "You are LearnX AI, a friendly, encouraging, and highly knowledgeable tutor like ChatGPT. Explain clearly with analogies, step-by-step logic, code/examples, and key takeaways.",
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.response && typeof data.response === "string" && data.response.trim().length > 20) {
        return data.response.trim();
      }
    }
  } catch {
    // Fallback gracefully
  }
  return null;
}

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY || cloudApiBlockedOrRestricted) {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch {
      return null;
    }
  }
  return aiClient;
}

export interface QuestionAnalysis {
  is_unclear: boolean;
  is_conversational?: boolean;
  clarification_question?: string;
  detected_subject: string;
  detected_topic: string;
  detected_concept: string;
  technical_terms: string[];
  intent?: string;
  cleaned_query?: string;
  raw_input?: string;
}

export interface ExplanationResult {
  explanation: string;
  detected_subject: string;
  detected_topic: string;
  detected_concept: string;
  validation_passed: boolean;
  is_conversational?: boolean;
  validation_notes?: string;
}

export interface GeneratedMCQ {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  topic: string;
  concept: string;
  validation_passed: boolean;
}

// ============================================================================
// FRIENDLY ACADEMIC KNOWLEDGE BASE (CHATGPT-STYLE CLARITY & WARMTH)
// ============================================================================

interface ConceptMasteryEntry {
  subject: string;
  topic: string;
  concept: string;
  keywords: string[];
  plainEnglish: string;
  analogy: string;
  howItWorks: string[];
  realWorldExample: string;
  keyTakeaways: string[];
  mcq: {
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    correct: "A" | "B" | "C" | "D";
    explanation: string;
    difficulty?: "Easy" | "Medium" | "Hard";
  };
  mcqs?: Array<{
    question: string;
    a: string;
    b: string;
    c: string;
    d: string;
    correct: "A" | "B" | "C" | "D";
    explanation: string;
    difficulty?: "Easy" | "Medium" | "Hard";
  }>;
}

const ACADEMIC_KNOWLEDGE_BASE: ConceptMasteryEntry[] = [
  {
    subject: "Theory of Computation & Compiler Design",
    topic: "Formal Grammars & Automata",
    concept: "Context-Free Grammar (CFG)",
    keywords: ["context free grammar", "cfg", "context-free grammar", "cfl", "pushdown automata", "pda", "chomsky", "type-2 grammar"],
    plainEnglish: "Think of how grammar works in human languages: you have rules like `Sentence → Subject + Verb + Object`. A **Context-Free Grammar (CFG)** is the exact same idea, but designed for programming languages and mathematical expressions! It is a set of formal recursive rules that generates all grammatically valid strings in a language.",
    analogy: "It's called **'context-free'** because each rule replaces a single symbol without caring about what words or characters come before or after it. It's like replacing the word `[Fruit]` with `Apple` in a recipe—it doesn't matter if it says 'red [Fruit]' or 'fresh [Fruit]', the substitution rule works anywhere in any context!",
    howItWorks: [
      "**Mathematically defined as a 4-Tuple $G = (V, \\Sigma, R, S)$**:",
      "1. **$V$ (Variables / Non-Terminals)**: Syntactic placeholders that can be expanded (e.g., $E, T, F$).",
      "2. **$\\Sigma$ (Terminals / Alphabet)**: The actual final tokens/characters (e.g., `+`, `*`, `(`, `)`, `id`). Terminals can never appear on the left-hand side of a rule.",
      "3. **$R$ (Production Rules)**: Substitution rules strictly of the form $A \\to \\alpha$, where $A \\in V$ (exactly one variable) and $\\alpha \\in (V \\cup \\Sigma)^*$ (any sequence of variables and terminals).",
      "4. **$S$ (Start Symbol)**: The special variable $S \\in V$ where all derivations begin."
    ],
    realWorldExample: "### Real-World Example: Balanced Parentheses Grammar\n```text\nVariables: V = { S }\nTerminals: Σ = { (, ) }\nRules:     S → (S) | SS | ε   (where ε is the empty string)\n```\nTo generate `(())`:\n1. Start with `S`\n2. Apply rule `S → (S)`: gives `(S)`\n3. Apply rule `S → (S)` inside: gives `((S))`\n4. Replace `S` with `ε`: gives `(())` ✨\n\nCompilers (like in Python, C++, and JavaScript) use CFGs to make sure your brackets and syntax are valid before running your code!",
    keyTakeaways: [
      "**Chomsky Hierarchy**: CFGs are **Type-2** grammars. They are more expressive than Regular Grammars (Type-3) and a subset of Context-Sensitive Grammars (Type-1).",
      "**Machine Equivalence**: The computational machine that recognizes Context-Free Languages is the **Pushdown Automaton (PDA)**, which has a Last-In First-Out (LIFO) stack.",
      "**The Golden Rule**: The left side of every rule must contain **exactly one variable** ($A \\to \\alpha$).",
      "**Closure Properties**: Closed under Union, Concatenation, and Kleene Star. Not closed under Intersection or Complement."
    ],
    mcq: {
      question: "What is the defining structural constraint on every production rule A → α in a Context-Free Grammar (CFG)?",
      a: "The left-hand side A must consist of exactly one non-terminal variable",
      b: "The right-hand side α cannot contain any terminal symbols",
      c: "The left-hand side must contain at least one terminal and one non-terminal",
      d: "The length of α on the right-hand side must be strictly greater than 2",
      correct: "A",
      explanation: "In a Context-Free Grammar (Type-2), every production rule must have the form A → α, where A is a single non-terminal variable (A ∈ V). Because no surrounding symbols constrain A on the left, it is called 'context-free'."
    }
  },
  {
    subject: "Theory of Computation & Automata",
    topic: "Finite Automata",
    concept: "DFA vs NFA",
    keywords: ["dfa vs nfa", "deterministic finite automaton", "nfa", "dfa", "finite automata", "epsilon transition"],
    plainEnglish: "Both **DFA** (Deterministic Finite Automaton) and **NFA** (Non-Deterministic Finite Automaton) are abstract state machines used to recognize patterns and regular languages (like regex search in text editors). The big difference is how they make decisions!",
    analogy: "Think of a **DFA** like following a strict GPS navigation route—at every intersection, there is exactly one sign directing you where to turn. An **NFA** is like exploring a maze with clones—whenever there is a fork in the road or multiple paths, you can conceptually split and explore all choices simultaneously!",
    howItWorks: [
      "**DFA (Deterministic)**: For every state and input character, there is **exactly one** next state $(\\delta: Q \\times \\Sigma \\to Q)$. No guessing, no empty $(\\epsilon)$ jumps.",
      "**NFA (Non-Deterministic)**: For a state and input character, there can be **zero, one, or multiple** next states $(\\delta: Q \\times (\\Sigma \\cup \\{\\epsilon\\}) \\to 2^Q)$. It can also transition on $\\epsilon$ without reading any character.",
      "**Acceptance**: A DFA accepts if it ends in an accepting state. An NFA accepts if *at least one* of its possible computational paths reaches an accepting state.",
      "**Equivalence**: Amazingly, DFAs and NFAs have the **exact same computational power**! Any language accepted by an NFA can also be accepted by a DFA via the **Subset Construction** algorithm."
    ],
    realWorldExample: "When you write a regex like `(a|b)*abb`, it is very easy to draw as an NFA. Compilers (like Lex/Flex) first convert your regex to an NFA, convert the NFA to an equivalent DFA, minimize the DFA, and then run it in lightning-fast $O(n)$ time!",
    keyTakeaways: [
      "Both DFA and NFA recognize **Type-3 (Regular Languages)**.",
      "An NFA with $n$ states can produce an equivalent DFA with up to $2^n$ states in the worst case (state explosion).",
      "DFAs are faster to run ($O(n)$ time, no backtracking); NFAs are simpler and more compact to design."
    ],
    mcq: {
      question: "Which of the following statements comparing DFA and NFA is TRUE?",
      a: "DFA and NFA have the exact same expressive power and both recognize Regular Languages",
      b: "NFA can recognize Context-Free Languages that a DFA cannot",
      c: "A DFA allows spontaneous transitions on empty string ε",
      d: "Every DFA requires strictly more states than any equivalent NFA"
    ,
      correct: "A",
      explanation: "Via the Powerset (Subset) Construction, every NFA can be converted into an equivalent DFA. Thus, DFA and NFA possess identical computational power and recognize exactly the class of Regular Languages."
    }
  },
  {
    subject: "Operating Systems",
    topic: "CPU Scheduling",
    concept: "Round Robin Scheduling",
    keywords: ["round robin", "cpu scheduling", "time quantum", "preemptive scheduling", "ready queue", "turnaround time"],
    plainEnglish: "**Round Robin (RR)** is one of the most widely used CPU scheduling algorithms in modern operating systems. It is designed to be fair and responsive, ensuring that every running program gets a turn on the CPU without any single program hogging all resources.",
    analogy: "Think of Round Robin like sharing a gaming console with your friends using a 10-minute timer. Player 1 plays for 10 minutes. When the timer rings, Player 1 moves to the back of the line, and Player 2 takes their turn for 10 minutes. Nobody starves, and everyone gets regular turns!",
    howItWorks: [
      "**Preemptive Algorithm**: The OS sets a fixed slice of CPU time called a **Time Quantum** (typically 10ms to 100ms).",
      "**Circular Ready Queue**: Processes wait in a FIFO queue. The CPU takes the first process and lets it run.",
      "**Time Expiration**: If the process doesn't finish within the time quantum, an interrupt triggers, the CPU context-switches, and the process is sent to the back of the queue.",
      "**Fairness**: Prevents starvation completely. Every process gets $1/n$-th of the CPU in chunks of at most $q$ time units."
    ],
    realWorldExample: "If you have 3 apps open (Browser with 10ms burst, Music with 4ms burst, Code Editor with 6ms burst) and a time quantum $q = 5\\text{ms}$:\n- Browser runs for 5ms (5ms remaining) → moves to back\n- Music runs for 4ms (finishes!) ✨\n- Editor runs for 5ms (1ms remaining) → moves to back\n- Browser runs its remaining 5ms (finishes!) ✨\n- Editor runs its remaining 1ms (finishes!) ✨",
    keyTakeaways: [
      "If the Time Quantum $q$ is **very large**, Round Robin degenerates into **First-Come First-Served (FCFS)**.",
      "If the Time Quantum $q$ is **too small**, the CPU spends too much time on context switching overhead rather than doing useful work.",
      "Rule of thumb: 80% of CPU bursts should be shorter than the time quantum."
    ],
    mcq: {
      question: "What happens if the time quantum in a Round Robin CPU scheduling algorithm is set extremely large?",
      a: "The algorithm behaves identically to First-Come First-Served (FCFS)",
      b: "The system experiences severe CPU context-switching overhead",
      c: "The algorithm behaves as Shortest Job First (SJF)",
      d: "Processes suffer from complete starvation",
      correct: "A",
      explanation: "If the time quantum is larger than the burst time of any process, each process finishes in its very first turn without being preempted, effectively turning Round Robin into FCFS."
    }
  },
  {
    subject: "Database Management Systems",
    topic: "Relational Database Design",
    concept: "Database Normalization (1NF, 2NF, 3NF, BCNF)",
    keywords: ["normalization", "1nf", "2nf", "3nf", "bcnf", "database normalization", "functional dependency", "database anomalies"],
    plainEnglish: "**Database Normalization** is the process of organizing data in a relational database to eliminate messy redundancy (duplicate data) and prevent unwanted bugs called insertion, update, and deletion anomalies.",
    analogy: "Imagine storing a student's address, phone number, college name, and college principal's name in every single course enrollment row. If the college changes its principal, you would have to update 10,000 rows! If you miss one, your database is corrupted. Normalization splits this into clean tables (`Students`, `Courses`, `Colleges`) linked together logically.",
    howItWorks: [
      "**1NF (First Normal Form)**: Eliminate repeating groups. Every column must contain only **atomic (indivisible) values**, and each row must be unique (Primary Key).",
      "**2NF (Second Normal Form)**: Must be in 1NF AND have **no partial functional dependencies**. Every non-key column must depend on the *entire* primary key, not just a part of a composite key.",
      "**3NF (Third Normal Form)**: Must be in 2NF AND have **no transitive dependencies**. Non-key attributes must depend directly on the primary key, not through another non-key attribute (*'Every attribute depends on the key, the whole key, and nothing but the key'*).",
      "**BCNF (Boyce-Codd Normal Form)**: A stricter version of 3NF. For every non-trivial functional dependency $X \\to Y$, $X$ must be a **Super Key**."
    ],
    realWorldExample: "A table `Orders(OrderID, ProductID, ProductName, SupplierPhone)`:\n- `ProductName` depends only on `ProductID`, not `OrderID` (violates 2NF!).\n- Solution: Split into `OrderItems(OrderID, ProductID)` and `Products(ProductID, ProductName, SupplierID)`.",
    keyTakeaways: [
      "Higher normal forms minimize redundancy and prevent data anomalies.",
      "Trade-off: Highly normalized databases require more table `JOIN`s, which can slow down read-heavy queries. In big data analytics, databases are sometimes intentionally 'denormalized' for speed."
    ],
    mcq: {
      question: "Which normal form specifically requires eliminating transitive dependencies between non-prime attributes?",
      a: "1NF",
      b: "2NF",
      c: "3NF",
      d: "BCNF",
      correct: "C",
      explanation: "Third Normal Form (3NF) requires that a table is in 2NF and has no transitive dependencies (i.e., non-prime attributes must not determine other non-prime attributes)."
    }
  },
  {
    subject: "Operating Systems",
    topic: "Process Synchronization & Concurrency",
    concept: "Deadlock & Prevention",
    keywords: ["deadlock", "coffman conditions", "banker's algorithm", "mutual exclusion", "circular wait", "resource allocation graph"],
    plainEnglish: "A **Deadlock** is a situation in computing where two or more processes are permanently stuck because each is waiting for a resource that the other process holds.",
    analogy: "Think of two cars meeting head-to-head on a narrow one-lane bridge. Neither car can move forward without the other backing up, but neither driver is willing to back up. They are deadlocked!",
    howItWorks: [
      "**The 4 Coffman Conditions (Must all hold simultaneously for deadlock to occur)**:",
      "1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode (only one process at a time).",
      "2. **Hold and Wait**: A process holds at least one resource while waiting to acquire additional resources held by others.",
      "3. **No Preemption**: Resources cannot be forcibly taken away; they can only be released voluntarily by the holding process.",
      "4. **Circular Wait**: A closed chain of processes exists: $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$."
    ],
    realWorldExample: "Thread A locks `Database_Row_1` and needs `Database_Row_2`. At the exact same microsecond, Thread B locks `Database_Row_2` and needs `Database_Row_1`. Both wait forever unless the OS detects the cycle and kills one transaction.",
    keyTakeaways: [
      "**Deadlock Prevention**: Invalidate at least one of the 4 Coffman conditions (e.g. impose a strict global numerical ordering on all resource acquisitions to eliminate circular wait).",
      "**Deadlock Avoidance**: Use algorithms like Dijkstra's **Banker's Algorithm** to test for a safe state before granting requests."
    ],
    mcq: {
      question: "Which condition is broken when an operating system enforces a strict global numerical ordering for acquiring all resources?",
      a: "Mutual Exclusion",
      b: "Hold and Wait",
      c: "No Preemption",
      d: "Circular Wait",
      correct: "D",
      explanation: "By enforcing a strict linear hierarchy or numerical ordering on all resources and requiring processes to request resources only in increasing order, a circular chain of dependencies cannot form, effectively eliminating Circular Wait."
    }
  },
  {
    subject: "Data Structures & Algorithms",
    topic: "Searching Algorithms",
    concept: "Binary Search",
    keywords: ["binary search", "binary searching", "bsearch", "sorted array search", "divide and conquer search"],
    plainEnglish: "**Binary Search** is an ultra-fast algorithm to find any item in a sorted array by repeatedly chopping the search area in half.",
    analogy: "Think of opening a physical 1,000-page dictionary to find the word 'Quantum'. You don't read page 1, then page 2. You flip directly to page 500 (the middle). 'Quantum' comes after 'M', so you instantly discard pages 1-500 and flip to page 750. In just 10 flips, you find any word in the entire book!",
    howItWorks: [
      "**Requirement**: The list **must be sorted**.",
      "**Algorithm**:",
      "1. Set `low = 0` and `high = array.length - 1`.",
      "2. Find the midpoint: `mid = low + Math.floor((high - low) / 2)`.",
      "3. If `arr[mid] === target`, you found it! 🎉",
      "4. If `arr[mid] < target`, search the right half (`low = mid + 1`).",
      "5. If `arr[mid] > target`, search the left half (`high = mid - 1`).",
      "6. Repeat until found or `low > high`."
    ],
    realWorldExample: "```ts\nfunction binarySearch(arr: number[], target: number): number {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = low + Math.floor((high - low) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1; // Not found\n}\n```",
    keyTakeaways: [
      "**Time Complexity**: $O(\\log n)$ in the worst and average cases. For 1,000,000 elements, it takes at most 20 checks!",
      "**Space Complexity**: $O(1)$ iterative, $O(\\log n)$ recursive call stack.",
      "**Crucial Detail**: `low + Math.floor((high - low) / 2)` avoids 32-bit integer overflow bugs seen in `(low + high) / 2`."
    ],
    mcq: {
      question: "What is the maximum number of comparisons Binary Search needs to find a target in a sorted list of 1,024 elements?",
      a: "10",
      b: "1,024",
      c: "512",
      d: "32",
      correct: "A",
      explanation: "Since Binary Search divides the search space in half each time, the maximum comparisons is log2(1024) = 10."
    }
  },
  {
    subject: "Computer Networks",
    topic: "Transport Layer Protocols",
    concept: "TCP vs UDP",
    keywords: ["tcp vs udp", "tcp", "udp", "transport layer", "three-way handshake", "reliable transmission"],
    plainEnglish: "**TCP** and **UDP** are the two fundamental protocols that move data across the Internet. They differ in a classic trade-off: **100% Guaranteed Accuracy (TCP)** vs **Maximum Speed (UDP)**.",
    analogy: "Think of **TCP** like a registered postal letter with return receipt requested: the mail carrier checks the recipient's signature, numbers the pages, and if a page gets lost in transit, resends it until everything is confirmed. **UDP** is like live radio or live television broadcasting: the audio/video streams out continuously; if you miss half a second of sound, it doesn't pause to repeat it, it just keeps playing live!",
    howItWorks: [
      "**TCP (Transmission Control Protocol)**:",
      "- Connection-oriented: Establishes connection via **3-Way Handshake** (SYN → SYN-ACK → ACK).",
      "- Reliable: Acknowledges received packets, retransmits lost packets, reorders packets.",
      "- Flow & Congestion Control: Adapts speed to network conditions.",
      "**UDP (User Datagram Protocol)**:",
      "- Connectionless: Just sends packets ('fire and forget') without establishing a session.",
      "- Fast and lightweight: No handshakes, no retransmissions, no packet ordering overhead."
    ],
    realWorldExample: "- **Use TCP for**: Web browsing (HTTP/HTTPS), downloading files, sending emails, banking apps where losing even 1 byte is unacceptable.\n- **Use UDP for**: Online multiplayer gaming, live video calls (Zoom/Discord), live sports streaming, and DNS lookups where speed and low latency matter more than occasional dropped frames.",
    keyTakeaways: [
      "TCP = Reliable, ordered, slower, heavier header (20 bytes).",
      "UDP = Fast, connectionless, unordered, lighter header (8 bytes).",
      "TCP handles retransmission automatically; with UDP, the application layer must handle packet loss if needed."
    ],
    mcq: {
      question: "Why do real-time online multiplayer games and live video calls prefer UDP over TCP?",
      a: "UDP eliminates connection handshakes and retransmission delays, prioritizing low latency",
      b: "UDP automatically encrypts all packets by default",
      c: "UDP guarantees zero packet loss during peak congestion",
      d: "UDP guarantees that all packets arrive in exact sequential order",
      correct: "A",
      explanation: "In live games and video calls, low latency is critical. Retransmitting a delayed packet from 2 seconds ago is useless because real-time action has already moved forward."
    }
  },
  {
    subject: "Physics",
    topic: "Classical Mechanics & Dynamics",
    concept: "Newton's Laws of Motion",
    keywords: ["newton", "newton's laws", "newton's third law", "newtons laws", "action reaction", "f=ma", "inertia", "laws of motion"],
    plainEnglish: "Sir Isaac Newton formulated three fundamental laws that describe how objects move and interact in our everyday world. From walking down the street to launching rockets into orbit, these laws govern the physical universe!",
    analogy: "Think of skateboarding: if you push off the ground, your skateboard rolls smoothly until friction slows it down (1st Law). If a small dog vs a heavy elephant stands on the skateboard, the elephant needs much more push to accelerate (2nd Law). When you push backward against the pavement with your foot, the pavement pushes you forward with equal force (3rd Law)!",
    howItWorks: [
      "**1st Law (Law of Inertia)**: An object at rest stays at rest, and an object in motion continues in uniform straight-line motion at constant velocity unless acted upon by an external net force.",
      "**2nd Law ($F = ma$)**: Force equals mass times acceleration. The acceleration of an object is directly proportional to the net force applied and inversely proportional to its mass ($a = F / m$).",
      "**3rd Law (Action & Reaction)**: For every action, there is an equal and opposite reaction ($F_{A \\to B} = -F_{B \\to A}$). Forces always occur in matched interaction pairs!"
    ],
    realWorldExample: "Rocket propulsion: When a rocket engine burns fuel and blasts hot exhaust gases downward at high velocity (Action), the expelled gases push the rocket upward into space with equal force (Reaction)!",
    keyTakeaways: [
      "1st Law defines inertia (measured by mass).",
      "2nd Law gives the quantitative relationship $F = \\frac{dp}{dt} = ma$ in SI units (Newtons, N).",
      "3rd Law action-reaction forces **never cancel each other out** because they act on two completely different objects!"
    ],
    mcq: {
      question: "Why do action and reaction forces in Newton's Third Law never cancel each other out?",
      a: "Because they act simultaneously on two different objects, not on the same object",
      b: "Because action force is always slightly larger than reaction force",
      c: "Because reaction force occurs after a small time delay",
      d: "Because they operate in perpendicular directions",
      correct: "A",
      explanation: "Newton's Third Law states that if object A exerts a force on object B, object B exerts an equal and opposite force on object A. Since the two forces act on distinct bodies, they cannot cancel each other out."
    }
  },
  {
    subject: "Computer Science & Software Engineering",
    topic: "Object-Oriented Programming (OOP)",
    concept: "The 4 Pillars of OOP",
    keywords: ["oop", "object oriented", "four pillars", "encapsulation", "inheritance", "polymorphism", "abstraction"],
    plainEnglish: "Object-Oriented Programming (OOP) is a software design model where code is organized around real-world 'objects' containing data (fields) and behavior (methods), rather than just loose functions and variables.",
    analogy: "Think of a modern car: you don't need to know how the fuel injectors or engine pistons work under the hood to drive it—you just press the accelerator and turn the steering wheel (Abstraction). The engine parts are sealed safely inside the chassis (Encapsulation). An Electric Car inherits wheels, brakes, and headlights from the base Car blueprint (Inheritance). And pressing 'start' boots an electric battery or revs a gas engine depending on the specific model (Polymorphism)!",
    howItWorks: [
      "**1. Encapsulation**: Bundling data and methods together inside a class while hiding private internal state using `private`/`protected` modifiers and public getters/setters.",
      "**2. Abstraction**: Hiding complex implementation details and showing only the clean, high-level interface to the user.",
      "**3. Inheritance**: Mechanism where a child class derives attributes and methods from an existing parent class (`class Dog extends Animal`), promoting code reuse.",
      "**4. Polymorphism**: The ability of different classes to respond to the same method call in their own unique way (Method Overriding and Overloading)."
    ],
    realWorldExample: "```java\nabstract class Payment { abstract void pay(double amount); }\nclass UpiPayment extends Payment { void pay(double a) { System.out.println(\"Paid via UPI: \" + a); } }\nclass CardPayment extends Payment { void pay(double a) { System.out.println(\"Paid via Card: \" + a); } }\n```\nThe checkout system calls `payment.pay(amount)` without caring which specific payment method the customer selected!",
    keyTakeaways: [
      "Encapsulation = Data Hiding & Protection.",
      "Abstraction = Interface Simplicity (Hiding internal mechanics).",
      "Inheritance = 'IS-A' relationship and code reuse.",
      "Polymorphism = Many forms (Method Overriding at runtime, Overloading at compile time)."
    ],
    mcq: {
      question: "Which pillar of OOP specifically focuses on hiding complex internal mechanics and exposing only an intuitive public interface?",
      a: "Abstraction",
      b: "Inheritance",
      c: "Compilation",
      d: "Polymorphism",
      correct: "A",
      explanation: "Abstraction hides the internal complexity of a subsystem, providing a simplified, clean interface for clients to interact with."
    }
  },
  {
    subject: "Biological Sciences",
    topic: "Plant Physiology & Bioenergetics",
    concept: "Photosynthesis",
    keywords: ["photosynthesis", "chlorophyll", "chloroplast", "light dependent", "calvin cycle", "atp"],
    plainEnglish: "**Photosynthesis** is the miraculous biochemical process by which green plants, algae, and certain bacteria convert sunlight energy into chemical energy (glucose) that fuels almost all life on Earth, releasing the oxygen we breathe!",
    analogy: "Think of a plant leaf like a tiny solar-powered solar bakery: sunlight is the electrical power, water absorbed by roots and carbon dioxide absorbed from the air are the raw ingredients, and delicious sugar (glucose) is the baked product, with oxygen given off as clean fresh steam!",
    howItWorks: [
      "**Chemical Equation**: $6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light} \\to \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$",
      "**Stage 1: Light-Dependent Reactions (in Thylakoid membranes)**: Chlorophyll absorbs photons, splits water molecules ($H_2O$) to release $O_2$, and generates energy carriers **ATP** and **NADPH**.",
      "**Stage 2: Light-Independent Reactions (Calvin Cycle in Stroma)**: Uses the ATP and NADPH generated in Stage 1 to fix carbon dioxide ($CO_2$) into energy-rich glucose sugar molecules."
    ],
    realWorldExample: "Forests and phytoplankton in the world's oceans act as the planet's primary 'carbon sink', pulling billions of tons of greenhouse $CO_2$ gas out of the atmosphere every year and pumping out oxygen.",
    keyTakeaways: [
      "Takes place inside **chloroplasts**.",
      "Water provides the electrons and is split into oxygen.",
      "Carbon dioxide is fixed into carbohydrates via the **Calvin Cycle** catalyzed by the enzyme **RuBisCO** (the most abundant protein on Earth)."
    ],
    mcq: {
      question: "Where in the chloroplast do the light-dependent reactions of photosynthesis take place?",
      a: "Thylakoid membranes",
      b: "Stroma",
      c: "Mitochondrial matrix",
      d: "Outer lipid envelope",
      correct: "A",
      explanation: "The light-dependent reactions occur within the thylakoid membranes where chlorophyll pigments absorb light and split water to produce ATP, NADPH, and O2."
    }
  },
  {
    subject: "Computer Science & Programming",
    topic: "Algorithmic Paradigms",
    concept: "Recursion",
    keywords: ["recursion", "recursive", "base case", "call stack", "stack overflow"],
    plainEnglish: "**Recursion** is a programming technique where a function solves a problem by calling a smaller copy of itself until it reaches a simple, directly solvable condition called the **Base Case**.",
    analogy: "Think of Russian nesting dolls (Matryoshka): to find what's at the center, you open a doll to find a slightly smaller doll inside. You keep opening each smaller doll until you reach the tiny solid wooden doll at the center (the Base Case). Then you can close each doll back up in reverse order!",
    howItWorks: [
      "**Two Essential Components**:",
      "1. **The Base Case**: The stopping condition that returns a value immediately without making further recursive calls. (Without this, you get infinite recursion and a `StackOverflowError`!).",
      "2. **The Recursive Step**: Calls the function with a smaller or simpler sub-problem, ensuring progress toward the base case.",
      "**The Call Stack**: Each recursive call pauses the current execution frame and pushes a new frame onto the CPU call stack until the base case is hit."
    ],
    realWorldExample: "```python\ndef factorial(n: int) -> int:\n    # Base case: 0! = 1 and 1! = 1\n    if n <= 1:\n        return 1\n    # Recursive step\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 5 * 4 * 3 * 2 * 1 = 120\n```",
    keyTakeaways: [
      "Every recursive solution must have at least one valid **Base Case**.",
      "Time complexity is determined by the number of recursive branches and work per call; space complexity is determined by the maximum depth of the call stack.",
      "Any recursive algorithm can also be written iteratively using an explicit loop and stack data structure."
    ],
    mcq: {
      question: "What catastrophic runtime error occurs if a recursive function is called without a valid base case?",
      a: "Stack Overflow",
      b: "Memory Leak in Heap",
      c: "Null Pointer Exception",
      d: "Deadlock",
      correct: "A",
      explanation: "Without a base case to terminate recursion, the function calls itself indefinitely, exhausting the allocated call stack space and triggering a Stack Overflow."
    }
  },
  {
    subject: "Computer Science & Programming",
    topic: "Object-Oriented Programming (OOP)",
    concept: "The 4 Pillars of OOP",
    keywords: ["oop", "object oriented", "encapsulation", "polymorphism", "inheritance", "abstraction", "classes and objects"],
    plainEnglish: "**Object-Oriented Programming (OOP)** is a programming model organized around **Objects** (data entities) rather than just functions. Its foundation rests on **4 Pillars**: **Encapsulation**, **Abstraction**, **Inheritance**, and **Polymorphism**.",
    analogy: "Think of a modern Smartphone:\n- **Encapsulation**: Internal circuits, battery, and chips are sealed inside the phone casing so you cannot accidentally short-circuit them.\n- **Abstraction**: You interact with an intuitive touchscreen interface without needing to understand radio frequency equations or CPU voltages.\n- **Inheritance**: An 'iPhone 15 Pro' inherits camera, calling, and WiFi features from the base 'Phone' blueprint without reinventing them from scratch.\n- **Polymorphism**: The single power button performs different behaviors depending on how you press it (quick press = lock screen, long press = power off/Siri).",
    howItWorks: [
      "**1. Encapsulation**: Bundling data attributes and methods that operate on that data inside a class while restricting direct external access via private/protected modifiers and getters/setters.",
      "**2. Abstraction**: Hiding complex internal implementation details and exposing only the essential public interface (e.g. abstract classes and interfaces).",
      "**3. Inheritance**: A child class inherits attributes and methods from a parent class (`class Dog extends Animal`), promoting code reuse and hierarchical taxonomy.",
      "**4. Polymorphism**: 'Many forms' — the ability of different classes to respond to the same method call in their own specific way (Method Overriding at runtime, Method Overloading at compile-time)."
    ],
    realWorldExample: "```python\nclass Animal:\n    def speak(self):\n        return \"Some generic sound\"\n\nclass Dog(Animal):\n    def speak(self):  # Polymorphism (Method Overriding)\n        return \"Woof! Woof!\"\n\nclass Cat(Animal):\n    def speak(self):\n        return \"Meow!\"\n\nfor animal in [Dog(), Cat()]:\n    print(animal.speak())\n# Output:\n# Woof! Woof!\n# Meow!\n```",
    keyTakeaways: [
      "Encapsulation protects internal object state (`private` variables with accessors).",
      "Abstraction simplifies complexity by showing *what* an object does rather than *how* it does it.",
      "Inheritance establishes an 'is-a' relationship (`Dog is an Animal`).",
      "Polymorphism allows treating derived objects as instances of their parent interface."
    ],
    mcq: {
      question: "Which pillar of Object-Oriented Programming is demonstrated when a subclass provides its own specific implementation of a method defined in its parent class?",
      a: "Polymorphism (Method Overriding)",
      b: "Encapsulation",
      c: "Data Shadowing",
      d: "Garbage Collection",
      correct: "A",
      explanation: "Polymorphism (specifically runtime method overriding) allows a derived subclass to provide a specific implementation of a method that is already defined in its superclass."
    },
    mcqs: [
      {
        question: "Hiding internal data representations and restricting direct outside modification by making variables private is an example of which OOP pillar?",
        a: "Encapsulation",
        b: "Inheritance",
        c: "Polymorphism",
        d: "Recursion",
        correct: "A",
        explanation: "Encapsulation bundles data and methods together and prevents unauthorized direct manipulation of an object's internal fields."
      }
    ]
  },
  {
    subject: "Data Structures & Algorithms",
    topic: "Searching Algorithms",
    concept: "Binary Search",
    keywords: ["binary search", "search sorted array", "log n search", "divide and conquer search"],
    plainEnglish: "**Binary Search** is an extremely fast search algorithm that finds the position of a target value within a **strictly sorted array**. By repeatedly dividing the search interval in half, it finds elements in **O(log n)** time.",
    analogy: "Imagine opening a physical English Dictionary to look up the word 'Network'. You don't read page by page from the letter 'A'. Instead, you flip open to the exact middle (letter 'M'). Since 'N' comes after 'M', you discard the entire first half of the book and repeat the search in the remaining right half!",
    howItWorks: [
      "**Precondition**: The input array MUST be sorted.",
      "**Step 1**: Calculate the middle index: `mid = low + (high - low) // 2` (prevents integer overflow in languages like C++/Java).",
      "**Step 2**: Compare `arr[mid]` with the `target`:",
      "- If `arr[mid] === target`: Target found! Return index.",
      "- If `arr[mid] < target`: Target must be in right half; set `low = mid + 1`.",
      "- If `arr[mid] > target`: Target must be in left half; set `high = mid - 1`.",
      "**Step 3**: Repeat while `low <= high`. If `low > high`, target does not exist in array."
    ],
    realWorldExample: "```python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid  # Found!\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1  # Not found\n\nnumbers = [10, 23, 35, 48, 59, 72, 88, 99]\nprint(binary_search(numbers, 59))  # Returns index 4\n```",
    keyTakeaways: [
      "Time Complexity: **Best Case O(1)** (found at middle on first try), **Average and Worst Case O(log n)**.",
      "Space Complexity: **O(1)** iterative, **O(log n)** recursive due to call stack frames.",
      "Crucial requirement: Array must be sorted prior to searching. Searching 1 billion elements takes only ~30 comparisons!"
    ],
    mcq: {
      question: "What is the maximum number of comparisons needed to find an element in a sorted array of 1,024 items using Binary Search?",
      a: "10 comparisons (log2(1024))",
      b: "512 comparisons",
      c: "1,024 comparisons",
      d: "100 comparisons",
      correct: "A",
      explanation: "Since binary search cuts the search space in half each step, log2(1024) = 10, meaning at most 10 comparisons are needed."
    }
  },
  {
    subject: "Database Management Systems",
    topic: "Indexing & Query Optimization",
    concept: "Database Indexes & B-Trees",
    keywords: ["database index", "b-tree", "b+ tree", "sql index", "table scan", "clustered index"],
    plainEnglish: "A **Database Index** is a specialized auxiliary data structure (typically a **B+ Tree**) that allows the database engine to locate specific rows in milliseconds without scanning every row in the table.",
    analogy: "Think of an Index at the back of a 1,000-page textbook: if you want to find where 'Transistors' are discussed, you look up the word alphabetically in the index, which tells you 'page 412'. Without an index, you would have to read all 1,000 pages line by line (a Full Table Scan)!",
    howItWorks: [
      "**B+ Tree Structure**: Balanced tree where all leaf nodes reside at the exact same depth and are linked as a doubly linked list for rapid range queries (`BETWEEN` or `>=`).",
      "**Clustered Index**: Dictates the physical storage order of data rows on disk (usually the Primary Key). A table can have only ONE clustered index.",
      "**Non-Clustered Index**: A separate structure containing sorted keys and pointers (row IDs) back to the actual data rows.",
      "**Trade-off**: Indexes make `SELECT` queries dramatically faster, but slightly slow down `INSERT`, `UPDATE`, and `DELETE` because the tree must be rebalanced."
    ],
    realWorldExample: "```sql\n-- Without an index, this scans 10,000,000 rows (Takes ~3.8 seconds):\nSELECT name, email FROM students WHERE roll_number = '24981A051N';\n\n-- Create B-Tree index on roll_number:\nCREATE INDEX idx_student_roll ON students(roll_number);\n\n-- With index: Binary tree traversal takes ~0.4 milliseconds!\n```",
    keyTakeaways: [
      "Indexes trade disk storage space and write performance for massive read query acceleration.",
      "B+ Trees provide **O(log N)** lookup, insertion, and deletion times.",
      "Avoid indexing columns with very low cardinality (e.g. boolean flags like `is_active`)."
    ],
    mcq: {
      question: "Why do B+ Trees serve as the primary data structure for relational database indexes instead of standard Binary Search Trees?",
      a: "B+ Trees have higher branching factors, minimizing expensive disk block I/O operations",
      b: "B+ Trees require zero storage space on the hard drive",
      c: "Binary Search Trees cannot store numeric numbers",
      d: "B+ Trees eliminate the need for primary keys",
      correct: "A",
      explanation: "Disk I/O is the primary database bottleneck. B+ Trees have a high fan-out (hundreds of children per node), meaning tree depth remains very shallow (3-4 levels for millions of rows), minimizing disk head reads."
    }
  },
  {
    subject: "Computer Networks",
    topic: "Transport Layer Protocols",
    concept: "TCP vs UDP",
    keywords: ["tcp", "udp", "transmission control protocol", "user datagram protocol", "3-way handshake", "reliable transport"],
    plainEnglish: "**TCP** and **UDP** are the two primary protocols of the Internet's **Transport Layer**. **TCP** is reliable, connection-oriented, and guarantees ordered delivery (at the cost of overhead). **UDP** is connectionless, lightweight, and prioritizes raw speed with zero transmission guarantees.",
    analogy: "- **TCP** is like a **Certified Courier Letter**: You receive a tracking receipt, the recipient signs for it, and if it gets lost in transit, the courier re-sends it.\n- **UDP** is like a **Live TV Broadcast or Megaphone**: The host speaks in real-time. If you miss a word because a siren drove by, the speaker doesn't pause to repeat it—the broadcast moves forward continuously!",
    howItWorks: [
      "**TCP (Transmission Control Protocol)**:",
      "1. **3-Way Handshake**: `SYN` -> `SYN-ACK` -> `ACK` establishes connection before sending payload.",
      "2. **Reliability**: Every packet has a Sequence Number; lost packets are automatically retransmitted.",
      "3. **Flow & Congestion Control**: Dynamically adjusts data rate to prevent crashing slow routers or receivers.",
      "**UDP (User Datagram Protocol)**:",
      "1. **Connectionless**: Shoots packets directly to IP and Port without any handshake or setup delay.",
      "2. **Zero Retransmission**: Missing packets are dropped; no packet ordering overhead."
    ],
    realWorldExample: "- **Use TCP for**: Web pages (HTTP/HTTPS), email (SMTP/IMAP), file downloads, and database queries where missing 1 byte breaks the whole file.\n- **Use UDP for**: Multiplayer gaming (Apex, Fortnite, Valorant), live Zoom video calls, voice (VoIP), and DNS lookups where speed and low latency matter far more than recovering a single dropped video pixel.",
    keyTakeaways: [
      "TCP: Reliable, ordered, slower, 3-way handshake, heavy 20-byte header.",
      "UDP: Unreliable, unordered, ultra-fast, connectionless, lightweight 8-byte header.",
      "TCP uses sliding window flow control and congestion avoidance algorithms."
    ],
    mcq: {
      question: "Which of the following applications is BEST suited to use UDP rather than TCP?",
      a: "Real-time competitive multiplayer game movement updates",
      b: "Online banking money transfer",
      c: "Downloading a software operating system ISO",
      d: "Loading an HTML webpage document",
      correct: "A",
      explanation: "Live gaming requires lowest possible latency. If a player position packet is dropped, retransmitting it milliseconds later is useless because newer position coordinates have already arrived."
    }
  },
  {
    subject: "Operating Systems",
    topic: "Process Synchronization & Concurrency",
    concept: "Deadlock & The 4 Coffman Conditions",
    keywords: ["deadlock", "coffman conditions", "bankers algorithm", "mutual exclusion", "circular wait", "hold and wait"],
    plainEnglish: "A **Deadlock** is a state in an operating system where a set of processes are permanently blocked because each process is holding a resource and waiting for another resource held by another process in the group.",
    analogy: "Picture a 4-way traffic intersection with no traffic light: Car A enters from the North and blocks Car B. Car B blocks Car C from the East. Car C blocks Car D from the South. Car D blocks Car A from the West. No car can move forward until another car backs up, but none of them can back up—traffic is completely frozen forever!",
    howItWorks: [
      "For a deadlock to occur, all **4 Coffman Conditions** MUST hold simultaneously:",
      "1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode (only one process can use it at a time).",
      "2. **Hold and Wait**: A process is holding at least one resource and actively waiting to acquire additional resources held by other processes.",
      "3. **No Preemption**: Resources cannot be forcefully confiscated from a process; they can only be released voluntarily after completion.",
      "4. **Circular Wait**: A closed loop exists: $P_0$ waits for $P_1$, $P_1$ waits for $P_2$ ... and $P_n$ waits for $P_0$."
    ],
    realWorldExample: "```python\n# Classic deadlock in multi-threaded programming:\n# Thread 1 locks Resource A, attempts to lock Resource B\n# Thread 2 locks Resource B, attempts to lock Resource A\n# Result: Both threads freeze permanently waiting on each other.\n```",
    keyTakeaways: [
      "To prevent deadlock, breaking **any one** of the four Coffman conditions guarantees deadlock cannot occur.",
      "Deadlock handling strategies: **Prevention**, **Avoidance** (Banker's Algorithm), **Detection & Recovery** (Resource Allocation Graph cycles), or **Ostrich Algorithm** (ignore it if rare).",
      "Circular wait is typically broken by enforcing a global resource ordering hierarchy."
    ],
    mcq: {
      question: "Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?",
      a: "Asynchronous Message Passing",
      b: "Mutual Exclusion",
      c: "Hold and Wait",
      d: "Circular Wait",
      correct: "A",
      explanation: "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Asynchronous message passing is a communication paradigm, not a Coffman condition."
    }
  },
  // ==========================================================================
  // INTERMEDIATE MPC (MATHEMATICS, PHYSICS, CHEMISTRY) CURRICULUM ENTRIES
  // ==========================================================================
  {
    subject: "Intermediate Mathematics",
    topic: "Algebra & Matrices",
    concept: "Matrices & Determinants",
    keywords: ["matrix", "matrices", "determinant", "cramer", "cramer's rule", "inverse of matrix", "adjoint", "intermediate math"],
    plainEnglish: "In Intermediate Mathematics, a **Matrix** is an ordered rectangular array of numbers or functions arranged in rows and columns. The **Determinant** is a single scalar value computed from a square matrix that tells us if a system of linear equations has a unique solution.",
    analogy: "Think of a spreadsheet or a table comparing the scores of 3 students in Maths, Physics, and Chemistry. A matrix neatly bundles these values so you can transform, scale, or solve for unknown variables all at once!",
    howItWorks: [
      "**1. Order of a Matrix**: A matrix with $m$ rows and $n$ columns has order $m \\times n$.",
      "**2. Determinant ($\\\\det A$ or $|A|$)**: For a $2 \\times 2$ matrix $\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$, $|A| = ad - bc$.",
      "**3. Singular vs Non-Singular**: If $|A| = 0$, the matrix is **Singular** and its inverse does not exist. If $|A| \\\\neq 0$, it is **Non-Singular**.",
      "**4. Matrix Inversion & Cramer's Rule**: $A^{-1} = \\\\frac{1}{|A|} \\\\text{adj}(A)$. We use Cramer's rule to solve systems of linear equations: $x = \\\\frac{\\\\Delta_1}{\\\\Delta}, y = \\\\frac{\\\\Delta_2}{\\\\Delta}, z = \\\\frac{\\\\Delta_3}{\\\\Delta}$."
    ],
    realWorldExample: "Solving simultaneous equations in physics (e.g., finding current $I_1, I_2, I_3$ in electrical mesh circuits using Kirchhoff's laws) is solved using $3 \\times 3$ matrices and Cramer's Rule!",
    keyTakeaways: [
      "For Board exams: Practice 7-mark questions on solving equations via Cramer's Rule and Matrix Inversion method.",
      "Property: $|AB| = |A| \\cdot |B|$ and $|A^T| = |A|$.",
      "If any two rows or columns are identical or proportional, the determinant is zero."
    ],
    mcq: {
      question: "If the determinant of a square matrix A is equal to zero (|A| = 0), what can we conclude about matrix A?",
      a: "A is a singular matrix and its inverse does not exist",
      b: "A is an identity matrix",
      c: "A is an orthogonal matrix",
      d: "A must have all zero elements",
      correct: "A",
      explanation: "A square matrix with determinant equal to zero is called a singular matrix. Since A⁻¹ = (1/|A|) adj(A), division by zero means the inverse does not exist."
    }
  },
  {
    subject: "Intermediate Mathematics",
    topic: "Calculus",
    concept: "Differentiation & Derivatives",
    keywords: ["differentiation", "derivative", "derivatives", "chain rule", "dy/dx", "rate of change", "calculus"],
    plainEnglish: "In Intermediate Mathematics, **Differentiation** measures the instantaneous rate at which a dependent variable changes with respect to an independent variable. Graphically, $\\\\frac{dy}{dx}$ represents the **slope of the tangent** to the curve at any given point.",
    analogy: "If a car travels from Visakhapatnam to Vijayawada, dividing total distance by total time gives the *average* speed. But the speedometer needle reading right now at this exact microsecond is the **derivative** $\\\\frac{ds}{dt}$!",
    howItWorks: [
      "**1. First Principles (Definition of Derivative)**: $f'(x) = \\\\lim_{h \\to 0} \\\\frac{f(x+h) - f(x)}{h}$.",
      "**2. Standard Formulas**: $\\\\frac{d}{dx}(x^n) = n x^{n-1}$, $\\\\frac{d}{dx}(\\\\sin x) = \\\\cos x$, $\\\\frac{d}{dx}(e^x) = e^x$, $\\\\frac{d}{dx}(\\\\ln x) = \\\\frac{1}{x}$.",
      "**3. Product Rule & Quotient Rule**: $(uv)' = u'v + uv'$, and $\\\\left(\\\\frac{u}{v}\\\\right)' = \\\\frac{u'v - uv'}{v^2}$.",
      "**4. Chain Rule**: For composite functions $y = f(g(x))$, $\\\\frac{dy}{dx} = f'(g(x)) \\\\cdot g'(x)$."
    ],
    realWorldExample: "In Physics, velocity is the first derivative of displacement with respect to time ($v = \\\\frac{ds}{dt}$), and acceleration is the derivative of velocity ($a = \\\\frac{dv}{dt} = \\\\frac{d^2s}{dt^2}$).",
    keyTakeaways: [
      "Always apply the Chain Rule carefully from outside function to inside function.",
      "At local maxima or minima of a function $f(x)$, the first derivative $f'(x) = 0$.",
      "High weightage in Intermediate Board calculus (AP/TS Inter 1B/2B and CBSE 12)."
    ],
    mcq: {
      question: "What is the derivative of f(x) = sin(x²) with respect to x using the Chain Rule?",
      a: "2x cos(x²)",
      b: "cos(x²)",
      c: "2x sin(x)",
      d: "-2x cos(x²)",
      correct: "A",
      explanation: "By the Chain Rule: d/dx[sin(u)] = cos(u) * du/dx. Here u = x², and du/dx = 2x. Thus, the derivative is 2x cos(x²)."
    }
  },
  {
    subject: "Intermediate Physics",
    topic: "Classical Mechanics (Senior Secondary)",
    concept: "Newton's Laws of Motion & Friction",
    keywords: ["newton's laws", "laws of motion", "friction", "limiting friction", "inertia", "f=ma", "momentum"],
    plainEnglish: "Newton's Laws of Motion form the foundation of classical mechanics in Intermediate Physics. They explain how external forces cause objects to accelerate, stay in equilibrium, or interact through mutual action-reaction pairs.",
    analogy: "When a passenger is standing in a bus that suddenly accelerates forward, their lower body moves with the floor while their upper body tends to stay at rest due to **inertia** (1st Law). When the bus hits the brakes, the passenger lurches forward for the same reason!",
    howItWorks: [
      "**1. First Law (Law of Inertia)**: An object remains in its state of rest or uniform motion unless acted upon by a net external force.",
      "**2. Second Law ($F = ma$)**: The rate of change of linear momentum is directly proportional to the applied force: $\\\\vec{F} = \\\\frac{d\\\\vec{p}}{dt} = m\\\\vec{a}$.",
      "**3. Third Law (Action & Reaction)**: To every action, there is always an equal and opposite reaction: $\\\\vec{F}_{AB} = -\\\\vec{F}_{BA}$.",
      "**4. Friction Laws**: Static friction $f_s \\\\le \\\\mu_s N$, where $N$ is the normal reaction. Once motion starts, kinetic friction $f_k = \\\\mu_k N$ opposes the relative sliding."
    ],
    realWorldExample: "Rocket propulsion works directly on Newton's Third Law and conservation of momentum: the high-velocity expulsion of burnt gases downward exerts an equal upward thrust force driving the rocket into orbit!",
    keyTakeaways: [
      "Always draw a clear **Free Body Diagram (FBD)** resolving forces along perpendicular axes ($X$ and $Y$).",
      "Static friction is self-adjusting up to its maximum limiting value $f_{\\\\max} = \\\\mu_s N$.",
      "Action and reaction forces never act on the same body; they always act on two different interacting bodies."
    ],
    mcq: {
      question: "A block of mass m rests on a rough horizontal surface with coefficient of static friction μs. A horizontal force F is applied, but the block does not move. What is the magnitude of the frictional force?",
      a: "Equal to the applied force F",
      b: "Always equal to μs * m * g",
      c: "Zero",
      d: "Greater than F",
      correct: "A",
      explanation: "Static friction is a self-adjusting force. As long as the applied force F does not exceed the limiting friction (μs * N), the static frictional force exactly equals the applied force F to keep the block in equilibrium."
    }
  },
  {
    subject: "Intermediate Physics",
    topic: "Kinematics & Dynamics",
    concept: "Projectile Motion",
    keywords: ["projectile motion", "projectile", "trajectory", "maximum height", "horizontal range", "time of flight"],
    plainEnglish: "In Intermediate Physics, **Projectile Motion** is a two-dimensional motion under the influence of constant gravitational acceleration $g$ acting vertically downward, with no horizontal acceleration (neglecting air resistance).",
    analogy: "When a cricket batsman hits a ball into the outfield for a six, the ball travels forward at constant horizontal speed while gravity pulls it down in a curved parabolic arc!",
    howItWorks: [
      "**1. Independent Axes**: Horizontal velocity $u_x = u \\\\cos \\\\theta$ remains constant ($a_x = 0$). Vertical velocity $u_y = u \\\\sin \\\\theta$ changes with acceleration $a_y = -g$.",
      "**2. Time of Flight**: $T = \\\\frac{2u \\\\sin \\\\theta}{g}$.",
      "**3. Maximum Height**: $H_{\\\\max} = \\\\frac{u^2 \\\\sin^2 \\\\theta}{2g}$.",
      "**4. Horizontal Range**: $R = \\\\frac{u^2 \\\\sin(2\\\\theta)}{g}$. The maximum range occurs at $\\\\theta = 45^\\\\circ$."
    ],
    realWorldExample: "Firefighters aiming water hoses at burning upper floors of a building calculate the angle $\\\\theta$ to ensure the stream reaches maximum vertical height with sufficient flow.",
    keyTakeaways: [
      "The path (trajectory) of a projectile is a **Parabola**: $y = x \\\\tan \\\\theta - \\\\frac{gx^2}{2u^2 \\\\cos^2 \\\\theta}$.",
      "At the highest point, vertical velocity is zero ($v_y = 0$), but horizontal velocity remains $u \\\\cos \\\\theta$.",
      "Two angles of projection that give the same horizontal range are complementary angles: $\\\\theta$ and $(90^\\\\circ - \\\\theta)$."
    ],
    mcq: {
      question: "At what angle of projection with the horizontal is the horizontal range of a projectile maximized for a given initial velocity?",
      a: "45°",
      b: "30°",
      c: "60°",
      d: "90°",
      correct: "A",
      explanation: "The horizontal range is given by R = (u² sin 2θ) / g. The range is maximized when sin(2θ) reaches its maximum value of 1, which occurs when 2θ = 90°, meaning θ = 45°."
    }
  },
  {
    subject: "Intermediate Chemistry",
    topic: "Inorganic & Physical Chemistry",
    concept: "Chemical Bonding & Hybridization",
    keywords: ["hybridization", "chemical bonding", "sp3", "sp2", "sp", "vsepr", "sigma bond", "pi bond", "covalent bond"],
    plainEnglish: "In Intermediate Chemistry, **Hybridization** is the concept of intermixing atomic orbitals of slightly different energies to produce a new set of equivalent orbitals (hybrid orbitals) with identical energies, shapes, and directional orientations in space.",
    analogy: "Think of mixing 1 cup of blue paint (s-orbital) and 3 cups of yellow paint (p-orbitals). You get 4 cups of uniform green paint! That is exactly how an atom creates 4 equivalent $sp^3$ hybrid orbitals.",
    howItWorks: [
      "**1. $sp^3$ Hybridization**: 1 s + 3 p orbitals mix to form 4 hybrid orbitals. Geometry: **Tetrahedral**, bond angle $109.5^\\\\circ$ (e.g., $CH_4$).",
      "**2. $sp^2$ Hybridization**: 1 s + 2 p orbitals mix to form 3 hybrid orbitals. Geometry: **Trigonal Planar**, bond angle $120^\\\\circ$ (e.g., $BF_3$, Ethene $C_2H_4$).",
      "**3. $sp$ Hybridization**: 1 s + 1 p orbital mix to form 2 hybrid orbitals. Geometry: **Linear**, bond angle $180^\\\\circ$ (e.g., $BeCl_2$, Ethyne $C_2H_2$).",
      "**4. Lone Pair Repulsion**: According to VSEPR theory: Lone Pair - Lone Pair > Lone Pair - Bond Pair > Bond Pair - Bond Pair. This explains why water ($H_2O$) has an angular bent shape ($104.5^\\\\circ$) despite $sp^3$ hybridization."
    ],
    realWorldExample: "The hardness of Diamond (where each carbon is $sp^3$ hybridized in a rigid 3D lattice) versus the electrical conductivity of Graphite (where carbons are $sp^2$ hybridized in planar sheets with delocalized $\\\\pi$ electrons) is purely dictated by hybridization!",
    keyTakeaways: [
      "Steric Number formula: $\\\\text{Steric Number} = (\\\\text{Number of } \\\\sigma \\\\text{ bonds}) + (\\\\text{Number of lone pairs on central atom})$.",
      "Steric Number 2 = $sp$, 3 = $sp^2$, 4 = $sp^3$, 5 = $sp^3d$, 6 = $sp^3d^2$.",
      "Multiple bonds contain $1 \\\\sigma$ bond and the rest are $\\\\pi$ bonds."
    ],
    mcq: {
      question: "What is the hybridization and molecular geometry of methane (CH4)?",
      a: "sp³ hybridization with tetrahedral geometry",
      b: "sp² hybridization with trigonal planar geometry",
      c: "sp hybridization with linear geometry",
      d: "sp³d hybridization with trigonal bipyramidal geometry",
      correct: "A",
      explanation: "In methane (CH4), the carbon atom forms 4 single sigma bonds with hydrogen and has zero lone pairs (steric number = 4). Thus it undergoes sp³ hybridization with a tetrahedral shape and bond angle of 109.5°."
    }
  },
  {
    subject: "Intermediate Chemistry",
    topic: "Physical Chemistry",
    concept: "Chemical Equilibrium & Le Chatelier's Principle",
    keywords: ["chemical equilibrium", "le chatelier", "equilibrium constant", "kc", "kp", "reversible reaction"],
    plainEnglish: "In Intermediate Chemistry, **Chemical Equilibrium** is a dynamic state in a reversible reaction where the rate of the forward reaction equals the rate of the backward reaction, so concentrations of reactants and products remain constant over time.",
    analogy: "Imagine walking up a downward-moving escalator at the exact same speed that the stairs move down. To an observer, you appear motionless in one spot, but both you and the escalator are actively moving! That is dynamic equilibrium.",
    howItWorks: [
      "**1. Equilibrium Constant ($K_c$ and $K_p$)**: For $aA + bB \\\\rightleftharpoons cC + dD$, $K_c = \\\\frac{[C]^c [D]^d}{[A]^a [B]^b}$. $K_p = K_c (RT)^{\\\\Delta n_g}$.",
      "**2. Le Chatelier's Principle**: If a system at equilibrium is subjected to a change in concentration, pressure, or temperature, the equilibrium shifts in the direction that tends to counteract the change.",
      "**3. Effect of Pressure**: Increasing pressure shifts equilibrium toward the side with **fewer moles of gas**.",
      "**4. Effect of Temperature**: For an exothermic reaction ($\\\\Delta H < 0$), increasing temperature shifts equilibrium to the left (backward). For endothermic ($\\\\Delta H > 0$), it shifts forward."
    ],
    realWorldExample: "In the industrial Haber process for ammonia synthesis ($N_2 + 3H_2 \\\\rightleftharpoons 2NH_3, \\\\Delta H = -92 \\\\text{ kJ/mol}$), applying high pressure (200 atm) shifts the equilibrium toward ammonia ($2$ moles vs $4$ moles) to maximize yield!",
    keyTakeaways: [
      "Catalysts do NOT change the equilibrium constant $K_c$ or position of equilibrium; they only help reach equilibrium faster by lowering activation energy.",
      "Temperature is the ONLY factor that changes the numerical value of the equilibrium constant $K$.",
      "Very high weightage in Intermediate Physical Chemistry (AP/TS Inter 1st year & CBSE 11)."
    ],
    mcq: {
      question: "According to Le Chatelier's principle, what effect does increasing the pressure have on the gaseous equilibrium: N2(g) + 3H2(g) ⇌ 2NH3(g)?",
      a: "Shifts the equilibrium forward toward NH3 (fewer gas moles)",
      b: "Shifts the equilibrium backward toward N2 and H2",
      c: "Has no effect because pressure does not affect gases",
      d: "Decreases the value of the equilibrium constant Kc",
      correct: "A",
      explanation: "The forward reaction has 2 moles of gas while the reactant side has 1 + 3 = 4 moles of gas. Increasing pressure favors the side with fewer moles of gas to relieve the pressure, thus shifting equilibrium forward toward NH3."
    }
  }
];

function findKnowledgeBaseEntry(
  query: string,
  educationLevel?: string,
  streamBranch?: string
): ConceptMasteryEntry | null {
  const q = query.toLowerCase();
  const isInter = educationLevel === "Intermediate";
  const isMPC = !streamBranch || streamBranch.toUpperCase().includes("MPC");
  const isSchool = educationLevel === "School";

  // Check if query is explicitly asking about computer coding
  const isExplicitCodingQuery = q.includes("python") ||
    q.includes("javascript") ||
    q.includes("c++") ||
    q.includes("java code") ||
    q.includes("sql query") ||
    q.includes("write code");

  for (const entry of ACADEMIC_KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      // If student is Intermediate MPC or School, avoid pure university CSE entries unless explicitly requested
      const isCSEEntry = entry.subject.includes("Theory of Computation") ||
        entry.subject.includes("Operating Systems") ||
        entry.subject.includes("Database Management") ||
        entry.subject.includes("Compiler") ||
        entry.subject.includes("Computer Networks") ||
        (entry.subject.includes("Data Structures") && !q.includes("algorithm"));

      if ((isInter || isSchool) && isCSEEntry && !isExplicitCodingQuery) {
        continue;
      }

      // If Intermediate MPC student, prioritize Intermediate MPC entries
      if (isInter && isMPC && !entry.subject.includes("Intermediate") && !isExplicitCodingQuery) {
        // Look ahead for an Intermediate entry first
        const betterMatch = ACADEMIC_KNOWLEDGE_BASE.find(
          (e) => e.subject.includes("Intermediate") && e.keywords.some((kw) => q.includes(kw.toLowerCase()))
        );
        if (betterMatch) return betterMatch;
      }

      return entry;
    }
  }
  return null;
}

// ============================================================================
// CONVERSATIONAL & CHATGPT-STYLE SYNTHESIZER FOR ANY TOPIC
// ============================================================================

function isGreetingOrChitchat(query: string): boolean {
  return isConversationalQuery(query);
}

function handleConversationalResponse(
  query: string,
  educationLevel: string = "Intermediate",
  streamBranch: string = "MPC"
): string {
  const intent = analyzeStudentIntent(query, educationLevel, streamBranch);
  return formatTailoredExplanation(intent, educationLevel, streamBranch);
}

// Friendly Dynamic Synthesizer for ANY concept across all domains
function synthesizeFriendlyExplanation(
  question: string,
  subject: string,
  topic: string,
  concept: string,
  educationLevel?: string,
  streamBranch?: string
): ExplanationResult {
  const qLower = question.toLowerCase();

  // 0. Fast conversational or identity query handling
  if (isConversationalQuery(question) || isConversationalQuery(concept) || isGreetingOrChitchat(question)) {
    return {
      explanation: handleConversationalResponse(question, educationLevel, streamBranch),
      detected_subject: "LearnX Academic Assistant",
      detected_topic: "Conversational & Assistance",
      detected_concept: "LearnX Assistant",
      validation_passed: true,
      is_conversational: true,
      validation_notes: "Handled conversational inquiry."
    };
  }

  // 1. Specialized friendly handling for Study Skills & Productivity
  if (qLower.includes("study") && (qLower.includes("how") || qLower.includes("tip") || qLower.includes("stress") || qLower.includes("procrastinat") || qLower.includes("focus"))) {
    const tipsMarkdown = `Hey! Studying effectively isn't about sitting at a desk for 10 hours—it's about studying **smartly** so concepts stick in your long-term memory. Here is a friendly, proven framework used by top students:

---

### 🧠 1. The Feynman Technique (The Ultimate Clarity Test)
1. Pick any concept you're learning.
2. Pretend you are explaining it out loud to a 10-year-old using simple words and no jargon.
3. Whenever you hesitate or use a complicated word to hide confusion, stop! Go back to your notes and clarify that exact gap.
*If you can't explain it simply, you don't understand it yet!*

---

### 🔄 2. Active Recall over Passive Reading
- **The Trap**: Highlighting textbooks or re-reading slides feels productive, but research shows it only creates an illusion of competence.
- **The Fix**: Close your book after reading a section, grab a blank piece of paper, and write down or draw everything you remember from scratch. Testing yourself is 3x more effective!

---

### ⏳ 3. The Pomodoro 25/5 Method
- Put your phone in another room or on Do Not Disturb.
- Set a timer for **25 minutes of 100% focused study**.
- Take a **5-minute physical break** (walk, drink water, stretch—don't open social media).
- Repeat 4 cycles, then take a longer 20-minute break.

---

### 🎯 4. Target the High-Yield 20%
In almost every syllabus or exam, 20% of the core principles account for 80% of exam questions. Master the definitions, primary formulas, and fundamental proofs first before worrying about obscure edge cases.

Give one of these a try right now! What specific subject or topic are you working on today? Let's break it down together!`;

    return {
      explanation: tipsMarkdown,
      detected_subject: "Study Strategies & Productivity",
      detected_topic: "Effective Learning",
      detected_concept: "Smart Study Techniques",
      validation_passed: true,
      is_conversational: true,
      validation_notes: "Friendly pedagogical study guide."
    };
  }

  // 2. Python / Coding Queries
  if (qLower.includes("reverse a string") || (qLower.includes("code") && qLower.includes("reverse"))) {
    const codeMarkdown = `Hey! Reversing a string is a classic coding question. Let's look at the cleanest ways to do it!

---

### 💡 1. The Idiomatic Way in Python (Slice Notation)
In Python, the fastest and most elegant way is using slice step \`[::-1]\`:

\`\`\`python
def reverse_string(s: str) -> str:
    # Slicing with a step of -1 traverses backwards
    return s[::-1]

# Example:
text = "LearnX"
print(reverse_string(text))  # Output: "XnraeL"
\`\`\`
- **Time Complexity**: $O(n)$ where $n$ is the length of the string.
- **Space Complexity**: $O(n)$ to store the new reversed string (since Python strings are immutable).

---

### ⚙️ 2. The Algorithmic Two-Pointer Approach (Great for Interviews!)
If an interviewer asks you to reverse in-place or without built-in slicing:

\`\`\`python
def reverse_two_pointers(s: str) -> str:
    # Convert string to list of characters because strings in Python cannot be mutated
    chars = list(s)
    left, right = 0, len(chars) - 1
    
    while left < right:
        # Swap characters at the edges
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
        
    return "".join(chars)
\`\`\`

---

### 🎓 Key Takeaway
- Slicing \`s[::-1]\` is standard, clean, and optimized in C underneath Python.
- The two-pointer approach demonstrates your algorithmic understanding of swap operations and pointer arithmetic!

Want to see how to do this in JavaScript, C++, or Java too? Just let me know!`;

    return {
      explanation: codeMarkdown,
      detected_subject: "Computer Science & Programming",
      detected_topic: "String Manipulation & Algorithms",
      detected_concept: "Reversing a String",
      validation_passed: true,
      validation_notes: "Friendly coding walkthrough."
    };
  }

  // 3. Dynamic Friendly Conceptual Explanation for any Academic Topic
  const cleanConcept = concept.replace(/[?!.]+$/, "").trim();
  const isInter = educationLevel === "Intermediate" || subject.includes("Intermediate");
  const isMPC = isInter && (!streamBranch || streamBranch.toUpperCase().includes("MPC"));
  const isBiPC = isInter && (streamBranch && streamBranch.toUpperCase().includes("BIPC"));
  const isSchool = educationLevel === "School" || subject.includes("School");
  const isDegree = educationLevel === "Degree" || subject.includes("Degree") || subject.includes("Commerce");

  // Tailor intuitive analogy and intuition based on detected domain and student level
  let plainEnglish = `**${cleanConcept}** is a foundational idea in **${subject}** (${topic}). At its core, it gives us a clear, reliable way to understand how systems behave, solve problems, and make decisions without guessing.`;
  let analogy = `Think of it like learning the rules of chess: once you know how the pieces move and interact, complex strategies start making total sense. **${cleanConcept}** provides that exact rulebook in **${topic}**!`;
  let mechanics = [
    `**Core Goal**: Solves a specific challenge in ${subject} by establishing clear, predictable rules.`,
    `**Step-by-step logic**: Takes input information, applies the governing principles of ${topic}, and produces an accurate, verifiable result.`,
    `**Practical Trade-off**: Balances simplicity, efficiency, and real-world constraints.`
  ];
  let realWorld = `In modern science and engineering, **${cleanConcept}** is used to build reliable systems, model nature, or solve analytical problems in coursework and industry.`;
  let takeaways = [
    `Always start with the core definition before diving into complex equations or edge cases.`,
    `Focus on *why* this concept was created—it almost always solves an efficiency, accuracy, or organization problem!`,
    `Remember its connection to the parent topic **${topic}** when answering exam questions.`
  ];

  if (isMPC || subject.includes("Intermediate Mathematics") || subject.includes("Intermediate Physics") || subject.includes("Intermediate Chemistry")) {
    plainEnglish = `In Intermediate (+2 / Class 11-12) **${subject}**, **${cleanConcept}** is a cornerstone topic. It establishes the mathematical, physical, or chemical framework that governs physical systems and gives you exact formulas and derivations to solve problems in your Intermediate Board exams and entrance tests like JEE Main and EAMCET.`;
    analogy = `Imagine building a sturdy multi-story building: you can't construct the upper floors without pouring a deep, reinforced concrete foundation. Master **${cleanConcept}**, and the entire chapter in **${topic}** becomes intuitive and easy to solve!`;
    mechanics = [
      `**Standard Board Definition & Governing Laws**: Formulated according to the Senior Secondary / Intermediate curriculum.`,
      `**Step-by-step Derivation & Method**: Apply the standard mathematical formulas, physical conservation laws, or reaction mechanisms methodically.`,
      `**Sign Conventions & Units**: Always verify SI units and positive/negative directional conventions.`
    ];
    realWorld = `Aerospace engineers, chemical plant designers, physicists, and structural engineers directly apply these Intermediate MPC principles when designing satellites, calculating trajectories, formulating compounds, and building infrastructure.`;
    takeaways = [
      `Write out the standard Intermediate Board formula clearly with labeled parameters for full step marks.`,
      `Double check your calculations and units (e.g., Joules, Newtons, radians, moles).`,
      `High-weightage topic in Intermediate 1st & 2nd Year Board exams (AP / TS / CBSE) and JEE / EAMCET!`
    ];
  } else if (isBiPC || subject.includes("Intermediate Biology")) {
    plainEnglish = `In Intermediate (+2 / Class 11-12) **${subject}**, **${cleanConcept}** is an essential biological concept explaining how living organisms, cellular structures, and biochemical processes function and maintain balance.`;
    analogy = `Think of the human body or a plant like a masterfully orchestrated city: each organelle, cell, and organ has a specialized department that keeps the whole organism thriving!`;
    mechanics = [
      `**Biological Definition & Structure**: Anatomical or cellular components involved.`,
      `**Physiological Process**: How the biochemical reactions or physical movements unfold step by step.`,
      `**Significance & Adaptations**: Why this process is crucial for survival and evolution.`
    ];
    realWorld = `Doctors, geneticists, agricultural scientists, and pharmaceutical researchers apply these exact biological mechanisms to develop life-saving medicines and improve crops.`;
    takeaways = [
      `Practice drawing neat, labeled diagrams for Board exam descriptive questions.`,
      `Remember scientific names and terminology for NEET objective questions.`,
      `Review key functions and regulatory feedback mechanisms.`
    ];
  } else if (isSchool) {
    plainEnglish = `In school studies, **${cleanConcept}** is an exciting and essential building block in **${subject}**. It helps us solve everyday math puzzles, understand the nature around us, and express thoughts clearly!`;
    analogy = `Think of it like building with LEGO blocks: every big castle starts with simple, colorful bricks. Master **${cleanConcept}**, and the rest of the puzzle clicks together with ease!`;
    mechanics = [
      `**Observation & Rule**: Look at the given values or description carefully.`,
      `**Step-by-step Solution**: Apply the basic formula or definition one step at a time.`,
      `**Double Check**: Look at your final answer to see if it makes common sense!`
    ];
    realWorld = `From calculating change at a grocery shop, measuring room sizes, to understanding how seasons change, **${cleanConcept}** is active all around us every single day.`;
    takeaways = [
      `Remember the golden formula or main definition.`,
      `Always write units (e.g. meters, rupees, seconds) in your answers.`,
      `Practice with 2-3 simple textbook examples before the test.`
    ];
  } else if (isDegree || subject.includes("Commerce") || subject.includes("Business") || subject.includes("Accounting") || subject.includes("Economics")) {
    plainEnglish = `In Degree & Commerce studies, **${cleanConcept}** is a core principle used by organizations and financial analysts to track value, make smart investments, and guide strategic decisions.`;
    analogy = `Think of a household budget book: if you track where every rupee enters and exits, you can save money, avoid debt, and plan for future goals. **${cleanConcept}** does that for entire companies!`;
    mechanics = [
      `**Recognition & Classification**: Categorize the transaction or business event accurately.`,
      `**Ledger / Analytical Processing**: Apply standard accounting standards or management frameworks.`,
      `**Reporting & Decision-Making**: Summarize into financial statements that executives and investors can rely on.`
    ];
    realWorld = `Every startup, global corporation, and local business uses these exact practices to manage revenue, pay taxes, and grow sustainably.`;
    takeaways = [
      `Always keep the Golden Rules of Accounting or core managerial principles in mind.`,
      `Verify Debit equals Credit or check balance sheet equilibrium.`,
      `Explain both qualitative impact on customers and quantitative impact on profit.`
    ];
  } else if (subject.includes("Theory") || subject.includes("Compiler") || topic.includes("Automata") || topic.includes("Grammar")) {
    plainEnglish = `In **Theory of Computation**, **${cleanConcept}** is a formal model used to define languages, model computation, or design how compilers understand source code.`;
    analogy = `Think of it like a translator: a compiler needs to take the code you type and break it down mathematically so the machine knows exactly what you meant, with zero ambiguity!`;
    mechanics = [
      `**Formal Specification**: Defines exact alphabet symbols, states, or production rules.`,
      `**Deterministic vs Non-Deterministic**: Specifies whether each step has one unique path or multiple branches.`,
      `**Expressive Power**: Located within the Chomsky Hierarchy to determine what problems it can solve.`
    ];
    realWorld = `Every programming language compiler (Python, GCC, Clang, Rust) uses these formal automata and grammar principles in its lexical analyzer and parser!`;
    takeaways = [
      `Identify the Chomsky hierarchy level (Type-0 to Type-3).`,
      `Remember which machine recognizes it (Finite Automata, PDA, or Turing Machine).`,
      `Check key closure properties (Union, Concatenation, Star).`
    ];
  } else if (subject.includes("Operating") || topic.includes("Process") || topic.includes("Scheduling")) {
    plainEnglish = `In **Operating Systems**, **${cleanConcept}** is all about resource management—how the OS coordinates the CPU, memory, and devices so multiple programs run smoothly together.`;
    analogy = `Think of the OS like an air traffic controller: it manages who gets runway time (CPU), who waits in holding patterns (ready queue), and prevents collisions (deadlocks)!`;
    mechanics = [
      `**Resource Sharing**: Coordinates CPU time and memory space among competing processes.`,
      `**Fairness & Latency**: Ensures responsive user interactions while preventing starvation.`,
      `**Protection**: Prevents one buggy program from crashing other programs or the OS kernel.`
    ];
    realWorld = `Your laptop and smartphone rely on these exact operating system mechanisms every second to run your browser, music player, and games simultaneously!`;
    takeaways = [
      `Note whether the mechanism is preemptive or non-preemptive.`,
      `State the trade-offs in throughput, turnaround time, and context-switching overhead.`,
      `Pay attention to concurrency edge cases like race conditions.`
    ];
  } else if (subject.includes("Database") || topic.includes("SQL") || topic.includes("Relational")) {
    plainEnglish = `In **Database Systems**, **${cleanConcept}** ensures that data is stored cleanly, fetched quickly, and remains 100% accurate even if the server suddenly loses power.`;
    analogy = `Think of a database like a digital filing cabinet: if you file documents randomly, finding anything takes hours. **${cleanConcept}** provides the organized filing system and lock on the drawer!`;
    mechanics = [
      `**Data Integrity**: Enforces relationships and rules so corrupt or incomplete data cannot enter.`,
      `**Efficient Retrieval**: Minimizes disk reads so queries return in milliseconds.`,
      `**ACID Compliance**: Guarantees transactions either finish completely or roll back safely.`
    ];
    realWorld = `Banks, e-commerce stores, and social networks rely on these database principles to process millions of transactions without losing a single record!`;
    takeaways = [
      `Identify the primary key, foreign key, or normal form constraints.`,
      `Explain how it eliminates redundancy and anomalies.`,
      `Mention the trade-off between read speed and write performance.`
    ];
  } else if (subject.includes("Data Structures") || subject.includes("Algorithm")) {
    plainEnglish = `In **Data Structures & Algorithms**, **${cleanConcept}** is a smart tool to organize data or solve a computational problem in minimum time and memory.`;
    analogy = `Think of choosing the right tool for the job: you wouldn't use a sledgehammer to hang a small picture frame. Choosing the right algorithm or data structure makes your software run thousands of times faster!`;
    mechanics = [
      `**Data Organization**: Structures elements in memory for optimal access.`,
      `**Step-by-step Transformation**: Follows a deterministic sequence of operations from input to output.`,
      `**Complexity Analysis**: Analyzes time and memory usage as the input size $n$ grows.`
    ];
    realWorld = `Google Search, GPS navigation (Google Maps), and video streaming platforms all depend on optimized algorithms and data structures to serve billions of users instantly!`;
    takeaways = [
      `State the Best, Average, and Worst-case Time Complexity in Big-O notation.`,
      `State the Space Complexity (memory required).`,
      `Identify edge cases (e.g. empty inputs, duplicates, already-sorted data).`
    ];
  }

  const realWorldHeading = (isInter || isSchool) ? "🔬 Real-World Application in Science & Engineering" : "💻 Where You See It in Real Life";
  const takeawaysHeading = (isMPC) 
    ? "🎓 Key Takeaways for Intermediate Board Exams (AP/TS/CBSE) & JEE / EAMCET" 
    : (isInter) 
    ? "🎓 Key Takeaways for Intermediate Board Exams & Competitive Tests" 
    : (isSchool) 
    ? "🎓 Key Takeaways for School Exams & Tests" 
    : "🎓 Key Takeaways for Exams & Interviews";

  const explanation = `Hey! Let's break down **${cleanConcept}** in a simple, friendly, and intuitive way.

---

### 💡 What is it in plain English?
${plainEnglish}

---

### 🔍 Simple Real-World Analogy
${analogy}

---

### ⚙️ How It Works (Step-by-Step)
${mechanics.map((m) => `- ${m}`).join("\n")}

---

### ${realWorldHeading}
${realWorld}

---

### ${takeawaysHeading}
${takeaways.map((t) => `- ${t}`).join("\n")}

Hope that makes it super clear! Let me know if you want to explore any part of this deeper or solve a practice problem together!`;

  return {
    explanation,
    detected_subject: subject,
    detected_topic: topic,
    detected_concept: cleanConcept,
    validation_passed: true,
    validation_notes: "Friendly academic synthesis."
  };
}

// ============================================================================
// STEP 1-5: SMART QUESTION UNDERSTANDING & CLASSIFICATION
// ============================================================================

export async function analyzeQuestion(
  question: string,
  educationLevel?: string,
  streamBranch?: string,
  context?: ConversationContext
): Promise<QuestionAnalysis> {
  const clean = question.trim();

  // 1. High-Speed Intent & Context Detection (tolerates typos, Telugu/English, strips greetings)
  const intentResult = analyzeStudentIntent(
    clean,
    educationLevel || "Intermediate",
    streamBranch || "MPC",
    context
  );

  // If pure greeting or conversational chitchat, return immediately (<2ms)
  if (intentResult.is_conversational) {
    return {
      is_unclear: false,
      is_conversational: true,
      detected_subject: intentResult.detected_subject,
      detected_topic: intentResult.detected_topic,
      detected_concept: intentResult.detected_concept,
      technical_terms: [],
      intent: intentResult.intent,
      cleaned_query: intentResult.cleaned_query,
      raw_input: clean
    };
  }

  // Basic sanity check for gibberish (only if totally unparseable symbols)
  if (clean.length < 2 || (/^[^\w\s]+$/.test(clean) && !clean.includes("?"))) {
    return {
      is_unclear: true,
      clarification_question: "Could you please specify your question in a bit more detail? (For example: 'Explain Newton's Laws of Motion' or 'What is Cramer's Rule?')",
      detected_subject: "General",
      detected_topic: "General Topic",
      detected_concept: clean,
      technical_terms: [],
      intent: "UNKNOWN",
      cleaned_query: clean,
      raw_input: clean
    };
  }

  // Check Knowledge Base directly with level & stream filtering (using cleaned query or raw query)
  const kbMatch =
    findKnowledgeBaseEntry(intentResult.cleaned_query, educationLevel, streamBranch) ||
    findKnowledgeBaseEntry(clean, educationLevel, streamBranch) ||
    findKnowledgeBaseEntry(intentResult.detected_concept, educationLevel, streamBranch);

  if (kbMatch) {
    return {
      is_unclear: false,
      detected_subject: kbMatch.subject,
      detected_topic: kbMatch.topic,
      detected_concept: kbMatch.concept,
      technical_terms: [kbMatch.concept, ...kbMatch.keywords.slice(0, 3)],
      intent: intentResult.intent,
      cleaned_query: intentResult.cleaned_query,
      raw_input: clean
    };
  }

  const qLower = clean.toLowerCase();

  // Clean concept name
  let concept = clean
    .replace(/^(what is|what are|explain|how does|define|tell me about|how to implement|why is|difference between|how do i|can you explain)\s+/i, "")
    .replace(/[?!.]+$/, "")
    .trim();

  if (concept.length > 0) {
    concept = concept.charAt(0).toUpperCase() + concept.slice(1);
  }

  // ==========================================================================
  // STREAM & GRADE-AWARE CLASSIFICATION ENGINE
  // ==========================================================================
  const isInter = educationLevel === "Intermediate";
  const isInterMPC = isInter && (!streamBranch || streamBranch.toUpperCase().includes("MPC"));
  const isInterBiPC = isInter && (streamBranch && streamBranch.toUpperCase().includes("BIPC"));
  const isSchool = educationLevel === "School";
  const isDegree = educationLevel === "Degree";
  const isBTech = educationLevel === "B.Tech";

  let subject = "Academic Studies";
  let topic = "General Core Syllabus";

  // Check if student asked explicitly for programming / code
  const isExplicitProgramming = qLower.includes("python") ||
    qLower.includes("javascript") ||
    qLower.includes("c++") ||
    qLower.includes("java code") ||
    qLower.includes("write a program") ||
    qLower.includes("coding question") ||
    qLower.includes("sql query");

  // 1. INTERMEDIATE MPC (Mathematics, Physics, Chemistry)
  if (isInterMPC && !isExplicitProgramming) {
    // Check Chemistry keywords
    const isChemistry = qLower.includes("chem") || qLower.includes("atom") || qLower.includes("periodic") ||
      qLower.includes("mole") || qLower.includes("reaction") || qLower.includes("acid") || qLower.includes("base") ||
      qLower.includes("salt") || qLower.includes("equilibrium") || qLower.includes("redox") || qLower.includes("bond") ||
      qLower.includes("orbital") || qLower.includes("electron") || qLower.includes("hybrid") || qLower.includes("enthalpy") ||
      qLower.includes("entropy") || qLower.includes("thermodynamic") || qLower.includes("gas") || qLower.includes("molarity") ||
      qLower.includes("organic") || qLower.includes("alkane") || qLower.includes("alkene") || qLower.includes("benzene") ||
      qLower.includes("alcohol") || qLower.includes("aldehyde") || qLower.includes("ketone") || qLower.includes("amine") ||
      qLower.includes("le chatelier") || qLower.includes("vsepr") || qLower.includes("ph ");

    // Check Physics keywords
    const isPhysics = qLower.includes("physic") || qLower.includes("force") || qLower.includes("motion") ||
      qLower.includes("velocity") || qLower.includes("acceleration") || qLower.includes("gravity") || qLower.includes("newton") ||
      qLower.includes("friction") || qLower.includes("momentum") || qLower.includes("work") || qLower.includes("energy") ||
      qLower.includes("power") || qLower.includes("torque") || qLower.includes("wave") || qLower.includes("sound") ||
      qLower.includes("light") || qLower.includes("optics") || qLower.includes("lens") || qLower.includes("mirror") ||
      qLower.includes("refraction") || qLower.includes("reflection") || qLower.includes("charge") || qLower.includes("coulomb") ||
      qLower.includes("current") || qLower.includes("ohm") || qLower.includes("kirchhoff") || qLower.includes("magnetic") ||
      qLower.includes("induction") || qLower.includes("projectile") || qLower.includes("shm") || qLower.includes("capacitor");

    // Check Mathematics keywords
    const isMath = qLower.includes("math") || qLower.includes("function") || qLower.includes("matrix") ||
      qLower.includes("determinant") || qLower.includes("algebra") || qLower.includes("quadratic") || qLower.includes("trigonometr") ||
      qLower.includes("sin") || qLower.includes("cos") || qLower.includes("tan") || qLower.includes("circle") ||
      qLower.includes("parabola") || qLower.includes("ellipse") || qLower.includes("hyperbola") || qLower.includes("vector") ||
      qLower.includes("calculus") || qLower.includes("limit") || qLower.includes("derivative") || qLower.includes("differentiation") ||
      qLower.includes("integral") || qLower.includes("integration") || qLower.includes("probability") || qLower.includes("cramer");

    if (isChemistry) {
      subject = "Intermediate Chemistry";
      topic = qLower.includes("organic") || qLower.includes("alkane") || qLower.includes("benzene")
        ? "Organic Chemistry (Senior Secondary)"
        : qLower.includes("hybrid") || qLower.includes("bond") || qLower.includes("periodic")
        ? "Inorganic Chemistry (Class 11/12)"
        : "Physical Chemistry (Class 11/12)";
    } else if (isPhysics) {
      subject = "Intermediate Physics";
      topic = qLower.includes("optics") || qLower.includes("lens") || qLower.includes("light")
        ? "Ray & Wave Optics"
        : qLower.includes("current") || qLower.includes("ohm") || qLower.includes("charge") || qLower.includes("magnetic")
        ? "Electricity & Magnetism"
        : qLower.includes("projectile") || qLower.includes("newton") || qLower.includes("motion")
        ? "Kinematics & Dynamics"
        : "Senior Secondary Physics";
    } else if (isMath) {
      subject = "Intermediate Mathematics";
      topic = qLower.includes("derivative") || qLower.includes("integral") || qLower.includes("calculus") || qLower.includes("limit")
        ? "Calculus (Senior Secondary)"
        : qLower.includes("matrix") || qLower.includes("determinant") || qLower.includes("cramer")
        ? "Matrices & Linear Algebra"
        : qLower.includes("trig") || qLower.includes("sin") || qLower.includes("cos")
        ? "Trigonometry & Identities"
        : "Senior Secondary Mathematics";
    } else {
      // Default for Intermediate MPC: Never CSE!
      subject = "Intermediate Mathematics, Physics & Chemistry (MPC)";
      topic = "Class 11 & 12 Senior Secondary Syllabus";
    }
  } else if (isInterBiPC && !isExplicitProgramming) {
    // 2. INTERMEDIATE BiPC (Biology, Physics, Chemistry)
    const isBio = qLower.includes("cell") || qLower.includes("dna") || qLower.includes("botany") ||
      qLower.includes("zoology") || qLower.includes("organ") || qLower.includes("photosynthesis") ||
      qLower.includes("respiration") || qLower.includes("genetics") || qLower.includes("tissue");

    if (isBio) {
      subject = "Intermediate Biology";
      topic = qLower.includes("plant") || qLower.includes("botany") || qLower.includes("photosynthesis")
        ? "Botany (Senior Secondary)"
        : "Zoology & Human Physiology";
    } else if (qLower.includes("chem") || qLower.includes("reaction") || qLower.includes("acid")) {
      subject = "Intermediate Chemistry";
      topic = "Senior Secondary Chemistry";
    } else {
      subject = "Intermediate Physics";
      topic = "Senior Secondary Physics";
    }
  } else if (isSchool && !isExplicitProgramming) {
    // 3. SCHOOL LEVEL
    const classStr = streamBranch || "Secondary";
    if (qLower.includes("math") || qLower.includes("fraction") || qLower.includes("geometry") || qLower.includes("triangle") || qLower.includes("number")) {
      subject = "School Mathematics";
      topic = `Mathematics (Class ${classStr})`;
    } else if (qLower.includes("science") || qLower.includes("plant") || qLower.includes("force") || qLower.includes("light") || qLower.includes("water")) {
      subject = "School Science";
      topic = `General Science (Class ${classStr})`;
    } else {
      subject = "School Academic Studies";
      topic = `Curriculum (Class ${classStr})`;
    }
  } else if (isDegree && !isExplicitProgramming) {
    // 4. DEGREE (B.Com, B.Sc, BCA, BBA)
    const spec = streamBranch || "General";
    if (spec.toLowerCase().includes("b.com") || qLower.includes("accounting") || qLower.includes("finance") || qLower.includes("debit") || qLower.includes("tax")) {
      subject = "Commerce & Accounting";
      topic = "Financial Accounting & Business Studies";
    } else if (spec.toLowerCase().includes("b.sc") || qLower.includes("physics") || qLower.includes("chemistry")) {
      subject = "B.Sc Science Fundamentals";
      topic = spec;
    } else {
      subject = `Degree (${spec})`;
      topic = "Degree Core Curriculum";
    }
  } else if (isBTech && streamBranch && !streamBranch.toLowerCase().includes("cse") && !isExplicitProgramming) {
    // 5. B.TECH NON-CSE (Mechanical, Civil, EEE, ECE, Chemical)
    subject = streamBranch;
    topic = "Engineering Core Fundamentals";
  } else {
    // 6. COMPUTER SCIENCE & ENGINEERING / GENERAL ACADEMIC (Only if B.Tech CSE, explicit coding, or CSE keywords)
    subject = "Computer Science & Engineering";
    topic = "Core Principles";

    if (qLower.includes("grammar") || qLower.includes("cfg") || qLower.includes("context free") || qLower.includes("automata") || qLower.includes("automaton") || qLower.includes("dfa") || qLower.includes("nfa") || qLower.includes("pda") || qLower.includes("pushdown") || qLower.includes("turing") || qLower.includes("chomsky") || qLower.includes("compiler") || qLower.includes("parser") || qLower.includes("parsing") || qLower.includes("lexer") || qLower.includes("regular expression")) {
      subject = "Theory of Computation & Compiler Design";
      topic = (qLower.includes("compiler") || qLower.includes("parser") || qLower.includes("parsing") || qLower.includes("lexer")) ? "Compiler Design & Syntax Analysis" : "Formal Languages & Automata";
      if (qLower.includes("context free") || qLower.includes("cfg") || qLower.includes("grammar")) {
        concept = "Context-Free Grammar (CFG)";
      } else if (qLower.includes("dfa") || qLower.includes("nfa") || qLower.includes("finite automata")) {
        concept = "DFA vs NFA";
      } else if (qLower.includes("pda") || qLower.includes("pushdown")) {
        concept = "Pushdown Automata (PDA)";
      } else if (qLower.includes("turing")) {
        concept = "Turing Machines";
      }
    } else if (qLower.includes("search") || qLower.includes("sort") || qLower.includes("tree") || qLower.includes("graph") || qLower.includes("linked list") || qLower.includes("stack") || qLower.includes("queue") || qLower.includes("algorithm") || qLower.includes("dynamic programming") || qLower.includes("dijkstra")) {
      subject = "Data Structures & Algorithms";
      topic = qLower.includes("search") ? "Searching Algorithms" : qLower.includes("sort") ? "Sorting Algorithms" : "Core Data Structures";
    } else if (qLower.includes("process") || qLower.includes("thread") || qLower.includes("deadlock") || qLower.includes("memory") || qLower.includes("paging") || qLower.includes("os") || qLower.includes("scheduling") || qLower.includes("round robin") || qLower.includes("semaphore")) {
      subject = "Operating Systems";
      topic = qLower.includes("scheduling") || qLower.includes("round robin") ? "CPU Scheduling" : qLower.includes("deadlock") ? "Concurrency & Deadlocks" : "System Concurrency & Management";
      if (qLower.includes("round robin")) concept = "Round Robin Scheduling";
      if (qLower.includes("deadlock")) concept = "Deadlock & Prevention";
    } else if (qLower.includes("sql") || qLower.includes("database") || qLower.includes("table") || qLower.includes("acid") || qLower.includes("transaction") || qLower.includes("normalization") || qLower.includes("1nf") || qLower.includes("2nf") || qLower.includes("3nf") || qLower.includes("bcnf")) {
      subject = "Database Management Systems";
      topic = qLower.includes("normalization") || qLower.includes("1nf") || qLower.includes("2nf") || qLower.includes("3nf") || qLower.includes("bcnf") ? "Relational Database Design" : "Relational Databases & Architecture";
      if (qLower.includes("normalization") || qLower.includes("1nf") || qLower.includes("2nf") || qLower.includes("3nf") || qLower.includes("bcnf")) {
        concept = "Database Normalization (1NF, 2NF, 3NF, BCNF)";
      }
    } else if (qLower.includes("network") || qLower.includes("tcp") || qLower.includes("udp") || qLower.includes("ip") || qLower.includes("osi") || qLower.includes("protocol") || qLower.includes("dns") || qLower.includes("http")) {
      subject = "Computer Networks";
      topic = qLower.includes("tcp") || qLower.includes("udp") ? "Transport Layer Protocols" : "Network Protocol Architectures";
      if (qLower.includes("tcp") || qLower.includes("udp")) concept = "TCP vs UDP";
    } else if (qLower.includes("study") || qLower.includes("exam") || qLower.includes("procrastinat") || qLower.includes("focus")) {
      subject = "Study Skills & Productivity";
      topic = "Effective Learning Strategies";
      concept = "Smart Study Techniques";
    }
  }

  return {
    is_unclear: false,
    detected_subject: subject,
    detected_topic: topic,
    detected_concept: concept || "Academic Concept",
    technical_terms: clean.split(/\s+/).filter((w) => w.length > 4)
  };
}

// ============================================================================
// STEP 6-8: EXPLANATION GENERATION (FRIENDLY, ACCURATE & PEDAGOGICAL)
// ============================================================================

export async function generateValidatedExplanation(
  question: string,
  analysis: QuestionAnalysis,
  educationLevel?: string,
  preferredModel?: string,
  ollamaEndpoint?: string,
  streamBranch?: string
): Promise<ExplanationResult> {
  // 1. If it is a friendly greeting or conversational inquiry
  if (analysis.is_conversational || isGreetingOrChitchat(question)) {
    return {
      explanation: handleConversationalResponse(question, educationLevel, streamBranch),
      detected_subject: analysis.detected_subject || "LearnX Academic Assistant",
      detected_topic: analysis.detected_topic || "Conversational",
      detected_concept: analysis.detected_concept || "LearnX Assistant",
      validation_passed: true,
      is_conversational: true,
      validation_notes: "Friendly conversational response."
    };
  }

  // 1.5. Specialized Intent Tailoring (Code questions, comparisons, re-explanations)
  if (
    analysis.intent === "REEXPLANATION" ||
    (analysis.intent === "CODE_QUESTION" && question.toLowerCase().includes("hello world")) ||
    analysis.intent === "COMPARISON"
  ) {
    const tailored = formatTailoredExplanation(
      {
        raw_input: question,
        cleaned_query: analysis.cleaned_query || question,
        intent: analysis.intent as any,
        is_conversational: false,
        is_pure_greeting: false,
        detected_subject: analysis.detected_subject,
        detected_topic: analysis.detected_topic,
        detected_concept: analysis.detected_concept,
        comparison_targets: analysis.intent === "COMPARISON" ? [
          analysis.detected_concept.split(/\s+vs\s+|\s+and\s+/i)[0] || "Option A",
          analysis.detected_concept.split(/\s+vs\s+|\s+and\s+/i)[1] || "Option B"
        ] : undefined,
        requires_context: false,
        context_applied: false
      },
      educationLevel,
      streamBranch
    );

    if (tailored) {
      return {
        explanation: tailored,
        detected_subject: analysis.detected_subject,
        detected_topic: analysis.detected_topic,
        detected_concept: analysis.detected_concept,
        validation_passed: true,
        validation_notes: `Tailored ${analysis.intent} format.`
      };
    }
  }

  // 2. Check curated Knowledge Base for high-yield, deeply verified concept matching student's grade & stream
  const kbEntry = findKnowledgeBaseEntry(question, educationLevel, streamBranch) ||
    findKnowledgeBaseEntry(analysis.detected_concept, educationLevel, streamBranch) ||
    findKnowledgeBaseEntry(analysis.detected_topic, educationLevel, streamBranch);

  if (kbEntry) {
    const isInter = educationLevel === "Intermediate" || kbEntry.subject.includes("Intermediate");
    const isMPC = isInter && (!streamBranch || streamBranch.toUpperCase().includes("MPC"));
    const realWorldHeader = (isInter || educationLevel === "School")
      ? "🔬 Real-World Application in Science & Engineering"
      : "💻 Concrete Example & Real-World Use";
    const examHeader = isMPC
      ? "🎓 Key Takeaways for Intermediate Board Exams (AP/TS/CBSE) & JEE / EAMCET"
      : isInter
      ? "🎓 Key Takeaways for Intermediate Board Exams & Competitive Tests"
      : "🎓 Key Takeaways for Exams & Tests";

    const friendlyMarkdown = `Hey! Let's explore **${kbEntry.concept}** in a simple, friendly, and intuitive way.

---

### 💡 In Plain English
${kbEntry.plainEnglish}

---

### 🔍 Simple Real-World Analogy
${kbEntry.analogy}

---

### ⚙️ How It Works (Step-by-Step)
${kbEntry.howItWorks.join("\n")}

---

### ${realWorldHeader}
${kbEntry.realWorldExample}

---

### ${examHeader}
${kbEntry.keyTakeaways.join("\n")}

Hope that makes it super clear! Let me know if you want to dive deeper into any part or test yourself with the quick quiz below!`;

    return {
      explanation: friendlyMarkdown,
      detected_subject: kbEntry.subject,
      detected_topic: kbEntry.topic,
      detected_concept: kbEntry.concept,
      validation_passed: true,
      validation_notes: "Curriculum-verified precision response."
    };
  }

  // 3. If student connects Ollama local runtime with offline models (Qwen 2.5, DeepSeek R1, Llama 3.2)
  if (
    preferredModel === "ollama" ||
    preferredModel === "qwen-2.5" ||
    preferredModel === "deepseek-r1" ||
    preferredModel === "llama-3.2"
  ) {
    const ollamaStatus = await checkOllamaStatus(ollamaEndpoint || "http://localhost:11434");
    if (ollamaStatus.online) {
      let targetModel = ollamaStatus.recommendedModel;
      if (preferredModel === "deepseek-r1") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("deepseek")) || "deepseek-r1:7b";
      } else if (preferredModel === "llama-3.2") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("llama")) || "llama3.2:3b";
      } else if (preferredModel === "qwen-2.5") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("qwen")) || "qwen2.5:1.5b";
      }

      const systemPrompt = `You are LearnX AI, a warm, encouraging, and brilliant academic mentor like ChatGPT.
STUDENT ACADEMIC LEVEL: ${educationLevel || "Intermediate"} (${streamBranch || "MPC"})
SUBJECT: ${analysis.detected_subject}
TOPIC: ${analysis.detected_topic}

CRITICAL RULES:
1. Explain this strictly according to the student's selected academic grade (${educationLevel}) and stream (${streamBranch}).
2. If the student is in Intermediate MPC, you MUST use Class 11/12 senior secondary Mathematics, Physics, or Chemistry context, Intermediate Board syllabus, and JEE Main / EAMCET standards.
3. NEVER assume Computer Science & Engineering (CSE), university software engineering, coding, or compilers unless the student explicitly asks a coding question.
4. Tone: Friendly, conversational, encouraging, and easy to understand (like ChatGPT).`;

      const prompt = `Student Question: "${question}"\nSubject: ${analysis.detected_subject}\nTopic: ${analysis.detected_topic}\nConcept: ${analysis.detected_concept}`;
      const ollamaResponse = await queryOllama(
        ollamaEndpoint || "http://localhost:11434",
        targetModel,
        prompt,
        systemPrompt
      );
      if (ollamaResponse && ollamaResponse.length > 50) {
        return {
          explanation: ollamaResponse,
          detected_subject: analysis.detected_subject,
          detected_topic: analysis.detected_topic,
          detected_concept: analysis.detected_concept,
          validation_passed: true,
          validation_notes: `Powered by offline AI model (${targetModel})`,
        };
      }
    }
  }

  // 4. Try cloud Gemini API if configured & accessible
  if (preferredModel !== "academic-engine") {
    const ai = getAI();
    if (ai) {
      try {
        const prompt = `You are LearnX AI, a friendly, enthusiastic, and clear academic tutor just like ChatGPT.
STUDENT CONTEXT:
- Academic Level: "${educationLevel || "Intermediate"}"
- Stream / Branch: "${streamBranch || "MPC"}"
- Subject: "${analysis.detected_subject}"
- Topic: "${analysis.detected_topic}"
- Concept: "${analysis.detected_concept}"

Student Question: "${question}"

CRITICAL INSTRUCTION:
- You MUST explain this strictly according to the student's selected academic grade (${educationLevel}) and stream (${streamBranch}).
- If the student is in Intermediate MPC, you MUST use Class 11/12 senior secondary Mathematics, Physics, or Chemistry context, Intermediate Board syllabus, and JEE Main / EAMCET standards.
- DO NOT default to or mention Computer Science & Engineering (CSE), university software engineering, coding, or compilers unless the student explicitly asks for code!
- Tone: Friendly, conversational, encouraging, and easy to understand (like ChatGPT).
- Structure:
  1. Warm conversational opening with the intuitive 'In Plain English' concept definition suited to ${educationLevel} (${streamBranch}).
  2. A relatable real-world analogy.
  3. Clear, step-by-step explanation of how it works.
  4. A concrete example (with math/science problem walkthrough, formula, or real-life application).
  5. Memorable key takeaways for Board exams, competitive tests, or interviews.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });

        const explanationText = response.text || "";
        if (explanationText.trim().length > 50) {
          return {
            explanation: explanationText,
            detected_subject: analysis.detected_subject,
            detected_topic: analysis.detected_topic,
            detected_concept: analysis.detected_concept,
            validation_passed: true
          };
        }
      } catch (err: any) {
        if (err?.message?.includes("PERMISSION_DENIED") || err?.status === 403 || err?.code === 403) {
          cloudApiBlockedOrRestricted = true;
        }
      }
    }
  }

  // 5. Intelligent, Friendly Dynamic Synthesis (zero robotic filler)
  return synthesizeFriendlyExplanation(
    question,
    analysis.detected_subject,
    analysis.detected_topic,
    analysis.detected_concept,
    educationLevel,
    streamBranch
  );
}

// ============================================================================
// STEP 11 & 12: AUTOMATIC & INFINITE MCQ GENERATION ENGINE
// ============================================================================

function generateInfiniteDynamicMCQ(
  subject: string,
  topic: string,
  concept: string,
  difficulty: "Easy" | "Medium" | "Hard",
  questionNumber: number
): GeneratedMCQ {
  const patternIndex = (questionNumber - 1) % 8;
  const correctChoiceIndex = (questionNumber * 2 + 1) % 4; // Cycles through 1(B), 3(D), 1(B), 3(D)... or varied
  const optionsKeys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
  const correctKey = optionsKeys[correctChoiceIndex];

  let questionText = "";
  let correctText = "";
  let distractors: string[] = [];
  let explanation = "";

  switch (patternIndex) {
    case 0:
      questionText = `What is the main purpose of learning "${concept}" in ${topic}?`;
      correctText = `To understand how to solve problems systematically and accurately using the principles of ${topic}`;
      distractors = [
        `To memorize formulas and answers without understanding why they work`,
        `To make simple calculations and everyday problems unnecessarily confusing`,
        `To guess the correct answer randomly without following any logical steps`
      ];
      explanation = `The main goal of ${concept} is to give you a clear, systematic way to solve problems in ${topic} with confidence and accuracy.`;
      break;

    case 1:
      questionText = `Which of the following best describes how "${concept}" works in practice?`;
      correctText = `It follows clear, step-by-step principles to produce an accurate, dependable result`;
      distractors = [
        `It changes its rules and formulas randomly every time you use it`,
        `It only works if you completely ignore the core fundamentals of ${subject}`,
        `It produces an answer without needing any input or problem statement`
      ];
      explanation = `In practice, ${concept} relies on consistent, step-by-step logic to guarantee reproducible and correct results.`;
      break;

    case 2:
      questionText = `When solving questions on "${concept}", what is the best practice to avoid mistakes?`;
      correctText = `Carefully check given values, apply the standard formula or steps, and verify the final answer`;
      distractors = [
        `Skip reading the question and jump directly to guessing an option`,
        `Assume that all numbers and conditions are identical in every problem`,
        `Ignore the units (like meters, seconds, or data types) completely`
      ];
      explanation = `To score high and avoid careless mistakes in ${concept}, always note down what is given, follow each step methodically, and double-check your units.`;
      break;

    case 3:
      questionText = `Compared to unorganized methods, why is using "${concept}" much better?`;
      correctText = `It saves time, eliminates confusion, and provides a clear, proven structure`;
      distractors = [
        `It makes the problem take 100 times longer with no benefits`,
        `It hides all steps and makes finding errors impossible`,
        `It forces you to start over every time you make a minor adjustment`
      ];
      explanation = `Using structured concepts like ${concept} gives you a roadmap that simplifies complex questions and saves precious time.`;
      break;

    case 4:
      questionText = `In real-world applications, where do we see "${concept}" being applied?`;
      correctText = `In everyday technology, practical problem-solving, and professional industry projects`;
      distractors = [
        `Only in fictional stories with zero real-life value`,
        `Nowhere, because it has never been used outside of single-page tests`,
        `Exclusively on computers built over 80 years ago that are no longer operational`
      ];
      explanation = `Real-world engineers, scientists, and researchers actively rely on ${concept} to create apps, devices, and systems we use daily.`;
      break;

    case 5:
      questionText = `Which statement is TRUE regarding the core idea behind "${concept}"?`;
      correctText = `Understanding the fundamental idea makes answering tough exam questions much easier`;
      distractors = [
        `"${concept}" has no relation to ${topic} or any other academic subject`,
        `Learning "${concept}" will make you forget basic math and science rules`,
        `There is no way to verify whether an answer in "${concept}" is correct`
      ];
      explanation = `Once you master the fundamentals of ${concept}, solving both easy and challenging questions becomes natural and fun!`;
      break;

    case 6:
      questionText = `Which of the following is FALSE about "${concept}" in ${topic}?`;
      correctText = `"${concept}" can be completely skipped because no questions are ever asked from it`;
      distractors = [
        `"${concept}" helps build a solid foundation for higher studies`,
        `Practicing standard numerical or conceptual examples improves mastery`,
        `Reviewing key formulas for "${concept}" helps in quick exam revision`
      ];
      explanation = `${concept} is a vital part of the syllabus for ${topic}, so understanding it gives you an advantage in tests and assignments.`;
      break;

    case 7:
    default:
      questionText = `What is the best way to revise and master "${concept}" for your exams?`;
      correctText = `Understand the real-life analogy, write down key steps, and solve a few practice questions`;
      distractors = [
        `Only cram the night before without understanding the definitions`,
        `Ignore the feedback from practice quizzes and keep repeating errors`,
        `Rely entirely on luck without looking at the syllabus`
      ];
      explanation = `Consistent practice, understanding the intuition, and reviewing key points is the proven secret to mastering ${concept}!`;
      break;
  }

  // Construct options placing correctText at correctKey
  const optionsMap: Record<"A" | "B" | "C" | "D", string> = {
    A: "",
    B: "",
    C: "",
    D: "",
  };

  optionsMap[correctKey] = correctText;
  const remainingKeys = optionsKeys.filter((k) => k !== correctKey);
  for (let i = 0; i < remainingKeys.length; i++) {
    optionsMap[remainingKeys[i]] = distractors[i] || `Alternative condition ${i + 1}`;
  }

  return {
    question_text: questionText,
    option_a: optionsMap.A,
    option_b: optionsMap.B,
    option_c: optionsMap.C,
    option_d: optionsMap.D,
    correct_option: correctKey,
    explanation,
    difficulty,
    subject,
    topic,
    concept,
    validation_passed: true,
  };
}

export async function generateValidatedMCQ(
  subject: string,
  topic: string,
  concept: string,
  educationLevel: string = "Student",
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
  explanationGiven: string = "",
  preferredModel?: string,
  ollamaEndpoint?: string,
  questionIndex: number = 1,
  previousQuestions: string[] = [],
  streamBranch?: string
): Promise<GeneratedMCQ> {
  const qNum = Math.max(1, questionIndex);
  const computedDifficulty: "Easy" | "Medium" | "Hard" =
    difficulty || (qNum <= 2 ? "Medium" : qNum <= 4 ? "Hard" : "Medium");

  // 1. Check Knowledge Base first across all models with grade and stream filtering
  const kbEntry =
    findKnowledgeBaseEntry(concept, educationLevel, streamBranch) ||
    findKnowledgeBaseEntry(topic, educationLevel, streamBranch);
  if (kbEntry) {
    const allKbQuestions = [kbEntry.mcq, ...(kbEntry.mcqs || [])];
    // Find an unused question that hasn't appeared in previousQuestions
    const unusedKbQuestion = allKbQuestions.find(
      (q) => !previousQuestions.some((prev) => prev.toLowerCase().trim() === q.question.toLowerCase().trim())
    );

    if (unusedKbQuestion) {
      return {
        question_text: unusedKbQuestion.question,
        option_a: unusedKbQuestion.a,
        option_b: unusedKbQuestion.b,
        option_c: unusedKbQuestion.c,
        option_d: unusedKbQuestion.d,
        correct_option: unusedKbQuestion.correct,
        explanation: unusedKbQuestion.explanation,
        difficulty: unusedKbQuestion.difficulty || computedDifficulty,
        subject: kbEntry.subject,
        topic: kbEntry.topic,
        concept: kbEntry.concept,
        validation_passed: true
      };
    }
  }

  // 2. If local Ollama is active
  if (
    preferredModel === "ollama" ||
    preferredModel === "qwen-2.5" ||
    preferredModel === "deepseek-r1" ||
    preferredModel === "llama-3.2"
  ) {
    const ollamaStatus = await checkOllamaStatus(ollamaEndpoint || "http://localhost:11434");
    if (ollamaStatus.online) {
      let targetModel = ollamaStatus.recommendedModel;
      if (preferredModel === "deepseek-r1") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("deepseek")) || "deepseek-r1:7b";
      } else if (preferredModel === "llama-3.2") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("llama")) || "llama3.2:3b";
      } else if (preferredModel === "qwen-2.5") {
        targetModel =
          ollamaStatus.models.find((m) => m.toLowerCase().includes("qwen")) || "qwen2.5:1.5b";
      }
      const prompt = `Generate multiple-choice question #${qNum} testing "${concept}" in ${subject} (${topic}).
Difficulty: ${computedDifficulty}.
Previous questions to NOT repeat: ${previousQuestions.slice(-3).join(" | ")}.
Return ONLY a raw JSON object with:
{
  "question_text": "Question testing ${concept}",
  "option_a": "Option A",
  "option_b": "Option B",
  "option_c": "Option C",
  "option_d": "Option D",
  "correct_option": "A",
  "explanation": "Why correct option is right"
}`;
      const resp = await queryOllama(
        ollamaEndpoint || "http://localhost:11434",
        ollamaStatus.recommendedModel,
        prompt,
        "You are an academic exam generator. Output only valid JSON."
      );
      if (resp) {
        try {
          const jsonMatch = resp.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const opt = ["A", "B", "C", "D"].includes(parsed.correct_option?.toUpperCase())
              ? (parsed.correct_option.toUpperCase() as "A" | "B" | "C" | "D")
              : "A";
            if (parsed.question_text && parsed.option_a && parsed.option_b) {
              return {
                question_text: parsed.question_text,
                option_a: parsed.option_a,
                option_b: parsed.option_b,
                option_c: parsed.option_c || "Option C",
                option_d: parsed.option_d || "Option D",
                correct_option: opt,
                explanation: parsed.explanation || `Option ${opt} is correct based on ${concept}.`,
                difficulty: computedDifficulty,
                subject,
                topic,
                concept,
                validation_passed: true
              };
            }
          }
        } catch {}
      }
    }
  }

  // 3. Try Cloud Gemini API for infinite dynamic questions if available
  if (preferredModel !== "academic-engine") {
    const ai = getAI();
    if (ai) {
      try {
        const prevQText = previousQuestions.slice(-3).map((q) => `"${q}"`).join(", ");
        const prompt = `Generate a high-quality academic multiple-choice question (#${qNum}) testing "${concept}" in ${subject} (${topic}).
Difficulty level: ${computedDifficulty}.
${prevQText ? `Do NOT repeat or closely rephrase any of these previous questions: ${prevQText}.` : ""}
Create 4 realistic, distinct options (A, B, C, D) with exactly one clearly correct option and 3 plausible distractors.

Return ONLY a raw JSON object with no markdown fences, matching this schema:
{
  "question_text": "The question here",
  "option_a": "Option A text",
  "option_b": "Option B text",
  "option_c": "Option C text",
  "option_d": "Option D text",
  "correct_option": "A",
  "explanation": "Detailed explanation why the correct option is right"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });

        const respText = response.text || "";
        const jsonMatch = respText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const opt = ["A", "B", "C", "D"].includes(parsed.correct_option?.toUpperCase())
            ? (parsed.correct_option.toUpperCase() as "A" | "B" | "C" | "D")
            : "A";
          if (parsed.question_text && parsed.option_a && parsed.option_b) {
            return {
              question_text: parsed.question_text,
              option_a: parsed.option_a,
              option_b: parsed.option_b,
              option_c: parsed.option_c || "Option C",
              option_d: parsed.option_d || "Option D",
              correct_option: opt,
              explanation: parsed.explanation || `Option ${opt} is correct for ${concept}.`,
              difficulty: computedDifficulty,
              subject,
              topic,
              concept,
              validation_passed: true
            };
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
  }

  // 4. Multi-Angle Infinite Dynamic Concept Question Generator
  return generateInfiniteDynamicMCQ(subject, topic, concept, computedDifficulty, qNum);
}
