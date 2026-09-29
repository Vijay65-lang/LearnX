/**
 * LearnX Academic Knowledge Base & Precision Mastery Engine
 * Deeply verified concepts across Physics, Chemistry, Biology, Mathematics, and Computer Science.
 * Provides ChatGPT/Claude-style crystal clarity, intuitive analogies, step-by-step logic,
 * worked examples, exam takeaways, and 100% verified matching MCQs.
 */

export interface ConceptMasteryEntry {
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

export const ACADEMIC_KNOWLEDGE_BASE: ConceptMasteryEntry[] = [
  // ==========================================================================
  // PHYSICS
  // ==========================================================================
  {
    subject: "Physics",
    topic: "Current Electricity & Circuits",
    concept: "Ohm's Law ($V = IR$) & Electrical Resistance",
    keywords: ["ohm's law", "ohms law", "v = ir", "v=ir", "electrical resistance", "voltage and current", "resistor", "resistivity"],
    plainEnglish: "**Ohm's Law** states that the electric current ($I$) flowing through a conductor between two points is directly proportional to the voltage ($V$) across the two points, provided physical conditions (especially temperature) remain constant: $V = IR$.",
    analogy: "Think of water flowing through a garden pipe:\n- **Voltage ($V$)**: The water pressure from the tap pushing water through.\n- **Current ($I$)**: The actual rate of water flow (liters per second).\n- **Resistance ($R$)**: How narrow the pipe is or someone stepping on the hose, resisting the flow.",
    howItWorks: [
      "**1. Fundamental Formula**: $V = IR$, which can be rearranged to find current ($I = \\frac{V}{R}$) or resistance ($R = \\frac{V}{I}$).",
      "**2. Electric Current ($I$)**: Measured in **Amperes (A)**, represents the rate of charge flow: $I = \\frac{Q}{t}$ (Coulombs/sec).",
      "**3. Potential Difference / Voltage ($V$)**: Measured in **Volts (V)**, the electrical pressure or work done per unit charge.",
      "**4. Resistance ($R$)**: Measured in **Ohms ($\\Omega$)**, dependent on geometry and material: $R = \\rho \\frac{L}{A}$ (where $\\rho$ is resistivity, $L$ is length, and $A$ is cross-sectional area).",
      "**5. Ohmic vs Non-Ohmic Devices**: Metals obey Ohm's Law (linear V-I graph through origin); semiconductors, diodes, and electrolytes are non-ohmic."
    ],
    realWorldExample: "If an electric water heater is connected to a 240 V household outlet and draws 12 A of current, its internal resistance is $R = \\frac{V}{I} = \\frac{240}{12} = 20\\ \\Omega$!",
    keyTakeaways: [
      "Current is directly proportional to voltage and inversely proportional to resistance.",
      "Doubling the voltage across a constant resistor doubles the current.",
      "Doubling the resistance at a constant voltage cuts the current in half.",
      "SI Units: Voltage in Volts (V), Current in Amperes (A), Resistance in Ohms ($\\Omega$)."
    ],
    mcq: {
      question: "According to Ohm's Law (V = IR), if the voltage applied across a constant 10 Ω resistor is increased from 20 V to 40 V, what happens to the electric current?",
      a: "The current doubles from 2 A to 4 A (I = V / R)",
      b: "The current is halved from 2 A to 1 A",
      c: "The current remains unchanged at 2 A",
      d: "The current quadruples to 8 A",
      correct: "A",
      explanation: "By Ohm's Law, I = V / R. Initially I = 20 / 10 = 2 A. When voltage increases to 40 V, I = 40 / 10 = 4 A, directly doubling the current."
    }
  },
  {
    subject: "Physics",
    topic: "Gravitation & Planetary Motion",
    concept: "Newton's Universal Law of Gravitation & Gravity",
    keywords: ["gravity", "gravitation", "universal gravitation", "gravitational force", "newton gravity", "acceleration due to gravity", "g = 9.8", "inverse square law"],
    plainEnglish: "**Newton's Law of Universal Gravitation** states that every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers: $F = G \\frac{m_1 m_2}{r^2}$.",
    analogy: "Imagine an invisible, elastic rubber cord connecting every object in the cosmos. The heavier the objects, the thicker and stronger the cord; but the further apart they are, the weaker the pull becomes—dropping off rapidly like light fading from a flashlight!",
    howItWorks: [
      "**1. Mathematical Equation**: $F = G \\frac{m_1 m_2}{r^2}$, where $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$ is the Universal Gravitational Constant.",
      "**2. Inverse-Square Law**: If the distance between two masses doubles ($2r$), the gravitational attraction drops to $\\frac{1}{4}$ of its initial value ($2^2 = 4$).",
      "**3. Acceleration Due to Gravity ($g$)**: At Earth's surface, $g = \\frac{GM_E}{R_E^2} \\approx 9.8\\ \\text{m/s}^2$. Notice that $g$ does not depend on the falling object's mass—a bowling ball and a feather fall at the exact same rate in a vacuum!",
      "**4. Mass vs Weight**: Mass ($m$) is intrinsic matter in kg (constant everywhere); Weight ($W = mg$) is the gravitational pull in Newtons (varies by planet)."
    ],
    realWorldExample: "The Moon orbits Earth at an average distance of ~384,400 km. Earth's gravitational pull provides the exact centripetal force required to keep the Moon locked in its stable 27.3-day elliptical orbit, preventing it from flying off into space!",
    keyTakeaways: [
      "Gravitational force is always attractive, never repulsive.",
      "It obeys the Inverse-Square Law ($F \\propto \\frac{1}{r^2}$).",
      "Gravitational constant $G$ is universal; acceleration $g$ depends on the celestial body's mass and radius.",
      "In a vacuum, all objects accelerate downward at the identical rate ($9.8\\ \\text{m/s}^2$ on Earth)."
    ],
    mcq: {
      question: "If the distance between two masses is doubled while their masses remain unchanged, how does the gravitational force between them change?",
      a: "It decreases to one-fourth (1/4) of its original magnitude",
      b: "It decreases to one-half (1/2) of its original magnitude",
      c: "It doubles in magnitude",
      d: "It remains completely unchanged",
      correct: "A",
      explanation: "Because gravity follows an inverse-square law (F ∝ 1/r²), doubling the distance r yields F' = F / (2)² = F / 4."
    }
  },
  {
    subject: "Physics",
    topic: "Classical Mechanics & Dynamics",
    concept: "Newton's Three Laws of Motion & Friction",
    keywords: ["newton's laws", "newtons laws", "laws of motion", "newton second law", "newton third law", "f=ma", "inertia", "friction"],
    plainEnglish: "**Newton's Laws of Motion** are the three bedrock principles of classical physics describing how forces cause objects to accelerate, remain stationary, or interact with one another: Inertia (1st Law), $F = ma$ (2nd Law), and Equal & Opposite Action-Reaction (3rd Law).",
    analogy: "- **1st Law**: A couch potato staying on the couch unless forced up.\n- **2nd Law**: Pushing a light bicycle accelerates it fast; pushing a heavy truck requires immense force to achieve the same acceleration.\n- **3rd Law**: When you push off the side of a swimming pool, the wall pushes you forward with equal force!",
    howItWorks: [
      "**1. First Law (Law of Inertia)**: An object at rest stays at rest, and an object in motion continues with constant velocity in a straight line, unless acted upon by a net external force ($\\Sigma F = 0 \\implies a = 0$).",
      "**2. Second Law (Fundamental Dynamics)**: The net external force equals the time rate of change of momentum: $F = \\frac{dp}{dt} = ma$ (for constant mass). Force is a vector measured in Newtons (N), where $1\\ \\text{N} = 1\\ \\text{kg}\\cdot\\text{m/s}^2$.",
      "**3. Third Law (Action-Reaction)**: For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$). Forces always occur in matched pairs acting on *different* objects.",
      "**4. Friction Force**: Opposes relative motion: $f_s \\le \\mu_s N$ (static friction) and $f_k = \\mu_k N$ (kinetic friction)."
    ],
    realWorldExample: "When a space rocket launches, its engines expel hot combustion exhaust gas downwards at supersonic velocity (Action). The escaping gas exerts an equal and opposite upward thrust on the rocket body (Reaction), propelling it into orbit!",
    keyTakeaways: [
      "Newton's First Law defines Inertia and inertial reference frames.",
      "Newton's Second Law ($F = ma$) provides the quantitative formula for calculating dynamics.",
      "Newton's Third Law action-reaction pairs never cancel each other out because they act on different bodies."
    ],
    mcq: {
      question: "According to Newton's Second Law of Motion (F = ma), how does acceleration change if the net force applied to a constant mass is doubled?",
      a: "Acceleration doubles directly in proportion to the net force (a = F / m)",
      b: "Acceleration is cut in half",
      c: "Acceleration quadruples",
      d: "Acceleration stays constant while mass increases",
      correct: "A",
      explanation: "Since a = F / m, acceleration is directly proportional to net force. Doubling F with constant mass m doubles the acceleration a."
    }
  },
  {
    subject: "Physics",
    topic: "Work, Energy & Power",
    concept: "Work, Kinetic Energy & Conservation of Mechanical Energy",
    keywords: ["work and energy", "kinetic energy", "potential energy", "conservation of energy", "work energy theorem", "power", "ke = 1/2 mv^2"],
    plainEnglish: "**Work** is the measure of energy transfer that occurs when a force acts upon an object causing a displacement in the direction of the force: $W = F d \\cos\\theta$. The **Law of Conservation of Energy** states that energy cannot be created or destroyed, only transformed from one form to another.",
    analogy: "Think of a roller coaster: climbing to the highest hill converts electrical motor work into Gravitational Potential Energy ($mgh$). As it plunges down, that potential energy converts entirely into speed and Kinetic Energy ($\\frac{1}{2}mv^2$)!",
    howItWorks: [
      "**1. Work Formula**: $W = \\vec{F} \\cdot \\vec{d} = F d \\cos\\theta$. If the force is perpendicular to motion ($\\theta = 90^\\circ$, like centripetal force), zero work is done!",
      "**2. Kinetic Energy (KE)**: Energy of motion: $KE = \\frac{1}{2}m v^2$. Measured in Joules (J).",
      "**3. Gravitational Potential Energy (PE)**: Stored positional energy: $PE = mgh$.",
      "**4. Work-Energy Theorem**: The net work done on an object equals the change in its kinetic energy: $W_{\\text{net}} = \\Delta KE = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$.",
      "**5. Conservation of Mechanical Energy**: In an isolated system with conservative forces: $KE_i + PE_i = KE_f + PE_f$."
    ],
    realWorldExample: "A hydroelectric power plant stores water in an elevated mountain reservoir (high PE). When released, the falling water gains kinetic energy that spins giant turbines, generating clean electrical energy for thousands of homes!",
    keyTakeaways: [
      "Work is zero if displacement is zero or if force is perpendicular to displacement ($\\cos 90^\\circ = 0$).",
      "Kinetic Energy depends on velocity squared: doubling speed quadruples braking distance ($2^2 = 4$).",
      "SI unit of Work and Energy is the Joule (J = $\\text{N}\\cdot\\text{m} = \\text{kg}\\cdot\\text{m}^2/\\text{s}^2$)."
    ],
    mcq: {
      question: "If a moving car's speed is doubled from 30 km/h to 60 km/h, by what factor does its Kinetic Energy (KE = ½mv²) increase?",
      a: "It increases by a factor of 4 (quadruples)",
      b: "It increases by a factor of 2 (doubles)",
      c: "It increases by a factor of 8",
      d: "It remains unchanged",
      correct: "A",
      explanation: "Because KE is proportional to the square of velocity (KE ∝ v²), doubling the velocity v results in (2v)² = 4v², quadrupling the kinetic energy."
    }
  },
  {
    subject: "Physics",
    topic: "Wave Motion & Acoustics",
    concept: "The Doppler Effect in Sound & Light",
    keywords: ["doppler effect", "doppler shift", "frequency shift", "redshift", "blueshift", "sound frequency", "moving source"],
    plainEnglish: "The **Doppler Effect** is the apparent change in frequency or wavelength of a wave observed by an observer when the wave source and the observer are in relative motion towards or away from each other.",
    analogy: "When an ambulance with its siren blaring rushes towards you, each sound wave crest is emitted closer to you than the previous one, bunching them up into a higher pitch (wee-woo-wee-woo at high frequency). Once it zooms past and drives away, the sound waves stretch out, dropping to a noticeably lower pitch!",
    howItWorks: [
      "**1. General Formula for Sound Waves**:\n   $$\n   f' = f \\left( \\frac{v \\pm v_o}{v \\mp v_s} \\right)\n   $$\n   where $f$ is original frequency, $v$ is sound speed in the medium, $v_o$ is observer velocity, and $v_s$ is source velocity.",
      "**2. Approaching Source**: Wavelength compresses ($\\lambda' < \\lambda$), observed frequency increases ($f' > f$).",
      "**3. Receding Source**: Wavelength stretches ($\\lambda' > \\lambda$), observed frequency decreases ($f' < f$).",
      "**4. Doppler Effect in Light (Astronomy)**:\n   - **Blueshift**: Objects moving toward Earth have spectra shifted to shorter, bluer wavelengths.\n   - **Redshift**: Distant galaxies moving away from Earth have spectra shifted to longer, redder wavelengths, proving the universe is expanding!"
    ],
    realWorldExample: "Police radar guns emit a radio wave of known frequency towards a moving car. By measuring the tiny Doppler frequency shift of the reflected wave bounced back from the car, the radar instantly calculates the vehicle's exact speed!",
    keyTakeaways: [
      "Motion towards each other always causes an apparent increase in observed frequency (higher pitch / blueshift).",
      "Motion away from each other always causes an apparent decrease in observed frequency (lower pitch / redshift).",
      "Hubble's discovery of galactic redshift proved the expansion of our universe."
    ],
    mcq: {
      question: "What happens to the observed frequency of a siren when a police car approaches a stationary pedestrian?",
      a: "The observed frequency increases (higher pitch) because the sound waves are compressed",
      b: "The observed frequency decreases (lower pitch) because the waves stretch out",
      c: "The observed frequency stays the same while amplitude decreases",
      d: "The speed of sound increases in the air",
      correct: "A",
      explanation: "As the source approaches the stationary observer, each successive wave crest is emitted from a closer position, compressing the effective wavelength and causing an increased observed frequency (higher pitch)."
    }
  },
  {
    subject: "Physics",
    topic: "Thermodynamics & Heat",
    concept: "Laws of Thermodynamics & Entropy",
    keywords: ["thermodynamics", "laws of thermodynamics", "entropy", "first law of thermodynamics", "second law of thermodynamics", "delta u = q - w", "heat engine"],
    plainEnglish: "**Thermodynamics** is the branch of physics studying heat, work, temperature, and energy transformations. Its core laws dictate that total energy is conserved (First Law) and that spontaneous natural processes always cause the overall disorder or **entropy** of an isolated universe to increase (Second Law).",
    analogy: "Think of your study bedroom: keeping it clean and organized takes active effort and energy. If you leave it alone, papers, clothes, and books naturally scatter everywhere. Nature has an arrow of time—things naturally proceed from order to disorder (increasing entropy)!",
    howItWorks: [
      "**1. Zeroth Law (Thermal Equilibrium)**: If bodies A and B are in thermal equilibrium with body C, then A and B are in thermal equilibrium with each other (basis of thermometers).",
      "**2. First Law (Energy Conservation)**: $\\Delta U = Q - W$, where $\\Delta U$ is change in internal energy, $Q$ is heat added to the system, and $W$ is work done by the system.",
      "**3. Second Law (Entropy & Heat Flow)**: Heat cannot spontaneously flow from a colder body to a hotter body without external work. In any spontaneous cyclic process, $\\Delta S_{\\text{universe}} \\ge 0$.",
      "**4. Third Law (Absolute Zero)**: As temperature approaches absolute zero ($0\\ \\text{K} = -273.15^\\circ\\text{C}$), the entropy of a pure crystalline substance approaches exactly zero."
    ],
    realWorldExample: "Refrigerators and air conditioners cannot cool a room for free—they must consume electrical power (compressor work) to force heat to flow 'uphill' from the colder interior compartment and dump it out into the hotter kitchen environment!",
    keyTakeaways: [
      "First Law: $\\Delta U = Q - W$ (Conservation of Energy).",
      "Second Law: Total entropy of an isolated system always increases; 100% efficient heat engines (Carnot engine limit) are impossible.",
      "Entropy ($S = k_B \\ln \\Omega$) is a fundamental measure of molecular disorder and statistical probability."
    ],
    mcq: {
      question: "According to the First Law of Thermodynamics (ΔU = Q - W), if 500 J of heat is added to a gas (Q = 500 J) and the gas does 200 J of work expanding against a piston (W = 200 J), what is the change in internal energy (ΔU)?",
      a: "ΔU = +300 J",
      b: "ΔU = +700 J",
      c: "ΔU = -300 J",
      d: "ΔU = 0 J",
      correct: "A",
      explanation: "By the First Law of Thermodynamics, ΔU = Q - W = 500 J - 200 J = +300 J. The internal energy increases by 300 Joules."
    }
  },

  // ==========================================================================
  // CHEMISTRY
  // ==========================================================================
  {
    subject: "Chemistry",
    topic: "Acids, Bases & Ionic Equilibrium",
    concept: "Acids, Bases & the pH Scale",
    keywords: ["acid and base", "acids and bases", "ph scale", "arrhenius", "bronsted lowry", "lewis acid", "neutralization", "buffer solution"],
    plainEnglish: "**Acids** are substances that release hydrogen ions ($H^+$ or hydronium $H_3O^+$) in aqueous solution (sour taste, turn blue litmus red, pH < 7). **Bases** release hydroxide ions ($OH^-$) or accept protons (bitter taste, slippery feel, turn red litmus blue, pH > 7). The **pH scale** measures the concentration of $H^+$ on a logarithmic scale from 0 to 14.",
    analogy: "Think of an acid like an eager donor handing out protons ($H^+$), and a base like a catcher glove waiting to catch that proton. When an acid and base meet, they shake hands and neutralize each other into pure water and harmless salt!",
    howItWorks: [
      "**1. Three Major Theories**:\n   - **Arrhenius**: Acids produce $H^+$ in water; Bases produce $OH^-$ in water.\n   - **Brønsted-Lowry**: Acids are proton ($H^+$) donors; Bases are proton acceptors.\n   - **Lewis**: Acids are electron-pair acceptors; Bases are electron-pair donors.",
      "**2. The pH Formula**: $\\text{pH} = -\\log_{10}[H^+]$ and $\\text{pOH} = -\\log_{10}[OH^-]$.",
      "**3. Water Ion Product**: At $25^\\circ\\text{C}$, $K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$, which means $\\text{pH} + \\text{pOH} = 14$.",
      "**4. Scale Values**:\n   - $\\text{pH} < 7$: Acidic (e.g., gastric juice pH ~1.5, lemon juice pH ~2.2).\n   - $\\text{pH} = 7$: Neutral (pure water at $25^\\circ\\text{C}$).\n   - $\\text{pH} > 7$: Basic / Alkaline (e.g., bleach pH ~12, sodium hydroxide pH ~14).",
      "**5. Neutralization Reaction**: $\\text{Acid} + \\text{Base} \\to \\text{Salt} + \\text{Water}$ (e.g., $\\text{HCl} + \\text{NaOH} \\to \\text{NaCl} + \\text{H}_2\\text{O}$)."
    ],
    realWorldExample: "Human blood must maintain a strictly regulated pH between 7.35 and 7.45. A carbonic acid-bicarbonate buffer system ($H_2CO_3 / HCO_3^-$) instantly neutralizes acidic and basic metabolic wastes to keep you alive!",
    keyTakeaways: [
      "Because the pH scale is logarithmic (base 10), a solution with pH 3 is 10 times more acidic than pH 4, and 100 times more acidic than pH 5!",
      "Strong acids (HCl, $H_2SO_4$, $HNO_3$) dissociate 100% completely in water.",
      "Acid + Base $\\to$ Salt + Water (Neutralization)."
    ],
    mcq: {
      question: "If an aqueous solution has a hydrogen ion concentration of [H⁺] = 1 × 10⁻⁴ M at 25°C, what is its pH and chemical nature?",
      a: "pH = 4, Acidic",
      b: "pH = 10, Basic",
      c: "pH = 4, Basic",
      d: "pH = 7, Neutral",
      correct: "A",
      explanation: "pH = -log₁₀[H⁺] = -log₁₀(1 × 10⁻⁴) = 4. Since pH 4 is less than 7, the solution is acidic."
    }
  },
  {
    subject: "Chemistry",
    topic: "Chemical Bonding & Molecular Structure",
    concept: "Chemical Bonding & Hybridization",
    keywords: ["chemical bond", "chemical bonding", "hybridization", "ionic bond", "covalent bond", "vsepr", "hydrogen bonding", "sp3"],
    plainEnglish: "**Chemical Bonding** refers to the attractive forces holding atoms together to form molecules and crystal lattices, driven by the thermodynamic desire of atoms to achieve a stable octet (8 valence electrons) like noble gases. The primary types are **Ionic Bonds** (electron transfer) and **Covalent Bonds** (electron sharing).",
    analogy: "- **Ionic Bond**: Like one friend giving away an old jacket entirely to someone who needs it—both now hold opposing magnetic charges and stick together!\n- **Covalent Bond**: Two roommates sharing a TV set—neither owns it exclusively, but both stay connected by holding onto it!",
    howItWorks: [
      "**1. Ionic Bonding**: Occurs between metals (low electronegativity) and non-metals (high electronegativity). Electron is transferred: $Na + Cl \\to Na^+ + Cl^- \\to NaCl$.",
      "**2. Covalent Bonding**: Occurs between non-metals sharing pairs of electrons (e.g., $H_2, O_2, CH_4$).",
      "**3. Orbital Hybridization ($sp, sp^2, sp^3$)**: Mixing of atomic orbitals to form identical directional hybrid orbitals:\n   - **$sp^3$**: 4 hybrid orbitals, tetrahedral geometry, $109.5^\\circ$ bond angle (e.g., $CH_4$).\n   - **$sp^2$**: 3 hybrid orbitals, trigonal planar, $120^\\circ$ bond angle (e.g., $C_2H_4$).\n   - **$sp$**: 2 hybrid orbitals, linear geometry, $180^\\circ$ bond angle (e.g., $C_2H_2$).",
      "**4. Hydrogen Bonding**: Strong dipole-dipole attraction between hydrogen bonded to electronegative $N, O, F$ and another electronegative atom."
    ],
    realWorldExample: "Water ($H_2O$) has an unexpectedly high boiling point ($100^\\circ\\text{C}$) compared to similar molecules like $H_2S$ (boiling point $-60^\\circ\\text{C}$) because of extensive intermolecular **Hydrogen Bonding**!",
    keyTakeaways: [
      "Atoms bond to minimize potential energy and achieve stable noble gas octets.",
      "Hybridization formula: Steric Number = (Number of bonded atoms) + (Number of lone pairs).",
      "Steric number 4 $\\to sp^3$, Steric number 3 $\\to sp^2$, Steric number 2 $\\to sp$."
    ],
    mcq: {
      question: "In methane (CH₄), what is the hybridization of the central carbon atom and its molecular geometry?",
      a: "sp³ hybridization with a tetrahedral geometry (bond angle ~109.5°)",
      b: "sp² hybridization with a trigonal planar geometry",
      c: "sp hybridization with a linear geometry",
      d: "dsp² hybridization with a square planar geometry",
      correct: "A",
      explanation: "Carbon forms 4 single sigma bonds with hydrogen atoms and has 0 lone pairs (Steric Number = 4). This corresponds to sp³ hybridization with a symmetric tetrahedral geometry and bond angle of 109.5°."
    }
  },
  {
    subject: "Chemistry",
    topic: "Physical Chemistry & Stoichiometry",
    concept: "The Mole Concept & Avogadro's Number",
    keywords: ["mole concept", "avogadro's number", "molar mass", "molarity", "moles", "stoichiometry", "6.022x10^23"],
    plainEnglish: "The **Mole** (symbol: mol) is the SI base unit for the amount of substance. One mole contains exactly **$6.02214076 \\times 10^{23}$** elementary entities (atoms, molecules, or ions). This fundamental constant is known as **Avogadro's Number ($N_A$)**.",
    analogy: "Just like the word **'dozen'** always means exactly 12 items (whether it's 12 eggs or 12 elephants), the word **'mole'** always means exactly $6.022 \\times 10^{23}$ particles! It serves as the microscopic-to-macroscopic bridge in chemistry.",
    howItWorks: [
      "**1. Number of Moles ($n$)**: $n = \\frac{\\text{Mass in grams } (m)}{\\text{Molar Mass in g/mol } (M)}$.",
      "**2. Number of Particles ($N$)**: $N = n \\times N_A = n \\times 6.022 \\times 10^{23}$.",
      "**3. Molar Volume of Gas at STP**: One mole of any ideal gas occupies **22.4 Liters** at Standard Temperature and Pressure ($0^\\circ\\text{C}$ and 1 atm).",
      "**4. Molarity ($M$)**: Concentration of a solution: $M = \\frac{\\text{Moles of solute } (n)}{\\text{Volume of solution in Liters } (V)}$."
    ],
    realWorldExample: "Water ($H_2O$) has a molar mass of $18\\ \\text{g/mol}$ (2 H atoms $\\times 1 + 1$ O atom $\\times 16$). Drinking a small 18 ml sip of water means you are swallowing over 600 sextillion ($6.022 \\times 10^{23}$) water molecules!",
    keyTakeaways: [
      "1 mole = $6.022 \\times 10^{23}$ particles.",
      "Molar mass in grams numerically equals atomic or molecular weight in atomic mass units (amu).",
      "Molarity ($M$) = moles of solute / liters of solution."
    ],
    mcq: {
      question: "How many moles are present in 44 grams of Carbon Dioxide (CO₂)? (Atomic masses: C = 12, O = 16)",
      a: "1.0 mole",
      b: "2.0 moles",
      c: "0.5 moles",
      d: "44.0 moles",
      correct: "A",
      explanation: "Molar mass of CO₂ = 12 + 2(16) = 44 g/mol. Number of moles n = mass / molar mass = 44 g / 44 g/mol = 1.0 mole."
    }
  },

  // ==========================================================================
  // BIOLOGY & LIFE SCIENCES
  // ==========================================================================
  {
    subject: "Biology & Life Sciences",
    topic: "Plant Physiology & Bioenergetics",
    concept: "Photosynthesis ($6CO_2 + 6H_2O \\to C_6H_{12}O_6 + 6O_2$)",
    keywords: ["photosynthesis", "chlorophyll", "chloroplast", "calvin cycle", "light reaction", "dark reaction", "thylakoid", "stroma"],
    plainEnglish: "**Photosynthesis** is the biological process by which green plants, algae, and cyanobacteria convert light energy into chemical energy (glucose) by taking in carbon dioxide from the air and water from the soil, releasing oxygen as a byproduct: $6CO_2 + 6H_2O \\xrightarrow{\\text{light, chlorophyll}} C_6H_{12}O_6 + 6O_2$.",
    analogy: "Think of a leaf like a high-tech solar power plant and bakery combined: sunlight powers the solar ovens (chlorophyll in thylakoids), which split water to produce energy packets (ATP and NADPH). Then the kitchen (stroma) uses that energy to bake sugar loaves from carbon dioxide flour!",
    howItWorks: [
      "**1. Overall Chemical Reaction**: $6CO_2 + 6H_2O + \\text{photons} \\to C_6H_{12}O_6 + 6O_2$.",
      "**2. Light-Dependent Reactions (in Thylakoid Membranes)**:\n   - Chlorophyll absorbs photons, exciting electrons in Photosystems II and I.\n   - **Photolysis of Water**: $2H_2O \\to 4H^+ + 4e^- + O_2$ (releasing breathable oxygen gas!).\n   - Synthesizes energy carriers: **ATP** (via ATP synthase) and **NADPH**.",
      "**3. Light-Independent Reactions / Calvin Cycle (in Stroma)**:\n   - Enzyme **RuBisCO** fixes $CO_2$ into 3-PGA.\n   - Uses ATP and NADPH to reduce 3-PGA into G3P sugar, which synthesizes glucose.",
      "**4. Chloroplast Anatomy**: Double membrane enclosing stacked thylakoids (grana) surrounded by fluid stroma."
    ],
    realWorldExample: "Every breath of oxygen you inhale and almost all calories humans consume in the food chain originate directly from this photosynthetic light reaction inside chloroplasts!",
    keyTakeaways: [
      "Light reactions occur in the thylakoid membranes and produce $O_2$, ATP, and NADPH.",
      "Dark reactions (Calvin cycle) occur in the stroma and synthesize glucose.",
      "Oxygen released during photosynthesis comes strictly from splitting water ($H_2O$), not from $CO_2$."
    ],
    mcq: {
      question: "Where in the chloroplast do the light-dependent reactions of photosynthesis take place?",
      a: "Thylakoid membranes",
      b: "Stroma",
      c: "Outer mitochondrial membrane",
      d: "Cell vacuole",
      correct: "A",
      explanation: "Light-dependent reactions occur within the thylakoid membranes where chlorophyll pigments, Photosystems II & I, and ATP synthase complexes are embedded."
    }
  },
  {
    subject: "Biology & Life Sciences",
    topic: "Cell Biology & Cytology",
    concept: "Cell Structure & Mitochondria",
    keywords: ["cell structure", "mitochondria", "organelles", "nucleus", "ribosome", "powerhouse of the cell", "atp synthesis"],
    plainEnglish: "The **Cell** is the fundamental structural and functional unit of life. In eukaryotic cells, specialized membrane-bound **organelles** perform distinct biochemical roles. The **Mitochondria** is universally known as the 'powerhouse of the cell' because it performs cellular respiration to generate **ATP (Adenosine Triphosphate)**.",
    analogy: "A eukaryotic cell is like a high-tech factory:\n- **Nucleus**: The executive office with master blueprints (DNA).\n- **Mitochondria**: The electrical generators producing battery power (ATP).\n- **Ribosomes**: The assembly workers manufacturing proteins.\n- **Cell Membrane**: The security checkpoint controlling entry and exit.",
    howItWorks: [
      "**1. Mitochondria Structure**: Double-membraned organelle. The inner membrane is heavily folded into **cristae** to dramatically increase surface area for the Electron Transport Chain (ETC).",
      "**2. Cellular Respiration**: $C_6H_{12}O_6 + 6O_2 \\to 6CO_2 + 6H_2O + 36\\text{-}38\\text{ ATP}$.",
      "**3. Krebs Cycle (Citric Acid Cycle)**: Takes place inside the mitochondrial matrix.",
      "**4. Endosymbiotic Theory**: Mitochondria have their own circular DNA and 70S ribosomes, inherited maternally from mother to offspring."
    ],
    realWorldExample: "Human heart cells beat continuously without rest and contain over 5,000 mitochondria per cell to supply the constant ATP energy required for muscle contractions!",
    keyTakeaways: [
      "Mitochondria generate ATP via aerobic cellular respiration.",
      "Inner membrane foldings are called cristae.",
      "Mitochondrial DNA is inherited exclusively from the maternal line."
    ],
    mcq: {
      question: "Why are mitochondria universally referred to as the 'powerhouse of the cell'?",
      a: "They synthesize ATP (cellular energy currency) via aerobic respiration",
      b: "They contain the genetic code for the entire organism",
      c: "They synthesize glucose via photosynthesis",
      d: "They digest damaged organelles using acid hydrolases",
      correct: "A",
      explanation: "Mitochondria produce the majority of a cell's ATP (Adenosine Triphosphate) through the Krebs cycle and oxidative phosphorylation (Electron Transport Chain)."
    }
  },
  {
    subject: "Biology & Life Sciences",
    topic: "Molecular Genetics & DNA",
    concept: "DNA Structure & Semi-Conservative Replication",
    keywords: ["dna replication", "dna structure", "double helix", "watson crick", "dna polymerase", "helicase", "okazaki fragments", "semi-conservative"],
    plainEnglish: "**DNA (Deoxyribonucleic Acid)** is the hereditary molecule of living organisms, structured as a **double helix** of anti-parallel nucleotide chains. **DNA Replication** is the process where a cell duplicates its entire genome before cell division, occurring **semi-conservatively** so each daughter DNA molecule contains one original template strand and one newly synthesized strand.",
    analogy: "Think of an old zipper being unzipped: as the slider (Helicase) moves along, two new zipper halves are instantly woven onto the exposed teeth (by DNA Polymerase), creating two complete, identical zippers from one!",
    howItWorks: [
      "**1. Double Helix Architecture**: Sugar-phosphate backbone on the outside with complementary nitrogenous base pairs on the inside:\n   - **Adenine (A)** pairs with **Thymine (T)** via 2 hydrogen bonds.\n   - **Guanine (G)** pairs with **Cytosine (C)** via 3 hydrogen bonds.",
      "**2. Anti-Parallel Strands**: One strand runs $5' \\to 3'$ and the complementary strand runs $3' \\to 5'$.",
      "**3. Key Enzymes**:\n   - **Helicase**: Unwinds the double helix at the replication fork.\n   - **Primase**: Lays down an RNA primer.\n   - **DNA Polymerase**: Synthesizes the new complementary strand strictly in the $5' \\to 3'$ direction.\n   - **Ligase**: Seals nicks between Okazaki fragments on the lagging strand.",
      "**4. Leading vs Lagging Strand**: The leading strand synthesizes continuously; the lagging strand synthesizes discontinuously in short Okazaki fragments."
    ],
    realWorldExample: "Every time a human skin cell divides to heal a cut, DNA Polymerase copies over 3 billion base pairs of your genome with an extraordinary error rate of less than one mistake in a billion base pairs thanks to active proofreading!",
    keyTakeaways: [
      "DNA replication is semi-conservative (proved by the Meselson-Stahl experiment).",
      "Complementary base pairing: A=T (2 H-bonds) and G≡C (3 H-bonds).",
      "DNA Polymerase can only synthesize in the $5' \\to 3'$ direction."
    ],
    mcq: {
      question: "During DNA replication, which enzyme is responsible for synthesizing the new complementary DNA strand in the 5' to 3' direction?",
      a: "DNA Polymerase",
      b: "DNA Helicase",
      c: "RNA Polymerase",
      d: "DNA Ligase",
      correct: "A",
      explanation: "DNA Polymerase adds complementary deoxyribonucleotides to the 3'-OH end of an existing primer, synthesizing the new daughter strand in the 5' to 3' direction."
    }
  },

  // ==========================================================================
  // MATHEMATICS
  // ==========================================================================
  {
    subject: "Mathematics",
    topic: "Linear Equations & Algebra",
    concept: "Solving Linear Equations ($ax + b = c$)",
    keywords: ["linear equation", "solve equation", "linear equations", "solving linear equations", "isolate x"],
    plainEnglish: "A **Linear Equation** is an algebraic equation in which the highest exponent of the variable is $1$ (forming a straight line when graphed: $y = mx + b$). Solving a linear equation means finding the exact numerical value of the variable that makes the equation true.",
    analogy: "Think of an old-fashioned balance scale with two weighing pans: if both pans are currently balanced ($LHS = RHS$), you can add 5 kg to both sides, subtract 3 kg from both sides, or divide both sides by 2, and the scale remains in balance!",
    howItWorks: [
      "**1. Standard Form**: $ax + b = c$ where $a \\neq 0$.",
      "**2. Step 1 (Isolate Variable Term)**: Subtract $b$ from both sides: $ax = c - b$.",
      "**3. Step 2 (Solve for $x$)**: Divide both sides by the coefficient $a$: $x = \\frac{c - b}{a}$.",
      "**4. Verification**: Substitute your calculated answer back into the original equation to verify that $\\text{LHS} = \\text{RHS}$."
    ],
    realWorldExample: "If an electric taxi charges a base fare of ₹50 plus ₹10 per kilometer, and your total bill is ₹220, the equation is $10k + 50 = 220 \\implies 10k = 170 \\implies k = 17\\text{ km}$!",
    keyTakeaways: [
      "Linear equations in one variable have exactly **one unique solution**.",
      "Golden Rule: Whatever operation you apply to the Left-Hand Side (LHS), you must apply identically to the Right-Hand Side (RHS).",
      "Always verify by back-substitution."
    ],
    mcq: {
      question: "What is the solution for x in the linear equation 3x + 7 = 22?",
      a: "x = 5",
      b: "x = 7",
      c: "x = 3",
      d: "x = 15",
      correct: "A",
      explanation: "Subtracting 7 from both sides gives 3x = 22 - 7 = 15. Dividing both sides by 3 yields x = 15 / 3 = 5."
    }
  },
  {
    subject: "Mathematics",
    topic: "Quadratic Equations",
    concept: "Quadratic Equations & Roots ($ax^2 + bx + c = 0$)",
    keywords: ["quadratic equation", "quadratic equations", "quadratic formula", "discriminant", "roots of quadratic", "b^2 - 4ac"],
    plainEnglish: "A **Quadratic Equation** is a second-degree polynomial equation of the form $ax^2 + bx + c = 0$ where $a \\neq 0$. When graphed on a coordinate plane, it forms a symmetric U-shaped curve called a **parabola**.",
    analogy: "When you kick a soccer ball or launch a rocket into the air, gravity pulls it back down along a curved parabolic trajectory. That trajectory is mathematically described by a quadratic equation!",
    howItWorks: [
      "**1. Standard Form**: $ax^2 + bx + c = 0$.",
      "**2. Quadratic Formula**: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.",
      "**3. The Discriminant ($\\Delta = b^2 - 4ac$)**:\n   - If $\\Delta > 0$: **Two distinct real roots**.\n   - If $\\Delta = 0$: **One real repeated root**.\n   - If $\\Delta < 0$: **Two complex conjugate roots**.",
      "**4. Vieta's Formulas**: Sum of roots $= -b/a$, Product of roots $= c/a$."
    ],
    realWorldExample: "For $x^2 - 5x + 6 = 0$, the roots are $(x-2)(x-3) = 0 \\implies x = 2$ and $x = 3$. The discriminant is $\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$ ✨",
    keyTakeaways: [
      "A quadratic equation always has exactly **2 roots** (real or complex).",
      "The vertex of the parabola $y = ax^2 + bx + c$ is located at $x = -\\frac{b}{2a}$.",
      "Discriminant $\\Delta = b^2 - 4ac$ reveals root nature instantly without full solving."
    ],
    mcq: {
      question: "For a quadratic equation ax² + bx + c = 0, what does a discriminant value of Δ = b² - 4ac > 0 signify?",
      a: "The equation possesses two distinct real roots",
      b: "The equation possesses two complex conjugate roots with non-zero imaginary parts",
      c: "The equation possesses exactly one real repeated root",
      d: "The equation has zero mathematical solutions",
      correct: "A",
      explanation: "When the discriminant Δ = b² - 4ac is strictly positive, the square root √Δ produces a real non-zero number, yielding two distinct real solutions via (-b ± √Δ) / 2a."
    }
  },
  {
    subject: "Mathematics",
    topic: "Calculus & Analysis",
    concept: "Differentiation & Derivatives",
    keywords: ["derivative", "derivatives", "differentiation", "power rule", "chain rule", "product rule", "calculus derivative", "rate of change"],
    plainEnglish: "The **Derivative** of a function measures the instantaneous rate of change of the function with respect to one of its variables. Geometrically, it represents the exact slope of the tangent line to the function's graph at any given point: $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$.",
    analogy: "Think of your car's speedometer: while your average speed over a 2-hour road trip might be 60 km/h, your speedometer tells you your instantaneous speed at this exact millisecond. That instantaneous speed is the mathematical derivative of your position!",
    howItWorks: [
      "**1. Power Rule**: $\\frac{d}{dx}[x^n] = n x^{n-1}$ (e.g., $\\frac{d}{dx}[x^3] = 3x^2$).",
      "**2. Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u'v + uv'$.",
      "**3. Quotient Rule**: $\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u'v - uv'}{v^2}$.",
      "**4. Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$.",
      "**5. Common Derivatives**: $\\frac{d}{dx}[\\sin x] = \\cos x$, $\\frac{d}{dx}[\\cos x] = -\\sin x$, $\\frac{d}{dx}[e^x] = e^x$, $\\frac{d}{dx}[\\ln x] = \\frac{1}{x}$."
    ],
    realWorldExample: "In machine learning and neural networks, gradient descent calculates the partial derivatives of the loss function with respect to millions of model weights to minimize prediction errors!",
    keyTakeaways: [
      "Derivative = instantaneous rate of change = slope of the tangent line.",
      "Power rule: $\\frac{d}{dx}[x^n] = n x^{n-1}$.",
      "Where $f'(x) = 0$, the function has a stationary point (local minimum, maximum, or inflection point)."
    ],
    mcq: {
      question: "Using the power rule of calculus, what is the derivative of f(x) = 4x³ - 5x + 7 with respect to x?",
      a: "12x² - 5",
      b: "12x² - 5x",
      c: "7x² - 5",
      d: "12x³ - 5",
      correct: "A",
      explanation: "Applying the power rule term-by-term: d/dx(4x³) = 4(3x²) = 12x², d/dx(-5x) = -5(1) = -5, and d/dx(7) = 0. Thus, f'(x) = 12x² - 5."
    }
  },
  {
    subject: "Mathematics",
    topic: "Calculus & Integration",
    concept: "Integration & Definite Integrals",
    keywords: ["integral", "integration", "calculus integration", "definite integral", "indefinite integral", "antiderivative", "area under curve"],
    plainEnglish: "**Integration** is the inverse operation of differentiation (antiderivative). While differentiation calculates instantaneous rates of change, integration calculates continuous accumulation, such as the total **area under a curve**, total distance traveled from velocity, or volume of a solid.",
    analogy: "If differentiation is slicing a loaf of bread into infinitely thin transparent slices to inspect the rate of change, integration is gluing all those infinite slices back together to find the total volume of the entire loaf!",
    howItWorks: [
      "**1. Fundamental Theorem of Calculus**: If $F'(x) = f(x)$, then $\\int_a^b f(x)dx = F(b) - F(a)$.",
      "**2. Power Rule for Integrals**: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ (for $n \\neq -1$).",
      "**3. Constant of Integration ($C$)**: Added to all indefinite integrals because the derivative of any constant is zero.",
      "**4. Special Integrals**: $\\int \\frac{1}{x} dx = \\ln|x| + C$, $\\int e^x dx = e^x + C$, $\\int \\cos x dx = \\sin x + C$."
    ],
    realWorldExample: "If an electric car's velocity graph is $v(t) = 3t^2$ meters/second, the total distance traveled between $t = 0$ and $t = 4$ seconds is the definite integral $\\int_0^4 3t^2 dt = [t^3]_0^4 = 4^3 - 0 = 64\\text{ meters}$!",
    keyTakeaways: [
      "Integration computes total accumulation and area under a curve.",
      "Indefinite integrals always require $+ C$.",
      "Power rule: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$."
    ],
    mcq: {
      question: "What is the indefinite integral of f(x) = 6x² + 2x with respect to x?",
      a: "2x³ + x² + C",
      b: "12x + 2 + C",
      c: "3x³ + 2x² + C",
      d: "6x³ + 2x² + C",
      correct: "A",
      explanation: "Integrating term-by-term: ∫ 6x² dx = 6(x³/3) = 2x³, and ∫ 2x dx = 2(x²/2) = x². Adding the constant of integration yields 2x³ + x² + C."
    }
  },

  // ==========================================================================
  // COMPUTER SCIENCE & ENGINEERING
  // ==========================================================================
  {
    subject: "Computer Networks",
    topic: "Network Protocol Architectures",
    concept: "OSI 7-Layer Reference Model",
    keywords: ["osi model", "osi 7 layer", "osi layers", "open systems interconnection", "7 layers", "layer 3", "layer 4", "transport layer", "network layer"],
    plainEnglish: "The **OSI (Open Systems Interconnection) Model** is a conceptual framework that standardizes the communication functions of a telecommunication or computing system into **7 distinct abstraction layers**. Moving from physical hardware up to the user software, each layer serves the layer above it and is served by the layer below it.",
    analogy: "Think of sending a letter internationally:\n1. **Layer 7 (Application)**: You write your message.\n2. **Layer 6 (Presentation)**: Translated into English and encrypted.\n3. **Layer 5 (Session)**: Ensuring recipient's mailbox is ready.\n4. **Layer 4 (Transport)**: Split into numbered postcards (TCP) to guarantee delivery.\n5. **Layer 3 (Network)**: Addressing with international postal code (IP address) for sorting.\n6. **Layer 2 (Data Link)**: Loaded onto local mail delivery trucks (MAC addresses).\n7. **Layer 1 (Physical)**: The highway pavement and cables carrying the trucks.",
    howItWorks: [
      "**1. Layer 7 (Application)**: HTTP, HTTPS, FTP, DNS, SMTP (Interacts with user software).",
      "**2. Layer 6 (Presentation)**: Data representation, SSL/TLS encryption, compression, JPEG/ASCII.",
      "**3. Layer 5 (Session)**: Establishes, manages, and terminates connections between applications.",
      "**4. Layer 4 (Transport)**: End-to-end reliability, flow control, port numbers (TCP segments, UDP datagrams).",
      "**5. Layer 3 (Network)**: Logical addressing (IPv4/IPv6) and packet routing across networks (Routers).",
      "**6. Layer 2 (Data Link)**: Physical hop-to-hop framing, MAC addressing, error detection (Switches).",
      "**7. Layer 1 (Physical)**: Unstructured raw bitstreams over copper, fiber optics, or radio (Cables, Hubs)."
    ],
    realWorldExample: "When you browse `https://example.com`, your browser (Application) formats an HTTP GET request, TLS (Presentation) encrypts it, TCP (Transport) chops it into segments with port 443, IP (Network) attaches router destination IPs, Ethernet (Data Link) wraps it into frames with MAC addresses, and your Wi-Fi antenna (Physical) broadcasts radio waves!",
    keyTakeaways: [
      "Mnemonic from Layer 7 to 1: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.",
      "Layer 3 (Network) handles IP routing and Packets.",
      "Layer 4 (Transport) handles Ports and Segments/Datagrams.",
      "Layer 2 (Data Link) handles MAC addresses and Frames."
    ],
    mcq: {
      question: "At which layer of the OSI model does logical IP packet routing occur, and what is its Protocol Data Unit (PDU)?",
      a: "Network Layer (Layer 3) with PDU 'Packet'",
      b: "Transport Layer (Layer 4) with PDU 'Segment'",
      c: "Data Link Layer (Layer 2) with PDU 'Frame'",
      d: "Physical Layer (Layer 1) with PDU 'Bit'",
      correct: "A",
      explanation: "The Network Layer (Layer 3) is responsible for logical addressing (IPv4/IPv6) and path determination (routing) across interconnected networks. Its Protocol Data Unit is the Packet."
    }
  },
  {
    subject: "Computer Networks",
    topic: "Transport Layer Protocols",
    concept: "TCP vs UDP (Transmission Control vs User Datagram)",
    keywords: ["tcp vs udp", "tcp and udp", "transmission control protocol", "user datagram protocol", "three way handshake", "connectionless", "reliable transport"],
    plainEnglish: "**TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are the two primary transport protocols powering the internet. **TCP is connection-oriented, reliable, and ordered** (uses a 3-way handshake and packet acknowledgments). **UDP is connectionless, lightweight, and fast** (fire-and-forget without retransmissions).",
    analogy: "- **TCP is like a registered postal letter with delivery tracking**: The recipient signs for every package, and if one is lost in transit, the post office automatically resends it.\n- **UDP is like a live radio broadcast or shouting**: You blast information into the air. If someone misses a single syllable due to static, you don't stop the broadcast to repeat it—you keep streaming in real time!",
    howItWorks: [
      "**1. TCP Three-Way Handshake**: SYN $\\to$ SYN-ACK $\\to$ ACK establishes a verified two-way virtual connection before data flows.",
      "**2. TCP Reliability**: Every byte is numbered with Sequence and Acknowledgment numbers. Lost packets are automatically retransmitted.",
      "**3. TCP Flow & Congestion Control**: Sliding window protocol prevents overwhelming the receiver or congested routers.",
      "**4. UDP Simplicity**: Zero handshake, no sequence numbers, no retransmissions. Header is only 8 bytes (vs TCP's 20-60 bytes).",
      "**5. Use Cases**:\n   - **TCP**: Web browsing (HTTP/HTTPS), email (SMTP/IMAP), file downloads (FTP), SSH.\n   - **UDP**: Live video streaming (Twitch/YouTube Live), online multiplayer gaming, VoIP calls (Zoom/Discord), DNS queries."
    ],
    realWorldExample: "In online multiplayer games like Fortnite or Call of Duty, player coordinate updates are sent via UDP hundreds of times per second. Waiting for TCP retransmission of a 50ms-old location packet would cause terrible game freezing (lag)!",
    keyTakeaways: [
      "TCP: Reliable, ordered, heavy, 3-way handshake, error recovery.",
      "UDP: Unreliable, unordered, ultra-fast, minimal 8-byte header overhead.",
      "Use TCP when data accuracy is critical; use UDP when real-time low latency matters more than occasional lost packets."
    ],
    mcq: {
      question: "Why do real-time voice calls (VoIP) and online multiplayer gaming predominantly use UDP instead of TCP?",
      a: "UDP eliminates handshake and retransmission latency, prioritizing immediate real-time delivery",
      b: "UDP automatically encrypts all voice data with SSL/TLS",
      c: "UDP guarantees that every single packet arrives in exact sequential order",
      d: "UDP packets can traverse routers without needing IP addresses",
      correct: "A",
      explanation: "UDP is connectionless and does not retransmit lost packets. In real-time voice and gaming, an old delayed packet is useless; eliminating retransmissions ensures minimal latency."
    }
  },
  {
    subject: "Computer Science",
    topic: "Linear Data Structures",
    concept: "Stack Data Structure (LIFO)",
    keywords: ["stack data structure", "stack in data structures", "lifo", "push and pop", "call stack", "stack overflow"],
    plainEnglish: "A **Stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. Elements can only be added (**push**) or removed (**pop**) from one end, referred to as the **top** of the stack.",
    analogy: "Think of a spring-loaded stack of dinner plates at a buffet: the last clean plate placed on top of the pile is the very first plate taken off by the next guest!",
    howItWorks: [
      "**1. Core Operations (All $O(1)$ constant time)**:\n   - `push(item)`: Adds an item to the top.\n   - `pop()`: Removes and returns the top item.\n   - `peek()` or `top()`: Inspects the top item without removing it.\n   - `isEmpty()`: Checks if the stack has zero elements.",
      "**2. Internal Representation**: Can be implemented using a dynamic array (with top index pointer) or a Singly Linked List.",
      "**3. Classic Applications**:\n   - **Call Stack**: Programming language execution frames for function calls and recursion.\n   - **Undo/Redo Mechanism**: In text editors (Ctrl+Z pops the most recent action).\n   - **Balanced Parentheses Checking**: Validating brackets `{}[]()` in compilers.\n   - **Browser Back Button**: Tracks visited URLs."
    ],
    realWorldExample: "When a function in your code calls another function, the CPU pushes a stack frame with local variables onto the call stack. If a recursive function runs without a terminating base case, memory exhausts, causing a crash known as **Stack Overflow**!",
    keyTakeaways: [
      "LIFO: Last-In, First-Out.",
      "All primary operations (`push`, `pop`, `peek`) run in $O(1)$ time.",
      "Underflow occurs when popping an empty stack; Overflow occurs when pushing onto a full fixed-size stack."
    ],
    mcq: {
      question: "Which data access principle governs the operation of a Stack data structure?",
      a: "Last-In, First-Out (LIFO)",
      b: "First-In, First-Out (FIFO)",
      c: "Random Access (O(1) by index)",
      d: "Shortest-Job-First (SJF)",
      correct: "A",
      explanation: "A Stack strictly operates on the Last-In, First-Out (LIFO) principle, where the most recently pushed element is the first one popped."
    }
  },
  {
    subject: "Computer Science",
    topic: "Linear Data Structures",
    concept: "Queue Data Structure (FIFO)",
    keywords: ["queue data structure", "queue in data structures", "fifo", "enqueue", "dequeue", "circular queue", "priority queue"],
    plainEnglish: "A **Queue** is a linear data structure that follows the **First-In, First-Out (FIFO)** principle. Elements are inserted at the **rear** (**enqueue**) and removed from the **front** (**dequeue**).",
    analogy: "Think of a queue of people waiting in line at a movie theater ticket counter: the first person who arrives in line is the first person served and allowed into the theater!",
    howItWorks: [
      "**1. Core Operations (All $O(1)$ time)**:\n   - `enqueue(item)`: Appends an element to the rear of the queue.\n   - `dequeue()`: Removes and returns the element at the front.\n   - `peek()` / `front()`: Views the front element without removing it.\n   - `isEmpty()`: Checks if the queue has zero items.",
      "**2. Circular Queue**: Solves array memory waste by wrapping front and rear pointers using modulo arithmetic: `rear = (rear + 1) % capacity`.",
      "**3. Variations**: Double-Ended Queue (Deque), Priority Queue (Heap-based).",
      "**4. Primary Applications**:\n   - CPU Task Scheduling & OS process ready queues.\n   - Breadth-First Search (BFS) graph traversal.\n   - Printer spooling buffers and message queues (RabbitMQ, Kafka)."
    ],
    realWorldExample: "When 5 people click 'Print' on the same office printer at the same time, the printer server enqueues all 5 print jobs in a FIFO queue, ensuring documents print in the exact order received!",
    keyTakeaways: [
      "FIFO: First-In, First-Out.",
      "Enqueue at rear, Dequeue at front.",
      "Essential for BFS graph traversal and asynchronous job processing."
    ],
    mcq: {
      question: "Which principle governs a standard Queue data structure, and at which ends do insertion and deletion occur?",
      a: "FIFO (First-In, First-Out); Enqueue at rear, Dequeue at front",
      b: "LIFO (Last-In, First-Out); Both operations at top",
      c: "FIFO; Enqueue at front, Dequeue at rear",
      d: "Priority ordering with random access",
      correct: "A",
      explanation: "Queues strictly adhere to First-In, First-Out (FIFO) semantics, inserting new elements at the rear (enqueue) and removing elements from the front (dequeue)."
    }
  },
  {
    subject: "Computer Science",
    topic: "Non-Linear Data Structures",
    concept: "Binary Tree & Binary Search Tree (BST)",
    keywords: ["binary tree", "binary search tree", "bst", "inorder traversal", "tree traversal", "balanced bst", "avl tree"],
    plainEnglish: "A **Binary Tree** is a hierarchical non-linear data structure where each node has at most two children (left child and right child). A **Binary Search Tree (BST)** is an ordered binary tree where for every node: all values in its **left subtree are strictly smaller**, and all values in its **right subtree are strictly greater**.",
    analogy: "Think of an organized company directory: the CEO is at the root. If an employee's ID is smaller, you look down the left corridor; if larger, down the right corridor. At every fork in the hallway, you eliminate half the company!",
    howItWorks: [
      "**1. BST Invariant**: For every node $N$ with key $K$:\n   - Every key in $\\text{leftSubtree}(N) < K$.\n   - Every key in $\\text{rightSubtree}(N) > K$.",
      "**2. Time Complexities**:\n   - Search / Insert / Delete: Average **$O(\\log n)$** when balanced; Worst case **$O(n)$** if skewed like a linked list.",
      "**3. Tree Traversals**:\n   - **In-Order (Left, Root, Right)**: Visits keys in strictly sorted ascending order!\n   - **Pre-Order (Root, Left, Right)**: Used for serializing or copying tree structures.\n   - **Post-Order (Left, Right, Root)**: Used for deleting nodes bottom-up.",
      "**4. Self-Balancing Trees**: AVL Trees and Red-Black Trees automatically perform rotations during insertions to maintain $O(\\log n)$ height."
    ],
    realWorldExample: "Database indexes (B-Trees) and programming language standard library maps (like `std::map` in C++ and `TreeMap` in Java) use balanced binary search trees underneath for guaranteed logarithmic search times!",
    keyTakeaways: [
      "BST property: Left < Root < Right.",
      "An in-order traversal of a BST yields elements in sorted ascending order.",
      "Average search time is $O(\\log n)$; self-balancing variants prevent $O(n)$ degradation."
    ],
    mcq: {
      question: "Which tree traversal order on a Binary Search Tree (BST) produces elements in strictly ascending sorted order?",
      a: "In-Order Traversal (Left, Root, Right)",
      b: "Pre-Order Traversal (Root, Left, Right)",
      c: "Post-Order Traversal (Left, Right, Root)",
      d: "Level-Order Traversal (BFS)",
      correct: "A",
      explanation: "Because a BST guarantees that all left subtree elements are smaller than the root and right subtree elements are larger, an In-Order traversal (Left, Root, Right) recursively outputs values in strictly sorted ascending order."
    }
  },
  {
    subject: "Computer Science",
    topic: "Searching & Algorithms",
    concept: "Binary Search Algorithm ($O(\\log n)$)",
    keywords: ["binary search", "binary search algorithm", "divide and conquer", "log n search", "sorted array search"],
    plainEnglish: "**Binary Search** is an ultra-fast search algorithm that finds the position of a target value within a **sorted array** in **$O(\\log n)$** time by repeatedly dividing the search interval in half.",
    analogy: "When looking up a word like 'Network' in a printed 1,000-page dictionary, you don't read every word starting from page 1! You flip open the middle (page 500), see 'Middle', know 'N' comes after 'M', and discard the entire first half of the book with a single flip!",
    howItWorks: [
      "**1. Prerequisite**: The array MUST be sorted.",
      "**2. Algorithm Steps**:\n   - Initialize pointers `low = 0`, `high = n - 1`.\n   - Calculate middle index: `mid = low + Math.floor((high - low) / 2)`.\n   - If `arr[mid] === target`: Found! Return `mid`.\n   - If `arr[mid] < target`: Search right half (`low = mid + 1`).\n   - If `arr[mid] > target`: Search left half (`high = mid - 1`).\n   - If `low > high`: Target is not in the array.",
      "**3. Complexity**: Divides problem size by 2 at each step: $T(n) = T(n/2) + 1 \\implies O(\\log_2 n)$."
    ],
    realWorldExample: "Searching through a sorted list of 1,000,000,000 (1 billion) items with Linear Search would take up to 1,000,000,000 comparisons. Binary Search finds any item in at most **30 comparisons** ($2^{30} \\approx 1.07 \\times 10^9$)!",
    keyTakeaways: [
      "Requires input array to be sorted.",
      "Time complexity: $O(\\log n)$, Space complexity: $O(1)$ iterative.",
      "Always compute `mid = low + (high - low) / 2` to prevent 32-bit integer overflow."
    ],
    mcq: {
      question: "What is the maximum number of comparisons Binary Search needs to find a target in a sorted list of 1,024 elements?",
      a: "10 (since 2¹⁰ = 1,024)",
      b: "1,024",
      c: "512",
      d: "100",
      correct: "A",
      explanation: "Binary Search operates in O(log₂ n) time. For n = 1,024, log₂(1024) = 10. Thus, at most 10 comparisons are needed in the worst case."
    }
  },
  {
    subject: "Operating Systems",
    topic: "Concurrency & Process Synchronization",
    concept: "Deadlock & The 4 Coffman Conditions",
    keywords: ["deadlock", "deadlocks", "coffman conditions", "deadlock prevention", "circular wait", "mutual exclusion", "banker's algorithm"],
    plainEnglish: "A **Deadlock** is a state in concurrent systems where two or more processes are permanently blocked because each process is holding a resource and waiting for another resource held by another process in a closed loop, meaning none can ever proceed.",
    analogy: "Think of a 4-way street intersection gridlock: Car A is in the intersection blocking Car B, Car B is blocking Car C, Car C is blocking Car D, and Car D is blocking Car A. No car can move forward without another car moving first!",
    howItWorks: [
      "**The 4 Coffman Conditions (ALL FOUR must be simultaneously true for deadlock to occur)**:\n1. **Mutual Exclusion**: At least one resource is held in a non-shareable mode (only one process can use it at a time).\n2. **Hold and Wait**: A process holds at least one resource and is waiting to acquire additional resources held by other processes.\n3. **No Preemption**: Resources cannot be forcibly taken away from a process; they can only be released voluntarily.\n4. **Circular Wait**: A closed chain of processes exists: $P_0$ waits for $P_1$, $P_1$ waits for $P_2$, ..., and $P_n$ waits for $P_0$.",
      "**Deadlock Handling Strategies**:\n- **Prevention**: Invalidate at least ONE of the 4 Coffman conditions (e.g., impose resource ordering to eliminate circular wait).\n- **Avoidance**: Banker's Algorithm ensures system always stays in a 'Safe State'.\n- **Detection & Recovery**: Terminate deadlocked processes or preempt resources."
    ],
    realWorldExample: "In database systems, if Transaction 1 locks the 'Users' table and requests the 'Orders' table, while Transaction 2 has already locked the 'Orders' table and requests the 'Users' table, both hang forever unless the DBMS detects the circular wait and aborts one transaction!",
    keyTakeaways: [
      "Deadlock requires ALL FOUR Coffman conditions.",
      "Breaking even one condition guarantees deadlock cannot occur.",
      "Imposing a strict global resource ordering breaks the Circular Wait condition."
    ],
    mcq: {
      question: "Which of the following is NOT one of the four essential Coffman conditions required for a deadlock to occur?",
      a: "Preemptive Resource Allocation (resources forcibly reclaimed by OS)",
      b: "Mutual Exclusion",
      c: "Hold and Wait",
      d: "Circular Wait",
      correct: "A",
      explanation: "The Coffman condition is 'No Preemption' (resources cannot be forcibly taken away). If preemption is allowed, deadlocks are avoided or resolved."
    }
  },
  {
    subject: "Database Management Systems",
    topic: "Transaction Management & Concurrency",
    concept: "ACID Properties of Transactions",
    keywords: ["acid properties", "acid in dbms", "atomicity", "consistency", "isolation", "durability", "dbms transactions"],
    plainEnglish: "**ACID** is an acronym representing the four critical properties that guarantee database transactions are processed reliably, maintaining data integrity even during system crashes, network failures, or concurrent user access: **Atomicity, Consistency, Isolation, and Durability**.",
    analogy: "Think of an online bank transfer of ₹1,000 from Alice to Bob:\n- **Atomicity**: The bank must debit ₹1,000 from Alice AND credit ₹1,000 to Bob as one atomic package. It cannot debit Alice and crash before Bob receives it!\n- **Consistency**: Total money in the bank remains balanced.\n- **Isolation**: If Charlie also transfers money to Bob at the exact same millisecond, the operations don't mix up.\n- **Durability**: Once you get the 'Success' receipt, the transfer is permanently written to disk even if power cuts immediately after!",
    howItWorks: [
      "**1. Atomicity ('All or Nothing')**: Every statement in a transaction succeeds completely, or the entire transaction rolls back (`ROLLBACK`) leaving the database untouched.",
      "**2. Consistency**: The database transitions from one valid state to another valid state, satisfying all constraints, cascades, and triggers.",
      "**3. Isolation**: Concurrent transactions execute as if they were running serially without interfering with each other (preventing dirty reads and race conditions).",
      "**4. Durability**: Once a transaction is committed (`COMMIT`), its updates persist permanently on non-volatile storage, even during a total server power outage."
    ],
    realWorldExample: "Relational database engines like PostgreSQL and MySQL InnoDB use Write-Ahead Logging (WAL) to ensure that transaction changes are written to persistent disk journals before acknowledging success, guaranteeing Durability!",
    keyTakeaways: [
      "Atomicity: All-or-nothing execution.",
      "Consistency: Enforces schema rules and integrity constraints.",
      "Isolation: Concurrency control without cross-transaction interference.",
      "Durability: Committed data survives crashes via persistent logs."
    ],
    mcq: {
      question: "Which ACID property guarantees that all operations within a database transaction either complete fully or have zero effect (all-or-nothing)?",
      a: "Atomicity",
      b: "Consistency",
      c: "Isolation",
      d: "Durability",
      correct: "A",
      explanation: "Atomicity enforces the 'all-or-nothing' principle: if any single operation within a transaction fails, the entire transaction is rolled back as if it never occurred."
    }
  },
  {
    subject: "Database Management Systems",
    topic: "Relational Database Design",
    concept: "Database Normalization (1NF, 2NF, 3NF, BCNF)",
    keywords: ["normalization", "database normalization", "1nf", "2nf", "3nf", "bcnf", "normal forms", "functional dependency"],
    plainEnglish: "**Database Normalization** is the systematic process of organizing fields and tables in a relational database to minimize **data redundancy** (duplication) and prevent **data anomalies** (insertion, update, and deletion anomalies) through decomposing tables based on functional dependencies.",
    analogy: "Imagine an office where employee names, phone numbers, and addresses are written on every single project report: when an employee moves houses, you have to update 50 reports! If you miss one, data becomes contradictory. Normalization puts employee details in one master table and links them with a clean Employee ID!",
    howItWorks: [
      "**1. First Normal Form (1NF)**: All column values must be atomic (no multi-valued lists or arrays) and each row must be uniquely identifiable via a Primary Key.",
      "**2. Second Normal Form (2NF)**: Must be in 1NF, AND eliminate partial dependencies (every non-key attribute must depend on the *entire* candidate key, not part of a composite key).",
      "**3. Third Normal Form (3NF)**: Must be in 2NF, AND eliminate transitive dependencies ($X \\to Y$ and $Y \\to Z$, non-key attribute depending on another non-key attribute).",
      "**4. Boyce-Codd Normal Form (BCNF)**: Stricter version of 3NF: for every functional dependency $X \\to Y$, $X$ must be a superkey."
    ],
    realWorldExample: "In e-commerce databases, storing Customer Address inside the Orders table creates 2NF/3NF anomalies. Decomposing into `Customers(id, name, address)` and `Orders(id, customer_id, total)` ensures updates happen in one place!",
    keyTakeaways: [
      "1NF: Atomic values only.",
      "2NF: No partial dependency on composite keys.",
      "3NF: No transitive dependencies.",
      "BCNF: In every $X \\to Y$, $X$ must be a superkey."
    ],
    mcq: {
      question: "A relational database table is in First Normal Form (1NF). What additional condition must it satisfy to achieve Second Normal Form (2NF)?",
      a: "It must eliminate all partial functional dependencies on composite primary keys",
      b: "It must eliminate all transitive dependencies between non-key columns",
      c: "It must have exactly one foreign key in every table",
      d: "It must store all text columns as variable-length characters",
      correct: "A",
      explanation: "To achieve 2NF, a table in 1NF must ensure that every non-prime attribute is fully functionally dependent on the entire primary key, eliminating partial dependencies."
    }
  },
  {
    subject: "Computer Science & Programming",
    topic: "Object-Oriented Programming (OOP)",
    concept: "The 4 Pillars of OOP (Encapsulation, Abstraction, Inheritance, Polymorphism)",
    keywords: ["oop", "object oriented programming", "4 pillars of oop", "encapsulation", "abstraction", "inheritance", "polymorphism"],
    plainEnglish: "**Object-Oriented Programming (OOP)** is a programming paradigm built around objects containing data (attributes) and code (methods). The four core pillars are:\n1. **Encapsulation**: Bundling data with methods and restricting direct access.\n2. **Abstraction**: Hiding internal implementation complexity behind simple interfaces.\n3. **Inheritance**: Deriving new classes from existing classes to reuse code.\n4. **Polymorphism**: The ability of different classes to respond to the same method call in their own unique way.",
    analogy: "- **Encapsulation**: A medical capsule enclosing ingredients safely inside.\n- **Abstraction**: A car's gas pedal: you press the pedal to accelerate without needing to understand fuel injection mechanics under the hood.\n- **Inheritance**: A child inheriting physical traits from their parents.\n- **Polymorphism**: The 'Play' button on your remote: pressing play works whether the media is a movie, music track, or podcast!",
    howItWorks: [
      "**1. Encapsulation**: Private fields (`private double balance;`) accessed only via public getters and setters.",
      "**2. Abstraction**: Abstract classes and interfaces (`interface Shape { double getArea(); }`) defining contracts.",
      "**3. Inheritance**: `class Dog extends Animal`: Dog inherits `eat()` from Animal and adds `bark()`.",
      "**4. Polymorphism**:\n   - **Compile-time (Overloading)**: Methods with same name but different parameter lists.\n   - **Runtime (Overriding)**: Subclass provides a specific implementation of an inherited method."
    ],
    realWorldExample: "In game development, an abstract `Enemy` class defines `attack()`. Both `Dragon` and `Goblin` inherit from `Enemy`, but when `enemy.attack()` is invoked polymorphically, `Dragon` breathes fire while `Goblin` swings a dagger!",
    keyTakeaways: [
      "Encapsulation: Data hiding (`private` fields, public API).",
      "Abstraction: Expose 'what it does', hide 'how it does it'.",
      "Inheritance: 'is-a' relationship, code reuse.",
      "Polymorphism: 'many forms', method overriding and overloading."
    ],
    mcq: {
      question: "Which pillar of Object-Oriented Programming is demonstrated when a subclass provides its own specific implementation of a method declared in its parent class (method overriding)?",
      a: "Polymorphism (Runtime Polymorphism)",
      b: "Encapsulation",
      c: "Data Mining",
      d: "Linear Recursion",
      correct: "A",
      explanation: "Method overriding in a subclass is the quintessential manifestation of Runtime (dynamic) Polymorphism, allowing subclasses to provide customized behavior for an inherited method call."
    }
  },
  {
    subject: "Intermediate Mathematics",
    topic: "Matrices & Linear Algebra",
    concept: "Matrices & Determinants",
    keywords: ["matrix", "matrices", "determinant", "cramer's rule", "matrix inverse", "singular matrix", "adjoint matrix"],
    plainEnglish: "A **Matrix** is a rectangular array of numbers, symbols, or expressions arranged in rows and columns. The **Determinant** is a scalar numerical value computed from a square matrix that characterizes its geometric scaling factor and determines whether the matrix has an inverse.",
    analogy: "Think of a spreadsheet or a digital photo: an image on your smartphone is literally a massive matrix of pixels with rows and columns of RGB color values! Computer graphics cards multiply matrices billions of times per second to rotate, scale, and render 3D game worlds.",
    howItWorks: [
      "**1. Determinant of 2x2 Matrix**: $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$.",
      "**2. Singular Matrix**: If $\\det(A) = |A| = 0$, the matrix is **singular** and its inverse **does not exist**.",
      "**3. Matrix Inverse**: $A^{-1} = \\frac{1}{|A|} \\text{adj}(A)$ (only exists if $|A| \\neq 0$).",
      "**4. Cramer's Rule**: Solves a system of linear equations $AX = B$ using determinants: $x = \\frac{\\Delta_1}{\\Delta}, y = \\frac{\\Delta_2}{\\Delta}, z = \\frac{\\Delta_3}{\\Delta}$ (where $\\Delta \\neq 0$)."
    ],
    realWorldExample: "Google's PageRank search algorithm, 3D video game transformations, GPS positioning calculations, and quantum mechanics state vectors all rely entirely on matrix operations and determinants!",
    keyTakeaways: [
      "Inverse exists if and only if determinant $|A| \\neq 0$.",
      "Matrix multiplication is non-commutative: in general, $AB \\neq BA$.",
      "Cramer's Rule fails (infinite or no solutions) if the coefficient determinant $\\Delta = 0$."
    ],
    mcq: {
      question: "If a square matrix A has a determinant of zero (|A| = 0), what does this mathematically imply about the matrix?",
      a: "A is a singular matrix and its inverse A⁻¹ does not exist",
      b: "A is an identity matrix",
      c: "A is an orthogonal matrix",
      d: "All entries of A must be zero",
      correct: "A",
      explanation: "A square matrix with determinant equal to zero is called a singular matrix. Because A⁻¹ = (1/|A|) adj(A), division by zero means the matrix inverse does not exist."
    }
  },
  {
    subject: "Intermediate Physics",
    topic: "Kinematics & Dynamics",
    concept: "Projectile Motion",
    keywords: ["projectile motion", "projectile", "trajectory", "maximum height", "horizontal range", "time of flight"],
    plainEnglish: "**Projectile Motion** is a two-dimensional curved motion under the sole influence of constant downward gravity ($g = 9.8\\ \\text{m/s}^2$), with zero horizontal acceleration (neglecting air resistance). Its path through space forms a symmetric **parabola**.",
    analogy: "When a cricket batsman hits a ball high into the air for a six, the ball travels forward at constant horizontal speed while gravity pulls it down in a curved parabolic arc!",
    howItWorks: [
      "**1. Velocity Components**: $u_x = u \\cos\\theta$ (constant, $a_x = 0$), $u_y = u \\sin\\theta$ (decelerated by gravity, $a_y = -g$).",
      "**2. Time of Flight**: $T = \\frac{2u \\sin\\theta}{g}$.",
      "**3. Maximum Height**: $H_{\\max} = \\frac{u^2 \\sin^2\\theta}{2g}$.",
      "**4. Horizontal Range**: $R = \\frac{u^2 \\sin(2\\theta)}{g}$. The maximum range is achieved when projected at an angle of $\\theta = 45^\\circ$."
    ],
    realWorldExample: "Artillery engineers, basketball players aiming for a three-pointer, and rocket trajectory controllers calculate the launch velocity $u$ and angle $\\theta$ using these projectile formulas to ensure exact target hit.",
    keyTakeaways: [
      "Trajectory equation is a parabola: $y = x \\tan\\theta - \\frac{gx^2}{2u^2 \\cos^2\\theta}$.",
      "At the apex (peak height), vertical velocity is momentarily zero ($v_y = 0$), but horizontal velocity remains $u \\cos\\theta$.",
      "Complementary launch angles ($\\theta$ and $90^\\circ - \\theta$) yield the exact same horizontal range $R$."
    ],
    mcq: {
      question: "At what angle of projection with the horizontal is the horizontal range of a projectile maximized for a given launch speed?",
      a: "45°",
      b: "30°",
      c: "60°",
      d: "90°",
      correct: "A",
      explanation: "Horizontal range is given by R = (u² sin 2θ) / g. Range is maximized when sin(2θ) reaches its maximum value of 1, which occurs when 2θ = 90°, meaning θ = 45°."
    }
  },
  {
    subject: "Intermediate Chemistry",
    topic: "Physical Chemistry",
    concept: "Chemical Equilibrium & Le Chatelier's Principle",
    keywords: ["chemical equilibrium", "le chatelier", "equilibrium constant", "kc", "kp", "reversible reaction"],
    plainEnglish: "**Chemical Equilibrium** is a dynamic state in a reversible reaction where the rate of the forward reaction equals the rate of the backward reaction, meaning concentrations of reactants and products remain constant over time.",
    analogy: "Imagine walking up a downward-moving escalator at the exact same speed that the stairs move down. To an observer, you appear stationary, but both you and the escalator are actively moving! That is dynamic equilibrium.",
    howItWorks: [
      "**1. Equilibrium Constant ($K_c$)**: For $aA + bB \\rightleftharpoons cC + dD$, $K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}$.",
      "**2. Le Chatelier's Principle**: If an external stress (concentration, temperature, pressure) is applied to a system at equilibrium, the system shifts to counteract that stress.",
      "**3. Effect of Pressure**: Increasing pressure shifts the equilibrium towards the side with **fewer moles of gas**.",
      "**4. Effect of Temperature**: For exothermic reactions ($\\Delta H < 0$), increasing temperature shifts equilibrium to the left (backward)."
    ],
    realWorldExample: "In the industrial Haber Process for ammonia synthesis ($N_2 + 3H_2 \\rightleftharpoons 2NH_3, \\Delta H = -92\\ \\text{kJ/mol}$), chemical plants operate at high pressure (200 atm) to force the equilibrium to shift forward towards $NH_3$ (2 gas moles vs 4 gas moles)!",
    keyTakeaways: [
      "Catalysts speed up the arrival at equilibrium, but do NOT change the equilibrium constant $K_c$ or yield.",
      "Temperature is the ONLY factor that changes the numerical value of $K_c$.",
      "High weightage in physical chemistry."
    ],
    mcq: {
      question: "According to Le Chatelier's principle, what effect does increasing the pressure have on the gaseous equilibrium: N2(g) + 3H2(g) ⇌ 2NH3(g)?",
      a: "Shifts the equilibrium forward toward NH3 (fewer gas moles)",
      b: "Shifts the equilibrium backward toward N2 and H2",
      c: "Has no effect because pressure does not affect chemical reactions",
      d: "Decreases the numerical value of the equilibrium constant Kc",
      correct: "A",
      explanation: "The forward side has 2 moles of gas while the reactant side has 1 + 3 = 4 moles of gas. Increasing pressure favors the side with fewer gas moles to relieve pressure, shifting equilibrium forward toward NH3."
    }
  },
  {
    subject: "Database Management Systems",
    topic: "SQL Queries & Relational Joins",
    concept: "SQL Joins (INNER, LEFT, RIGHT, FULL OUTER)",
    keywords: ["sql join", "sql joins", "inner join", "left join", "right join", "outer join", "cross join"],
    plainEnglish: "An **SQL JOIN** is a query clause used to combine columns and rows from two or more relational database tables based on a related column between them (such as a Primary Key and Foreign Key).",
    analogy: "Imagine two spreadsheets: Sheet 1 has `Students(ID, Name)` and Sheet 2 has `ExamScores(StudentID, Subject, Marks)`. An SQL JOIN matches them on `StudentID` so you can view each student's name right next to their exam scores in one unified report!",
    howItWorks: [
      "**1. INNER JOIN**: Returns only rows where there is a match in **both** tables.",
      "**2. LEFT JOIN**: Returns **all** rows from the left table, plus matched rows from the right table (unmatched right columns return `NULL`).",
      "**3. RIGHT JOIN**: Returns **all** rows from the right table, plus matched rows from the left table.",
      "**4. FULL OUTER JOIN**: Returns all records when there is a match in either table."
    ],
    realWorldExample: "```sql\nSELECT Users.name, Orders.order_total\nFROM Users\nLEFT JOIN Orders ON Users.id = Orders.user_id;\n```\nThis query lists every single user, showing their order totals if they made purchases, and `NULL` if they haven't ordered yet!",
    keyTakeaways: [
      "INNER JOIN excludes non-matching rows from both tables.",
      "LEFT JOIN preserves all rows from the primary left table.",
      "Always index foreign key columns for fast join performance."
    ],
    mcq: {
      question: "Which type of SQL JOIN returns ALL rows from the left table, with NULL values in the right table's columns if no match is found?",
      a: "LEFT (OUTER) JOIN",
      b: "INNER JOIN",
      c: "CROSS JOIN",
      d: "SELF JOIN",
      correct: "A",
      explanation: "A LEFT JOIN returns all rows from the left-hand table regardless of whether matching records exist in the right table, filling unmatched right columns with NULL."
    }
  },
  {
    subject: "Mathematics",
    topic: "Trigonometry & Identities",
    concept: "Trigonometric Identities (sin²θ + cos²θ = 1)",
    keywords: ["trigonometry", "trigonometric identities", "sin cos tan", "sin^2", "cos^2", "pythagorean identity"],
    plainEnglish: "Trigonometric identities are mathematical equations involving trigonometric functions (sine, cosine, tangent) that hold true for **every single valid angle $\\theta$**.",
    analogy: "Think of a right-angled triangle inscribed in a circle of radius 1 (the Unit Circle): the horizontal leg is $\\cos\\theta$ and the vertical leg is $\\sin\\theta$. By the Pythagorean Theorem ($a^2 + b^2 = c^2$), the sum of squares $(\\cos\\theta)^2 + (\\sin\\theta)^2$ must always equal the hypotenuse squared: $1^2 = 1$!",
    howItWorks: [
      "**1. Primary Pythagorean Identity**: $\\sin^2\\theta + \\cos^2\\theta = 1$.",
      "**2. Tangent & Secant Identity**: Dividing by $\\cos^2\\theta$ gives: $1 + \\tan^2\\theta = \\sec^2\\theta$.",
      "**3. Cotangent & Cosecant Identity**: Dividing by $\\sin^2\\theta$ gives: $1 + \\cot^2\\theta = \\csc^2\\theta$.",
      "**4. Double Angle Formulas**: $\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta$, $\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta$."
    ],
    realWorldExample: "GPS satellite triangulation, audio signal frequency decomposition (Fourier Transform), computer graphics 3D rotation matrices, and game physics engines all rely directly on these trigonometric identities!",
    keyTakeaways: [
      "$\\sin^2\\theta + \\cos^2\\theta = 1$ for all real numbers $\\theta$.",
      "$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$, $\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$, $\\sec\\theta = \\frac{1}{\\cos\\theta}$, $\\csc\\theta = \\frac{1}{\\sin\\theta}$.",
      "Always look for opportunities to substitute $1 - \\sin^2\\theta$ with $\\cos^2\\theta$ to simplify proofs."
    ],
    mcq: {
      question: "Which of the following trigonometric identities is mathematically valid for all real angles θ?",
      a: "1 + tan²(θ) = sec²(θ)",
      b: "sin²(θ) - cos²(θ) = 1",
      c: "1 + cot²(θ) = tan²(θ)",
      d: "sin(θ) + cos(θ) = 1",
      correct: "A",
      explanation: "Dividing the fundamental Pythagorean identity sin²(θ) + cos²(θ) = 1 by cos²(θ) yields (sin²θ/cos²θ) + (cos²θ/cos²θ) = (1/cos²θ), which simplifies to tan²(θ) + 1 = sec²(θ)."
    }
  },
  {
    subject: "Theory of Computation & Compiler Design",
    topic: "Formal Grammars & Automata",
    concept: "Context-Free Grammar (CFG)",
    keywords: ["context free grammar", "cfg", "context-free grammar", "cfl", "pushdown automata", "pda", "chomsky", "type-2 grammar"],
    plainEnglish: "A **Context-Free Grammar (CFG)** is a set of formal recursive production rules that describes how to form grammatically valid strings in a formal language (such as programming language syntax), where every rule replaces a single non-terminal variable regardless of surrounding context: $A \\to \\alpha$.",
    analogy: "It's like replacing `[Fruit]` with `Apple` in a recipe: whether it says 'red [Fruit]' or 'fresh [Fruit]', the rule works anywhere in any context without restriction!",
    howItWorks: [
      "**4-Tuple Definition $G = (V, \\Sigma, R, S)$**:",
      "1. $V$: Finite set of Variables / Non-Terminals.",
      "2. $\\Sigma$: Finite set of Terminals (actual tokens, $V \\cap \\Sigma = \\emptyset$).",
      "3. $R$: Production rules strictly of form $A \\to \\alpha$, where $A \\in V$ and $\\alpha \\in (V \\cup \\Sigma)^*$.",
      "4. $S$: Start symbol ($S \\in V$)."
    ],
    realWorldExample: "Compilers (Python, GCC, Clang) use CFGs in their syntax analysis parser to verify balanced brackets, operator precedence, and parse trees before generating bytecode!",
    keyTakeaways: [
      "Chomsky Hierarchy: Type-2 grammar.",
      "Recognized by Pushdown Automata (PDA) using a LIFO stack.",
      "Left side of every rule must contain exactly one non-terminal ($A \\to \\alpha$)."
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
    plainEnglish: "**DFA** (Deterministic Finite Automaton) and **NFA** (Non-Deterministic Finite Automaton) are abstract state machines that recognize regular languages (Type-3 in Chomsky hierarchy). While a DFA has exactly one state transition for each symbol, an NFA can transition to zero, one, or multiple states, or jump spontaneously on $\\epsilon$.",
    analogy: "A DFA is like following a strict GPS route with exactly one turn at each intersection. An NFA is like sending clones down every possible path at every fork in the road simultaneously!",
    howItWorks: [
      "**DFA**: Transition function $\\delta: Q \\times \\Sigma \\to Q$. Exactly one deterministic path.",
      "**NFA**: Transition function $\\delta: Q \\times (\\Sigma \\cup \\{\\epsilon\\}) \\to 2^Q$. Multiple branches or $\\epsilon$-moves.",
      "**Equivalence**: Any NFA can be converted into an equivalent DFA using the **Subset (Powerset) Construction** algorithm.",
      "**Complexity**: An $n$-state NFA may produce a DFA with up to $2^n$ states in the worst case."
    ],
    realWorldExample: "Regular expression engines (grep, JavaScript `/regex/`, Python `re`) convert regex into NFAs, transform them into DFAs, and execute pattern matching in rapid $O(n)$ time!",
    keyTakeaways: [
      "DFA and NFA have identical computational power (both recognize Regular Languages).",
      "DFAs are faster to execute ($O(n)$, no backtracking).",
      "NFAs are more compact and easier to construct."
    ],
    mcq: {
      question: "Which of the following statements comparing DFA and NFA is TRUE?",
      a: "DFA and NFA have the exact same expressive power and both recognize Regular Languages",
      b: "NFA can recognize Context-Free Languages that a DFA cannot",
      c: "A DFA allows spontaneous transitions on empty string ε",
      d: "Every DFA requires strictly more states than any equivalent NFA",
      correct: "A",
      explanation: "Via the Powerset (Subset) Construction, every NFA can be converted into an equivalent DFA. Thus, DFA and NFA possess identical computational power and recognize exactly the class of Regular Languages."
    }
  },
  {
    subject: "Operating Systems",
    topic: "CPU Scheduling",
    concept: "Round Robin Scheduling",
    keywords: ["round robin", "cpu scheduling", "time quantum", "preemptive scheduling", "ready queue", "turnaround time"],
    plainEnglish: "**Round Robin (RR)** is a preemptive CPU scheduling algorithm designed for time-sharing systems. The CPU is allocated to each process in a circular ready queue for a fixed time interval called a **Time Quantum** (slice).",
    analogy: "Sharing a video game console among friends: a 10-minute timer is set. Each person plays for 10 minutes, and when the timer rings, they hand the controller to the next person and wait at the back of the line!",
    howItWorks: [
      "**Preemptive**: If a process has not finished within its time quantum $q$, an OS timer interrupt triggers a context switch, moving the process to the rear of the ready queue.",
      "**Time Quantum Selection**:\n   - If $q$ is very large $\\implies$ degenerates into First-Come First-Served (FCFS).\n   - If $q$ is very small $\\implies$ excessive CPU context-switching overhead.",
      "**Fairness**: Every process receives $\\frac{1}{n}$-th of the CPU time, eliminating starvation."
    ],
    realWorldExample: "Multitasking operating systems like Linux and Windows use priority-weighted round-robin scheduling so your web browser, Spotify music, and code compiler all run smoothly at the same time.",
    keyTakeaways: [
      "Preemptive CPU algorithm using circular FIFO ready queue.",
      "Prevents starvation completely.",
      "Optimal quantum: 80% of CPU bursts should be shorter than $q$."
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
  }
];

/**
 * Smart, precise Knowledge Base matcher.
 * Prevents false positives like chemical 'acid' matching DBMS 'ACID',
 * or 'binary tree' matching 'binary search'.
 */
export function findKnowledgeBaseEntry(
  query: string,
  educationLevel?: string,
  streamBranch?: string
): ConceptMasteryEntry | null {
  if (!query || typeof query !== "string") return null;

  const q = query.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const words = new Set(cleanQ.split(/\s+/));

  // 1. DISAMBIGUATION CHECKS
  const isDbmsAcid =
    (q.includes("acid") || q.includes("atomicity") || q.includes("isolation")) &&
    (q.includes("dbms") || q.includes("database") || q.includes("transaction") || q.includes("commit") || q.includes("durability"));

  const isChemicalAcid =
    (words.has("acid") || words.has("acids") || words.has("base") || words.has("bases") || words.has("ph")) &&
    !isDbmsAcid;

  const isBinaryTree =
    (q.includes("binary tree") || q.includes("bst") || words.has("tree") || words.has("trees")) &&
    !q.includes("binary search");

  const isBinarySearch =
    (q.includes("binary search") || (words.has("search") && words.has("binary"))) &&
    !isBinaryTree;

  const isDnaReplication =
    (q.includes("dna replication") || q.includes("replication") || q.includes("polymerase") || q.includes("double helix")) &&
    !q.includes("mitochondria");

  const isMitochondria =
    (q.includes("mitochondria") || q.includes("mitochondrion") || q.includes("powerhouse")) &&
    !isDnaReplication;

  const isGravity =
    (words.has("gravity") || q.includes("gravitation") || q.includes("gravitational")) &&
    !q.includes("newton's second law") && !q.includes("f=ma");

  // Fast targeted lookup for disambiguated high-frequency concepts
  if (isChemicalAcid) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("Acids, Bases"));
    if (match) return match;
  }
  if (isDbmsAcid) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("ACID"));
    if (match) return match;
  }
  if (isBinaryTree) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("Binary Tree"));
    if (match) return match;
  }
  if (isBinarySearch) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("Binary Search"));
    if (match) return match;
  }
  if (isDnaReplication) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("DNA Structure"));
    if (match) return match;
  }
  if (isMitochondria) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("Mitochondria"));
    if (match) return match;
  }
  if (isGravity) {
    const match = ACADEMIC_KNOWLEDGE_BASE.find((e) => e.concept.includes("Universal Law of Gravitation"));
    if (match) return match;
  }

  // 2. GENERAL EXACT & KEYWORD MATCHING
  for (const entry of ACADEMIC_KNOWLEDGE_BASE) {
    const conceptLower = entry.concept.toLowerCase();

    // Direct concept name match
    if (q.includes(conceptLower) || cleanQ.includes(conceptLower)) {
      return entry;
    }

    // Precise keyword matching
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();

      // Multi-word keywords (e.g. "ohm's law", "work and energy", "linear equation")
      if (kwLower.includes(" ") && (q.includes(kwLower) || cleanQ.includes(kwLower))) {
        return entry;
      }

      // Single word keyword: require exact token match (avoids substring false positives)
      if (!kwLower.includes(" ") && words.has(kwLower)) {
        // Double check exclusions
        if (kwLower === "acid" && isDbmsAcid) continue;
        if (kwLower === "tree" && q.includes("binary search")) continue;
        if (kwLower === "search" && q.includes("binary tree")) continue;
        return entry;
      }
    }
  }

  return null;
}
