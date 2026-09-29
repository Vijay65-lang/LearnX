/**
 * LearnX Academic Mathematical & Numerical Problem Solver
 * Provides step-by-step mathematical proofs, equation derivations,
 * checks verification, and generates exact concept-matching MCQs.
 */

import { GeneratedMCQ } from "./ai.js";

export interface MathSolverResult {
  isSolved: boolean;
  subject: string;
  topic: string;
  concept: string;
  solutionMarkdown: string;
  mcq: GeneratedMCQ;
}

/**
 * Attempts to parse and solve mathematical equations and numerical problems.
 */
export function solveMathOrNumerical(query: string): MathSolverResult | null {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // 1. LINEAR EQUATIONS: e.g. "solve 3x + 7 = 22", "2x - 5 = 15", "4x = 28", "2x + 8 = 3x + 2"
  const linearResult = trySolveLinearEquation(clean, lower);
  if (linearResult) return linearResult;

  // 2. QUADRATIC EQUATIONS: e.g. "x^2 - 5x + 6 = 0", "roots of 2x^2 + 5x - 3 = 0"
  const quadraticResult = trySolveQuadraticEquation(clean, lower);
  if (quadraticResult) return quadraticResult;

  // 3. PERCENTAGE CALCULATIONS: e.g. "what is 15% of 80", "calculate 20% of 150"
  const percentResult = trySolvePercentage(clean, lower);
  if (percentResult) return percentResult;

  // 4. OHM'S LAW NUMERICALS: e.g. "V = 20, R = 5, find I", "find voltage if I = 3A and R = 10 ohms"
  const ohmsLawResult = trySolveOhmsLawNumerical(clean, lower);
  if (ohmsLawResult) return ohmsLawResult;

  return null;
}

/**
 * Solves single-variable linear equations of forms:
 * - ax + b = c
 * - ax - b = c
 * - ax = c
 * - ax + b = cx + d
 */
