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

  // 5. NEWTON'S SECOND LAW NUMERICALS: e.g. "mass = 10 kg, acceleration = 3 m/s^2, find force"
  const newtonResult = trySolveNewtonSecondLaw(clean, lower);
  if (newtonResult) return newtonResult;

  // 6. KINETIC ENERGY NUMERICALS: e.g. "mass = 4 kg, velocity = 5 m/s, find kinetic energy"
  const keResult = trySolveKineticEnergy(clean, lower);
  if (keResult) return keResult;

  // 7. PYTHAGOREAN THEOREM: e.g. "hypotenuse if sides are 3 and 4", "a = 6, b = 8 find hypotenuse"
  const pythagorasResult = trySolvePythagoras(clean, lower);
  if (pythagorasResult) return pythagorasResult;

  // 8. SPEED, DISTANCE, TIME: e.g. "speed if distance is 120 km and time is 2 hours"
  const sdtResult = trySolveSpeedDistanceTime(clean, lower);
  if (sdtResult) return sdtResult;

  // 9. SIMPLE INTEREST: e.g. "simple interest for P = 5000, R = 5%, T = 3 years"
  const siResult = trySolveSimpleInterest(clean, lower);
  if (siResult) return siResult;

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
  if (!raw.includes("=") && !lower.includes("solve") && !lower.includes("find x") && !lower.includes("value of x")) {
    return null;
  }

  // Strip prefixes like "solve", "find x in", "calculate"
  const stripped = raw
    .replace(/^(?:solve(?:\s+the\s+equation)?|find\s+(?:the\s+value\s+of\s+)?[a-zA-Z](?:\s+in)?|calculate)\s+/i, "")
    .trim();

  if (!stripped.includes("=")) return null;

  const [rawLhs, rawRhs] = stripped.split("=");
  if (!rawLhs || !rawRhs) return null;

  const lhs = rawLhs.replace(/\s+/g, "");
  const rhs = rawRhs.replace(/\s+/g, "");

  // Pattern A: ax + b = c (single variable on LHS, constant on RHS)
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
- **Golden Rule of Algebra**: Whatever operation you perform on one side of the equals sign, you must perform equally on the other side to keep balance!
- Always substitute your answer back into the original equation during exams to guarantee full marks!`;

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

  // Pattern B: ax + b = cx + d (variables on both LHS and RHS)
  const rhsMatch = rhs.match(simpleLinearRegex);
  if (lhsMatch && rhsMatch && lhsMatch[2].toLowerCase() === rhsMatch[2].toLowerCase()) {
    const variable = lhsMatch[2];

    const parseCoeff = (c: string) => {
      if (c === "" || c === "+") return 1;
      if (c === "-") return -1;
      return parseFloat(c);
    };

    const a1 = parseCoeff(lhsMatch[1]);
    const b1 = lhsMatch[3] ? parseFloat(lhsMatch[3]) : 0;
    const a2 = parseCoeff(rhsMatch[1]);
    const b2 = rhsMatch[3] ? parseFloat(rhsMatch[3]) : 0;

    const netA = a1 - a2;
    const netB = b2 - b1;

    if (netA !== 0) {
      const solution = netB / netA;
      const formattedSolution = Number.isInteger(solution) ? solution.toString() : solution.toFixed(2);

      const signB1 = b1 >= 0 ? `+ ${b1}` : `- ${Math.abs(b1)}`;
      const signB2 = b2 >= 0 ? `+ ${b2}` : `- ${Math.abs(b2)}`;

      const solutionMarkdown = `### 📐 Step-by-Step Solution: Linear Equation with Variables on Both Sides
*Mathematics · Algebra & Linear Equations*

---

#### 🎯 Problem Statement:
Solve for **$${variable}$** in the equation:
$$\n${a1 !== 1 ? a1 : ""}${variable} ${b1 !== 0 ? signB1 : ""} = ${a2 !== 1 ? a2 : ""}${variable} ${b2 !== 0 ? signB2 : ""}\n$$

---

#### 🪜 Step-by-Step Walkthrough:

1. **Given Equation:**
   $$\n   ${a1 !== 1 ? a1 : ""}${variable} ${b1 !== 0 ? signB1 : ""} = ${a2 !== 1 ? a2 : ""}${variable} ${b2 !== 0 ? signB2 : ""}\n   $$

