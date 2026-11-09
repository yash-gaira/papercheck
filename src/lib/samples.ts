import {
  PaperMetadata,
  ClassGrade,
  Subject,
} from "@/types/paper";

export interface SamplePaper {
  id: string;
  name: string;
  description: string;
  isClean: boolean;
  metadata: PaperMetadata;
  rawPaperText: string;
  rawAnswerKeyText: string;
}

// ============================================================================
// 1. Core Tested Specimens (Preserved Byte-for-Byte for Compatibility)
// ============================================================================

// Mathematics – Demo with Errors (Class 7)
export const SAMPLE_DELIBERATE_ERRORS: SamplePaper = {
  id: "sample-deliberate-errors",
  name: "Class 7 Mathematics (With Deliberate Errors)",
  description:
    "Demo paper with 6 questions (3 marks each, total 18 vs expected 20), an exact duplicate question, and a prime number MCQ with two valid primes (2 and 3).",
  isClean: false,
  metadata: {
    title: "Class 7 Mathematics Periodic Test 1",
    classGrade: "Class 7",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Read each question carefully before attempting.",
      "Write neat steps for calculation questions.",
    ],
  },
  rawPaperText: `1. Calculate 3/4 + 1/4. [3 marks]
Answer: 1

2. Which of these is a prime number? [3 marks]
A. 2
B. 3
C. 4
D. 6
Answer: A

3. Find the perimeter of a rectangle with length 8 cm and breadth 5 cm. [3 marks]
Answer: 26 cm

4. Calculate 3/4 + 1/4. [3 marks]
Answer: 1

5. If 5x - 7 = 18, find the value of x. [3 marks]
Answer: 5

6. Find the area of a square whose side is 7 cm. [3 marks]
Answer: 49 sq cm`,
  rawAnswerKeyText: `1. 1
2. A
3. 26 cm
4. 1
5. 5
6. 49 sq cm`,
};

// Mathematics – Clean Sample (Class 7)
export const SAMPLE_CLEAN: SamplePaper = {
  id: "sample-clean",
  name: "Class 7 Mathematics (Clean Paper)",
  description:
    "Standard verified paper with 5 questions (4 marks each, total 20 = expected 20), valid MCQs, distinct questions, and complete answer key.",
  isClean: true,
  metadata: {
    title: "Class 7 Mathematics Mid-Term Examination",
    classGrade: "Class 7",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Check your calculations before final submission.",
      "Marks are indicated against each question.",
    ],
  },
  rawPaperText: `1. Evaluate: (-15) + (-8) - (-12). [4 marks]
Answer: -11

2. Which of the following is an improper fraction? [4 marks]
A. 2/5
B. 3/7
C. 7/4
D. 5/9
Answer: C

3. Find the perimeter of a triangle with sides 6 cm, 8 cm, and 10 cm. [4 marks]
Answer: 24 cm

4. Solve for y: 3y + 4 = 19. [4 marks]
Answer: 5

5. What is the complementary angle of 35°? [4 marks]
A. 45°
B. 55°
C. 65°
D. 145°
Answer: B`,
  rawAnswerKeyText: `1. -11
2. C
3. 24 cm
4. 5
5. B`,
};

// Science – Demo with Errors (Class 10)
export const SAMPLE_SCIENCE_ERRORS: SamplePaper = {
  id: "sample-science-errors",
  name: "Class 10 Science (With Deliberate Errors)",
  description:
    "Demo science paper with 6 questions (3 marks each, total 18 vs expected 20) featuring missing physical units, lowercase chemical formula co2, unbalanced chemical equation, and a missing figure citation.",
  isClean: false,
  metadata: {
    title: "Class 10 Science Periodic Assessment 1",
    classGrade: "Class 10",
    subject: "Science",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Include relevant chemical equations and SI units.",
    ],
  },
  rawPaperText: `1. A car accelerates from rest to a velocity of 25 m/s in 10 seconds. Calculate the acceleration of the car in m/s². [3 marks]
Answer: 2.5

2. Which gas is released during photosynthesis? [3 marks]
A. co2
B. O2
C. N2
D. H2
Answer: B

3. Write the chemical equation for the formation of water from hydrogen and oxygen gas. [3 marks]
Answer: H2 + O2 -> H2O

4. Find the equivalent resistance of the circuit shown in the figure below. [3 marks]
Answer: 6 ohms

5. Which organelle is known as the powerhouse of the cell? [3 marks]
A. Mitochondria
B. Ribosome
C. Golgi apparatus
D. Nucleus
Answer: A

6. State Ohm's Law and express it mathematically. [3 marks]
Answer: V = IR`,
  rawAnswerKeyText: `1. 2.5
2. B
3. H2 + O2 -> H2O
4. 6 ohms
5. A
6. V = IR`,
};