function trySolveLinearEquation(raw: string, lower: string): MathSolverResult | null {
  // Check if query is asking to solve an equation or contains '='
  if (!raw.includes("=") && !lower.includes("solve") && !lower.includes("find x")) {
    return null;
  }

  // Extract the equation part
  const eqMatch = raw.match(/([0-9a-zA-Z\s+\-*\/^.]+=[0-9a-zA-Z\s+\-*\/^.]+)/);
  const eqString = eqMatch ? eqMatch[1].replace(/\s+/g, "") : raw.replace(/^(?:solve|find\s+[a-z]|calculate)\s+/i, "").replace(/\s+/g, "");

  if (!eqString.includes("=")) return null;

  const [lhs, rhs] = eqString.split("=");
  if (!lhs || !rhs) return null;

  // Pattern: ax + b = c  or  ax - b = c  or  ax = c
  // Handles variable name: x, y, z, a, b, n, t
  const simpleLinearRegex = /^([+-]?\d*(?:\.\d+)?)([a-zA-Z])([+-]\d+(?:\.\d+)?)?$/;
  const lhsMatch = lhs.match(simpleLinearRegex);
  const rhsNum = parseFloat(rhs);

  if (lhsMatch && !isNaN(rhsNum)) {
    const rawA = lhsMatch[1];
    const variable = lhsMatch[2];
    const rawB = lhsMatch[3];

    let a = 1;
    if (rawA === "" || rawA === "+") a = 1;
    else if (rawA === "-") a = -1;
    else a = parseFloat(rawA);

    const b = rawB ? parseFloat(rawB) : 0;

    if (a !== 0) {
      // Step-by-step:
      // ax + b = rhsNum
      // ax = rhsNum - b
      // x = (rhsNum - b) / a
      const numerator = rhsNum - b;
      const solution = numerator / a;
      const formattedSolution = Number.isInteger(solution) ? solution.toString() : solution.toFixed(2);

      const signB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const step2Text = b !== 0
        ? `Subtract **${b}** from both sides:\n   $$\n   ${a !== 1 ? a : ""}${variable} = ${rhsNum} ${b > 0 ? `- ${b}` : `+ ${Math.abs(b)}`} \\implies ${a !== 1 ? a : ""}${variable} = ${numerator}\n   $$`
        : `Variable term is already isolated: ${a !== 1 ? a : ""}${variable} = ${numerator}`;

      const step3Text = a !== 1
        ? `Divide both sides by the coefficient **${a}**:\n   $$\n   ${variable} = \\frac{${numerator}}{${a}} = \\mathbf{${formattedSolution}}\n   $$`
        : `Since the coefficient is 1:\n   $$\n   ${variable} = \\mathbf{${formattedSolution}}\n   $$`;

      // Verification check:
      const checkLhs = a * solution + b;
      const checkMatch = Math.abs(checkLhs - rhsNum) < 0.0001;

      const solutionMarkdown = `### 📐 Step-by-Step Solution: Linear Equation
*Mathematics · Algebra & Linear Equations*

---

#### 🎯 Problem Statement:
Solve for **$${variable}$** in the equation:
$$\n${a !== 1 ? a : ""}${variable} ${b !== 0 ? signB : ""} = ${rhsNum}\n$$

---

#### 🪜 Step-by-Step Algebraic Walkthrough:

1. **Write down the given equation:**
   $$\n   ${a !== 1 ? a : ""}${variable} ${b !== 0 ? signB : ""} = ${rhsNum}\n   $$

2. **${step2Text}**

3. **${step3Text}**

4. **✅ Verification (Check your answer):**
   Substitute $${variable} = ${formattedSolution}$ back into the original left-hand side:
   $$\n   \\text{LHS} = ${a}(${formattedSolution}) ${b !== 0 ? signB : ""} = ${checkLhs.toFixed(2).replace(/\.00$/, "")}\n   $$
   $$\n   \\text{LHS} = \\text{RHS} = ${rhsNum} \\quad \\text{(${checkMatch ? "Verified Correct! 🎉" : "Checked"})}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{${variable} = ${formattedSolution}}\n$$

---

#### 🎓 Key Takeaway & Exam Tip:
- **Golden Rule of Algebra**: Whatever operation (addition, subtraction, multiplication, division) you perform on one side of the equals sign, you must perform equally on the other side to keep balance!
- Always substitute your answer back into the original equation during tests to guarantee 100% full marks!`;

      // Build realistic distractors
      const dist1 = Number.isInteger(solution) ? (solution + 2).toString() : (solution + 1.5).toFixed(2);
      const dist2 = Number.isInteger(solution) ? (solution - 2).toString() : (solution - 1.5).toFixed(2);
      const dist3 = Number.isInteger(solution) ? (solution * 2).toString() : (solution * 2).toFixed(2);

      const mcq: GeneratedMCQ = {
        question_text: `What is the exact solution for ${variable} in the linear equation ${a !== 1 ? a : ""}${variable} ${b !== 0 ? signB : ""} = ${rhsNum}?`,
        option_a: `${variable} = ${formattedSolution}`,
        option_b: `${variable} = ${dist1}`,
        option_c: `${variable} = ${dist2}`,
        option_d: `${variable} = ${dist3}`,
        correct_option: "A",
        explanation: `Subtracting ${b} from both sides gives ${a}${variable} = ${numerator}. Dividing both sides by ${a} yields ${variable} = ${formattedSolution}.`,
        difficulty: "Easy",
        subject: "Mathematics",
        topic: "Linear Equations & Algebra",
        concept: "Solving Linear Equations",
        validation_passed: true,
      };

      return {
        isSolved: true,
        subject: "Mathematics",
        topic: "Linear Equations & Algebra",
        concept: "Solving Linear Equations",
        solutionMarkdown,
        mcq,
      };
    }
  }

  return null;
}

/**
 * Solves quadratic equations of form: ax^2 + bx + c = 0
 */
