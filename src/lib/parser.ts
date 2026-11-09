import {
  Question,
  ParsingResult,
  QuestionOption,
  QuestionSubPart,
} from "@/types/paper";

// Supported unsupported pattern detectors
const INTERNAL_CHOICE_LINE_REGEX =
  /^\s*(?:or|either\s+.*?\s+or|attempt\s+any\b|choose\s+any\b|section\s+[a-z]\s*\(answer\s+any)\b/i;
const STANDALONE_OR_REGEX = /^\s*OR\s*$/;

// For fractional/negative marks:
const FRACTIONAL_MARKS_REGEX =
  /\[\s*\d+\.\d+\s*(?:marks?|m)?\s*\]|\(\s*\d+\.\d+\s+(?:marks?|m)\s*\)/i;
const NEGATIVE_MARKS_REGEX =
  /\[\s*-\d+\s*(?:marks?|m)?\s*\]|\(\s*-\d+\s+(?:marks?|m)\s*\)/i;

// Sub-part patterns e.g. "(a) ", "(b) ", "a) ", "i) ", "(i) "
const SUB_PART_REGEX = /^\s*(?:\(([a-d]|[ivx]+)\)|([a-d]|[ivx]+)\))\s+(.*)$/i;

// Section divider e.g. "Section A", "SECTION - B", "Section C (1 mark each)"
const SECTION_HEADER_REGEX = /^\s*section\s*[-–:]?\s*([a-e])\b(?:\s*[:\-\(].*)?$/i;

interface RawBlock {
  headerNumber: number;
  marksRaw?: string;
  marks: number | null;
  textLines: string[];
  options: QuestionOption[];
  subParts: QuestionSubPart[];
  answerKey?: string;
  rawText: string;
  section?: string;
}

/**
 * Deterministically parses question paper text and optional answer key text.
 * Strictly preserves unparsed text and flags unsupported formats.
 */
export function parsePaperText(
  rawText: string,
  answerKeyText?: string
): ParsingResult {
  const lines = rawText.split(/\r?\n/);
  const questions: Question[] = [];
  const unparsedLines: string[] = [];
  const unsupportedFeaturesDetected: string[] = [];
  const parseWarnings: string[] = [];

  let currentBlock: RawBlock | null = null;
  let inPreamble = true;
  let currentSection: string | undefined = undefined;

  // Regex patterns
  // Matches "1. ", "1) ", "Q1. ", "Question 1: ", "1: "
  const questionStartRegex = /^\s*(?:(?:q|question)\s*)?(\d+)[\.\:\)]\s*(.*)$/i;
  // Matches "[3 marks]", "(3 marks)", "[3m]", "[3]"
  const marksRegex =
    /\[\s*(\d+)\s*(?:marks?|m)?\s*\]|\(\s*(\d+)\s*(?:marks?|m)\s*\)/i;
  // Matches "A. ", "A) ", "(A) ", "a. "
  const optionRegex = /^\s*(?:\(?([A-Da-d])[\.\)]|\(([A-Da-d])\))\s*(.+)$/;
  // Matches "Answer: A", "Ans: 1", "Answer - C", "Solution: 4"
  const answerRegex = /^\s*(?:answer|ans|solution)\s*[\:\-]\s*(.+)$/i;

  function finalizeCurrentBlock() {
    if (!currentBlock) return;

    const questionText = currentBlock.textLines.join(" ").trim();
    const type = currentBlock.options.length > 0 ? "mcq" : "short_answer";

    // Detect internal choices in question block
    if (
      STANDALONE_OR_REGEX.test(questionText) ||
      /\bOR\s*\(Internal Choice\)/i.test(questionText) ||
      /\b(?:either\s+.*?\s+or\b)/i.test(questionText)
    ) {
      unsupportedFeaturesDetected.push(
        `Question ${currentBlock.headerNumber} contains an internal choice ('OR' / optionality). Only compulsory papers where every question is answered are supported.`
      );
    }

    // Sub-parts marks calculation for senior case-based questions:
    // If sub-parts have individual marks, compute question marks as sum of sub-parts
    let finalMarks = currentBlock.marks;
    if (currentBlock.subParts.length > 0) {
      const subPartsWithMarks = currentBlock.subParts.filter(
        (sp) => sp.marks !== null && sp.marks !== undefined && sp.marks > 0
      );
      if (subPartsWithMarks.length > 0) {
        const subSum = subPartsWithMarks.reduce((acc, sp) => acc + (sp.marks || 0), 0);
        if (finalMarks === null || finalMarks === 0) {
          finalMarks = subSum;
        }
      }
    }

    if (finalMarks === null) {
      parseWarnings.push(
        `Question ${currentBlock.headerNumber} has no valid mark specified (e.g. '[3 marks]').`
      );
    }

    const question: Question = {
      id: `q-${currentBlock.headerNumber}-${Math.random().toString(36).substring(2, 9)}`,
      number: currentBlock.headerNumber,
      text: questionText,
      type,
      marks: finalMarks,
      options: currentBlock.options,
      subParts: currentBlock.subParts.length > 0 ? currentBlock.subParts : undefined,
      answerKey: currentBlock.answerKey,
      rawText: currentBlock.rawText.trim(),
      section: currentBlock.section,
    };

    questions.push(question);
    currentBlock = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      // Empty line can be part of spacing in raw text
      if (currentBlock) {
        currentBlock.rawText += "\n" + rawLine;
      }
      continue;
    }

    // Check for Section headers (e.g. Section A, Section B)
    if (SECTION_HEADER_REGEX.test(trimmedLine)) {
      currentSection = trimmedLine;
      finalizeCurrentBlock();
      continue;
    }

    // Check for global unsupported patterns
    if (
      INTERNAL_CHOICE_LINE_REGEX.test(trimmedLine) ||
      STANDALONE_OR_REGEX.test(trimmedLine)
    ) {
      unsupportedFeaturesDetected.push(
        `Unsupported option pattern detected on line ${i + 1}: "${trimmedLine}". This MVP supports compulsory papers only.`
      );
    }

    // Check for fractional or negative marks on the line
    if (FRACTIONAL_MARKS_REGEX.test(trimmedLine)) {
      unsupportedFeaturesDetected.push(
        `Fractional marks detected on line ${i + 1} ("${trimmedLine}"). Only positive integer marks are supported in this release.`
      );
    }
    if (NEGATIVE_MARKS_REGEX.test(trimmedLine)) {
      unsupportedFeaturesDetected.push(
        `Negative marks detected on line ${i + 1} ("${trimmedLine}"). Only positive integer marks are supported.`
      );
    }

    // Check if line starts a new question
    const qMatch = trimmedLine.match(questionStartRegex);
    if (qMatch) {
      inPreamble = false;
      finalizeCurrentBlock();

      const qNum = parseInt(qMatch[1], 10);
      let remainingText = qMatch[2] || "";

      // Look for marks in the line
      let parsedMarks: number | null = null;
      let marksRawMatch: string | undefined = undefined;

      const marksFound = remainingText.match(marksRegex);
      if (marksFound) {
        marksRawMatch = marksFound[0];
        const markVal = parseInt(marksFound[1] || marksFound[2], 10);
        if (!isNaN(markVal) && markVal > 0) {
          parsedMarks = markVal;
        }
        remainingText = remainingText.replace(marksFound[0], "").trim();
      }

      currentBlock = {
        headerNumber: qNum,
        marksRaw: marksRawMatch,
        marks: parsedMarks,
        textLines: remainingText ? [remainingText] : [],
        options: [],
        subParts: [],
        rawText: rawLine,
        section: currentSection,
      };
      continue;
    }

    // If we haven't hit the first question, it's preamble text
    if (inPreamble) {
      unparsedLines.push(`[Preamble/Header] ${trimmedLine}`);
      continue;
    }

    // If we are inside a question block
    if (currentBlock) {
      currentBlock.rawText += "\n" + rawLine;

      // Check for answer key in question block
      const ansMatch = trimmedLine.match(answerRegex);
      if (ansMatch) {
        currentBlock.answerKey = ansMatch[1].trim();
        continue;
      }

      // If an answer line has already occurred in this question block, any following non-question line is unparsed
      if (currentBlock.answerKey) {
        unparsedLines.push(
          `[Post-Answer line after Q${currentBlock.headerNumber}] ${trimmedLine}`
        );
        continue;
      }

      // Check for case-based question sub-parts: e.g. "(a) Calculate ... [1 mark]" or "(i) ..."
      const subPartMatch = trimmedLine.match(SUB_PART_REGEX);
      const isSubPart =
        subPartMatch &&
        (marksRegex.test(trimmedLine) ||
          currentBlock.subParts.length > 0 ||
          /^\s*\((?:[ivx]+|[e-z])\)/i.test(trimmedLine));

      if (isSubPart && subPartMatch) {
        const subLabel = `(${subPartMatch[1] || subPartMatch[2]})`;
        let subText = (subPartMatch[3] || "").trim();
        let subMarks: number | null = null;

        const subMarksMatch = subText.match(marksRegex);
        if (subMarksMatch) {
          const mVal = parseInt(subMarksMatch[1] || subMarksMatch[2], 10);
          if (!isNaN(mVal) && mVal > 0) {
            subMarks = mVal;
          }
          subText = subText.replace(subMarksMatch[0], "").trim();
        }

        currentBlock.subParts.push({
          label: subLabel,
          text: subText,
          marks: subMarks,
        });
        currentBlock.textLines.push(trimmedLine);
        continue;
      }

      // Check for marks line inside the block if not already found
      if (currentBlock.marks === null) {
        const marksFound = trimmedLine.match(marksRegex);
        if (marksFound) {
          const markVal = parseInt(marksFound[1] || marksFound[2], 10);
          if (!isNaN(markVal) && markVal > 0) {
            currentBlock.marks = markVal;
          }
          const cleanLine = trimmedLine.replace(marksFound[0], "").trim();
          if (cleanLine) {
            currentBlock.textLines.push(cleanLine);
          }
          continue;
        }
      }

      // Check for MCQ options
      const optMatch = trimmedLine.match(optionRegex);
      if (optMatch) {
        const label = (optMatch[1] || optMatch[2]).toUpperCase();
        const optText = optMatch[3].trim();
        currentBlock.options.push({ label, text: optText });
        continue;
      }

      // Otherwise regular question text continuation
      currentBlock.textLines.push(trimmedLine);
      continue;
    }

    // Any line that couldn't be associated with a question
    unparsedLines.push(trimmedLine);
  }

  finalizeCurrentBlock();

  // If a separate answer key text was provided, parse and merge it
  if (answerKeyText && answerKeyText.trim()) {
    mergeAnswerKey(questions, answerKeyText, unparsedLines);
  }

  // Check 20-question limit
  if (questions.length > 20) {
    unsupportedFeaturesDetected.push(
      `Paper contains ${questions.length} questions. The MVP is restricted to papers with up to 20 questions.`
    );
  }

  return {
    questions,
    unparsedLines,
    unsupportedFeaturesDetected,
    parseWarnings,
  };
}

/**
 * Parses a standalone answer key text and links answers to questions by number.
 */
function mergeAnswerKey(
  questions: Question[],
  answerKeyText: string,
  unparsedLines: string[]
) {
  const lines = answerKeyText.split(/\r?\n/);
  const keyRegex = /^\s*(?:(?:q|question|ans|answer)\s*)?(\d+)[\.\:\-\)]\s*(.+)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(keyRegex);
    if (match) {
      const qNum = parseInt(match[1], 10);
      const answerVal = match[2].trim();

      const matchedQ = questions.find((q) => q.number === qNum);
      if (matchedQ) {
        matchedQ.answerKey = answerVal;
      } else {
        unparsedLines.push(
          `[Answer Key for unknown Question ${qNum}] ${trimmed}`
        );
      }
    } else {
      unparsedLines.push(`[Unmatched Answer Key Line] ${trimmed}`);
    }
  }
}