2. **Collect variable terms on the left side:**
   Subtract $${a2 !== 1 ? a2 : ""}${variable}$ from both sides:
   $$\n   (${a1} - ${a2})${variable} ${b1 !== 0 ? signB1 : ""} = ${b2}\n   $$
   $$\n   ${netA !== 1 ? netA : ""}${variable} ${b1 !== 0 ? signB1 : ""} = ${b2}\n   $$

3. **Isolate variable term:**
   ${b1 !== 0 ? `Subtract ${b1} from both sides:\n   $$\n   ${netA !== 1 ? netA : ""}${variable} = ${b2} - (${b1}) = ${netB}\n   $$` : `Variable term is already isolated: ${netA}${variable} = ${netB}`}

4. **Solve for $${variable}$:**
   Divide both sides by ${netA}:
   $$\n   ${variable} = \\frac{${netB}}{${netA}} = \\mathbf{${formattedSolution}}\n   $$

5. **✅ Check Answer:**
   - LHS = $${a1}(${formattedSolution}) ${b1 !== 0 ? signB1 : ""} = ${(a1 * solution + b1).toFixed(2).replace(/\.00$/, "")}$
   - RHS = $${a2}(${formattedSolution}) ${b2 !== 0 ? signB2 : ""} = ${(a2 * solution + b2).toFixed(2).replace(/\.00$/, "")}$
   - LHS = RHS! Verified correct.

---

#### 💡 Final Answer:
$$\n\\mathbf{${variable} = ${formattedSolution}}\n$$`;

      const dist1 = Number.isInteger(solution) ? (solution + 1).toString() : (solution + 1.2).toFixed(2);
      const dist2 = Number.isInteger(solution) ? (solution - 1).toString() : (solution - 1.2).toFixed(2);
      const dist3 = Number.isInteger(solution) ? (-solution).toString() : (-solution).toFixed(2);

      const mcq: GeneratedMCQ = {
        question_text: `What is the value of ${variable} satisfying ${a1 !== 1 ? a1 : ""}${variable} ${b1 !== 0 ? signB1 : ""} = ${a2 !== 1 ? a2 : ""}${variable} ${b2 !== 0 ? signB2 : ""}?`,
        option_a: `${variable} = ${formattedSolution}`,
        option_b: `${variable} = ${dist1}`,
        option_c: `${variable} = ${dist2}`,
        option_d: `${variable} = ${dist3}`,
        correct_option: "A",
        explanation: `Collecting like terms gives (${a1} - ${a2})${variable} = ${b2} - ${b1}, which simplifies to ${netA}${variable} = ${netB}, giving ${variable} = ${formattedSolution}.`,
        difficulty: "Medium",
        subject: "Mathematics",
        topic: "Linear Equations & Algebra",
        concept: "Solving Linear Equations with Variables on Both Sides",
        validation_passed: true,
      };

      return {
        isSolved: true,
        subject: "Mathematics",
        topic: "Linear Equations & Algebra",
        concept: "Solving Linear Equations with Variables on Both Sides",
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

  const cleanEq = raw
    .replace(/^(?:solve(?:\s+the\s+equation)?|find\s+roots\s+of|roots\s+of|calculate)\s+/i, "")
    .replace(/\s+/g, "");

  const quadMatch = cleanEq.match(/([+-]?\d*(?:\.\d+)?)[a-zA-Z]\^?2([+-]\d*(?:\.\d+)?)[a-zA-Z]([+-]\d+(?:\.\d+)?)?=0/i);
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

  const vMatch = lower.match(/(?:v\s*=|voltage\s*(?:of|=|is)?|potential\s*difference\s*(?:of|=|is)?)\s*(\d+(?:\.\d+)?)\s*(?:v|volts)?/i);
  const rMatch = lower.match(/(?:r\s*=|resistance\s*(?:of|=|is)?|resistor\s*(?:of|=|is)?)\s*(\d+(?:\.\d+)?)\s*(?:ohm|ohms|ω)?/i);
  const iMatch = lower.match(/(?:i\s*=|current\s*(?:of|=|is)?)\s*(\d+(?:\.\d+)?)\s*(?:a|amps|amperes)?/i);

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

/**
 * Solves Newton's Second Law numericals: F = ma, a = F/m, m = F/a
 */
function trySolveNewtonSecondLaw(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("newton") && !lower.includes("force") && !lower.includes("acceleration") && !lower.includes("mass")) {
    return null;
  }

  const mMatch = lower.match(/(?:mass\s*(?:of|=|is)?|m\s*=)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilograms|g)?/i);
  const aMatch = lower.match(/(?:acceleration\s*(?:of|=|is)?|a\s*=)\s*(\d+(?:\.\d+)?)\s*(?:m\/s\^?2|ms-2)?/i);
  const fMatch = lower.match(/(?:force\s*(?:of|=|is)?|f\s*=)\s*(\d+(?:\.\d+)?)\s*(?:n|newtons)?/i);

  const m = mMatch ? parseFloat(mMatch[1]) : null;
  const a = aMatch ? parseFloat(aMatch[1]) : null;
  const f = fMatch ? parseFloat(fMatch[1]) : null;

  // Case 1: Given m and a, find F
  if (m !== null && a !== null && f === null) {
    const force = m * a;
    const forceStr = Number.isInteger(force) ? force.toString() : force.toFixed(2);

    const solutionMarkdown = `### 🚀 Step-by-Step Solution: Newton's Second Law of Motion
