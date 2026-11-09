import { describe, it, expect } from "vitest";
import { runDeterministicChecks, normalizeText } from "@/lib/checker";
import { Question, PaperMetadata } from "@/types/paper";

const baseMetadata: PaperMetadata = {
  title: "Class 7 Mathematics Periodic Test",
  classGrade: "Class 7",
  subject: "Mathematics",
  expectedTotalMarks: 20,
};

describe("Deterministic Rule Checker", () => {
  it("passes when mark totals match and questions are valid", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate 5 + 7.",
        type: "short_answer",
        marks: 10,
        options: [],
        answerKey: "12",
      },
      {
        id: "q2",
        number: 2,
        text: "Calculate 20 - 6.",
        type: "short_answer",
        marks: 10,
        options: [],
        answerKey: "14",
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    expect(report.isMarksSumReliable).toBe(true);
    expect(report.marksSum).toBe(20);
    expect(report.findings.filter((f) => f.severity === "error")).toHaveLength(0);
  });

  it("detects incorrect mark totals (e.g. 18 vs 20)", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Question 1 text",
        type: "short_answer",
        marks: 10,
        options: [],
        answerKey: "Ans 1",
      },
      {
        id: "q2",
        number: 2,
        text: "Question 2 text",
        type: "short_answer",
        marks: 8,
        options: [],
        answerKey: "Ans 2",
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    expect(report.isMarksSumReliable).toBe(true);
    expect(report.marksSum).toBe(18);
    const mismatch = report.findings.find((f) => f.id === "rule-marks-mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch?.severity).toBe("error");
    expect(mismatch?.explanation).toContain("does not match the expected total marks (20)");
  });

  it("treats invalid or missing marks as preventing a reliable total", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate x + 1",
        type: "short_answer",
        marks: null, // missing mark
        options: [],
      },
      {
        id: "q2",
        number: 2,
        text: "Calculate y + 2",
        type: "short_answer",
        marks: 5,
        options: [],
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    expect(report.isMarksSumReliable).toBe(false);
    expect(report.marksSum).toBeNull();
    expect(report.findings.some((f) => f.id.includes("rule-missing-marks"))).toBe(true);
    expect(report.findings.some((f) => f.id === "rule-marks-unreliable")).toBe(true);
  });

  it("detects duplicate question numbers and gaps in numbering", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "First problem",
        type: "short_answer",
        marks: 5,
        options: [],
      },
      {
        id: "q2",
        number: 1, // Duplicate number 1!
        text: "Second problem",
        type: "short_answer",
        marks: 5,
        options: [],
      },
      {
        id: "q3",
        number: 4, // Gap: skips 2 and 3!
        text: "Third problem",
        type: "short_answer",
        marks: 10,
        options: [],
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    expect(report.findings.some((f) => f.id.includes("rule-duplicate-num-1"))).toBe(true);
    expect(report.findings.some((f) => f.id === "rule-numbering-gap")).toBe(true);
  });

  it("detects exact duplicate question text after whitespace and case normalization", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate 3/4 + 1/4.",
        type: "short_answer",
        marks: 10,
        options: [],
      },
      {
        id: "q2",
        number: 2,
        text: "  calculate   3/4 + 1/4.  ", // exact duplicate with different spaces/case
        type: "short_answer",
        marks: 10,
        options: [],
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    const dupFinding = report.findings.find((f) => f.id.includes("rule-exact-duplicate"));
    expect(dupFinding).toBeDefined();
    expect(dupFinding?.severity).toBe("error");
    expect(dupFinding?.questionNumber).toBe(2);
  });

  it("validates MCQ option counts, duplicate options, and invalid answer key reference", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "What is 2+2?",
        type: "mcq",
        marks: 10,
        options: [
          { label: "A", text: "4" },
          { label: "A", text: "5" }, // duplicate label 'A'
        ],
        answerKey: "E", // option E does not exist!
      },
      {
        id: "q2",
        number: 2,
        text: "What is 3+3?",
        type: "mcq",
        marks: 10,
        options: [{ label: "A", text: "6" }], // fewer than 2 options!
        answerKey: "A",
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    expect(report.findings.some((f) => f.id.includes("rule-mcq-duplicate-label"))).toBe(true);
    expect(report.findings.some((f) => f.id.includes("rule-mcq-invalid-key"))).toBe(true);
    expect(report.findings.some((f) => f.id.includes("rule-mcq-few-options"))).toBe(true);
  });

  it("treats absent answer keys as 'Not checked' rather than an error", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate 10 * 2.",
        type: "short_answer",
        marks: 20,
        options: [],
        // no answerKey provided
      },
    ];

    const report = runDeterministicChecks(questions, baseMetadata);

    // Should NOT produce an error finding for missing key
    expect(report.findings.filter((f) => f.severity === "error")).toHaveLength(0);
    // Should be documented under checksNotPerformed
    expect(
      report.checksNotPerformed.some((c) => c.toLowerCase().includes("no answer key"))
    ).toBe(true);
  });
});