// Science – Clean Sample (Class 9)
export const SAMPLE_SCIENCE_CLEAN: SamplePaper = {
  id: "sample-science-clean",
  name: "Class 9 Science (Clean Paper)",
  description:
    "Standard verified science paper with 5 questions (4 marks each, total 20 = expected 20), proper SI units, valid IUPAC formulas, and complete answer key.",
  isClean: true,
  metadata: {
    title: "Class 9 Science Term Assessment",
    classGrade: "Class 9",
    subject: "Science",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Write units clearly for numerical answers.",
    ],
  },
  rawPaperText: `1. A runner travels a distance of 100 meters in 5 seconds. Calculate the runner's speed in m/s. [4 marks]
Answer: 20 m/s

2. What is the chemical formula of Sodium Chloride? [4 marks]
A. NaCl
B. Na2Cl
C. NaCl2
D. Na2Cl2
Answer: A

3. What is the SI unit of force? [4 marks]
A. Joule
B. Newton
C. Pascal
D. Watt
Answer: B

4. Define inertia and give one everyday example. [4 marks]
Answer: Inertia is the property of an object to resist changes in its state of motion.

5. Calculate the kinetic energy of an object of mass 2 kg moving at 3 m/s. [4 marks]
Answer: 9 Joules`,
  rawAnswerKeyText: `1. 20 m/s
2. A
3. B
4. Inertia is the property of an object to resist changes in its state of motion.
5. 9 Joules`,
};

// ============================================================================
// 2. Class-Specific Verified Demos (Classes 6 through 12)
// ============================================================================

// Class 6 Mathematics
export const SAMPLE_CLASS_6_MATHS: SamplePaper = {
  id: "sample-class-6-maths",
  name: "Class 6 Mathematics (Periodic Review)",
  description:
    "Curriculum questions on LCM/HCF, integers, fractions, ratios, and perimeter of regular polygons.",
  isClean: true,
  metadata: {
    title: "Class 6 Mathematics Periodic Assessment",
    classGrade: "Class 6",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Show neat working steps for calculation questions.",
    ],
  },
  rawPaperText: `1. Find the lowest common multiple (LCM) of 12 and 18. [3 marks]
Answer: 36

2. Which of the following is the smallest whole number? [3 marks]
A. -1
B. 0
C. 1
D. 2
Answer: B

3. Solve: (-15) + 8. [3 marks]
Answer: -7

4. Find the ratio of 40 cm to 2 m in simplest form. [3 marks]
Answer: 1:5

5. Find the perimeter of a regular pentagon whose each side is 6 cm. [4 marks]
Answer: 30 cm

6. Write the predecessor of the number 10,000. [4 marks]
Answer: 9999`,
  rawAnswerKeyText: `1. 36
2. B
3. -7
4. 1:5
5. 30 cm
6. 9999`,
};

// Class 6 Science
export const SAMPLE_CLASS_6_SCIENCE: SamplePaper = {
  id: "sample-class-6-science",
  name: "Class 6 Science (Foundations Assessment)",
  description:
    "Curriculum questions on speed calculation, nutrients, magnetic materials, and separation of substances.",
  isClean: true,
  metadata: {
    title: "Class 6 Science Periodic Assessment",
    classGrade: "Class 6",
    subject: "Science",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Include units for all measurements.",
    ],
  },
  rawPaperText: `1. A student walks a distance of 400 meters in 200 seconds. Calculate the walking speed in m/s. [4 marks]
Answer: 2 m/s

2. Which vitamin is synthesized in our skin when exposed to sunlight? [4 marks]
A. Vitamin A
B. Vitamin B
C. Vitamin C
D. Vitamin D
Answer: D

3. Which of the following is a non-magnetic material? [4 marks]
A. Iron
B. Nickel
C. Wood
D. Cobalt
Answer: C

4. State the primary function of dietary fibers (roughage) in our digestive system. [4 marks]
Answer: Helps our body get rid of undigested food.

5. What is the process of converting water vapor into liquid water called? [4 marks]
Answer: Condensation`,
  rawAnswerKeyText: `1. 2 m/s
2. D
3. C
4. Helps our body get rid of undigested food.
5. Condensation`,
};

