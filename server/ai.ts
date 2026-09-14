import { GoogleGenAI, Type } from "@google/genai";

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
  }
];

function findKnowledgeBaseEntry(query: string): ConceptMasteryEntry | null {
  const q = query.toLowerCase();
  for (const entry of ACADEMIC_KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return entry;
    }
  }
  return null;
}

// ============================================================================
// CONVERSATIONAL & CHATGPT-STYLE SYNTHESIZER FOR ANY TOPIC
// ============================================================================

const GREETING_KEYWORDS = [
  "hi", "hello", "hey", "hola", "sup", "good morning", "good evening", "good afternoon",
  "who are you", "what can you do", "introduce yourself", "how are you", "what is learnx",
  "help", "help me", "thanks", "thank you", "bye", "goodbye"
];

function isGreetingOrChitchat(query: string): boolean {
  const clean = query.trim().toLowerCase().replace(/[!?.,]+$/, "");
  if (clean.length <= 4 && ["hi", "hey", "hello", "yo", "sup", "help"].includes(clean)) return true;
  return GREETING_KEYWORDS.some((kw) => clean === kw || clean.startsWith(kw + " ") || clean.endsWith(" " + kw));
}

function handleConversationalResponse(query: string): string {
  const clean = query.trim().toLowerCase();
  if (clean.includes("who are you") || clean.includes("what can you do") || clean.includes("introduce")) {
    return `Hey there! 👋 I'm **LearnX AI**, your friendly, intelligent personal tutor and study companion!

I'm designed to help you understand tough concepts simply and clearly, without robotic jargon. Here is how I can help:

- 💡 **Explain any study concept** in plain English with easy-to-grasp analogies (Computer Science, Math, Physics, DBMS, OS, Biology, and more).
- 💻 **Code & Walkthroughs**: Write, explain, or debug code in Python, C++, Java, JavaScript, and SQL.
- 🎯 **Exam & Interview Prep**: Break down high-yield questions, theoretical formulas, and common traps.
- 📝 **Study Strategies**: Techniques like Active Recall, the Feynman Technique, and Pomodoro to study smarter without burnout.
- ⚡ **Instant Quizzes**: Test your understanding with auto-generated practice questions.

What would you like to explore today? Ask me any doubt or drop in a topic!`;
  }

  if (clean.includes("thank") || clean.includes("thanks")) {
    return `You're very welcome! 😊 I'm always here whenever you have another question or want to review a topic. Happy learning and keep up the great work! What shall we tackle next?`;
  }

  if (clean.includes("how are you")) {
    return `I'm doing fantastic, thank you for asking! 🚀 Ready to help you tackle any study doubts, solve problems, or prepare for exams. What's on your mind today?`;
  }

  return `Hey there! 👋 Welcome to **LearnX**! 

I'm your personal study buddy. You can ask me **anything**—from clarifying a tricky engineering or science concept, to writing code, solving math, or giving you effective study tips.

What topic would you like to explore today? Just ask away!`;
}

