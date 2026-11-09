import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { performBharatCodeReview } from "@/lib/bharatcode";
import { Question, PaperMetadata } from "@/types/paper";

const sampleQuestions: Question[] = [
  {
    id: "q-test-1",
    number: 1,
    text: "Which of these is a prime number?",
    type: "mcq",
    marks: 3,
    options: [
      { label: "A", text: "2" },
      { label: "B", text: "3" },
      { label: "C", text: "4" },
      { label: "D", text: "6" },
    ],
    answerKey: "A",
  },
];

const sampleMetadata: PaperMetadata = {
  title: "Periodic Assessment",
  classGrade: "Class 7",
  subject: "Mathematics",
  expectedTotalMarks: 20,
};

describe("BharatCode Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("handles missing API key gracefully without crashing", async () => {
    delete process.env.BHARATCODE_API_KEY;

    const result = await performBharatCodeReview(sampleQuestions, sampleMetadata);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("MISSING_API_KEY");
    expect(result.error).toBe("AI review unavailable — BharatCode key not configured.");
    expect(result.findings).toHaveLength(0);
  });

  it("detects and flags truncated AI responses (finish_reason === length)", async () => {
    process.env.BHARATCODE_API_KEY = "dummy-key-test";

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            finish_reason: "length", // Truncated!
            message: {
              content: '{"findings": [{"questionId": "q-test-1", "severity": "error"',
            },
          },
        ],
      }),
    } as any);

    const result = await performBharatCodeReview(sampleQuestions, sampleMetadata);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("TRUNCATED_RESPONSE");
    expect(result.error).toContain("truncated because maximum tokens were exceeded");
  });

  it("rejects findings referencing hallucinated non-existent question IDs", async () => {
    process.env.BHARATCODE_API_KEY = "dummy-key-test";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                findings: [
                  {
                    questionId: "q-test-1", // valid question ID
                    severity: "error",
                    title: "Multiple primes",
                    relevantText: "options A and B",
                    explanation: "Both 2 and 3 are prime numbers.",
                    proposedCorrection: {
                      field: "optionText",
                      targetOptionLabel: "B",
                      newValue: "9",
                      label: "Change option B to 9",
                    },
                  },
                  {
                    questionId: "q-hallucinated-99", // Invalid question ID!
                    severity: "error",
                    title: "Phantom question issue",
                    relevantText: "Phantom text",
                    explanation: "This ID does not exist in the question paper.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    } as any);

    const result = await performBharatCodeReview(sampleQuestions, sampleMetadata);

    expect(result.success).toBe(true);
    // Should keep only the valid questionId finding and drop the hallucinated one
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].questionId).toBe("q-test-1");
    expect(result.findings[0].needsTeacherReview).toBe(true);
    expect(result.findings[0].proposedCorrection?.newValue).toBe("9");
  });

  it("handles malformed JSON response safely", async () => {
    process.env.BHARATCODE_API_KEY = "dummy-key-test";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: "This is not json at all! Something went wrong on the server.",
            },
          },
        ],
      }),
    } as any);

    const result = await performBharatCodeReview(sampleQuestions, sampleMetadata);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("INVALID_RESPONSE");
    expect(result.error).toContain("Failed to parse structured JSON");
  });
});