// Class 7 Science
export const SAMPLE_CLASS_7_SCIENCE: SamplePaper = {
  id: "sample-class-7-science",
  name: "Class 7 Science (Mid-Term Assessment)",
  description:
    "Curriculum questions on heat transfer, acids and bases, motion and time, and chemical indicators.",
  isClean: true,
  metadata: {
    title: "Class 7 Science Mid-Term Test",
    classGrade: "Class 7",
    subject: "Science",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Check chemical formulas and units.",
    ],
  },
  rawPaperText: `1. A cyclist covers a distance of 15 km in 30 minutes. Calculate the speed in km/h. [4 marks]
Answer: 30 km/h

2. What is the chemical formula of Sodium Hydroxide? [4 marks]
A. NaOH
B. Na2OH
C. NaH
D. SOH
Answer: A

3. Which acid is naturally present in lemon juice? [4 marks]
A. Acetic acid
B. Citric acid
C. Lactic acid
D. Tartaric acid
Answer: B

4. Name the mode of heat transfer that does not require any material medium. [4 marks]
Answer: Radiation

5. What is the normal temperature of a healthy human body in °C? [4 marks]
Answer: 37 °C`,
  rawAnswerKeyText: `1. 30 km/h
2. A
3. B
4. Radiation
5. 37 °C`,
};

// Class 8 Mathematics
export const SAMPLE_CLASS_8_MATHS: SamplePaper = {
  id: "sample-class-8-maths",
  name: "Class 8 Mathematics (Algebra & Mensuration)",
  description:
    "Curriculum questions on linear equations, laws of exponents, quadrilaterals, square roots, and rhombus area.",
  isClean: true,
  metadata: {
    title: "Class 8 Mathematics Mid-Term Review",
    classGrade: "Class 8",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Write neat steps for algebraic solutions.",
    ],
  },
  rawPaperText: `1. Solve the linear equation: 5x - 7 = 2x + 8. [4 marks]
Answer: 5

2. What is the value of 4^(-2)? [4 marks]
A. -8
B. 1/16
C. -16
D. 1/8
Answer: B

3. Find the sum of all interior angles of a quadrilateral. [4 marks]
Answer: 360°

4. Find the square root of 784 by prime factorization or long division. [4 marks]
Answer: 28

5. Calculate the area of a rhombus whose diagonals measure 14 cm and 10 cm. [4 marks]
Answer: 70 sq cm`,
  rawAnswerKeyText: `1. 5
2. B
3. 360°
4. 28
5. 70 sq cm`,
};

// Class 8 Science
export const SAMPLE_CLASS_8_SCIENCE: SamplePaper = {
  id: "sample-class-8-science",
  name: "Class 8 Science (Forces, Pressure & Chemistry)",
  description:
    "Curriculum questions on pressure in Pascals, reactivity of metals, sound frequency, and balanced chemical equations.",
  isClean: true,
  metadata: {
    title: "Class 8 Science Assessment",
    classGrade: "Class 8",
    subject: "Science",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Physical units are mandatory for numerical problems.",
    ],
  },
  rawPaperText: `1. A force of 300 N is applied perpendicular to an area of 6 m². Calculate the pressure exerted in Pascals. [4 marks]
Answer: 50 Pa

2. Which alkali metal is stored immersed in kerosene due to vigorous reaction with moisture? [4 marks]
A. Copper
B. Iron
C. Sodium
D. Silver
Answer: C

3. What is the SI unit of frequency of a vibrating object? [4 marks]
A. Decibel
B. Hertz
C. Second
D. Meter
Answer: B

4. Write the balanced chemical equation for the burning of magnesium ribbon in oxygen. [4 marks]
Answer: 2Mg + O2 -> 2MgO

5. Name the contact force that always opposes relative motion between two sliding surfaces. [4 marks]
Answer: Friction`,
  rawAnswerKeyText: `1. 50 Pa
2. C
3. B
4. 2Mg + O2 -> 2MgO
5. Friction`,
};

