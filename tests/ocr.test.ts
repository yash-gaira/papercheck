import { describe, it, expect } from "vitest";
import { cleanExtractedOcrText } from "@/lib/ocr";

describe("Open-Source Photo-to-Text OCR Pre/Post Processing", () => {
  it("normalizes OCR misread question headers like QI. to Q1.", () => {
    const rawOcr = `QI. Calculate the value of 5x - 7 = 18. [ 3 marks ]
Ans: 5`;

    const cleaned = cleanExtractedOcrText(rawOcr);
    expect(cleaned).toContain("Q1. Calculate the value of 5x - 7 = 18. [3 marks]");
  });

  it("normalizes marks bracket spacing and syntax from photo OCR", () => {
    const rawOcr = `1. Find the area of a square of side 8 cm. [ 4 marks ]
2. Which is prime? ( 3 marks )
A ) 2
B ) 4`;

    const cleaned = cleanExtractedOcrText(rawOcr);
    expect(cleaned).toContain("1. Find the area of a square of side 8 cm. [4 marks]");
    expect(cleaned).toContain("2. Which is prime? [3 marks]");
    expect(cleaned).toContain("A. 2");
    expect(cleaned).toContain("B. 4");
  });

  it("handles empty or whitespace OCR outputs cleanly", () => {
    expect(cleanExtractedOcrText("")).toBe("");
    expect(cleanExtractedOcrText("   \n\n   ")).toBe("");
  });
});

