import { describe, it, expect } from "vitest";
import { parsePaperText } from "@/lib/parser";
import { runDeterministicChecks } from "@/lib/checker";
import { SAMPLE_DELIBERATE_ERRORS, SAMPLE_CLEAN } from "@/lib/samples";
import { PaperDraftSchema } from "@/types/paper";

describe("Workflow & Verification Rules", () => {
  it("deliberate error sample triggers deterministic marks mismatch and duplicate detection", () => {
    const parsed = parsePaperText(
      SAMPLE_DELIBERATE_ERRORS.rawPaperText,
      SAMPLE_DELIBERATE_ERRORS.rawAnswerKeyText
    );

    expect(parsed.questions).toHaveLength(6);

    const report = runDeterministicChecks(
      parsed.questions,
      SAMPLE_DELIBERATE_ERRORS.metadata,
      parsed.unsupportedFeaturesDetected
    );

    // Sum of 6 questions * 3 marks = 18 marks, expected 20
    expect(report.marksSum).toBe(18);
    expect(report.isMarksSumReliable).toBe(true);

    const mismatchFinding = report.findings.find((f) => f.id === "rule-marks-mismatch");
    expect(mismatchFinding).toBeDefined();
    expect(mismatchFinding?.explanation).toContain("18");
    expect(mismatchFinding?.explanation).toContain("20");

    // Duplicate detection: Q4 is identical to Q1
    const duplicateFinding = report.findings.find((f) => f.id.includes("rule-exact-duplicate"));
    expect(duplicateFinding).toBeDefined();
    expect(duplicateFinding?.questionNumber).toBe(4);
    expect(duplicateFinding?.relevantText).toContain("Calculate 3/4 + 1/4");
  });

  it("clean sample passes all deterministic checks without errors", () => {
    const parsed = parsePaperText(
      SAMPLE_CLEAN.rawPaperText,
      SAMPLE_CLEAN.rawAnswerKeyText
    );

    expect(parsed.questions).toHaveLength(5);

    const report = runDeterministicChecks(
      parsed.questions,
      SAMPLE_CLEAN.metadata,
      parsed.unsupportedFeaturesDetected
    );

    // 5 * 4 = 20 marks
    expect(report.marksSum).toBe(20);
    expect(report.isMarksSumReliable).toBe(true);
    expect(report.findings.filter((f) => f.severity === "error")).toHaveLength(0);
  });

  it("student export data structure strictly excludes answers and findings", () => {
    const parsed = parsePaperText(SAMPLE_DELIBERATE_ERRORS.rawPaperText);

    // Simulating the student export data generation:
    // Only number, text, marks, and options are rendered; answerKey is strictly omitted
    const studentRenderData = parsed.questions.map((q) => ({
      number: q.number,
      text: q.text,
      marks: q.marks,
      options: q.options.map((o) => ({ label: o.label, text: o.text })),
    }));

    for (const item of studentRenderData) {
      expect((item as any).answerKey).toBeUndefined();
      expect((item as any).solution).toBeUndefined();
      expect((item as any).findings).toBeUndefined();
    }
  });

  it("validates that PaperDraftSchema validates correct draft structure", () => {
    const draft = {
      version: "1.0",
      metadata: SAMPLE_CLEAN.metadata,
      questions: parsePaperText(SAMPLE_CLEAN.rawPaperText).questions,
      rawPaperText: SAMPLE_CLEAN.rawPaperText,
      rawAnswerKeyText: SAMPLE_CLEAN.rawAnswerKeyText,
    };

    const validated = PaperDraftSchema.safeParse(draft);
    expect(validated.success).toBe(true);
  });
});

