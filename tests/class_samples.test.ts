import { describe, it, expect } from "vitest";
import { ALL_SAMPLES, getSamplesForClass, getDefaultSampleForClass } from "@/lib/samples";
import { parsePaperText } from "@/lib/parser";
import { runDeterministicChecks } from "@/lib/checker";
import { runScienceChecks } from "@/lib/scienceChecker";
import { ClassGradeValues } from "@/types/paper";
import { getClassFormatSpecimen } from "@/lib/classExamples";

describe("All-Class Verified Demo Question Papers", () => {
  it("verifies that demo samples exist for every class from Class 6 to Class 12", () => {
    for (const cls of ClassGradeValues) {
      const mathsSample = getDefaultSampleForClass(cls, "Mathematics");
      expect(mathsSample).toBeDefined();
      expect(mathsSample?.metadata.classGrade).toBe(cls);
      expect(mathsSample?.metadata.subject).toBe("Mathematics");

      const scienceSample = getDefaultSampleForClass(cls, "Science");
      expect(scienceSample).toBeDefined();
      expect(scienceSample?.metadata.classGrade).toBe(cls);
      expect(scienceSample?.metadata.subject).toBe("Science");
    }
  });

  it("verifies format specimens exist for all (Class, Subject) combinations", () => {
    for (const cls of ClassGradeValues) {
      const mathsSpecimen = getClassFormatSpecimen(cls, "Mathematics");
      expect(mathsSpecimen).toBeDefined();
      expect(mathsSpecimen.q1.statement).toBeTruthy();
      expect(mathsSpecimen.q2.options.length).toBe(4);

      const scienceSpecimen = getClassFormatSpecimen(cls, "Science");
      expect(scienceSpecimen).toBeDefined();
      expect(scienceSpecimen.q1.statement).toBeTruthy();
      expect(scienceSpecimen.q2.options.length).toBe(4);
    }
  });

  it("verifies all clean demo samples parse and pass deterministic checks with 0 errors", () => {
    const cleanSamples = ALL_SAMPLES.filter((s) => s.isClean);
    expect(cleanSamples.length).toBeGreaterThanOrEqual(13);

    for (const sample of cleanSamples) {
      const parsed = parsePaperText(sample.rawPaperText, sample.rawAnswerKeyText);
      expect(parsed.questions.length).toBeGreaterThan(0);
      expect(parsed.unsupportedFeaturesDetected.length).toBe(0);

      const report =
        sample.metadata.subject === "Science"
          ? runScienceChecks(parsed.questions, sample.metadata)
          : runDeterministicChecks(parsed.questions, sample.metadata);

      const errors = report.findings.filter((f) => f.severity === "error");
      expect(errors.length, `Expected 0 errors in clean demo: ${sample.name}`).toBe(0);
      expect(report.marksSum).toBe(sample.metadata.expectedTotalMarks);
      expect(report.isMarksSumReliable).toBe(true);
    }
  });
});