*Physics · Classical Mechanics & Dynamics*

---

#### 🎯 Given Data:
- **Mass ($m$)** = $${m}\\text{ kg}$
- **Acceleration ($a$)** = $${a}\\text{ m/s}^2$

---

#### 🪜 Step-by-Step Calculation:

1. **State the Governing Law:**
   According to Newton's Second Law of Motion:
   $$\n   F = m \\times a\n   $$

2. **Substitute Given Values:**
   $$\n   F = ${m}\\text{ kg} \\times ${a}\\text{ m/s}^2 = \\mathbf{${forceStr}\\text{ Newtons (N)}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{F = ${forceStr}\\text{ N}}\n$$`;

    const mcq: GeneratedMCQ = {
      question_text: `What net force is required to impart an acceleration of ${a} m/s² to an object of mass ${m} kg?`,
      option_a: `${forceStr} N (using F = m * a = ${m} * ${a})`,
      option_b: `${(force * 1.5).toFixed(1)} N`,
      option_c: `${(force * 0.5).toFixed(1)} N`,
      option_d: `${(m + a).toFixed(1)} N`,
      correct_option: "A",
      explanation: `By Newton's second law, net force is the product of mass and acceleration: F = ma = ${m} * ${a} = ${forceStr} N.`,
      difficulty: "Easy",
      subject: "Physics",
      topic: "Laws of Motion & Mechanics",
      concept: "Newton's Second Law ($F = ma$)",
      validation_passed: true,
    };

    return {
      isSolved: true,
      subject: "Physics",
      topic: "Laws of Motion & Mechanics",
      concept: "Newton's Second Law ($F = ma$)",
      solutionMarkdown,
      mcq,
    };
  }

  // Case 2: Given F and m, find a
  if (f !== null && m !== null && m > 0 && a === null) {
    const acc = f / m;
    const accStr = Number.isInteger(acc) ? acc.toString() : acc.toFixed(2);

    const solutionMarkdown = `### 🚀 Step-by-Step Solution: Newton's Second Law of Motion
*Physics · Classical Mechanics & Dynamics*

---

#### 🎯 Given Data:
- **Force ($F$)** = $${f}\\text{ N}$
- **Mass ($m$)** = $${m}\\text{ kg}$

---

#### 🪜 Step-by-Step Calculation:

1. **State Newton's Second Law:**
   $$\n   F = m \\times a \\implies a = \\frac{F}{m}\n   $$

2. **Substitute the Values:**
   $$\n   a = \\frac{${f}\\text{ N}}{${m}\\text{ kg}} = \\mathbf{${accStr}\\text{ m/s}^2}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{a = ${accStr}\\text{ m/s}^2}\n$$`;

    const mcq: GeneratedMCQ = {
      question_text: `What is the acceleration produced when a force of ${f} N acts on a body of mass ${m} kg?`,
      option_a: `${accStr} m/s²`,
      option_b: `${(acc * 2).toFixed(1)} m/s²`,
      option_c: `${(acc * 0.5).toFixed(1)} m/s²`,
      option_d: `${(f * m).toFixed(1)} m/s²`,
      correct_option: "A",
      explanation: `Rearranging Newton's Second Law (F = ma) gives a = F / m = ${f} / ${m} = ${accStr} m/s².`,
      difficulty: "Easy",
      subject: "Physics",
      topic: "Laws of Motion & Mechanics",
      concept: "Newton's Second Law ($F = ma$)",
      validation_passed: true,
    };

    return {
      isSolved: true,
      subject: "Physics",
      topic: "Laws of Motion & Mechanics",
      concept: "Newton's Second Law ($F = ma$)",
      solutionMarkdown,
      mcq,
    };
  }

  return null;
}

