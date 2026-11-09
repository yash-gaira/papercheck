import { ClassGrade, Subject } from "@/types/paper";

export interface ClassFormatSpecimen {
  classGrade: ClassGrade;
  subject: Subject;
  badge: string;
  topicNote: string;
  q1: {
    statement: string;
    marks: number;
    answerKey: string;
    guideline: string;
  };
  q2: {
    statement: string;
    marks: number;
    options: { label: string; text: string }[];
    answerKey: string;
    guideline: string;
  };
}

export const CLASS_FORMAT_SPECIMENS: Record<string, ClassFormatSpecimen> = {
  // Class 6
  "Class 6-Mathematics": {
    classGrade: "Class 6",
    subject: "Mathematics",
    badge: "Class 6 Elementary Mathematics",
    topicNote: "Numbers, LCM/HCF, Negative Integers, Decimals & Perimeter",
    q1: {
      statement: "Find the lowest common multiple (LCM) of 12 and 18.",
      marks: 3,
      answerKey: "36",
      guideline: "State working steps and integer answer clearly.",
    },
    q2: {
      statement: "Which of the following is the smallest whole number?",
      marks: 3,
      options: [
        { label: "A", text: "-1" },
        { label: "B", text: "0" },
        { label: "C", text: "1" },
        { label: "D", text: "2" },
      ],
      answerKey: "B",
      guideline: "Single-choice MCQ with distinct options A, B, C, D.",
    },
  },
  "Class 6-Science": {
    classGrade: "Class 6",
    subject: "Science",
    badge: "Class 6 General Science",
    topicNote: "Motion, Nutrients, Magnets & States of Matter",
    q1: {
      statement: "A student walks 400 meters in 200 seconds. Calculate the speed in m/s.",
      marks: 4,
      answerKey: "2 m/s",
      guideline: "Mandatory SI units (m/s) in answer key.",
    },
    q2: {
      statement: "Which of the following is a non-magnetic material?",
      marks: 4,
      options: [
        { label: "A", text: "Iron" },
        { label: "B", text: "Nickel" },
        { label: "C", text: "Wood" },
        { label: "D", text: "Cobalt" },
      ],
      answerKey: "C",
      guideline: "Accurate physical science concepts with clear keys.",
    },
  },

  // Class 7
  "Class 7-Mathematics": {
    classGrade: "Class 7",
    subject: "Mathematics",
    badge: "Class 7 Middle School Mathematics",
    topicNote: "Fractions, Decimals, Simple Equations, Lines & Angles",
    q1: {
      statement: "Calculate: 3/4 + 1/4.",
      marks: 3,
      answerKey: "1",
      guideline: "Standard fraction arithmetic with square bracket marks.",
    },
    q2: {
      statement: "Which of the following is a prime number?",
      marks: 3,
      options: [
        { label: "A", text: "2" },
        { label: "B", text: "4" },
        { label: "C", text: "6" },
        { label: "D", text: "9" },
      ],
      answerKey: "A",
      guideline: "Ensure exactly one option is mathematically valid.",
    },
  },
  "Class 7-Science": {
    classGrade: "Class 7",
    subject: "Science",
    badge: "Class 7 General Science",
    topicNote: "Heat, Acids & Bases, Physical & Chemical Changes, Motion",
    q1: {
      statement: "A cyclist covers a distance of 15 km in 30 minutes. Calculate the speed in km/h.",
      marks: 4,
      answerKey: "30 km/h",
      guideline: "Specify units consistently between question and answer key.",
    },
    q2: {
      statement: "Which acid is naturally present in lemon juice?",
      marks: 4,
      options: [
        { label: "A", text: "Acetic acid" },
        { label: "B", text: "Citric acid" },
        { label: "C", text: "Lactic acid" },
        { label: "D", text: "Tartaric acid" },
      ],
      answerKey: "B",
      guideline: "Biological and chemical nomenclature verified.",
    },
  },

  // Class 8
  "Class 8-Mathematics": {
    classGrade: "Class 8",
    subject: "Mathematics",
    badge: "Class 8 Pre-Secondary Mathematics",
    topicNote: "Linear Equations, Exponents, Quadrilaterals & Mensuration",
    q1: {
      statement: "Solve the linear equation for x: 5x - 7 = 2x + 8.",
      marks: 4,
      answerKey: "5",
      guideline: "Single-variable linear equation with positive integer marks.",
    },
    q2: {
      statement: "What is the numerical value of 4^(-2)?",
      marks: 4,
      options: [
        { label: "A", text: "-8" },
        { label: "B", text: "1/16" },
        { label: "C", text: "-16" },
        { label: "D", text: "1/8" },
      ],
      answerKey: "B",
      guideline: "Laws of negative integer exponents.",
    },
  },
  "Class 8-Science": {
    classGrade: "Class 8",
    subject: "Science",
    badge: "Class 8 General Science",
    topicNote: "Force & Pressure, Combustion, Friction, Sound & Metals",
    q1: {
      statement: "A force of 300 N acts perpendicular to an area of 6 m². Calculate pressure in Pascals.",
      marks: 4,
      answerKey: "50 Pa",
      guideline: "Pressure unit Pa (or N/m²) required in answer key.",
    },
    q2: {
      statement: "What is the SI unit of frequency of a vibrating object?",
      marks: 4,
      options: [
        { label: "A", text: "Decibel" },
        { label: "B", text: "Hertz" },
        { label: "C", text: "Second" },
        { label: "D", text: "Meter" },
      ],
      answerKey: "B",
      guideline: "Standard physics quantities and units.",
    },
  },

  // Class 9
  "Class 9-Mathematics": {
    classGrade: "Class 9",
    subject: "Mathematics",
    badge: "Class 9 Secondary Mathematics",
    topicNote: "Real Numbers, Polynomials, Coordinate Geometry & Volumes",
    q1: {
      statement: "Rationalize the denominator of: 1 / (√7 - √5).",
      marks: 4,
      answerKey: "(√7 + √5) / 2",
      guideline: "Irrational conjugate multiplication.",
    },
    q2: {
      statement: "In which quadrant of the Cartesian plane does the point (-4, 3) lie?",
      marks: 4,
      options: [
        { label: "A", text: "Quadrant I" },
        { label: "B", text: "Quadrant II" },
        { label: "C", text: "Quadrant III" },
        { label: "D", text: "Quadrant IV" },
      ],
      answerKey: "B",
      guideline: "Cartesian sign conventions.",
    },
  },
  "Class 9-Science": {
    classGrade: "Class 9",
    subject: "Science",
    badge: "Class 9 Science (Physics & Chemistry)",
    topicNote: "Kinematics, Force & Laws of Motion, Atoms & Molecules",
    q1: {
      statement: "A runner travels 100 meters in 5 seconds. Calculate the runner's speed in m/s.",
      marks: 4,
      answerKey: "20 m/s",
      guideline: "Strict physical SI units checked deterministically.",
    },
    q2: {
      statement: "What is the correct chemical formula of Sodium Chloride?",
      marks: 4,
      options: [
        { label: "A", text: "NaCl" },
        { label: "B", text: "Na2Cl" },
        { label: "C", text: "NaCl2" },
        { label: "D", text: "Na2Cl2" },
      ],
      answerKey: "A",
      guideline: "IUPAC formula capitalization verified.",
    },
  },

  // Class 10
  "Class 10-Mathematics": {
    classGrade: "Class 10",
    subject: "Mathematics",
    badge: "Class 10 Secondary Board Mathematics",
    topicNote: "Quadratic Equations, Arithmetic Progressions & Trigonometry",
    q1: {
      statement: "Find the roots of the quadratic equation: x² - 8x + 15 = 0.",
      marks: 3,
      answerKey: "3, 5",
      guideline: "Factorization or quadratic formula roots.",
    },
    q2: {
      statement: "Which term of the arithmetic progression 3, 8, 13, 18... is 78?",
      marks: 3,
      options: [
        { label: "A", text: "14th" },
        { label: "B", text: "15th" },
        { label: "C", text: "16th" },
        { label: "D", text: "17th" },
      ],
      answerKey: "C",
      guideline: "nth term formula an = a + (n-1)d.",
    },
  },
  "Class 10-Science": {
    classGrade: "Class 10",
    subject: "Science",
    badge: "Class 10 Secondary Board Science",
    topicNote: "Chemical Reactions, Acids & Bases, Electricity & Light",
    q1: {
      statement: "A car accelerates from rest at 2.5 m/s² for 10 seconds. Calculate velocity in m/s.",
      marks: 3,
      answerKey: "25 m/s",
      guideline: "Velocity calculation with physical SI units.",
    },
    q2: {
      statement: "Which gas is released during the reaction of zinc with dilute hydrochloric acid?",
      marks: 3,
      options: [
        { label: "A", text: "O2" },
        { label: "B", text: "H2" },
        { label: "C", text: "CO2" },
        { label: "D", text: "N2" },
      ],
      answerKey: "B",
      guideline: "Reaction stoichiometry and IUPAC gas formulas.",
    },
  },

  // Class 11
  "Class 11-Mathematics": {
    classGrade: "Class 11",
    subject: "Mathematics",
    badge: "Class 11 Senior Secondary Mathematics",
    topicNote: "Sets, Complex Numbers, Permutations, Limits & Derivatives",
    q1: {
      statement: "Evaluate the limit: lim (x -> 2) (x³ - 8) / (x - 2).",
      marks: 5,
      answerKey: "12",
      guideline: "Algebraic limit factorization.",
    },
    q2: {
      statement: "What is the multiplicative inverse of the complex number z = 3 + 4i?",
      marks: 3,
      options: [
        { label: "A", text: "3/25 - 4/25 i" },
        { label: "B", text: "-3/25 + 4/25 i" },
        { label: "C", text: "3/7 - 4/7 i" },
        { label: "D", text: "3 - 4i" },
      ],
      answerKey: "A",
      guideline: "Complex conjugate division z^(-1) = z* / |z|².",
    },
  },
  "Class 11-Science": {
    classGrade: "Class 11",
    subject: "Science",
    badge: "Class 11 Senior Secondary Physics",
    topicNote: "Kinematics, Newton's Laws, Work-Energy & Projectile Motion",
    q1: {
      statement: "An automobile moving at 20 m/s is brought to rest over 40 m. Calculate acceleration in m/s².",
      marks: 4,
      answerKey: "-5 m/s²",
      guideline: "Third kinematic equation v² = u² + 2as.",
    },
    q2: {
      statement: "Which of the following is an SI base unit?",
      marks: 3,
      options: [
        { label: "A", text: "Newton" },
        { label: "B", text: "Joule" },
        { label: "C", text: "Kilogram" },
        { label: "D", text: "Watt" },
      ],
      answerKey: "C",
      guideline: "BIPM international SI base units.",
    },
  },

  // Class 12
  "Class 12-Mathematics": {
    classGrade: "Class 12",
    subject: "Mathematics",
    badge: "Class 12 Senior Secondary Board Mathematics",
    topicNote: "Matrices, Determinants, Definite Integrals & Probability",
    q1: {
      statement: "Evaluate the definite integral: ∫ (from 0 to 3) (2x + 1) dx.",
      marks: 4,
      answerKey: "12",
      guideline: "Fundamental Theorem of Calculus [x² + x] from 0 to 3.",
    },
    q2: {
      statement: "If A is a non-singular square matrix of order 3 and |A| = 4, what is the value of |adj A|?",
      marks: 3,
      options: [
        { label: "A", text: "4" },
        { label: "B", text: "16" },
        { label: "C", text: "64" },
        { label: "D", text: "12" },
      ],
      answerKey: "B",
      guideline: "Matrix determinant property |adj A| = |A|^(n-1).",
    },
  },
  "Class 12-Science": {
    classGrade: "Class 12",
    subject: "Science",
    badge: "Class 12 Senior Secondary Board Physics",
    topicNote: "Electrostatics, Current Electricity, Gauss's Law & Drift Velocity",
    q1: {
      statement: "A current of 2 A passes through a 10 Ω resistor for 15 s. Calculate heat generated in Joules using H = I²Rt.",
      marks: 4,
      answerKey: "600 J",
      guideline: "Joule heating with mandatory energy unit J.",
    },
    q2: {
      statement: "Which of the following is the SI unit of electric capacitance?",
      marks: 3,
      options: [
        { label: "A", text: "Coulomb" },
        { label: "B", text: "Farad" },
        { label: "C", text: "Henry" },
        { label: "D", text: "Ohm" },
      ],
      answerKey: "B",
      guideline: "Electromagnetism standard units.",
    },
  },
};

/**
 * Look up the format specimen for a given class and subject.
 */
export function getClassFormatSpecimen(
  classGrade: ClassGrade,
  subject: Subject
): ClassFormatSpecimen {
  const key = `${classGrade}-${subject}`;
  if (CLASS_FORMAT_SPECIMENS[key]) {
    return CLASS_FORMAT_SPECIMENS[key];
  }
  // Default to Class 7 Mathematics if not matched
  return CLASS_FORMAT_SPECIMENS["Class 7-Mathematics"];
}