// Class 9 Mathematics
export const SAMPLE_CLASS_9_MATHS: SamplePaper = {
  id: "sample-class-9-maths",
  name: "Class 9 Mathematics (Number Systems & Geometry)",
  description:
    "Curriculum questions on real numbers, coordinate geometry quadrants, polynomial zeroes, and volume of sphere.",
  isClean: true,
  metadata: {
    title: "Class 9 Mathematics Term Assessment",
    classGrade: "Class 9",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Express answers in simplest radical form where applicable.",
    ],
  },
  rawPaperText: `1. Rationalize the denominator of: 1 / (√7 - √5). [4 marks]
Answer: (√7 + √5) / 2

2. In which quadrant of the Cartesian plane does the point (-4, 3) lie? [4 marks]
A. Quadrant I
B. Quadrant II
C. Quadrant III
D. Quadrant IV
Answer: B

3. Find the zero of the polynomial p(x) = 5x - 20. [4 marks]
Answer: 4

4. If two lines intersect, prove that the vertically opposite angles are equal. If one angle is 65°, find its opposite angle. [4 marks]
Answer: 65°

5. Calculate the volume of a sphere whose radius is 3 cm. (Express in terms of π). [4 marks]
Answer: 36π cu cm`,
  rawAnswerKeyText: `1. (√7 + √5) / 2
2. B
3. 4
4. 65°
5. 36π cu cm`,
};

// Class 10 Mathematics
export const SAMPLE_CLASS_10_MATHS: SamplePaper = {
  id: "sample-class-10-maths",
  name: "Class 10 Mathematics (Board Pattern Assessment)",
  description:
    "Two-section paper covering quadratic roots, arithmetic progressions, basic trigonometry, coordinate geometry, and a case-study with sub-parts.",
  isClean: true,
  metadata: {
    title: "Class 10 Mathematics Board Specimen",
    classGrade: "Class 10",
    subject: "Mathematics",
    expectedTotalMarks: 25,
    timeAllowedMinutes: 60,
    instructions: [
      "All questions are compulsory.",
      "Section A contains MCQs and short questions; Section B contains descriptive & case-based questions.",
    ],
  },
  rawPaperText: `Section A
1. Find the roots of the quadratic equation: x² - 8x + 15 = 0. [3 marks]
Answer: 3, 5

2. Which term of the arithmetic progression 3, 8, 13, 18... is 78? [3 marks]
A. 14th
B. 15th
C. 16th
D. 17th
Answer: C

3. Evaluate: 2 tan² 45° + cos² 30° - sin² 60°. [3 marks]
Answer: 2

Section B
4. Find the coordinates of the point which divides the join of (-1, 7) and (4, -3) in the ratio 2:3. [4 marks]
Answer: (1, 3)

5. If the perimeter and area of a circle are numerically equal, find the radius of the circle in units. [4 marks]
Answer: 2 units

6. Case Study: Height and distance measurements of a lighthouse:
(a) Define the term angle of depression. [2 marks]
(b) From top of a 75 m lighthouse, angle of depression of a ship is 45°. Find distance of ship in meters. [3 marks]
(c) State the trigonometric ratio that relates opposite side to adjacent side. [3 marks]
Answer: 75 m`,
  rawAnswerKeyText: `1. 3, 5
2. C
3. 2
4. (1, 3)
5. 2 units
6. 75 m`,
};

// Class 11 Mathematics
export const SAMPLE_CLASS_11_MATHS: SamplePaper = {
  id: "sample-class-11-maths",
  name: "Class 11 Mathematics (Sets, Calculus & Combinatorics)",
  description:
    "Senior secondary paper with Section A (Sets, Complex numbers, Derivatives) and Section B (Limits, Permutations, Domain).",
  isClean: true,
  metadata: {
    title: "Class 11 Mathematics Term 1 Examination",
    classGrade: "Class 11",
    subject: "Mathematics",
    expectedTotalMarks: 25,
    timeAllowedMinutes: 60,
    instructions: [
      "All questions are compulsory.",
      "Show analytical steps clearly.",
    ],
  },
  rawPaperText: `Section A
1. Let A = {1, 2, 3, 4} and B = {3, 4, 5, 6}. Find the symmetric difference (A - B) ∪ (B - A). [3 marks]
Answer: {1, 2, 5, 6}

2. What is the multiplicative inverse of the complex number z = 3 + 4i? [3 marks]
A. 3/25 - 4/25 i
B. -3/25 + 4/25 i
C. 3/7 - 4/7 i
D. 3 - 4i
Answer: A

3. Find the derivative of f(x) = 4x³ - 5x² + 7x - 9 with respect to x. [4 marks]
Answer: 12x² - 10x + 7

Section B
4. Evaluate the limit: lim (x -> 2) (x³ - 8) / (x - 2). [5 marks]
Answer: 12

5. In how many distinct ways can the letters of the word 'PRISM' be arranged? [5 marks]
Answer: 120

6. Find the domain of the real-valued function f(x) = √(9 - x²). [5 marks]
Answer: [-3, 3]`,
  rawAnswerKeyText: `1. {1, 2, 5, 6}
2. A
3. 12x² - 10x + 7
4. 12
5. 120
6. [-3, 3]`,
};