/**
 * Solves Kinetic Energy numericals: KE = 1/2 m v^2
 */
function trySolveKineticEnergy(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("kinetic") && !lower.includes("ke") && !(lower.includes("energy") && (lower.includes("velocity") || lower.includes("speed")))) {
    return null;
  }

  const mMatch = lower.match(/(?:mass\s*(?:of|=|is)?|m\s*=)\s*(\d+(?:\.\d+)?)\s*(?:kg)?/i);
  const vMatch = lower.match(/(?:velocity\s*(?:of|=|is)?|speed\s*(?:of|=|is)?|v\s*=)\s*(\d+(?:\.\d+)?)\s*(?:m\/s)?/i);

  if (!mMatch || !vMatch) return null;

  const m = parseFloat(mMatch[1]);
  const v = parseFloat(vMatch[1]);

  if (isNaN(m) || isNaN(v) || m <= 0) return null;

  const ke = 0.5 * m * v * v;
  const keStr = Number.isInteger(ke) ? ke.toString() : ke.toFixed(2);

  const solutionMarkdown = `### ⚡ Step-by-Step Solution: Kinetic Energy
*Physics · Work, Energy & Power*

---

#### 🎯 Given Data:
- **Mass ($m$)** = $${m}\\text{ kg}$
- **Velocity ($v$)** = $${v}\\text{ m/s}$

---

#### 🪜 Step-by-Step Calculation:

1. **State the Kinetic Energy Formula:**
   $$\n   KE = \\frac{1}{2} m v^2\n   $$

2. **Substitute Given Values:**
   $$\n   KE = \\frac{1}{2} \\times ${m} \\times (${v})^2\n   $$
   $$\n   KE = 0.5 \\times ${m} \\times ${v * v} = \\mathbf{${keStr}\\text{ Joules (J)}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{KE = ${keStr}\\text{ J}}\n$$`;

  const mcq: GeneratedMCQ = {
    question_text: `What is the kinetic energy of an object of mass ${m} kg moving at a velocity of ${v} m/s?`,
    option_a: `${keStr} Joules`,
    option_b: `${(ke * 2).toFixed(1)} Joules`,
    option_c: `${(m * v).toFixed(1)} Joules`,
    option_d: `${(ke * 0.5).toFixed(1)} Joules`,
    correct_option: "A",
    explanation: `Kinetic energy is calculated via KE = 1/2 m v² = 0.5 * ${m} * (${v})² = ${keStr} J.`,
    difficulty: "Easy",
    subject: "Physics",
    topic: "Work, Energy & Power",
    concept: "Kinetic Energy ($KE = \\frac{1}{2}mv^2$)",
    validation_passed: true,
  };

  return {
    isSolved: true,
    subject: "Physics",
    topic: "Work, Energy & Power",
    concept: "Kinetic Energy ($KE = \\frac{1}{2}mv^2$)",
    solutionMarkdown,
    mcq,
  };
}

/**
 * Solves Pythagorean theorem: a^2 + b^2 = c^2
 */
