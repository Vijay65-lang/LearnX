import { EducationLevel } from "../types";

export interface AcademicSubjectOption {
  id: string;
  name: string;
  code: string;
  category: string;
  educationLevel: EducationLevel;
  branchStream?: string;
  description: string;
  suggestedTopics: string[];
  sampleNotes?: string;
}

export const ACADEMIC_SUBJECTS_CATALOG: AcademicSubjectOption[] = [
  // B.Tech CSE / IT / ECE / Mechanical / Civil
  {
    id: "btech_cs_ds",
    name: "Data Structures & Algorithms",
    code: "CS201",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graphs, Sorting, Dynamic Programming, and Time Complexity.",
    suggestedTopics: ["Arrays & Dynamic Arrays", "Linked Lists (Singly & Doubly)", "Stack & Queue Operations", "Binary Search Trees", "Graph BFS/DFS Traversal", "Sorting Algorithms (Merge, Quick)", "Dynamic Programming Basics", "Time & Space Complexity (Big-O)"],
    sampleNotes: `Unit 1: Linear Data Structures
- Arrays store contiguous memory elements with O(1) indexed access.
- Linked Lists use pointers (nodes with val and next) allowing O(1) insertion at head.
- Stack follows LIFO (Last In First Out); applications include expression evaluation and call stacks.
- Queue follows FIFO (First In First Out); used in CPU scheduling and breadth-first search.`
  },
  {
    id: "btech_cs_dbms",
    name: "Database Management Systems (DBMS)",
    code: "CS202",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Relational algebra, SQL, Normalization (1NF, 2NF, 3NF, BCNF), ACID properties, and Transaction indexing.",
    suggestedTopics: ["Relational Model & Keys", "SQL DDL & DML Queries", "Normalization & Functional Dependencies", "ACID Properties & Transactions", "B-Trees & Indexing", "Concurrency Control & Deadlocks"],
    sampleNotes: `Unit 2: Normalization & Transactions
- 1NF: Atomic values only.
- 2NF: In 1NF and no partial dependency on a composite primary key.
- 3NF: In 2NF and no transitive functional dependencies (X -> Y where Y is non-prime).
- ACID Properties: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent safety), Durability (persisted on disk).`
  },
  {
    id: "btech_cs_os",
    name: "Operating Systems",
    code: "CS203",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Process scheduling, CPU allocation, Threads, Virtual Memory, Paging, Deadlocks, and File systems.",
    suggestedTopics: ["Process States & Context Switching", "CPU Scheduling (FCFS, SJF, Round Robin)", "Process Synchronization & Semaphores", "Deadlock Conditions & Banker's Algorithm", "Virtual Memory & Paging", "Page Replacement (FIFO, LRU)"],
    sampleNotes: `Operating Systems Key Concepts:
- Coffman Deadlock Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
- Virtual Memory: Logical address translated to physical address via MMU and Page Table.
- Thrashing occurs when the system spends more time paging than executing instructions.`
  },
  {
    id: "btech_cs_cn",
    name: "Computer Networks",
    code: "CS204",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "OSI and TCP/IP models, IP addressing, Subnetting, Routing protocols, Transport layer (TCP/UDP), and Application layer.",
    suggestedTopics: ["OSI 7 Layers vs TCP/IP 4 Layers", "IPv4 Addressing & Subnetting", "TCP 3-Way Handshake vs UDP", "Routing Algorithms (Dijkstra, Distance Vector)", "DNS, HTTP/HTTPS & Security", "Flow Control & Congestion Control"],
    sampleNotes: `Networking Protocols:
- TCP: Reliable, connection-oriented, byte-stream protocol with 3-way handshake (SYN, SYN-ACK, ACK), sliding window flow control.
- UDP: Lightweight, connectionless datagram service without acknowledgment.
- Subnetting: /24 gives 256 addresses (254 usable hosts after network and broadcast IDs).`
  },
  {
    id: "btech_ece_signals",
    name: "Signals & Systems",
    code: "EC201",
    category: "Electronics",
    educationLevel: "B.Tech",
    branchStream: "Electronics & Communication Engineering",
    description: "Continuous and Discrete time signals, LTI systems, Fourier Transform, Laplace Transform, and Z-Transform.",
    suggestedTopics: ["Continuous vs Discrete Signals", "LTI Systems & Convolution", "Fourier Series & Fourier Transform", "Laplace Transform & ROC", "Z-Transform & Stability", "Nyquist Sampling Theorem"],
    sampleNotes: `Signals & Systems:
- Linear Time-Invariant (LTI) systems are completely characterized by their impulse response h(t).
- Output y(t) is the convolution of input x(t) with impulse response h(t): y(t) = x(t) * h(t).
- Nyquist Sampling Rate: fs >= 2 * fmax to prevent aliasing.`
  },
  {
    id: "btech_mech_thermo",
    name: "Thermodynamics & Fluid Mechanics",
    code: "ME201",
    category: "Mechanical",
    educationLevel: "B.Tech",
    branchStream: "Mechanical Engineering",
    description: "Laws of Thermodynamics, Heat engines, Carnot cycle, Bernoulli equation, and Fluid statics.",
    suggestedTopics: ["Zeroth, 1st & 2nd Laws of Thermodynamics", "Carnot Cycle & Thermal Efficiency", "Entropy & Enthalpy", "Fluid Statics & Pressure", "Bernoulli's Equation & Flow Rate", "Refrigeration Cycles"],
    sampleNotes: `Thermodynamics Fundamentals:
- 1st Law: Energy conservation dQ = dU + dW.
- 2nd Law: Heat cannot spontaneously flow from cold to hot reservoir without external work.
- Carnot Efficiency: eta = 1 - (Tc / Th).`
  },

  // Intermediate (11th & 12th / +2 / MPC / BiPC / CEC)
  {
    id: "inter_mpc_maths",
    name: "Mathematics (Intermediate 1A, 1B, 2A, 2B)",
    code: "MATH-XI-XII",
    category: "Mathematics",
    educationLevel: "Intermediate",
    branchStream: "MPC",
    description: "Functions, Matrices, Trigonometry, Calculus (Differentiation & Integration), Coordinate Geometry, Complex Numbers, Probability.",
    suggestedTopics: ["Functions & Domain/Range", "Matrices & Determinants (Cramer's Rule)", "Trigonometric Identities & Transformations", "Differentiation & Product/Quotient Rule", "Definite & Indefinite Integration", "Coordinate Geometry & Straight Lines", "Complex Numbers & De Moivre's Theorem", "Probability & Bayes' Theorem"],
    sampleNotes: `Intermediate Mathematics Core:
- Matrix Inversion: A^-1 = adj(A) / det(A).
- Differentiation: d/dx(u*v) = u*dv/dx + v*du/dx. d/dx(sin x) = cos x.
- Definite Integrals: Fundamental Theorem of Calculus states int_a^b f(x)dx = F(b) - F(a).`
  },
  {
    id: "inter_mpc_physics",
    name: "Physics (Intermediate 1st & 2nd Year)",
    code: "PHY-XI-XII",
    category: "Physics",
    educationLevel: "Intermediate",
    branchStream: "MPC",
    description: "Kinematics, Laws of Motion, Work Energy Power, Gravitation, Thermodynamics, Optics, Wave Optics, Electricity & Magnetism.",
    suggestedTopics: ["Kinematics & Projectile Motion", "Newton's Laws & Friction", "Work, Energy & Power Theorem", "Gravitation & Kepler's Laws", "Wave Optics & Interference", "Current Electricity (Ohm's Law & Kirchhoff's Rules)", "Electromagnetism & Faraday's Law", "Modern Physics & Dual Nature"],
    sampleNotes: `Intermediate Physics:
- Work-Energy Theorem: Net work done on an object equals change in kinetic energy: W_net = Delta K.
- Kirchhoff's Current Law (KCL): Sum of currents entering a junction = sum leaving (charge conservation).
- Kirchhoff's Voltage Law (KVL): Directed sum of potential differences in any closed loop is zero (energy conservation).`
  },
  {
    id: "inter_mpc_chemistry",
    name: "Chemistry (Physical, Organic & Inorganic)",
    code: "CHEM-XI-XII",
    category: "Chemistry",
    educationLevel: "Intermediate",
    branchStream: "MPC",
    description: "Atomic Structure, Periodic Table, Chemical Bonding, Thermodynamics, Equilibrium, Organic Reactions, Coordination Compounds.",
    suggestedTopics: ["Bohr Model & Quantum Numbers", "Periodic Trends (Electronegativity, Ionization)", "Chemical Bonding & VSEPR Theory", "Chemical Equilibrium & Le Chatelier's Principle", "Thermodynamics (Delta G, Delta H, Delta S)", "Organic Functional Groups & Reaction Mechanisms", "Alkanes, Alkenes & Alkynes", "Coordination Compounds & IUPAC"],
    sampleNotes: `Intermediate Chemistry:
- Le Chatelier's Principle: If an external stress (T, P, conc) is applied to an equilibrium, the system shifts in the direction that minimizes that stress.
- Gibbs Free Energy: Delta G = Delta H - T * Delta S. Reaction is spontaneous when Delta G < 0.`
  },
  {
    id: "inter_bipc_biology",
    name: "Botany & Zoology (Biology)",
    code: "BIO-XI-XII",
    category: "Biology",
    educationLevel: "Intermediate",
    branchStream: "BiPC",
    description: "Plant Physiology, Photosynthesis, Cell Division, Human Anatomy, Genetics & Evolution, Biotechnology.",
    suggestedTopics: ["Cell Biology & Organelles", "Photosynthesis (Light & Dark Reactions)", "Cell Division (Mitosis vs Meiosis)", "Human Circulatory & Respiratory Systems", "Nervous System & Synaptic Transmission", "Mendelian Genetics & Inheritance", "DNA Replication & Transcription", "Biotechnology & Genetic Engineering"],
    sampleNotes: `Botany & Zoology:
- Photosynthesis: 6CO2 + 6H2O + light -> C6H12O6 + 6O2. Occurs in chloroplast thylakoids (light reactions) and stroma (Calvin cycle).
- Central Dogma of Molecular Biology: DNA -> (transcription) -> mRNA -> (translation) -> Protein.`
  },

  // Degree (B.Sc / B.Com / BBA / BCA)
  {
    id: "degree_bca_web",
    name: "Full Stack Web Development",
    code: "BCA-301",
    category: "Computer Science",
    educationLevel: "Degree",
    branchStream: "BCA / Computer Science",
    description: "HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, REST APIs, and MongoDB.",
    suggestedTopics: ["DOM Manipulation & Events", "JavaScript Asynchronous (Promises, Async/Await)", "React Components, Props & Hooks", "RESTful API Design & HTTP Status Codes", "Express Middleware & Authentication", "NoSQL MongoDB vs SQL RDBMS"],
    sampleNotes: `Full Stack Web Notes:
- JavaScript Event Loop handles asynchronous callbacks using microtask (Promises) and macrotask (setTimeout) queues.
- React Hooks: useState preserves state across renders; useEffect coordinates side effects (data fetching, subscriptions).`
  },
  {
    id: "degree_bcom_acc",
    name: "Financial Accounting & Taxation",
    code: "BCOM-101",
    category: "Commerce",
    educationLevel: "Degree",
    branchStream: "B.Com",
    description: "Double Entry Bookkeeping, Journal Entries, Ledger, Trial Balance, Final Accounts, GST & Direct Taxation.",
    suggestedTopics: ["Golden Rules of Accounting", "Journal, Ledger & Trial Balance", "Trading, Profit & Loss Account", "Balance Sheet & Asset-Liability Classification", "Depreciation Methods (SLM, WDV)", "GST Concepts & Input Tax Credit"],
    sampleNotes: `Accounting Golden Rules:
1. Personal Account: Debit the receiver, Credit the giver.
2. Real Account: Debit what comes in, Credit what goes out.
3. Nominal Account: Debit all expenses & losses, Credit all incomes & gains.`
  },

  // School (Classes 8th - 10th)
  {
    id: "school_math_10",
    name: "Secondary Mathematics (Grade 9-10)",
    code: "SCH-MATH",
    category: "Mathematics",
    educationLevel: "School",
    description: "Real Numbers, Polynomials, Linear Equations in Two Variables, Quadratic Equations, Triangles, Trigonometry, Statistics.",
    suggestedTopics: ["Real Numbers & Euclid's Division", "Polynomials & Zeroes", "Pair of Linear Equations (Substitution, Elimination)", "Quadratic Equations (Quadratic Formula)", "Similar Triangles & Pythagoras Theorem", "Introduction to Trigonometry (sin, cos, tan)", "Surface Areas & Volumes", "Statistics & Mean/Median/Mode"],
    sampleNotes: `Class 10 Mathematics:
- Quadratic Formula for ax^2 + bx + c = 0 is x = (-b +- sqrt(b^2 - 4ac)) / (2a).
- Discriminant D = b^2 - 4ac: If D > 0 (two distinct real roots), D = 0 (two equal real roots), D < 0 (no real roots).`
  },
  {
    id: "school_sci_10",
    name: "General Science (Physics, Chem & Bio)",
    code: "SCH-SCI",
    category: "Science",
    educationLevel: "School",
    description: "Chemical Reactions, Acids Bases Salts, Metals Non-metals, Life Processes, Light Reflection/Refraction, Electricity.",
    suggestedTopics: ["Chemical Equations & Balancing", "Acids, Bases & pH Scale", "Metals, Non-metals & Reactivity Series", "Life Processes (Nutrition & Respiration)", "Light: Reflection & Mirrors", "Light: Refraction & Lenses", "Electricity: Ohm's Law & Circuits", "Magnetic Effects of Electric Current"],
    sampleNotes: `General Science Class 10:
- Ohm's Law: V = I * R (Potential difference is proportional to current at constant temperature).
- pH Scale: pH < 7 is Acidic, pH = 7 is Neutral (pure water), pH > 7 is Basic/Alkaline.`
  }
];

export function getSubjectsForStudent(
  educationLevel: EducationLevel,
  streamOrBranch?: string
): AcademicSubjectOption[] {
  const filtered = ACADEMIC_SUBJECTS_CATALOG.filter((subj) => {
    if (subj.educationLevel !== educationLevel) return false;
    if (!streamOrBranch || streamOrBranch === "Standard" || streamOrBranch === "All") return true;
    if (subj.branchStream) {
      const s = streamOrBranch.toLowerCase();
      const b = subj.branchStream.toLowerCase();
      return b.includes(s) || s.includes(b) || b.includes("all");
    }
    return true;
  });

  // If no specific match, return all subjects for that education level
  if (filtered.length > 0) return filtered;
  return ACADEMIC_SUBJECTS_CATALOG.filter((subj) => subj.educationLevel === educationLevel);
}
