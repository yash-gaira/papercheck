"use client";

import React, { useState } from "react";
import {
  PaperMetadata,
  ClassGrade,
  ClassGradeValues,
  Subject,
  SubjectValues,
  ScienceSubSubject,
  ScienceSubSubjectValues,
} from "@/types/paper";
import {
  SAMPLE_CLEAN,
  SAMPLE_DELIBERATE_ERRORS,
  SAMPLE_SCIENCE_CLEAN,
  SAMPLE_SCIENCE_ERRORS,
  ALL_SAMPLES,
  SamplePaper,
} from "@/lib/samples";
import { getClassFormatSpecimen } from "@/lib/classExamples";
import { DropZoneUploader } from "./DropZoneUploader";

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
  const [showAllSamplesModal, setShowAllSamplesModal] = useState<boolean>(false);

  const isSeniorClass =
    metadata.classGrade === "Class 11" || metadata.classGrade === "Class 12";

  const specimen = getClassFormatSpecimen(metadata.classGrade, metadata.subject);

  const handleTextLoaded = (text: string, mode: "replace" | "append") => {
    if (mode === "append" && rawPaperText.trim()) {
      onPaperTextChange(`${rawPaperText.trim()}\n\n${text.trim()}`);
    } else {
      onPaperTextChange(text.trim());
    }
  };

  const handleDropOnTextarea = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const textData = e.dataTransfer.getData("text/plain");
    if (textData && textData.trim()) {
      e.preventDefault();
      handleTextLoaded(textData, "append");
    }
  };

  const handleAnswerKeyLoaded = (text: string, mode: "replace" | "append") => {
    if (mode === "append" && rawAnswerKeyText.trim()) {
      onAnswerKeyTextChange(`${rawAnswerKeyText.trim()}\n${text.trim()}`);
    } else {
      onAnswerKeyTextChange(text.trim());
    }
  };

  const handleDropOnAnswerKeyTextarea = (
    e: React.DragEvent<HTMLTextAreaElement>
  ) => {
    const textData = e.dataTransfer.getData("text/plain");
    if (textData && textData.trim()) {
      e.preventDefault();
      handleAnswerKeyLoaded(textData, "append");
    }
  };

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
        {/* Clean Header & Simplified Demo Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-ink-rule gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink font-semibold tracking-tight">
              Question Paper Details
            </h2>
            <p className="font-sans text-xs text-ink-secondary mt-0.5">
              Set exam metadata or test with pre-built curriculum sample papers.
            </p>
          </div>

          {/* Clean Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                const sample =
                  metadata.subject === "Science"
                    ? SAMPLE_SCIENCE_CLEAN
                    : SAMPLE_CLEAN;
                onLoadSample(sample);
              }}
              className="font-mono text-[11px] text-pencil-green bg-pencil-faint/60 hover:bg-pencil-faint border border-pencil-border px-2.5 py-1 rounded-[2px] transition-colors font-medium"
              title="Load a verified clean question paper without errors"
            >
              Load Clean Sample
            </button>

            <button
              type="button"
              onClick={() => {
                const sample =
                  metadata.subject === "Science"
                    ? SAMPLE_SCIENCE_ERRORS
                    : SAMPLE_DELIBERATE_ERRORS;
                onLoadSample(sample);
              }}
              className="font-mono text-[11px] text-redpen bg-redpen-faint/60 hover:bg-redpen-faint border border-redpen-border px-2.5 py-1 rounded-[2px] transition-colors font-medium"
              title="Load a paper with deliberate marks mismatch and duplicate questions"
            >
              Load Sample with Errors
            </button>

            <button
              type="button"
              onClick={() => setShowAllSamplesModal(true)}
              className="font-mono text-[11px] text-ink-secondary hover:text-ink border border-ink-rule hover:border-ink px-2 py-1 rounded-[2px] transition-colors"
            >
              Browse all samples &rarr;
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
            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Target Class <span className="text-redpen">*</span>
              </label>
              <div className="flex sm:grid sm:grid-cols-7 overflow-x-auto no-scrollbar border border-ink-rule rounded-[2px] p-0.5 bg-paper-bg gap-0.5">
                {ClassGradeValues.map((cls) => {
                  const isSelected = metadata.classGrade === cls;
                  const classNum = cls.replace("Class ", "");
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        const newMeta: PaperMetadata = {
                          ...metadata,
                          classGrade: cls as ClassGrade,
                        };
                        // Clear subSubject if changing out of 11-12
                        if (cls !== "Class 11" && cls !== "Class 12") {
                          delete newMeta.subSubject;
                        }
                        onMetadataChange(newMeta);
                      }}
                      className={`min-w-[42px] py-1 text-center font-mono text-xs font-semibold rounded-[2px] transition-colors ${
                        isSelected
                          ? "bg-ink text-paper-surface shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      {classNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Segmented Control */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                Subject <span className="text-redpen">*</span>
              </label>
              <div className="grid grid-cols-2 border border-ink-rule rounded-[2px] p-0.5 bg-paper-bg">
                {SubjectValues.map((sub) => {
                  const isSelected = metadata.subject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        const newMeta: PaperMetadata = {
                          ...metadata,
                          subject: sub as Subject,
                        };
                        if (sub === "Science" && isSeniorClass && !newMeta.subSubject) {
                          newMeta.subSubject = "Physics";
                        } else if (sub === "Mathematics") {
                          delete newMeta.subSubject;
                        }
                        onMetadataChange(newMeta);
                      }}
                      className={`py-1 text-center font-mono text-xs font-semibold rounded-[2px] transition-colors ${
                        isSelected
                          ? "bg-ink text-paper-surface shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Science Sub-subject for Class 11-12 */}
            {metadata.subject === "Science" && isSeniorClass ? (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                  Discipline <span className="text-redpen">*</span>
                </label>
                <div className="grid grid-cols-3 border border-ink-rule rounded-[2px] p-0.5 bg-paper-bg">
                  {ScienceSubSubjectValues.map((sub) => {
                    const isSelected = (metadata.subSubject || "Physics") === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() =>
                          onMetadataChange({
                            ...metadata,
                            subSubject: sub as ScienceSubSubject,
                          })
                        }
                        className={`py-1 text-center font-mono text-[11px] font-semibold rounded-[2px] transition-colors ${
                          isSelected
                            ? "bg-ink text-paper-surface shadow-xs"
                            : "text-ink-secondary hover:text-ink"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1.5">
                  Curriculum Scope
                </label>
                <div className="pb-1.5 border-b border-ink-faint text-ink-muted font-mono text-xs pt-1 truncate">
                  {metadata.subject} &bull; Compulsory
                </div>
              </div>
            )}

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

          {/* Exam Specimen Format Guide (Collapsible) */}
          <details className="group border border-ink-rule rounded-[2px] bg-paper-bg/40 text-xs">
            <summary className="cursor-pointer list-none p-3 flex items-center justify-between font-mono text-[11px] text-ink-secondary hover:text-ink select-none">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-ink">
                  Format Guidelines &amp; Specimen ({specimen.badge})
                </span>
                <span className="text-ink-muted hidden sm:inline">
                  &bull; {specimen.topicNote}
                </span>
              </div>
              <span className="text-[10px] text-ink-muted group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>

            <div className="px-3 pb-3 pt-1 border-t border-ink-rule/40 space-y-3 font-mono">
              <div className="text-[10.5px] text-ink-secondary">
                Recommended layout for {metadata.classGrade} {metadata.subject} (Case sub-parts &amp; MCQs supported):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink">
                {/* Question 1 Example (Short Answer / Calculation) */}
                <div className="p-2.5 bg-paper-surface border border-ink-faint rounded-[2px] space-y-1">
                  <div className="flex justify-between text-ink-secondary text-[11px] gap-2">
                    <span>1. {specimen.q1.statement}</span>
                    <span className="text-ink font-bold flex-shrink-0">
                      [{specimen.q1.marks} mark{specimen.q1.marks > 1 ? "s" : ""}]
                    </span>
                  </div>
                  <div className="text-pencil-green font-medium">
                    Answer: {specimen.q1.answerKey}
                  </div>
                  <div className="text-[10px] text-ink-muted">
                    {specimen.q1.guideline}
                  </div>
                </div>

                {/* Question 2 Example (Single-Answer MCQ) */}
                <div className="p-2.5 bg-paper-surface border border-ink-faint rounded-[2px] space-y-1">
                  <div className="flex justify-between text-ink-secondary text-[11px] gap-2">
                    <span>2. {specimen.q2.statement}</span>
                    <span className="text-ink font-bold flex-shrink-0">
                      [{specimen.q2.marks} mark{specimen.q2.marks > 1 ? "s" : ""}]
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[11px] text-ink-muted">
                    {specimen.q2.options.map((opt) => (
                      <span key={opt.label}>
                        {opt.label}. {opt.text}
                      </span>
                    ))}
                  </div>
                  <div className="text-pencil-green font-medium">
                    Answer: {specimen.q2.answerKey}
                  </div>
                  <div className="text-[10px] text-ink-muted">
                    {specimen.q2.guideline}
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Custom Text Dropzone & Open-Source Photo-to-Text OCR */}
          <div>
            <div className="mb-1.5 flex justify-between items-baseline">
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary">
                Upload or Drop Question Paper (Text or Photo)
              </label>
              <span className="font-mono text-[10px] text-ink-muted">
                Open-source OCR &bull; Privacy protected
              </span>
            </div>
            <DropZoneUploader
              onTextLoaded={handleTextLoaded}
              hasExistingText={Boolean(rawPaperText.trim())}
              disabled={isAIStructuring}
            />
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
                onDrop={handleDropOnTextarea}
                placeholder="Paste question paper text here, drag & drop a file, or upload a photo of the printed paper above..."
                className="w-full p-4 lined-paper font-mono text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:bg-paper-surface"
                required
              />
            </div>
          </div>

          {/* Standalone Answer Key Textarea & Drag & Drop Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary">
                Separate Answer Key <span className="text-ink-muted">(Optional)</span>
              </label>
              <span className="font-mono text-[10px] text-ink-muted">
                Leave blank if answers are provided inline
              </span>
            </div>

            {/* Answer Key Drag & Drop Box */}
            <DropZoneUploader
              onTextLoaded={handleAnswerKeyLoaded}
              hasExistingText={Boolean(rawAnswerKeyText.trim())}
              disabled={isAIStructuring}
              label="Drag & drop answer key document or photo"
              sublabel="Extracts numerical and MCQ answer keys (e.g. 1. A, 2. 26 cm) using Tesseract OCR"
              buttonText="Browse Answer Key"
              targetName="key"
            />

            <div className="border border-ink-rule rounded-[2px] overflow-hidden">
              <textarea
                rows={4}
                value={rawAnswerKeyText}
                onChange={(e) => onAnswerKeyTextChange(e.target.value)}
                onDrop={handleDropOnAnswerKeyTextarea}
                placeholder="1. 1&#10;2. A&#10;3. 26 cm&#10;(Or drag & drop an answer key file or photo above)"
                className="w-full p-3.5 lined-paper font-mono text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:bg-paper-surface"
              />
            </div>
          </div>

          {/* Primary Action Focal Point */}
          <div className="pt-6 border-t border-ink-rule flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-ink-secondary font-mono">
              In-memory evaluation &bull; Supports inline &amp; separate answer keys
            </span>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-ink hover:bg-black text-paper-surface font-sans text-sm font-semibold tracking-tight rounded-[3px] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-redpen/60 cursor-pointer"
            >
              Confirm Extracted Questions &rarr;
            </button>
          </div>
        </form>
      </div>

      {/* Secondary Browse All Samples Modal */}
      {showAllSamplesModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]"
        >
          <div className="bg-paper-surface text-ink max-w-2xl w-full p-6 border border-ink-rule shadow-sheet-lifted rounded-[3px] max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-baseline pb-3 border-b border-ink-rule">
              <div>
                <h3 className="font-serif text-xl font-semibold text-ink">
                  Browse Curriculum Sample Papers
                </h3>
                <p className="font-sans text-xs text-ink-secondary mt-0.5">
                  Pre-configured CBSE/State syllabus papers across Classes 6–12.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllSamplesModal(false)}
                className="font-mono text-xs text-ink-secondary hover:text-ink px-2 py-1 border border-ink-rule rounded-[2px]"
              >
                Close [esc]
              </button>
            </div>

            <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
              {/* Mathematics Group */}
              <div>
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-ink-secondary block mb-2">
                  Mathematics (Classes 6–12)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_SAMPLES.filter((s) => s.metadata.subject === "Mathematics").map(
                    (sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          onLoadSample(sample);
                          setShowAllSamplesModal(false);
                        }}
                        className="text-left p-2.5 border border-ink-rule hover:border-ink bg-paper-bg/50 hover:bg-paper-bg rounded-[2px] transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10.5px] font-semibold text-ink">
                            {sample.metadata.classGrade}
                          </span>
                          {sample.isClean ? (
                            <span className="font-mono text-[9px] text-pencil-green uppercase font-semibold">
                              Clean
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-redpen uppercase font-semibold">
                              Errors
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-sm text-ink font-medium mt-0.5 truncate">
                          {sample.metadata.title}
                        </p>
                        <p className="font-sans text-[11px] text-ink-secondary line-clamp-1 mt-0.5">
                          {sample.description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Science Group */}
              <div className="pt-2">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-ink-secondary block mb-2">
                  Science (Classes 6–12)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_SAMPLES.filter((s) => s.metadata.subject === "Science").map(
                    (sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          onLoadSample(sample);
                          setShowAllSamplesModal(false);
                        }}
                        className="text-left p-2.5 border border-ink-rule hover:border-ink bg-paper-bg/50 hover:bg-paper-bg rounded-[2px] transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10.5px] font-semibold text-ink">
                            {sample.metadata.classGrade}
                            {sample.metadata.subSubject
                              ? ` (${sample.metadata.subSubject})`
                              : ""}
                          </span>
                          {sample.isClean ? (
                            <span className="font-mono text-[9px] text-pencil-green uppercase font-semibold">
                              Clean
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] text-redpen uppercase font-semibold">
                              Errors
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-sm text-ink font-medium mt-0.5 truncate">
                          {sample.metadata.title}
                        </p>
                        <p className="font-sans text-[11px] text-ink-secondary line-clamp-1 mt-0.5">
                          {sample.description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