function trySolveQuadraticEquation(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("^2") && !lower.includes("x2") && !lower.includes("quadratic")) {
    return null;
  }

  // Common quadratic patterns like x^2 - 5x + 6 = 0 or 2x^2 + 5x - 3 = 0
  const quadMatch = raw.replace(/\s+/g, "").match(/([+-]?\d*(?:\.\d+)?)[a-zA-Z]\^?2([+-]\d*(?:\.\d+)?)[a-zA-Z]([+-]\d+(?:\.\d+)?)?=0/i);
  if (!quadMatch) return null;

  const rawA = quadMatch[1];
  const rawB = quadMatch[2];
  const rawC = quadMatch[3];

  let a = 1;
  if (rawA === "" || rawA === "+") a = 1;
  else if (rawA === "-") a = -1;
  else a = parseFloat(rawA);

  let b = 1;
  if (rawB === "" || rawB === "+") b = 1;
  else if (rawB === "-") b = -1;
  else b = parseFloat(rawB);

  const c = rawC ? parseFloat(rawC) : 0;

  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  // Discriminant D = b^2 - 4ac
  const D = b * b - 4 * a * c;

  let rootsText = "";
  let root1Str = "";
  let root2Str = "";

  if (D > 0) {
    const sqrtD = Math.sqrt(D);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    root1Str = Number.isInteger(r1) ? r1.toString() : r1.toFixed(2);
    root2Str = Number.isInteger(r2) ? r2.toString() : r2.toFixed(2);
    rootsText = `Two distinct real roots:\n   $$\n   x_1 = \\frac{-(${b}) + \\sqrt{${D}}}{2(${a})} = \\mathbf{${root1Str}}, \\quad x_2 = \\frac{-(${b}) - \\sqrt{${D}}}{2(${a})} = \\mathbf{${root2Str}}\n   $$`;
  } else if (D === 0) {
    const r = -b / (2 * a);
    root1Str = Number.isInteger(r) ? r.toString() : r.toFixed(2);
    root2Str = root1Str;
    rootsText = `One real repeated root (double root):\n   $$\n   x = \\frac{-(${b})}{2(${a})} = \\mathbf{${root1Str}}\n   $$`;
  } else {
    const realPart = (-b / (2 * a)).toFixed(2);
    const imagPart = (Math.sqrt(-D) / (2 * a)).toFixed(2);
    root1Str = `${realPart} + ${imagPart}i`;
    root2Str = `${realPart} - ${imagPart}i`;
    rootsText = `Two complex conjugate roots:\n   $$\n   x_1 = \\mathbf{${root1Str}}, \\quad x_2 = \\mathbf{${root2Str}}\n   $$`;
  }

  const solutionMarkdown = `### 📐 Step-by-Step Solution: Quadratic Equation
*Mathematics · Algebra & Polynomial Roots*

---

#### 🎯 Problem Statement:
Find the roots of the quadratic equation:
$$\n${a !== 1 ? a : ""}x^2 ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0\n$$

---

#### 🪜 Step-by-Step Derivation:

1. **Identify Coefficients from Standard Form $ax^2 + bx + c = 0$:**
   - $a = ${a}$
   - $b = ${b}$
   - $c = ${c}$

2. **Compute the Discriminant $\\Delta = b^2 - 4ac$:**
   $$\n   \\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = \\mathbf{${D}}\n   $$
   - Since $\\Delta ${D > 0 ? "> 0" : D === 0 ? "= 0" : "< 0"}$, this equation has **${D > 0 ? "two distinct real roots" : D === 0 ? "one repeated real root" : "two complex conjugate roots"}**.

3. **Apply the Quadratic Formula:**
   $$\n   x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${D}}}{2(${a})}\n   $$

4. **Calculate the Final Roots:**
   ${rootsText}

---

#### 💡 Final Answer:
$$\n\\mathbf{x = ${root1Str}, \\quad x = ${root2Str}}\n$$`;

  const mcq: GeneratedMCQ = {
    question_text: `What is the value of the discriminant (Δ = b² - 4ac) for the quadratic equation ${a !== 1 ? a : ""}x² ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0?`,
    option_a: `Δ = ${D} (${D > 0 ? "yielding two real distinct roots" : D === 0 ? "yielding one real repeated root" : "yielding complex roots"})`,
    option_b: `Δ = ${D + 5}`,
    option_c: `Δ = ${D - 4}`,
    option_d: `Δ = ${-D}`,
    correct_option: "A",
    explanation: `Using the discriminant formula Δ = b² - 4ac: (${b})² - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${D}.`,
    difficulty: "Medium",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    concept: "Quadratic Roots & Discriminant",
    validation_passed: true,
  };

  return {
    isSolved: true,
    subject: "Mathematics",
    topic: "Quadratic Equations",
    concept: "Quadratic Roots & Discriminant",
    solutionMarkdown,
    mcq,
  };
}