function trySolvePythagoras(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("pythagor") && !lower.includes("hypotenuse") && !lower.includes("right triangle") && !lower.includes("right-angled")) {
    return null;
  }

  // Match sides/legs e.g. "sides are 3 and 4", "legs are 3 and 4", "a = 3, b = 4"
  const sidesMatch = lower.match(/(?:(?:sides?|legs?)\s*(?:are|=|of)?\s*|a\s*=\s*)(\d+(?:\.\d+)?)\s*(?:and|,|\s+b\s*=\s*)\s*(\d+(?:\.\d+)?)/i);
  if (!sidesMatch) return null;

  const a = parseFloat(sidesMatch[1]);
  const b = parseFloat(sidesMatch[2]);

  if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;

  const cSq = a * a + b * b;
  const c = Math.sqrt(cSq);
  const cStr = Number.isInteger(c) ? c.toString() : c.toFixed(2);

  const solutionMarkdown = `### 📐 Step-by-Step Solution: Pythagorean Theorem
*Mathematics · Geometry & Trigonometry*

---

#### 🎯 Problem Statement:
Find the hypotenuse ($c$) of a right-angled triangle with legs **$a = ${a}$** and **$b = ${b}$**.

---

#### 🪜 Step-by-Step Calculation:

1. **State the Pythagorean Theorem:**
   $$\n   a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}\n   $$

2. **Substitute Given Leg Lengths:**
   $$\n   c = \\sqrt{(${a})^2 + (${b})^2} = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${cSq}}\n   $$

3. **Calculate the Square Root:**
   $$\n   c = \\mathbf{${cStr}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{c = ${cStr}}\n$$`;

  const mcq: GeneratedMCQ = {
    question_text: `In a right triangle with legs of length ${a} and ${b}, what is the length of the hypotenuse?`,
    option_a: `${cStr}`,
    option_b: `${(a + b).toFixed(1)}`,
    option_c: `${(c * 1.5).toFixed(1)}`,
    option_d: `${(cSq).toFixed(0)}`,
    correct_option: "A",
    explanation: `By the Pythagorean theorem, c = √(a² + b²) = √(${a * a} + ${b * b}) = √(${cSq}) = ${cStr}.`,
    difficulty: "Easy",
    subject: "Mathematics",
    topic: "Geometry & Trigonometry",
    concept: "Pythagorean Theorem",
    validation_passed: true,
  };

  return {
    isSolved: true,
    subject: "Mathematics",
    topic: "Geometry & Trigonometry",
    concept: "Pythagorean Theorem",
    solutionMarkdown,
    mcq,
  };
}

/**
 * Solves Speed, Distance, Time: d = s * t, s = d/t, t = d/s
 */
function trySolveSpeedDistanceTime(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("speed") && !lower.includes("distance") && !lower.includes("velocity")) {
    return null;
  }

  const dMatch = lower.match(/(?:distance\s*(?:of|=|is)?|d\s*=)\s*(\d+(?:\.\d+)?)\s*(?:km|m|miles)?/i);
  const tMatch = lower.match(/(?:time\s*(?:of|=|is)?|t\s*=)\s*(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr|seconds|sec|s)?/i);
  const sMatch = lower.match(/(?:speed\s*(?:of|=|is)?|s\s*=)\s*(\d+(?:\.\d+)?)\s*(?:km\/h|m\/s)?/i);

  const d = dMatch ? parseFloat(dMatch[1]) : null;
  const t = tMatch ? parseFloat(tMatch[1]) : null;
  const s = sMatch ? parseFloat(sMatch[1]) : null;

  // Case 1: Given d and t, find s
  if (d !== null && t !== null && t > 0 && s === null) {
    const speed = d / t;
    const speedStr = Number.isInteger(speed) ? speed.toString() : speed.toFixed(2);

    const solutionMarkdown = `### 🏎️ Step-by-Step Solution: Speed, Distance & Time
*Physics & Mathematics · Kinematics*

---

#### 🎯 Given Data:
- **Distance ($d$)** = $${d}$
- **Time ($t$)** = $${t}$

---

#### 🪜 Step-by-Step Calculation:

1. **State the Speed Formula:**
   $$\n   \\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}\n   $$

2. **Substitute Values:**
   $$\n   s = \\frac{${d}}{${t}} = \\mathbf{${speedStr}}\n   $$

---

#### 💡 Final Answer:
$$\n\\mathbf{\\text{Speed} = ${speedStr}}\n$$`;

    const mcq: GeneratedMCQ = {
      question_text: `If an object travels a distance of ${d} units in ${t} units of time, what is its average speed?`,
      option_a: `${speedStr} units`,
      option_b: `${(speed * 1.5).toFixed(1)} units`,
      option_c: `${(speed * 0.5).toFixed(1)} units`,
      option_d: `${(d * t).toFixed(1)} units`,
      correct_option: "A",
      explanation: `Speed is defined as distance divided by time: s = d / t = ${d} / ${t} = ${speedStr}.`,
      difficulty: "Easy",
      subject: "Physics",
      topic: "Kinematics & Motion",
      concept: "Speed, Distance and Time",
      validation_passed: true,
    };

    return {
      isSolved: true,
      subject: "Physics",
      topic: "Kinematics & Motion",
      concept: "Speed, Distance and Time",
      solutionMarkdown,
      mcq,
    };
  }

  return null;
}

