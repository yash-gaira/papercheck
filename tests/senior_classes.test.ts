import { describe, it, expect } from "vitest";
import { parsePaperText } from "@/lib/parser";
import { PaperMetadataSchema, ClassGradeValues } from "@/types/paper";
import { runDeterministicChecks } from "@/lib/checker";

describe("Senior Classes (6–12) Support & Parsing", () => {
  it("validates all 7 ClassGrade values in Zod schema", () => {
    for (const cls of ClassGradeValues) {
      const res = PaperMetadataSchema.safeParse({
        title: "Test Exam",
        classGrade: cls,
        subject: "Mathematics",
        expectedTotalMarks: 50,
      });
      expect(res.success).toBe(true);
    }
  });

  it("parses Section headers (Section A, Section B) into questions", () => {
    const raw = `Section A
1. Solve 2x + 3 = 7. [2 marks]
Answer: 2

2. Evaluate 5^2. [2 marks]
Answer: 25

Section B
3. Find the derivative of x^2. [3 marks]
Answer: 2x`;

    const parsed = parsePaperText(raw);
    expect(parsed.questions.length).toBe(3);
    expect(parsed.questions[0].section).toBe("Section A");
    expect(parsed.questions[1].section).toBe("Section A");
    expect(parsed.questions[2].section).toBe("Section B");
  });

  it("parses case-based question sub-parts (a), (b), (c) and sums their marks", () => {
    const raw = `1. Read the following case study and answer the sub-questions:
(a) Define electric current. [1 mark]
(b) State the SI unit of current. [1 mark]
(c) Calculate current if 20 Coulombs flow in 4 seconds. [2 marks]
Answer: 5 A`;

    const parsed = parsePaperText(raw);
    expect(parsed.questions.length).toBe(1);
    const q1 = parsed.questions[0];
    expect(q1.subParts).toBeDefined();
    expect(q1.subParts?.length).toBe(3);
    expect(q1.subParts?.[0].label).toBe("(a)");
    expect(q1.subParts?.[0].marks).toBe(1);
    expect(q1.subParts?.[1].label).toBe("(b)");
    expect(q1.subParts?.[1].marks).toBe(1);
    expect(q1.subParts?.[2].label).toBe("(c)");
    expect(q1.subParts?.[2].marks).toBe(2);

    // Sum of sub-parts (1 + 1 + 2 = 4 marks)
    expect(q1.marks).toBe(4);
  });

  it("flags internal choice 'OR' as unsupported in senior classes as well", () => {
    const raw = `1. Solve for x: 3x - 5 = 10 [3 marks]
OR
Solve for y: 2y + 4 = 14 [3 marks]`;

    const parsed = parsePaperText(raw);
    expect(parsed.unsupportedFeaturesDetected.length).toBeGreaterThan(0);
    expect(parsed.unsupportedFeaturesDetected[0]).toContain("Unsupported option pattern");

    const report = runDeterministicChecks(parsed.questions, {
      title: "Class 11 Maths",
      classGrade: "Class 11",
      subject: "Mathematics",
      expectedTotalMarks: 3,
    }, parsed.unsupportedFeaturesDetected);

    expect(report.findings.some((f) => f.id.includes("rule-unsupported"))).toBe(true);
  });
});