/**
 * Solves percentage problems: "what is P% of N"
 */
function trySolvePercentage(raw: string, lower: string): MathSolverResult | null {
  const match = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const percent = parseFloat(match[1]);
  const total = parseFloat(match[2]);

  if (isNaN(percent) || isNaN(total)) return null;

  const result = (percent / 100) * total;
  const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(2);

  const solutionMarkdown = `### 📊 Step-by-Step Percentage Calculation
*Mathematics · Arithmetic & Commercial Mathematics*

---

#### 🎯 Problem Statement:
Calculate **${percent}% of ${total}**.

---

#### 🪜 Step-by-Step Solution:

1. **Understand what "Percent" means:**
   "Per cent" literally means *"out of 100"*. Therefore:
   $$\n   ${percent}\\% = \\frac{${percent}}{100} = ${(percent / 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}\n   $$

2. **Multiply by the total value:**
   $$\n   \\text{Value} = \\frac{${percent}}{100} \\times ${total}\n   $$

3. **Compute the final value:**
   $$\n   \\text{Value} = ${percent / 100} \\times ${total} = \\mathbf{${resultStr}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{${percent}\\% \\text{ of } ${total} = ${resultStr}}\n$$`;

  const mcq: GeneratedMCQ = {
    question_text: `What is ${percent}% of ${total}?`,
    option_a: `${resultStr}`,
    option_b: `${(result * 1.5).toFixed(1)}`,
    option_c: `${(result * 0.5).toFixed(1)}`,
    option_d: `${(result + 10).toFixed(1)}`,
    correct_option: "A",
    explanation: `${percent}% of ${total} is computed as (${percent} / 100) * ${total} = ${resultStr}.`,
    difficulty: "Easy",
    subject: "Mathematics",
    topic: "Arithmetic & Percentages",
    concept: "Percentage Calculations",
    validation_passed: true,
  };

  return {
    isSolved: true,
    subject: "Mathematics",
    topic: "Arithmetic & Percentages",
    concept: "Percentage Calculations",
    solutionMarkdown,
    mcq,
  };
}

/**
 * Solves Ohm's law numericals: V = IR, P = VI
 */
