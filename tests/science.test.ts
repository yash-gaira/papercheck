import { describe, it, expect } from "vitest";
import { runScienceChecks } from "@/lib/scienceChecker";
import { parsePaperText } from "@/lib/parser";
import {
  SAMPLE_SCIENCE_ERRORS,
  SAMPLE_SCIENCE_CLEAN,
  SAMPLE_DELIBERATE_ERRORS,
  SAMPLE_CLEAN,
} from "@/lib/samples";
import { Question, PaperMetadata } from "@/types/paper";
import { runDeterministicChecks } from "@/lib/checker";

describe("Science Deterministic Checker", () => {
  it("flags missing physical units on calculation questions", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "A runner completes a 100 m race. Calculate speed in m/s.",
        type: "short_answer",
        marks: 3,
        options: [],
        answerKey: "10", // Bare number without m/s
      },
    ];

    const metadata: PaperMetadata = {
      title: "Class 9 Physics Test",
      classGrade: "Class 9",
      subject: "Science",
      subSubject: "Physics",
      expectedTotalMarks: 3,
    };

    const report = runScienceChecks(questions, metadata);
    const missingUnitFinding = report.findings.find((f) =>
      f.id.includes("science-missing-unit")
    );
    expect(missingUnitFinding).toBeDefined();
    expect(missingUnitFinding?.severity).toBe("warning");
    expect(missingUnitFinding?.title).toContain("Numerical Answer Lacks Physical Units");
  });

  it("flags unit inconsistency between question and answer key", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Calculate the speed in m/s.",
        type: "short_answer",
        marks: 2,
        options: [],
        answerKey: "36 km/h", // Question asked for m/s, answer key gave km/h
      },
    ];

    const metadata: PaperMetadata = {
      title: "Class 10 Physics Assessment",
      classGrade: "Class 10",
      subject: "Science",
      expectedTotalMarks: 2,
    };

    const report = runScienceChecks(questions, metadata);
    const mismatch = report.findings.find((f) =>
      f.id.includes("science-unit-mismatch")
    );
    expect(mismatch).toBeDefined();
    expect(mismatch?.severity).toBe("error");
    expect(mismatch?.title).toContain("Unit Inconsistency");
  });

  it("flags malformed lowercase chemical formula like 'co2'", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Explain the role of co2 in the atmosphere.",
        type: "short_answer",
        marks: 2,
        options: [],
        answerKey: "CO2 is a greenhouse gas.",
      },
    ];

    const metadata: PaperMetadata = {
      title: "Class 10 Chemistry Test",
      classGrade: "Class 10",
      subject: "Science",
      subSubject: "Chemistry",
      expectedTotalMarks: 2,
    };

    const report = runScienceChecks(questions, metadata);
    const formulaFinding = report.findings.find((f) =>
      f.id.includes("science-formula-casing")
    );
    expect(formulaFinding).toBeDefined();
    expect(formulaFinding?.severity).toBe("error");
    expect(formulaFinding?.title).toContain('Malformed Chemical Formula ("co2")');
    expect(formulaFinding?.proposedCorrection?.newValue).toContain("CO2");
  });

  it("flags unbalanced simple chemical equation in answer key", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Write the reaction between hydrogen and oxygen to produce water.",
        type: "short_answer",
        marks: 2,
        options: [],
        answerKey: "H2 + O2 -> H2O",
      },
    ];

    const metadata: PaperMetadata = {
      title: "Class 10 Chemistry Assessment",
      classGrade: "Class 10",
      subject: "Science",
      expectedTotalMarks: 2,
    };

    const report = runScienceChecks(questions, metadata);
    const eqFinding = report.findings.find((f) =>
      f.id.includes("science-unbalanced-equation")
    );
    expect(eqFinding).toBeDefined();
    expect(eqFinding?.severity).toBe("error");
    expect(eqFinding?.title).toContain("Unbalanced Chemical Equation");
    expect(eqFinding?.proposedCorrection?.newValue).toContain("2H₂ + O₂ → 2H₂O");
  });

  it("flags missing diagram citation when question mentions 'in the figure below'", () => {
    const questions: Question[] = [
      {
        id: "q1",
        number: 1,
        text: "Find the equivalent resistance in the circuit shown in the figure below.",
        type: "short_answer",
        marks: 3,
        options: [],
        answerKey: "6 ohms",
      },
    ];

    const metadata: PaperMetadata = {
      title: "Class 10 Physics",
      classGrade: "Class 10",
      subject: "Science",
      expectedTotalMarks: 3,
    };

    const report = runScienceChecks(questions, metadata);
    const diagramFinding = report.findings.find((f) =>
      f.id.includes("science-missing-diagram")
    );
    expect(diagramFinding).toBeDefined();
    expect(diagramFinding?.severity).toBe("warning");
    expect(diagramFinding?.title).toContain("Missing Diagram / Figure Citation");
  });

  it("correctly identifies all deliberate errors in SAMPLE_SCIENCE_ERRORS", () => {
    const parsed = parsePaperText(
      SAMPLE_SCIENCE_ERRORS.rawPaperText,
      SAMPLE_SCIENCE_ERRORS.rawAnswerKeyText
    );
    const report = runScienceChecks(
      parsed.questions,
      SAMPLE_SCIENCE_ERRORS.metadata
    );

    // Should detect:
    // 1. Marks sum mismatch (18 vs 20)
    // 2. Q1 missing unit in answer key (2.5)
    // 3. Q2 malformed formula (co2)
    // 4. Q3 unbalanced equation (H2 + O2 -> H2O)
    // 5. Q4 missing diagram (figure below)
    expect(report.findings.some((f) => f.id === "rule-marks-mismatch")).toBe(true);
    expect(report.findings.some((f) => f.id.includes("science-missing-unit"))).toBe(true);
    expect(report.findings.some((f) => f.id.includes("science-formula-casing"))).toBe(true);
    expect(report.findings.some((f) => f.id.includes("science-unbalanced-equation"))).toBe(true);
    expect(report.findings.some((f) => f.id.includes("science-missing-diagram"))).toBe(true);
  });

  it("validates that SAMPLE_SCIENCE_CLEAN has zero errors and warnings", () => {
    const parsed = parsePaperText(
      SAMPLE_SCIENCE_CLEAN.rawPaperText,
      SAMPLE_SCIENCE_CLEAN.rawAnswerKeyText
    );
    const report = runScienceChecks(
      parsed.questions,
      SAMPLE_SCIENCE_CLEAN.metadata
    );

    const errorsAndWarnings = report.findings.filter(
      (f) => f.severity === "error" || f.severity === "warning"
    );
    expect(errorsAndWarnings.length).toBe(0);
    expect(report.marksSum).toBe(20);
    expect(report.isMarksSumReliable).toBe(true);
  });

  it("preserves exact Mathematics checks byte-for-byte on SAMPLE_DELIBERATE_ERRORS", () => {
    const parsed = parsePaperText(
      SAMPLE_DELIBERATE_ERRORS.rawPaperText,
      SAMPLE_DELIBERATE_ERRORS.rawAnswerKeyText
    );
    const report = runDeterministicChecks(
      parsed.questions,
      SAMPLE_DELIBERATE_ERRORS.metadata
    );

    expect(report.marksSum).toBe(18);
    expect(report.expectedMarks).toBe(20);
    expect(report.findings.some((f) => f.id === "rule-marks-mismatch")).toBe(true);
    expect(report.findings.some((f) => f.id.includes("exact-duplicate"))).toBe(true);
  });

  it("preserves exact Mathematics clean checks byte-for-byte on SAMPLE_CLEAN", () => {
    const parsed = parsePaperText(
      SAMPLE_CLEAN.rawPaperText,
      SAMPLE_CLEAN.rawAnswerKeyText
    );
    const report = runDeterministicChecks(parsed.questions, SAMPLE_CLEAN.metadata);

    expect(report.marksSum).toBe(20);
    expect(report.expectedMarks).toBe(20);
    expect(report.findings.length).toBe(0);
  });
});
