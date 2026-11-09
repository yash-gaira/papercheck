/**
 * Open-source Photo-to-Text OCR utility using Tesseract.js
 * Apache 2.0 Open Source - runs entirely client-side or in-memory
 */

export interface OcrResult {
  text: string;
  confidence: number;
}

/**
 * Cleans and normalizes OCR text extracted from photos of question papers.
 * Fixes common character recognition glitches in math/exam headers.
 */
export function cleanExtractedOcrText(raw: string): string {
  if (!raw) return "";

  const lines = raw.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (const line of lines) {
    let l = line.trim();
    if (!l) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
        cleanedLines.push("");
      }
      continue;
    }

    // Fix common OCR misrecognitions for question numbering:
    // e.g. "QI." or "Q1:" -> "1. " or "Q1. "
    l = l.replace(/^[Q|q][I|l|1][\.\:\)]\s*/, "Q1. ");
    l = l.replace(/^([0-9]+)\s*[\:\)]\s*/, "$1. ");

    // Normalize marks brackets e.g. "[ 3 marks ]" or "( 3 marks )" or "( 3 m )" -> "[3 marks]"
    l = l.replace(/[\[\(]\s*(\d+)\s*(?:marks?|m)\s*[\]\)]/gi, "[$1 marks]");
    l = l.replace(/\[\s*(\d+)\s*\]/g, "[$1 marks]");

    // Normalize options e.g. "( A )" or "A )" or "(A)" -> "A. "
    l = l.replace(/^\(?\s*([A-Da-d])\s*[\)\.]\s*/, "$1. ");

    cleanedLines.push(l);
  }

  return cleanedLines.join("\n").trim();
}

/**
 * Extracts text from an uploaded or dropped photo using the open-source Tesseract engine.
 */
export async function extractTextFromPhoto(
  imageSource: File | Blob | string,
  onProgress?: (percent: number, status: string) => void
): Promise<OcrResult> {
  const Tesseract = await import("tesseract.js");

  const worker = await Tesseract.createWorker("eng", 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        const percent = Math.min(100, Math.round(m.progress * 100));
        onProgress?.(percent, `Extracting printed text (${percent}%)...`);
      } else if (m.status) {
        onProgress?.(15, `Loading open-source Tesseract OCR engine (${m.status})...`);
      }
    },
  });

  try {
    const res = await worker.recognize(imageSource);
    const cleaned = cleanExtractedOcrText(res.data.text);
    return {
      text: cleaned,
      confidence: res.data.confidence,
    };
  } finally {
    await worker.terminate();
  }
}