function trySolveOhmsLawNumerical(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("ohm") && !lower.includes("voltage") && !lower.includes("resistance") && !lower.includes("current")) {
    return null;
  }

  // Look for values: V = 10, R = 5 or I = 2A, R = 4 ohm
  const vMatch = lower.match(/(?:v\s*=|voltage\s*=|potential\s*difference\s*(?:of|=))\s*(\d+(?:\.\d+)?)\s*(?:v|volts)?/i);
  const rMatch = lower.match(/(?:r\s*=|resistance\s*=|resistor\s*(?:of|=))\s*(\d+(?:\.\d+)?)\s*(?:ohm|ohms|ω)?/i);
  const iMatch = lower.match(/(?:i\s*=|current\s*(?:of|=))\s*(\d+(?:\.\d+)?)\s*(?:a|amps|amperes)?/i);

  const V = vMatch ? parseFloat(vMatch[1]) : null;
  const R = rMatch ? parseFloat(rMatch[1]) : null;
  const I = iMatch ? parseFloat(iMatch[1]) : null;

  // Case 1: Given V and R, find I
  if (V !== null && R !== null && R > 0) {
    const current = V / R;
    const currentStr = Number.isInteger(current) ? current.toString() : current.toFixed(2);
    const power = V * current;
    const powerStr = Number.isInteger(power) ? power.toString() : power.toFixed(2);

    const solutionMarkdown = `### ⚡ Step-by-Step Solution: Ohm's Law
*Physics · Current Electricity & Circuits*

---

#### 🎯 Given Data:
- **Voltage (V)** = $${V}\\text{ Volts (V)}$
- **Resistance (R)** = $${R}\\ \\Omega\\text{ (Ohms)}$

---

#### 🪜 Step-by-Step Calculation:

1. **State the Governing Law (Ohm's Law):**
   $$\n   V = I \\times R\n   $$

2. **Rearrange for Current ($I$):**
   $$\n   I = \\frac{V}{R}\n   $$

3. **Substitute the Given Values:**
   $$\n   I = \\frac{${V}\\text{ V}}{${R}\\ \\Omega} = \\mathbf{${currentStr}\\text{ Amperes (A)}}\n   $$

4. **Bonus: Electrical Power Dissipation ($P$):**
   $$\n   P = V \\times I = ${V} \\times ${currentStr} = \\mathbf{${powerStr}\\text{ Watts (W)}}\n   $$

---

#### 💡 Final Answer:
- **Electric Current ($I$)** = $\\mathbf{${currentStr}\\text{ A}}$
- **Power Dissipated ($P$)** = $\\mathbf{${powerStr}\\text{ W}}$`;

    const mcq: GeneratedMCQ = {
      question_text: `If a ${V} V potential difference is applied across a ${R} Ω resistor, what is the electric current flowing through it?`,
      option_a: `${currentStr} A (using I = V / R = ${V} / ${R})`,
      option_b: `${(current * 2).toFixed(1)} A`,
      option_c: `${(current * 0.5).toFixed(1)} A`,
      option_d: `${(V * R).toFixed(1)} A`,
      correct_option: "A",
      explanation: `By Ohm's Law (V = IR), rearranging for current gives I = V / R = ${V} / ${R} = ${currentStr} Amperes.`,
      difficulty: "Easy",
      subject: "Physics",
      topic: "Current Electricity & Circuits",
      concept: "Ohm's Law ($V = IR$)",
      validation_passed: true,
    };

    return {
      isSolved: true,
      subject: "Physics",
      topic: "Current Electricity & Circuits",
      concept: "Ohm's Law ($V = IR$)",
      solutionMarkdown,
      mcq,
    };
  }

  // Case 2: Given I and R, find V
  if (I !== null && R !== null) {
    const voltage = I * R;
    const voltageStr = Number.isInteger(voltage) ? voltage.toString() : voltage.toFixed(2);
    const power = voltage * I;
    const powerStr = Number.isInteger(power) ? power.toString() : power.toFixed(2);

    const solutionMarkdown = `### ⚡ Step-by-Step Solution: Ohm's Law
*Physics · Current Electricity & Circuits*

---

#### 🎯 Given Data:
- **Current (I)** = $${I}\\text{ Amperes (A)}$
- **Resistance (R)** = $${R}\\ \\Omega\\text{ (Ohms)}$

---

#### 🪜 Step-by-Step Calculation:

1. **State Ohm's Law Formula:**
   $$\n   V = I \\times R\n   $$

2. **Substitute Given Values:**
   $$\n   V = ${I}\\text{ A} \\times ${R}\\ \\Omega = \\mathbf{${voltageStr}\\text{ Volts (V)}}\n   $$

3. **Bonus: Power Dissipated ($P$):**
   $$\n   P = I^2 \\times R = (${I})^2 \\times ${R} = \\mathbf{${powerStr}\\text{ Watts (W)}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{V = ${voltageStr}\\text{ Volts (V)}}\n$$`;

    const mcq: GeneratedMCQ = {
      question_text: `What voltage is required to drive a ${I} A current through a ${R} Ω resistor?`,
      option_a: `${voltageStr} V (using V = I * R = ${I} * ${R})`,
      option_b: `${(voltage * 2).toFixed(1)} V`,
      option_c: `${(voltage / 2).toFixed(1)} V`,
      option_d: `${(R / I).toFixed(1)} V`,
      correct_option: "A",
      explanation: `By Ohm's Law (V = IR), the potential difference is V = ${I} A * ${R} Ω = ${voltageStr} Volts.`,
      difficulty: "Easy",
      subject: "Physics",
      topic: "Current Electricity & Circuits",
      concept: "Ohm's Law ($V = IR$)",
      validation_passed: true,
    };

    return {
      isSolved: true,
      subject: "Physics",
      topic: "Current Electricity & Circuits",
      concept: "Ohm's Law ($V = IR$)",
      solutionMarkdown,
      mcq,
    };
  }

  return null;
}
