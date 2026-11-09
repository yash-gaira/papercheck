"use client";

import React, { useState } from "react";
import { PaperMetadata, ClassGrade, ClassGradeValues } from "@/types/paper";
import { SAMPLE_DELIBERATE_ERRORS, SAMPLE_CLEAN, SamplePaper } from "@/lib/samples";
import { Sparkles, ArrowRight, BookOpen, AlertTriangle } from "lucide-react";

interface Step1AddPaperProps {
  metadata: PaperMetadata;
  rawPaperText: string;
  rawAnswerKeyText: string;
  aiConfigured: boolean;
  onMetadataChange: (meta: PaperMetadata) => void;
  onPaperTextChange: (text: string) => void;
  onAnswerKeyTextChange: (text: string) => void;
  onContinue: () => void;
  onLoadSample: (sample: SamplePaper) => void;
  onAIStructureAssist?: () => Promise<void>;
  isAIStructuring?: boolean;
}

export const Step1AddPaper: React.FC<Step1AddPaperProps> = ({
  metadata,
  rawPaperText,
  rawAnswerKeyText,
  aiConfigured,
  onMetadataChange,
  onPaperTextChange,
  onAnswerKeyTextChange,
  onContinue,
  onLoadSample,
  onAIStructureAssist,
  isAIStructuring = false,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata.title.trim()) {
      setErrorMsg("Please enter a title for the question paper.");
      return;
    }
    if (!metadata.expectedTotalMarks || metadata.expectedTotalMarks <= 0) {
      setErrorMsg("Please provide a valid positive integer for Expected Total Marks.");
      return;
    }
    if (!rawPaperText.trim()) {
      setErrorMsg("Please paste or enter the question paper text.");
      return;
    }
    setErrorMsg(null);
    onContinue();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Title & Quick Demo Loader Banner */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-warm-200">
          <div>
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">
              1. Add Question Paper
            </h2>
            <p className="text-xs text-navy-600 mt-1">
              Provide paper details and paste your drafted questions or choose a sample to inspect.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-navy-700">Quick Samples:</span>
            <button
              type="button"
              onClick={() => onLoadSample(SAMPLE_DELIBERATE_ERRORS)}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-medium px-3 py-1.5 rounded-lg transition"
            >
              Demo with Errors (6 Qs)
            </button>
            <button
              type="button"
              onClick={() => onLoadSample(SAMPLE_CLEAN)}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-medium px-3 py-1.5 rounded-lg transition"
            >
              Clean Sample (5 Qs)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Paper Metadata Fields */}
        <form onSubmit={handleNext} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Paper Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) =>
                  onMetadataChange({ ...metadata, title: e.target.value })
                }
                placeholder="e.g. Periodic Assessment 1 — Mathematics"
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Target Class <span className="text-red-500">*</span>
              </label>
              <select
                value={metadata.classGrade}
                onChange={(e) =>
                  onMetadataChange({
                    ...metadata,
                    classGrade: e.target.value as ClassGrade,
                  })
                }
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              >
                {ClassGradeValues.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Subject
              </label>
              <input
                type="text"
                value="Mathematics (Fixed for MVP)"
                disabled
                className="w-full px-3 py-2 border border-warm-200 bg-warm-100 text-navy-500 rounded-lg text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Expected Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={metadata.expectedTotalMarks || ""}
                onChange={(e) =>
                  onMetadataChange({
                    ...metadata,
                    expectedTotalMarks: parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="e.g. 20"
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">
                Time Allowed (Minutes)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                value={metadata.timeAllowedMinutes || ""}
                onChange={(e) =>
                  onMetadataChange({
                    ...metadata,
                    timeAllowedMinutes: parseInt(e.target.value, 10) || undefined,
                  })
                }
                placeholder="e.g. 45"
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Format Documentation Box */}
          <div className="bg-navy-50/70 border border-navy-100 rounded-lg p-4 text-xs text-navy-800">
            <div className="flex items-center space-x-2 font-semibold text-navy-900 mb-2">
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span>Documented Input Format</span>
            </div>
            <p className="mb-2 text-navy-700">
              Paste questions formatted with question numbers, marks in brackets (e.g. <code>[3 marks]</code>), and optional answer keys:
            </p>
            <div className="bg-white border border-navy-200 rounded p-3 font-mono text-[11px] text-navy-950 overflow-x-auto">
              <div>1. Calculate 3/4 + 1/4. [3 marks]</div>
              <div>Answer: 1</div>
              <div className="mt-2">2. Which of these is a prime number? [3 marks]</div>
              <div>A. 2</div>
              <div>B. 3</div>
              <div>C. 4</div>
              <div>D. 6</div>
              <div>Answer: A</div>
            </div>
            <div className="mt-2.5 flex items-start space-x-2 text-navy-600">
              <span className="font-semibold text-teal-800">Compulsory Papers:</span>
              <span>
                Every question is required. Internal choices (like &ldquo;OR&rdquo; / &ldquo;Attempt any 5&rdquo;) and negative marks are flagged as unsupported.
              </span>
            </div>
          </div>

          {/* Text Area for Question Paper Text */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-navy-800">
                Question Paper Text <span className="text-red-500">*</span>
              </label>
              {aiConfigured && onAIStructureAssist && (
                <button
                  type="button"
                  onClick={onAIStructureAssist}
                  disabled={isAIStructuring || !rawPaperText.trim()}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center space-x-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {isAIStructuring
                      ? "AI Structuring..."
                      : "Try AI Structuring Assistant"}
                  </span>
                </button>
              )}
            </div>
            <textarea
              rows={12}
              value={rawPaperText}
              onChange={(e) => onPaperTextChange(e.target.value)}
              placeholder="Paste questions here in the documented format..."
              className="w-full p-3 border border-warm-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
              required
            />
          </div>

          {/* Optional Standalone Answer Key Text */}
          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">
              Separate Answer Key (Optional)
            </label>
            <p className="text-xs text-navy-500 mb-1">
              Leave blank if answers are included inline with questions, or paste separate answers below (e.g. &ldquo;1. A\n2. 26 cm&rdquo;).
            </p>
            <textarea
              rows={4}
              value={rawAnswerKeyText}
              onChange={(e) => onAnswerKeyTextChange(e.target.value)}
              placeholder="1. 1&#10;2. A&#10;3. 26 cm"
              className="w-full p-3 border border-warm-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          {/* Action button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition"
            >
              <span>Confirm Extracted Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