// Class 11 Physics
export const SAMPLE_CLASS_11_PHYSICS: SamplePaper = {
  id: "sample-class-11-physics",
  name: "Class 11 Physics (Mechanics & Kinematics)",
  description:
    "Senior physics paper with SI base dimensions, equations of motion, work-energy theorem, and projectile sub-parts.",
  isClean: true,
  metadata: {
    title: "Class 11 Physics Periodic Test",
    classGrade: "Class 11",
    subject: "Science",
    subSubject: "Physics",
    expectedTotalMarks: 25,
    timeAllowedMinutes: 60,
    instructions: [
      "All questions are compulsory.",
      "Physical units must accompany numerical answers.",
    ],
  },
  rawPaperText: `Section A
1. An automobile moving at 20 m/s is brought to rest over a distance of 40 meters. Calculate the acceleration in m/s². [4 marks]
Answer: -5 m/s²

2. Which of the following is an SI base unit? [3 marks]
A. Newton
B. Joule
C. Kilogram
D. Watt
Answer: C

3. A block of mass 4 kg is accelerated by a constant force of 12 N. Calculate the acceleration in m/s². [4 marks]
Answer: 3 m/s²

Section B
4. Calculate the kinetic energy in Joules of a 0.5 kg ball moving at a speed of 10 m/s. [4 marks]
Answer: 25 Joules

5. State the Work-Energy Theorem for a particle. [4 marks]
Answer: The work done on a particle by the net force equals the change in its kinetic energy.

6. Case study on 2D projectile motion:
(a) What is the vertical component of velocity at the highest point of projectile flight? [2 marks]
(b) Does horizontal velocity change when air resistance is neglected? [2 marks]
(c) State the angle of projection for which horizontal range is maximum. [2 marks]
Answer: 0 m/s`,
  rawAnswerKeyText: `1. -5 m/s²
2. C
3. 3 m/s²
4. 25 Joules
5. The work done on a particle by the net force equals the change in its kinetic energy.
6. 0 m/s`,
};

// Class 12 Mathematics
export const SAMPLE_CLASS_12_MATHS: SamplePaper = {
  id: "sample-class-12-maths",
  name: "Class 12 Mathematics (Calculus, Matrices & Probability)",
  description:
    "Senior board review covering 2x2 determinant, matrix inverse property, definite integration, chain rule, and conditional probability.",
  isClean: true,
  metadata: {
    title: "Class 12 Mathematics Pre-Board Examination",
    classGrade: "Class 12",
    subject: "Mathematics",
    expectedTotalMarks: 30,
    timeAllowedMinutes: 75,
    instructions: [
      "All questions are compulsory.",
      "Show step-by-step calculus working.",
    ],
  },
  rawPaperText: `Section A
1. Evaluate the determinant of the matrix [[5, 3], [2, 4]]. [3 marks]
Answer: 14

2. If A is a non-singular square matrix of order 3 and |A| = 4, what is the value of |adj A|? [3 marks]
A. 4
B. 16
C. 64
D. 12
Answer: B

3. Evaluate the definite integral: ∫ (from 0 to 3) (2x + 1) dx. [4 marks]
Answer: 12

Section B
4. Differentiate y = log(sin x) with respect to x for x in (0, π). [5 marks]
Answer: cot x

5. If P(A) = 0.6, P(B) = 0.4, and P(A ∩ B) = 0.24, evaluate P(A|B). [5 marks]
Answer: 0.6

6. Sub-part analysis of a manufacturing reliability experiment:
(a) State the condition for two events A and B to be mutually independent. [2 marks]
(b) If P(A) = 0.3 and P(B) = 0.5 are independent, calculate P(A ∪ B). [4 marks]
(c) What is the probability of a sure event? [4 marks]
Answer: P(A ∩ B) = P(A) * P(B)`,
  rawAnswerKeyText: `1. 14
2. B
3. 12
4. cot x
5. 0.6
6. P(A ∩ B) = P(A) * P(B)`,
};

