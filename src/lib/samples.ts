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

