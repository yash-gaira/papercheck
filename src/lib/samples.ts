import { PaperMetadata } from "@/types/paper";

export interface SamplePaper {
  id: string;
  name: string;
  description: string;
  isClean: boolean;
  metadata: PaperMetadata;
  rawPaperText: string;
  rawAnswerKeyText: string;
}

// 1. Mathematics – Demo with Errors (Class 7)
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

// 2. Mathematics – Clean Sample (Class 7)
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

// 3. Science – Demo with Errors (Class 10)
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

// 4. Science – Clean Sample (Class 9)
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