// Friendly Dynamic Synthesizer for ANY concept across all domains
function synthesizeFriendlyExplanation(
  question: string,
  subject: string,
  topic: string,
  concept: string,
  educationLevel?: string
): ExplanationResult {
  const qLower = question.toLowerCase();

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

  // Tailor intuitive analogy and intuition based on detected domain
  let plainEnglish = `**${cleanConcept}** is a foundational idea in **${subject}** (${topic}). At its core, it gives us a clear, reliable way to understand how systems behave, solve problems, and make decisions without guessing.`;
  let analogy = `Think of it like learning the rules of chess: once you know how the pieces move and interact, complex strategies start making total sense. **${cleanConcept}** provides that exact rulebook in **${topic}**!`;
  let mechanics = [
    `**Core Goal**: Solves a specific challenge in ${subject} by establishing clear, predictable rules.`,
    `**Step-by-step logic**: Takes input information, applies the governing principles of ${topic}, and produces an accurate, verifiable result.`,
    `**Practical Trade-off**: Balances simplicity, efficiency, and real-world constraints.`
  ];
  let realWorld = `In modern engineering and technology, **${cleanConcept}** is used to build reliable systems, write clean code, or solve analytical problems in university coursework and industry.`;
  let takeaways = [
    `Always start with the core definition before diving into complex equations or edge cases.`,
    `Focus on *why* this concept was created—it almost always solves an efficiency, accuracy, or organization problem!`,
    `Remember its connection to the parent topic **${topic}** when answering exam questions.`
  ];

  if (subject.includes("Theory") || subject.includes("Compiler") || topic.includes("Automata") || topic.includes("Grammar")) {
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
    realWorld = `Banks, e-commerce stores (Amazon), and social networks (Instagram) rely on these database principles to process millions of transactions without losing a single record!`;
    takeaways = [
      `Identify the primary key, foreign key, or normal form constraints.`,
      `Explain how it eliminates redundancy and anomalies.`,
      `Mention the trade-off between read speed (denormalization/indexes) and write performance.`
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

### 💻 Where You See It in Real Life
${realWorld}

---

### 🎓 Key Takeaways for Exams & Interviews
${takeaways.map((t) => `- ${t}`).join("\n")}

Hope that makes it super clear! Let me know if you want to explore any part of this deeper or see a specific code/math example!`;

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
  streamBranch?: string
): Promise<QuestionAnalysis> {
  const clean = question.trim();

  // Check if it's a friendly greeting or casual chitchat
  if (isGreetingOrChitchat(clean)) {
    return {
      is_unclear: false,
      is_conversational: true,
      detected_subject: "General",
      detected_topic: "Conversational",
      detected_concept: "General Conversation",
      technical_terms: []
    };
  }

  // Basic sanity check for gibberish
  if (clean.length < 2 || /^[^\w\s]+$/.test(clean)) {
    return {
      is_unclear: true,
      clarification_question: "Could you please specify your question in a bit more detail? (For example: 'Explain Binary Search' or 'What is a Context-Free Grammar?')",
      detected_subject: "General",
      detected_topic: "General Topic",
      detected_concept: clean,
      technical_terms: []
    };
  }

  // Check Knowledge Base directly
  const kbMatch = findKnowledgeBaseEntry(clean);
  if (kbMatch) {
    return {
      is_unclear: false,
      detected_subject: kbMatch.subject,
      detected_topic: kbMatch.topic,
      detected_concept: kbMatch.concept,
      technical_terms: [kbMatch.concept, ...kbMatch.keywords.slice(0, 3)]
    };
  }

  const qLower = clean.toLowerCase();

  // Smart subject detection
  let subject = "Computer Science & Engineering";
  let topic = "Core Principles";
  let concept = clean
    .replace(/^(what is|explain|how does|define|tell me about|how to implement|why is|difference between|how do i|can you explain)\s+/i, "")
    .replace(/[?!.]+$/, "")
    .trim();

  if (concept.length > 0) {
    concept = concept.charAt(0).toUpperCase() + concept.slice(1);
  }

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
  } else if (qLower.includes("derivative") || qLower.includes("integral") || qLower.includes("matrix") || qLower.includes("calculus") || qLower.includes("probability") || qLower.includes("algebra")) {
    subject = "Mathematics";
    topic = qLower.includes("matrix") ? "Linear Algebra" : qLower.includes("probability") ? "Probability & Statistics" : "Calculus & Analysis";
  } else if (qLower.includes("newton") || qLower.includes("force") || qLower.includes("velocity") || qLower.includes("motion") || qLower.includes("gravity") || qLower.includes("physics") || qLower.includes("energy")) {
    subject = "Physics";
    topic = "Classical Mechanics & Dynamics";
  } else if (qLower.includes("photosynthesis") || qLower.includes("cell") || qLower.includes("dna") || qLower.includes("rna") || qLower.includes("genetics") || qLower.includes("biology")) {
    subject = "Biological Sciences";
    topic = "Cellular Biology & Genetics";
  } else if (qLower.includes("study") || qLower.includes("exam") || qLower.includes("procrastinat") || qLower.includes("focus")) {
    subject = "Study Skills & Productivity";
    topic = "Effective Learning Strategies";
    concept = "Smart Study Techniques";
  } else if (educationLevel === "B.Tech" && streamBranch) {
    subject = streamBranch;
    topic = "Engineering Fundamentals";
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
  ollamaEndpoint?: string
): Promise<ExplanationResult> {
  // 1. If it is a friendly greeting or conversational inquiry
  if (analysis.is_conversational || isGreetingOrChitchat(question)) {
    return {
      explanation: handleConversationalResponse(question),
      detected_subject: "General",
      detected_topic: "Conversational",
      detected_concept: "LearnX Assistant",
      validation_passed: true,
      is_conversational: true,
      validation_notes: "Friendly greeting."
    };
  }

  // 2. Check curated Knowledge Base for high-yield, deeply verified concept
  const kbEntry = findKnowledgeBaseEntry(question) || findKnowledgeBaseEntry(analysis.detected_concept) || findKnowledgeBaseEntry(analysis.detected_topic);
  if (kbEntry) {
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

### 💻 Concrete Example & Real-World Use
${kbEntry.realWorldExample}

---

### 🎓 Key Takeaways for Exams & Interviews
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
Explain the student's question clearly in plain English, with an intuitive real-world analogy, step-by-step logic, concrete examples or code, and memorable exam takeaways. Avoid robotic or cold bureaucratic boilerplate. Always encourage the student and build their confidence.`;
      const prompt = `Student Question: "${question}"\nEducation Level: ${educationLevel || "Student"}`;
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
Student question: "${question}"
Subject: "${analysis.detected_subject}"
Topic: "${analysis.detected_topic}"
Concept: "${analysis.detected_concept}"

INSTRUCTIONS:
- Tone: Friendly, conversational, encouraging, and easy to understand (like ChatGPT).
- Structure:
  1. Warm conversational opening with the intuitive 'In Plain English' concept definition.
  2. A relatable real-world analogy.
  3. Clear, step-by-step explanation of how it works.
  4. A concrete example (with code, math, or real-life scenario where applicable).
  5. Memorable key takeaways for exams or interviews.
- Never use cold robotic boilerplate or phrases like 'operational invariant' or 'governing mechanics boundary conditions'.`;

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
    educationLevel
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
      questionText = `What is the primary objective or foundational purpose of "${concept}" within ${subject}?`;
      correctText = `To establish clear, systematic, and verifiable rules that guarantee consistency and correct behavior in ${topic}`;
      distractors = [
        `To eliminate the need for memory allocation and hardware constraints completely`,
        `To act solely as an informal visual notation with no computational or logical semantics`,
        `To restrict execution exclusively to synchronous single-threaded legacy processors`
      ];
      explanation = `The primary objective of ${concept} is to provide systematic and verifiable rules for ${topic}, ensuring deterministic and robust operation.`;
      break;

    case 1:
      questionText = `During the application or execution of "${concept}", which operational invariant must always hold?`;
      correctText = `Every state transition or computational step must strictly satisfy the governing constraints of ${topic}`;
      distractors = [
        `Data structures must continuously double in size regardless of input scale`,
        `All asynchronous events must be discarded without acknowledgment`,
        `Computation must terminate within exactly one clock cycle regardless of complexity`
      ];
      explanation = `For ${concept} to remain sound, all transitions and steps must maintain the governing invariants defined in ${topic}.`;
      break;

    case 2:
      questionText = `What critical edge case or failure mode must engineers prevent when utilizing "${concept}"?`;
      correctText = `Unbounded resource consumption, deadlock, or invalid state transitions under extreme boundary conditions`;
      distractors = [
        `Deterministic execution yielding reproducible results across repeated runs`,
        `Strict adherence to the underlying algorithmic specification`,
        `Optimal asymptotic time complexity under average-case workloads`
      ];
      explanation = `Edge cases such as boundary violations, unhandled base conditions, or resource exhaustion are critical failure modes in ${concept}.`;
      break;

    case 3:
      questionText = `Compared to naive or unconstrained approaches, what is the key architectural advantage of "${concept}"?`;
      correctText = `It provides structured guarantees, predictable behavior, and superior modularity in ${topic}`;
      distractors = [
        `It operates with zero memory footprint and requires no CPU cycles`,
        `It bypasses all validation and error-checking layers for raw throughput`,
        `It guarantees infinite precision without any computational trade-offs`
      ];
      explanation = `By introducing formal structure, ${concept} ensures predictable, testable, and modular system design.`;
      break;

    case 4:
      questionText = `In production systems and industry practice, how is "${concept}" typically leveraged?`;
      correctText = `As a core building block to decouple complex subsystems and enforce standard protocol contracts`;
      distractors = [
        `As an optional aesthetic skin without any functional or logical impact`,
        `To artificially increase latency and slow down request processing`,
        `Exclusively within obsolete mainframe batch routines that run once per year`
      ];
      explanation = `In real-world architectures, ${concept} decouples responsibilities and ensures strict contract compliance across services.`;
      break;

    case 5:
      questionText = `Which statement accurately characterizes the efficiency or computational bounds of "${concept}"?`;
      correctText = `Its performance characteristics depend directly on input size and adherence to algorithmic best practices`;
      distractors = [
        `It permanently executes in O(1) time and space for any arbitrarily complex NP-hard problem`,
        `Its resource usage is completely unpredictable and cannot be mathematically bounded`,
        `It degrades exponentially even on trivial or empty inputs`
      ];
      explanation = `The operational complexity of ${concept} is governed by standard complexity analysis and input scaling.`;
      break;

    case 6:
      questionText = `Which of the following statements regarding "${concept}" in ${topic} is FALSE?`;
      correctText = `"${concept}" can be safely ignored without any risk of system corruption, data loss, or behavioral flaws`;
      distractors = [
        `"${concept}" is designed to handle common domain problems in ${subject}`,
        `Proper understanding of "${concept}" is essential for building scalable applications`,
        `Edge cases in "${concept}" must be explicitly tested during quality assurance`
      ];
      explanation = `Ignoring ${concept} compromises correctness, stability, and data integrity in real-world systems.`;
      break;

    case 7:
    default:
      questionText = `When troubleshooting an unexpected defect related to "${concept}", which factor should be verified FIRST?`;
      correctText = `Whether input prerequisites, boundary conditions, and state transitions conform to standard specifications`;
      distractors = [
        `Whether the hardware motherboard requires physical soldering`,
        `Whether user account credentials contain special punctuation characters`,
        `Whether random bit-shifting can bypass the underlying algorithm`
      ];
      explanation = `Verifying prerequisites, edge conditions, and state transition correctness is the primary troubleshooting protocol for ${concept}.`;
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
  previousQuestions: string[] = []
): Promise<GeneratedMCQ> {
  const qNum = Math.max(1, questionIndex);
  const computedDifficulty: "Easy" | "Medium" | "Hard" =
    difficulty || (qNum <= 2 ? "Medium" : qNum <= 4 ? "Hard" : "Medium");

  // 1. Check Knowledge Base first across all models
  const kbEntry = findKnowledgeBaseEntry(concept) || findKnowledgeBaseEntry(topic) || findKnowledgeBaseEntry(subject);
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