// Class 12 Physics
export const SAMPLE_CLASS_12_PHYSICS: SamplePaper = {
  id: "sample-class-12-physics",
  name: "Class 12 Physics (Electrostatics, Circuits & Induction)",
  description:
    "Board-level physics paper covering Joule heating, capacitance SI units, Gauss's theorem, electric dipoles, drift velocity, and circuit analysis.",
  isClean: true,
  metadata: {
    title: "Class 12 Physics Pre-Board Examination",
    classGrade: "Class 12",
    subject: "Science",
    subSubject: "Physics",
    expectedTotalMarks: 30,
    timeAllowedMinutes: 75,
    instructions: [
      "All questions are compulsory.",
      "Write units and state formula for every numerical.",
    ],
  },
  rawPaperText: `Section A
1. A current of 2 A passes through a resistor of 10 Ω for 15 seconds. Calculate the heat generated in Joules using H = I²Rt. [4 marks]
Answer: 600 J

2. Which of the following is the SI unit of capacitance? [3 marks]
A. Coulomb
B. Farad
C. Henry
D. Ohm
Answer: B

3. State Gauss's Law in electrostatics. [4 marks]
Answer: Total electric flux through a closed Gaussian surface equals Q / ε₀.

Section B
4. Define electric dipole moment and state its SI unit. [4 marks]
Answer: Product of magnitude of charge and separation distance; unit is Coulomb meter (C m).

5. Calculate the drift velocity of free electrons in a copper wire when current density is 4 x 10^6 A/m² and n = 8 x 10^28 m^-3. (e = 1.6 x 10^-19 C). Express in m/s. [5 marks]
Answer: 0.00031 m/s

6. Direct current series circuit questions:
(a) State Ohm's law mathematically. [3 marks]
(b) Three resistors of 3 Ω, 4 Ω, and 5 Ω are in series. Find equivalent resistance in ohms. [3 marks]
(c) If a 24 V battery is connected across this series combination, calculate circuit current in Amperes. [4 marks]
Answer: V = IR`,
  rawAnswerKeyText: `1. 600 J
2. B
3. Total electric flux through a closed Gaussian surface equals Q / ε₀.
4. Product of magnitude of charge and separation distance; unit is Coulomb meter (C m).
5. 0.00031 m/s
6. V = IR`,
};

// ============================================================================
// 3. Registry & Helper Functions
// ============================================================================

export const ALL_SAMPLES: SamplePaper[] = [
  SAMPLE_DELIBERATE_ERRORS,
  SAMPLE_CLEAN,
  SAMPLE_SCIENCE_ERRORS,
  SAMPLE_SCIENCE_CLEAN,
  SAMPLE_CLASS_6_MATHS,
  SAMPLE_CLASS_6_SCIENCE,
  SAMPLE_CLASS_7_SCIENCE,
  SAMPLE_CLASS_8_MATHS,
  SAMPLE_CLASS_8_SCIENCE,
  SAMPLE_CLASS_9_MATHS,
  SAMPLE_CLASS_10_MATHS,
  SAMPLE_CLASS_11_MATHS,
  SAMPLE_CLASS_11_PHYSICS,
  SAMPLE_CLASS_12_MATHS,
  SAMPLE_CLASS_12_PHYSICS,
];

/**
 * Returns available sample papers for a specific class grade and subject.
 */
export function getSamplesForClass(
  classGrade: ClassGrade,
  subject?: Subject
): SamplePaper[] {
  return ALL_SAMPLES.filter((s) => {
    if (s.metadata.classGrade !== classGrade) return false;
    if (subject && s.metadata.subject !== subject) return false;
    return true;
  });
}

/**
 * Returns the recommended clean demo specimen for a given class and subject.
 */
export function getDefaultSampleForClass(
  classGrade: ClassGrade,
  subject: Subject
): SamplePaper | undefined {
  const matches = getSamplesForClass(classGrade, subject);
  const cleanMatch = matches.find((s) => s.isClean);
  return cleanMatch || matches[0];
}
