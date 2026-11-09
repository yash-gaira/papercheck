import { z } from "zod";

export type ClassGrade =
  | "Class 6"
  | "Class 7"
  | "Class 8"
  | "Class 9"
  | "Class 10"
  | "Class 11"
  | "Class 12";

export const ClassGradeValues: ClassGrade[] = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

export type Subject = "Mathematics" | "Science";
export const SubjectValues: Subject[] = ["Mathematics", "Science"];

export type ScienceSubSubject = "Physics" | "Chemistry" | "Biology";
export const ScienceSubSubjectValues: ScienceSubSubject[] = [
  "Physics",
  "Chemistry",
  "Biology",
];

export type QuestionType = "mcq" | "short_answer";

export interface QuestionOption {
  label: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface QuestionSubPart {
  label: string; // e.g. "(a)", "(b)", "(i)", "(ii)"
  text: string;
  marks?: number | null;
  answerKey?: string;
}

export interface Question {
  id: string; // stable internal UUID / unique string
  number: number; // display number (1, 2, 3...)
  text: string;
  type: QuestionType;
  marks: number | null; // positive integer, or null if missing/unparsed
  options: QuestionOption[]; // empty for short_answer
  answerKey?: string; // e.g. "A" or "1" or "25 m/s"
  rawText?: string;
  subParts?: QuestionSubPart[]; // additive for senior case-based / sub-part questions
  section?: string; // e.g. "Section A"
}

export interface PaperMetadata {
  title: string;
  classGrade: ClassGrade;
  subject: Subject;
  subSubject?: ScienceSubSubject;
  expectedTotalMarks: number;
  timeAllowedMinutes?: number;
  instructions?: string[];
}

export interface ParsingResult {
  questions: Question[];
  unparsedLines: string[];
  unsupportedFeaturesDetected: string[];
  parseWarnings: string[];
}

export type FindingSource = "rule" | "ai";
export type FindingSeverity = "error" | "warning" | "note";

export interface ProposedCorrection {
  field: "text" | "marks" | "optionText" | "answerKey";
  targetOptionLabel?: string;
  originalValue?: string | number;
  newValue: string | number;
  label: string; // Human readable description
}

export interface Finding {
  id: string;
  questionId: string | null; // null for paper-level issues
  questionNumber?: number | null;
  source: FindingSource;
  severity: FindingSeverity;
  title: string;
  relevantText: string;
  explanation: string;
  proposedCorrection?: ProposedCorrection;
  needsTeacherReview: boolean;
  dismissed?: boolean;
  dismissedNote?: string;
}

export interface CheckReport {
  findings: Finding[];
  isStale: boolean;
  lastCheckedAt: string;
  checksPerformed: string[];
  checksNotPerformed: string[];
  marksSum: number | null;
  isMarksSumReliable: boolean;
  expectedMarks: number;
}

// Zod Schemas for Validation and API Safety

export const QuestionOptionSchema = z.object({
  label: z.string().min(1).max(5),
  text: z.string().min(1),
});

export const QuestionSubPartSchema = z.object({
  label: z.string().min(1).max(10),
  text: z.string().min(1),
  marks: z.number().int().positive().nullable().optional(),
  answerKey: z.string().optional(),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  text: z.string().min(1),
  type: z.enum(["mcq", "short_answer"]),
  marks: z.number().int().positive().nullable(),
  options: z.array(QuestionOptionSchema),
  answerKey: z.string().optional(),
  rawText: z.string().optional(),
  subParts: z.array(QuestionSubPartSchema).optional(),
  section: z.string().optional(),
});

export const PaperMetadataSchema = z.object({
  title: z.string().min(1, "Paper title is required").max(150),
  classGrade: z.enum([
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ]),
  subject: z.enum(["Mathematics", "Science"]),
  subSubject: z.enum(["Physics", "Chemistry", "Biology"]).optional(),
  expectedTotalMarks: z
    .number()
    .int()
    .positive("Expected marks must be a positive integer")
    .max(100),
  timeAllowedMinutes: z.number().int().positive().max(300).optional(),
  instructions: z.array(z.string()).optional(),
});

export const PaperDraftSchema = z.object({
  version: z.literal("1.0"),
  metadata: PaperMetadataSchema,
  questions: z.array(QuestionSchema).max(20, "Maximum 20 questions supported in MVP"),
  rawPaperText: z.string().optional(),
  rawAnswerKeyText: z.string().optional(),
});

export type PaperDraft = z.infer<typeof PaperDraftSchema>;

// AI Review Schemas
export const AIFindingItemSchema = z.object({
  questionId: z.string(),
  severity: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase() : v),
    z.enum(["error", "warning", "note"]).catch("note")
  ),
  title: z
    .string()
    .min(1)
    .catch("Review Finding")
    .transform((t) => t.slice(0, 150)),
  relevantText: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || ""),
  explanation: z.string().min(1).catch("No detailed explanation provided."),
  proposedCorrection: z
    .object({
      field: z.enum(["text", "marks", "optionText", "answerKey"]).catch("text"),
      targetOptionLabel: z.string().optional(),
      newValue: z.union([z.string(), z.number()]),
      label: z.string().catch("Apply Correction"),
    })
    .nullable()
    .optional(),
});

export const AIReviewResponseSchema = z.object({
  findings: z.array(AIFindingItemSchema).default([]),
  summary: z.string().optional(),
});

export type AIFindingItem = z.infer<typeof AIFindingItemSchema>;
export type AIReviewResponse = z.infer<typeof AIReviewResponseSchema>;
