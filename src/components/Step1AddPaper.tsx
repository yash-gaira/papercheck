"use client";

import React, { useState } from "react";
import { PaperMetadata, ClassGrade, ClassGradeValues } from "@/types/paper";
import { SAMPLE_DELIBERATE_ERRORS, SAMPLE_CLEAN, SamplePaper } from "@/lib/samples";

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
    <div className="space-y-8 step-fade-in">
      {/* Paper Surface Form Container */}
      <div className="bg-paper-surface border border-ink-rule p-6 sm:p-8 rounded-[3px] shadow-sheet">
        {/* Section Header & Sample Loaders */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-5 border-b border-ink-rule gap-3">
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary block">
              Section 01 / Intake
            </span>
            <h2 className="font-serif text-2xl text-ink font-semibold tracking-tight mt-0.5">
              Question Paper Details
            </h2>
          </div>

          {/* Understated Sample Paper Loaders */}
          <div className="flex items-baseline space-x-2 text-xs">
            <span className="font-mono text-[11px] text-ink-muted">Specimens:</span>
            <button
              type="button"
              onClick={() => onLoadSample(SAMPLE_DELIBERATE_ERRORS)}
              className="font-mono text-[11px] text-ink hover:text-redpen hover:border-redpen px-2 py-1 border border-ink-rule rounded-[2px] transition-colors"
            >
              Demo with Errors <span className="text-ink-muted">[6 Qs]</span>
            </button>
            <button
              type="button"
              onClick={() => onLoadSample(SAMPLE_CLEAN)}
              className="font-mono text-[11px] text-ink hover:text-pencil-green hover:border-pencil-green px-2 py-1 border border-ink-rule rounded-[2px] transition-colors"
            >
              Clean Sample <span className="text-ink-muted">[5 Qs]</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-redpen-faint border border-redpen-border text-redpen text-xs font-mono rounded-[2px] flex items-center space-x-2">
            <span className="font-bold">!</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Paper Metadata Fields */}
        <form onSubmit={handleNext} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Title (Underline style) */}
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Paper Title <span className="text-redpen">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) =>
                  onMetadataChange({ ...metadata, title: e.target.value })
                }
                placeholder="e.g. Periodic Assessment 1 — Mathematics"
                className="w-full pb-1.5 bg-transparent border-b border-ink-rule text-ink font-serif text-lg placeholder:text-ink-muted/50 focus-pen"
                required
              />
            </div>

            {/* Class Selector as Segmented Control */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Target Class <span className="text-redpen">*</span>
              </label>
              <div className="grid grid-cols-3 border border-ink-rule rounded-[2px] p-0.5 bg-paper-bg">
                {ClassGradeValues.map((cls) => {
                  const isSelected = metadata.classGrade === cls;
                  const classNum = cls.replace("Class ", "");
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => onMetadataChange({ ...metadata, classGrade: cls as ClassGrade })}
                      className={`py-1 text-center font-mono text-xs font-semibold rounded-[2px] transition-colors ${
                        isSelected
                          ? "bg-ink text-paper-surface shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Cl. {classNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Subject
              </label>
              <div className="pb-1.5 border-b border-ink-faint text-ink-muted font-mono text-xs pt-1">
                Mathematics <span className="text-[10px] text-ink-muted/70">(compulsory)</span>
              </div>
            </div>

            {/* Expected Total Marks */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Expected Total Marks <span className="text-redpen">*</span>
              </label>
              <div className="relative">
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
                  placeholder="20"
                  className="w-full pb-1.5 bg-transparent border-b border-ink-rule text-ink font-mono text-base focus-pen"
                  required
                />
                <span className="absolute right-0 bottom-1.5 font-mono text-[11px] text-ink-muted">
                  marks
                </span>
              </div>
            </div>

            {/* Time Allowed */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Time Allowed (Minutes)
              </label>
              <div className="relative">
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
                  placeholder="45"
                  className="w-full pb-1.5 bg-transparent border-b border-ink-rule text-ink font-mono text-base focus-pen"
                />
                <span className="absolute right-0 bottom-1.5 font-mono text-[11px] text-ink-muted">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Exam Specimen Format Guide */}
          <div className="border border-ink-rule rounded-[2px] p-4 bg-paper-bg/60">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-2 border-b border-ink-rule/60 gap-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                Format Specimen (Documented Syntax)
              </span>
              <span className="font-mono text-[10px] text-ink-secondary">
                Compulsory papers only &bull; Internal choices (OR) flagged
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-ink">
              <div className="p-2.5 bg-paper-surface border border-ink-faint rounded-[2px] space-y-1">
                <div className="flex justify-between text-ink-secondary text-[11px]">
                  <span>1. Calculate 3/4 + 1/4.</span>
                  <span className="text-ink font-bold">[3 marks]</span>
                </div>
                <div className="text-pencil-green font-medium">Answer: 1</div>
              </div>

              <div className="p-2.5 bg-paper-surface border border-ink-faint rounded-[2px] space-y-1">
                <div className="flex justify-between text-ink-secondary text-[11px]">
                  <span>2. Which of these is prime?</span>
                  <span className="text-ink font-bold">[3 marks]</span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-[11px] text-ink-muted">
                  <span>A. 2</span>
                  <span>B. 3</span>
                  <span>C. 4</span>
                  <span>D. 6</span>
                </div>
                <div className="text-pencil-green font-medium">Answer: A</div>
              </div>
            </div>
          </div>

          {/* Question Paper Textarea - Lined Paper Texture */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary">
                Question Paper Draft <span className="text-redpen">*</span>
              </label>
              {aiConfigured && onAIStructureAssist && (
                <button
                  type="button"
                  onClick={onAIStructureAssist}
                  disabled={isAIStructuring || !rawPaperText.trim()}
                  className="font-mono text-[10px] text-ink-secondary hover:text-ink underline disabled:opacity-40"
                >
                  {isAIStructuring ? "Structuring text..." : "AI assistant formatting"}
                </button>
              )}
            </div>

            <div className="border border-ink-rule rounded-[2px] overflow-hidden">
              <textarea
                rows={12}
                value={rawPaperText}
                onChange={(e) => onPaperTextChange(e.target.value)}
                placeholder="Paste question paper text here in the documented format..."
                className="w-full p-4 lined-paper font-mono text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:bg-paper-surface"
                required
              />
            </div>
          </div>

          {/* Standalone Answer Key Textarea */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary">
                Separate Answer Key <span className="text-ink-muted">(Optional)</span>
              </label>
              <span className="font-mono text-[10px] text-ink-muted">
                Leave blank if answers are provided inline
              </span>
            </div>
            <div className="border border-ink-rule rounded-[2px] overflow-hidden">
              <textarea
                rows={4}
                value={rawAnswerKeyText}
                onChange={(e) => onAnswerKeyTextChange(e.target.value)}
                placeholder="1. 1&#10;2. A&#10;3. 26 cm"
                className="w-full p-3.5 lined-paper font-mono text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:bg-paper-surface"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-ink-rule flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-ink hover:bg-black text-paper-surface font-mono text-xs font-semibold rounded-[2px] transition-colors focus:ring-2 focus:ring-redpen"
            >
              Confirm Extracted Questions &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