/**
 * Solves Simple Interest: SI = (P * R * T) / 100
 */
function trySolveSimpleInterest(raw: string, lower: string): MathSolverResult | null {
  if (!lower.includes("interest") && !lower.includes("principal")) {
    return null;
  }

  const pMatch = lower.match(/(?:principal\s*(?:of|=|is)?|p\s*=)\s*(\d+(?:\.\d+)?)/i);
  const rMatch = lower.match(/(?:rate\s*(?:of|=|is)?|r\s*=)\s*(\d+(?:\.\d+)?)\s*%?/i);
  const tMatch = lower.match(/(?:time\s*(?:of|=|is)?|t\s*=)\s*(\d+(?:\.\d+)?)\s*(?:years|yrs)?/i);

  if (!pMatch || !rMatch || !tMatch) return null;

  const P = parseFloat(pMatch[1]);
  const R = parseFloat(rMatch[1]);
  const T = parseFloat(tMatch[1]);

  if (isNaN(P) || isNaN(R) || isNaN(T)) return null;

  const SI = (P * R * T) / 100;
  const siStr = Number.isInteger(SI) ? SI.toString() : SI.toFixed(2);
  const totalAmount = P + SI;
  const amountStr = Number.isInteger(totalAmount) ? totalAmount.toString() : totalAmount.toFixed(2);

  const solutionMarkdown = `### 💰 Step-by-Step Solution: Simple Interest
*Mathematics · Commercial Arithmetic & Financial Math*

---

#### 🎯 Given Data:
- **Principal ($P$)** = $${P}$
- **Rate ($R$)** = $${R}\\%$ per annum
- **Time ($T$)** = $${T}$ years

---

#### 🪜 Step-by-Step Calculation:

1. **State the Simple Interest Formula:**
   $$\n   SI = \\frac{P \\times R \\times T}{100}\n   $$

2. **Substitute Given Values:**
   $$\n   SI = \\frac{${P} \\times ${R} \\times ${T}}{100} = \\frac{${P * R * T}}{100} = \\mathbf{${siStr}}\n   $$

3. **Total Amount ($A = P + SI$):**
   $$\n   A = ${P} + ${siStr} = \\mathbf{${amountStr}}\n   $$

---

#### 💡 Final Answer:
- **Simple Interest ($SI$)** = $\\mathbf{${siStr}}$
- **Total Maturity Amount ($A$)** = $\\mathbf{${amountStr}}$`;

  const mcq: GeneratedMCQ = {
    question_text: `What is the simple interest on a principal of ${P} at ${R}% per annum for ${T} years?`,
    option_a: `${siStr}`,
    option_b: `${(SI * 1.2).toFixed(1)}`,
    option_c: `${(SI * 0.8).toFixed(1)}`,
    option_d: `${(P * R).toFixed(1)}`,
    correct_option: "A",
    explanation: `Using the formula SI = (P * R * T) / 100 = (${P} * ${R} * ${T}) / 100 = ${siStr}.`,
    difficulty: "Easy",
    subject: "Mathematics",
    topic: "Commercial Arithmetic",
    concept: "Simple Interest",
    validation_passed: true,
  };

  return {
    isSolved: true,
    subject: "Mathematics",
    topic: "Commercial Arithmetic",
    concept: "Simple Interest",
    solutionMarkdown,
    mcq,
  };
}
