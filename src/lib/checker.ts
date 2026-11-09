import {
  Question,
  PaperMetadata,
  Finding,
  CheckReport,
} from "@/types/paper";

/**
 * Normalizes text for exact duplicate detection:
 * Strips punctuation, collapses whitespace, converts to lowercase.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Runs all deterministic rule-based checks on a paper's questions and metadata.
 */
export function runDeterministicChecks(
  questions: Question[],
  metadata: PaperMetadata,
  unsupportedFeatures: string[] = []
): CheckReport {
  const findings: Finding[] = [];
  const checksPerformed: string[] = [
    "Compulsory question structure & format verification",
    "Marks arithmetic: sum of question marks vs expected total",
    "Question numbering continuity & uniqueness",
    "Missing or invalid marks check",
    "Exact duplicate question detection",
    "MCQ structure: option count & duplicate option labels",
    "MCQ answer key label validity",
    "Answer key completeness check",
  ];
  const checksNotPerformed: string[] = [];

  let isMarksSumReliable = true;
  let totalMarksCalculated = 0;

  // 0. Report any unsupported features flagged during parsing
  if (unsupportedFeatures.length > 0) {
    isMarksSumReliable = false;
    for (const feat of unsupportedFeatures) {
      findings.push({
        id: `rule-unsupported-${Math.random().toString(36).substring(2, 7)}`,
        questionId: null,
        source: "rule",
        severity: "error",
        title: "Unsupported Paper Feature Detected",
        relevantText: feat,
        explanation:
          "This release supports single-answer compulsory Mathematics papers (Classes 6-8) with up to 20 questions and positive integer marks. Complex internal choices or unsupported formats cannot be verified accurately.",
        needsTeacherReview: false,
      });
    }
  }

  // 1. Check question count limit
  if (questions.length === 0) {
    isMarksSumReliable = false;
    findings.push({
      id: "rule-empty-paper",
      questionId: null,
      source: "rule",
      severity: "error",
      title: "No Questions Extracted",
      relevantText: "Question count: 0",
      explanation:
        "The question paper does not contain any extracted questions. Please paste or enter question text.",
      needsTeacherReview: false,
    });
    return {
      findings,
      isStale: false,
      lastCheckedAt: new Date().toISOString(),
      checksPerformed,
      checksNotPerformed: ["All semantic checks (paper is empty)"],
      marksSum: null,
      isMarksSumReliable: false,
      expectedMarks: metadata.expectedTotalMarks,
    };
  }

  if (questions.length > 20) {
    findings.push({
      id: "rule-max-questions",
      questionId: null,
      source: "rule",
      severity: "error",
      title: "Question Count Limit Exceeded",
      relevantText: `${questions.length} questions detected`,
      explanation:
        "The MVP is limited to 20 questions. Please split the paper or review questions within the limit.",
      needsTeacherReview: false,
    });
  }

  // 2. Validate marks for each question
  for (const q of questions) {
    if (q.marks === null || q.marks === undefined) {
      isMarksSumReliable = false;
      findings.push({
        id: `rule-missing-marks-${q.id}`,
        questionId: q.id,
        questionNumber: q.number,
        source: "rule",
        severity: "error",
        title: `Question ${q.number}: Missing Marks`,
        relevantText: `Question text: "${q.text.substring(0, 60)}..."`,
        explanation:
          "This question does not have marks specified. Every compulsory question must have a positive integer mark.",
        needsTeacherReview: false,
      });
    } else if (!Number.isInteger(q.marks) || q.marks <= 0) {
      isMarksSumReliable = false;
      findings.push({
        id: `rule-invalid-marks-${q.id}`,
        questionId: q.id,
        questionNumber: q.number,
        source: "rule",
        severity: "error",
        title: `Question ${q.number}: Invalid Marks (${q.marks})`,
        relevantText: `Marks: ${q.marks}`,
        explanation:
          "Marks must be a positive integer (e.g. 1, 2, 3). Fractional or negative marks are not supported in this release.",
        needsTeacherReview: false,
      });
    } else {
      totalMarksCalculated += q.marks;
    }
  }

  // 3. Check sum of marks vs expected total
  if (isMarksSumReliable) {
    if (totalMarksCalculated !== metadata.expectedTotalMarks) {
      findings.push({
        id: "rule-marks-mismatch",
        questionId: null,
        source: "rule",
        severity: "error",
        title: "Total Marks Mismatch",
        relevantText: `Sum of question marks: ${totalMarksCalculated} | Expected total: ${metadata.expectedTotalMarks}`,
        explanation: `The sum of marks across all ${questions.length} compulsory questions (${totalMarksCalculated}) does not match the expected total marks (${metadata.expectedTotalMarks}). Discrepancy: ${
          totalMarksCalculated - metadata.expectedTotalMarks > 0 ? "+" : ""
        }${totalMarksCalculated - metadata.expectedTotalMarks} marks.`,
        needsTeacherReview: false,
      });
    }
  } else {
    findings.push({
      id: "rule-marks-unreliable",
      questionId: null,
      source: "rule",
      severity: "warning",
      title: "Total Marks Cannot Be Verified",
      relevantText: "Reliable total marks: Unavailable",
      explanation:
        "Total marks cannot be verified reliably because one or more questions have missing or invalid marks, or unsupported optional choices exist.",
      needsTeacherReview: false,
    });
  }

  // 4. Check duplicate question numbers and gaps in numbering
  const numberCounts = new Map<number, Question[]>();
  for (const q of questions) {
    const list = numberCounts.get(q.number) || [];
    list.push(q);
    numberCounts.set(q.number, list);
  }

  // Duplicate question numbers
  numberCounts.forEach((qList, num) => {
    if (qList.length > 1) {
      findings.push({
        id: `rule-duplicate-num-${num}`,
        questionId: qList[1].id,
        questionNumber: num,
        source: "rule",
        severity: "error",
        title: `Duplicate Question Number (${num})`,
        relevantText: `Found ${qList.length} questions numbered as Question ${num}`,
        explanation: `Multiple questions share the number ${num}. Each question in a compulsory paper must have a unique sequential number.`,
        needsTeacherReview: false,
      });
    }
  });

  // Gaps in numbering (e.g. 1, 2, 4...)
  const sortedNumbers = Array.from(new Set(questions.map((q) => q.number))).sort(
    (a, b) => a - b
  );
  if (sortedNumbers.length > 0) {
    const minNum = sortedNumbers[0];
    const maxNum = sortedNumbers[sortedNumbers.length - 1];

    if (minNum !== 1) {
      findings.push({
        id: "rule-numbering-start",
        questionId: null,
        source: "rule",
        severity: "warning",
        title: "Numbering Does Not Start at 1",
        relevantText: `First question is numbered ${minNum}`,
        explanation: `The question paper begins with Question ${minNum} instead of Question 1.`,
        needsTeacherReview: false,
      });
    }

    const missingNumbers: number[] = [];
    for (let expected = minNum; expected <= maxNum; expected++) {
      if (!numberCounts.has(expected)) {
        missingNumbers.push(expected);
      }
    }

    if (missingNumbers.length > 0) {
      findings.push({
        id: "rule-numbering-gap",
        questionId: null,
        source: "rule",
        severity: "warning",
        title: "Gap in Question Numbering",
        relevantText: `Missing question numbers: ${missingNumbers.join(", ")}`,
        explanation: `The question numbering skips numbers (${missingNumbers.join(
          ", "
        )}). Please verify if questions were omitted.`,
        needsTeacherReview: false,
      });
    }
  }

  // 5. Exact duplicate question text (after normalizing whitespace & case)
  const normalizedTextMap = new Map<string, Question[]>();
  for (const q of questions) {
    const norm = normalizeText(q.text);
    if (!norm) continue;
    const list = normalizedTextMap.get(norm) || [];
    list.push(q);
    normalizedTextMap.set(norm, list);
  }

  normalizedTextMap.forEach((qList) => {
    if (qList.length > 1) {
      for (let i = 1; i < qList.length; i++) {
        findings.push({
          id: `rule-exact-duplicate-${qList[i].id}`,
          questionId: qList[i].id,
          questionNumber: qList[i].number,
          source: "rule",
          severity: "error",
          title: `Question ${qList[i].number}: Duplicate Question Text`,
          relevantText: `"${qList[i].text}" (Same as Question ${qList[0].number})`,
          explanation: `Question ${qList[i].number} has identical wording to Question ${qList[0].number}. This appears to be an accidental duplicate.`,
          needsTeacherReview: false,
        });
      }
    }
  });

  // 6. MCQ checks: option counts, duplicate option labels/text, valid answer labels
  for (const q of questions) {
    if (q.type === "mcq") {
      if (!q.options || q.options.length === 0) {
        findings.push({
          id: `rule-mcq-no-options-${q.id}`,
          questionId: q.id,
          questionNumber: q.number,
          source: "rule",
          severity: "error",
          title: `Question ${q.number}: MCQ Missing Options`,
          relevantText: `Question text: "${q.text}"`,
          explanation:
            "This question is marked as an MCQ but has no options (e.g. A, B, C, D).",
          needsTeacherReview: false,
        });
      } else if (q.options.length < 2) {
        findings.push({
          id: `rule-mcq-few-options-${q.id}`,
          questionId: q.id,
          questionNumber: q.number,
          source: "rule",
          severity: "error",
          title: `Question ${q.number}: MCQ Has Only ${q.options.length} Option`,
          relevantText: q.options.map((o) => `${o.label}. ${o.text}`).join(" | "),
          explanation:
            "A multiple choice question must provide at least two distinct options.",
          needsTeacherReview: false,
        });
      } else {
        // Check for duplicate option labels (e.g. two "A."s)
        const labelCounts = new Map<string, number>();
        const textCounts = new Map<string, number>();

        for (const opt of q.options) {
          const lbl = opt.label.toUpperCase();
          labelCounts.set(lbl, (labelCounts.get(lbl) || 0) + 1);

          const normOptText = normalizeText(opt.text);
          textCounts.set(normOptText, (textCounts.get(normOptText) || 0) + 1);
        }

        const duplicateLabels: string[] = [];
        labelCounts.forEach((count, lbl) => {
          if (count > 1) duplicateLabels.push(lbl);
        });

        if (duplicateLabels.length > 0) {
          findings.push({
            id: `rule-mcq-duplicate-label-${q.id}`,
            questionId: q.id,
            questionNumber: q.number,
            source: "rule",
            severity: "error",
            title: `Question ${q.number}: Duplicate Option Labels`,
            relevantText: `Duplicate labels: ${duplicateLabels.join(", ")}`,
            explanation: `Options cannot share the same label (${duplicateLabels.join(
              ", "
            )}).`,
            needsTeacherReview: false,
          });
        }

        // Check for duplicate option text
        textCounts.forEach((count, text) => {
          if (count > 1 && text.length > 0) {
            findings.push({
              id: `rule-mcq-duplicate-text-${q.id}`,
              questionId: q.id,
              questionNumber: q.number,
              source: "rule",
              severity: "warning",
              title: `Question ${q.number}: Duplicate Option Content`,
              relevantText: `Identical option text repeated: "${text}"`,
              explanation:
                "Two or more options have identical text, which reduces the effective choices.",
              needsTeacherReview: false,
            });
          }
        });

        // 7. Check if answerKey refers to a nonexistent option label
        if (q.answerKey && q.answerKey.trim()) {
          const cleanAns = q.answerKey.trim().toUpperCase();
          // If answerKey is a single letter (like "A", "B", "C", "D")
          if (/^[A-Z]$/.test(cleanAns)) {
            const hasOption = q.options.some(
              (o) => o.label.toUpperCase() === cleanAns
            );
            if (!hasOption) {
              findings.push({
                id: `rule-mcq-invalid-key-${q.id}`,
                questionId: q.id,
                questionNumber: q.number,
                source: "rule",
                severity: "error",
                title: `Question ${q.number}: Answer Key References Nonexistent Option '${cleanAns}'`,
                relevantText: `Answer key: ${q.answerKey} | Available options: ${q.options
                  .map((o) => o.label)
                  .join(", ")}`,
                explanation: `The answer key specifies '${cleanAns}', but the question only has options [${q.options
                  .map((o) => o.label)
                  .join(", ")}].`,
                needsTeacherReview: false,
              });
            }
          }
        }
      }
    }
  }

  // 8. Answer key completeness check
  // Note requirement: "Treat an absent answer key as 'Not checked', not as an incorrect answer."
  const questionsWithKeys = questions.filter(
    (q) => q.answerKey && q.answerKey.trim().length > 0
  );

  if (questionsWithKeys.length === 0) {
    checksNotPerformed.push(
      "Answer key completeness & verification: Not checked (no answer key provided)"
    );
  } else if (questionsWithKeys.length < questions.length) {
    const missingKeys = questions.filter(
      (q) => !q.answerKey || q.answerKey.trim().length === 0
    );
    findings.push({
      id: "rule-partial-answer-key",
      questionId: null,
      source: "rule",
      severity: "note",
      title: "Partial Answer Key Provided",
      relevantText: `${questionsWithKeys.length} of ${questions.length} questions have answer keys`,
      explanation: `Questions ${missingKeys
        .map((q) => q.number)
        .join(
          ", "
        )} do not have an answer key entry. Unprovided keys are marked as "Not checked".`,
      needsTeacherReview: false,
    });
  }

  return {
    findings,
    isStale: false,
    lastCheckedAt: new Date().toISOString(),
    checksPerformed,
    checksNotPerformed,
    marksSum: isMarksSumReliable ? totalMarksCalculated : null,
    isMarksSumReliable,
    expectedMarks: metadata.expectedTotalMarks,
  };
}

