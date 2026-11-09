import { describe, it, expect } from "vitest";
import { parsePaperText } from "@/lib/parser";

describe("Deterministic Parser", () => {
  it("parses the documented input format correctly", () => {
    const input = `1. Calculate 3/4 + 1/4. [3 marks]
Answer: 1

2. Which of these is a prime number? [3 marks]
A. 2
B. 3
C. 4
D. 6
Answer: A`;

    const result = parsePaperText(input);

    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].number).toBe(1);
    expect(result.questions[0].text).toBe("Calculate 3/4 + 1/4.");
    expect(result.questions[0].marks).toBe(3);
    expect(result.questions[0].type).toBe("short_answer");
    expect(result.questions[0].answerKey).toBe("1");

    expect(result.questions[1].number).toBe(2);
    expect(result.questions[1].text).toBe("Which of these is a prime number?");
    expect(result.questions[1].marks).toBe(3);
    expect(result.questions[1].type).toBe("mcq");
    expect(result.questions[1].options).toHaveLength(4);
    expect(result.questions[1].options[0]).toEqual({ label: "A", text: "2" });
    expect(result.questions[1].options[3]).toEqual({ label: "D", text: "6" });
    expect(result.questions[1].answerKey).toBe("A");
  });

  it("preserves unparsed content and never silently discards text", () => {
    const input = `Delhi Public School
Annual Examination 2026

1. Solve 2x = 10. [2 marks]
Answer: 5

Random unparsed note here that should not be dropped`;

    const result = parsePaperText(input);

    expect(result.questions).toHaveLength(1);
    expect(result.unparsedLines.length).toBeGreaterThanOrEqual(2);
    expect(result.unparsedLines.some((l) => l.includes("Delhi Public School"))).toBe(true);
    expect(result.unparsedLines.some((l) => l.includes("Random unparsed note"))).toBe(true);
  });

  it("detects and flags unsupported internal choices ('OR')", () => {
    const input = `1. Find the square of 12. [3 marks]
OR
Find the square of 15. [3 marks]`;

    const result = parsePaperText(input);

    expect(result.unsupportedFeaturesDetected.length).toBeGreaterThan(0);
    expect(
      result.unsupportedFeaturesDetected.some((f) => f.includes("internal choice") || f.includes("OR"))
    ).toBe(true);
  });

  it("detects and flags fractional or negative marks as unsupported", () => {
    const input = `1. Calculate 5 * 6. [2.5 marks]
2. Subtract 10 from 4. [-1 marks]`;

    const result = parsePaperText(input);

    expect(result.unsupportedFeaturesDetected.some((f) => f.includes("Fractional"))).toBe(true);
    expect(result.unsupportedFeaturesDetected.some((f) => f.includes("Negative"))).toBe(true);
  });

  it("merges separate answer key text accurately", () => {
    const paper = `1. Solve 3x = 9. [2 marks]
2. Find area of circle with r=7. [3 marks]`;

    const key = `1. 3
2. 154 sq cm`;

    const result = parsePaperText(paper, key);

    expect(result.questions[0].answerKey).toBe("3");
    expect(result.questions[1].answerKey).toBe("154 sq cm");
  });
});

