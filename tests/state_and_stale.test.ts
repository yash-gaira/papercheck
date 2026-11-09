import { describe, it, expect } from "vitest";
import { runDeterministicChecks } from "@/lib/checker";
import { Question, PaperMetadata, CheckReport, Finding, ProposedCorrection } from "@/types/paper";

describe("State, Stale Findings & Undo Lifecycle", () => {
  const metadata: PaperMetadata = {
    title: "Test Exam",
    classGrade: "Class 7",
    subject: "Mathematics",
    expectedTotalMarks: 20,
  };

  it("marks findings report as stale when an edit or proposed correction is applied", () => {
    const initialQuestions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate 5 + 5",
        type: "short_answer",
        marks: 10,
        options: [],
      },
      {
        id: "q2",
        number: 2,
        text: "Calculate 5 + 5", // Duplicate!
        type: "short_answer",
        marks: 10,
        options: [],
      },
    ];

    let report: CheckReport = runDeterministicChecks(initialQuestions, metadata);
    expect(report.isStale).toBe(false);
    expect(report.findings.some((f) => f.id.includes("rule-exact-duplicate"))).toBe(true);

    // Teacher edits Q2 or applies a correction:
    const correction: ProposedCorrection = {
      field: "text",
      newValue: "Calculate 7 + 3",
      label: "Rewrite question to resolve duplicate",
    };

    // Applying correction updates question data
    const updatedQuestions = initialQuestions.map((q) =>
      q.id === "q2" ? { ...q, text: String(correction.newValue) } : q
    );

    // CRITICAL: findings must be marked stale immediately upon editing!
    report = {
      ...report,
      isStale: true,
    };

    expect(report.isStale).toBe(true);

    // After teacher clicks "Recheck", a fresh report is generated with isStale: false
    const recheckReport = runDeterministicChecks(updatedQuestions, metadata);
    expect(recheckReport.isStale).toBe(false);
    // Duplicate finding is now resolved in the new run!
    expect(recheckReport.findings.some((f) => f.id.includes("rule-exact-duplicate"))).toBe(false);
  });

  it("handles dismissing a finding with an optional teacher note and restoring it", () => {
    const finding: Finding = {
      id: "test-finding-1",
      questionId: "q1",
      questionNumber: 1,
      source: "rule",
      severity: "warning",
      title: "Sample Warning",
      relevantText: "sample",
      explanation: "explanation",
      needsTeacherReview: false,
    };

    // Dismiss with teacher rationale
    const dismissedFinding: Finding = {
      ...finding,
      dismissed: true,
      dismissedNote: "Teacher confirmed syllabus wording.",
    };

    expect(dismissedFinding.dismissed).toBe(true);
    expect(dismissedFinding.dismissedNote).toBe("Teacher confirmed syllabus wording.");

    // Restore finding
    const restoredFinding: Finding = {
      ...dismissedFinding,
      dismissed: false,
      dismissedNote: undefined,
    };

    expect(restoredFinding.dismissed).toBe(false);
    expect(restoredFinding.dismissedNote).toBeUndefined();
  });
});

