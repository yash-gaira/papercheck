"use client";

import React, { useState } from "react";
import { Question, PaperMetadata } from "@/types/paper";
import { QuestionEditorModal } from "./QuestionEditorModal";

interface Step2ConfirmQuestionsProps {
  questions: Question[];
  metadata: PaperMetadata;
  unparsedLines: string[];
  unsupportedFeatures: string[];
  parseWarnings: string[];
  onQuestionsChange: (questions: Question[]) => void;
  onProceedToReview: () => void;
  onBackToAddPaper: () => void;
}

export const Step2ConfirmQuestions: React.FC<Step2ConfirmQuestionsProps> = ({
  questions,
  metadata,
  unparsedLines,
  unsupportedFeatures,
  parseWarnings,
  onQuestionsChange,
  onProceedToReview,
  onBackToAddPaper,
}) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalCalculatedMarks = questions.reduce(
    (acc, q) => acc + (q.marks !== null && Number.isInteger(q.marks) ? q.marks : 0),
    0
  );
  const allQuestionsHaveMarks = questions.every(
    (q) => q.marks !== null && Number.isInteger(q.marks) && q.marks > 0
  );

  const handleEditClick = (q: Question) => {
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (updated: Question) => {
    const updatedList = questions.map((q) => (q.id === updated.id ? updated : q));
    onQuestionsChange(updatedList);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Remove this question from the paper?")) {
      const updatedList = questions.filter((q) => q.id !== id);
      onQuestionsChange(updatedList);
    }
  };

  const handleAddNewQuestion = () => {
    if (questions.length >= 20) {
      alert("Maximum limit of 20 questions reached for this MVP.");
      return;
    }
    const nextNum = questions.length > 0 ? Math.max(...questions.map((q) => q.number)) + 1 : 1;
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      number: nextNum,
      text: "",
      type: "short_answer",
      marks: 3,
      options: [],
    };
    setEditingQuestion(newQ);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 step-fade-in">
      {/* Paper Surface Container */}
      <div className="bg-paper-surface border border-ink-rule rounded-[3px] p-6 sm:p-8 shadow-sheet">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between pb-5 border-b border-ink-rule gap-3">
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">
                Section 02 / Verification
              </span>
              <span className="font-mono text-xs text-ink-secondary">
                [{questions.length} of 20 Qs]
              </span>
            </div>
            <h2 className="font-serif text-2xl text-ink font-semibold tracking-tight mt-0.5">
              Confirm Extracted Questions
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAddNewQuestion}
              disabled={questions.length >= 20}
              className="font-mono text-xs px-3 py-1.5 border border-ink-rule hover:border-ink rounded-[2px] text-ink transition-colors disabled:opacity-40"
            >
              + Add Question
            </button>
            <button
              type="button"
              onClick={onProceedToReview}
              disabled={questions.length === 0}
              className="font-mono text-xs font-semibold px-4 py-1.5 bg-ink text-paper-surface hover:bg-black rounded-[2px] transition-colors disabled:opacity-40 focus:ring-2 focus:ring-redpen"
            >
              Run Checks &amp; Review &rarr;
            </button>
          </div>
        </div>

        {/* Paper Stats Margin Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 px-4 bg-paper-bg border border-ink-rule/80 rounded-[2px] font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Class &amp; Subject</span>
            <span className="font-semibold text-ink">
              {metadata.classGrade} &bull; {metadata.subject}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Expected Marks</span>
            <span className="font-semibold text-ink">{metadata.expectedTotalMarks} marks</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Current Marks Sum</span>
            <span
              className={`font-semibold ${
                allQuestionsHaveMarks && totalCalculatedMarks === metadata.expectedTotalMarks
                  ? "text-pencil-green"
                  : "text-redpen"
              }`}
            >
              {allQuestionsHaveMarks ? `${totalCalculatedMarks} marks` : "Unreliable (Missing marks)"}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Answer Keys</span>
            <span className="font-semibold text-ink">
              {questions.filter((q) => q.answerKey && q.answerKey.trim().length > 0).length} of{" "}
              {questions.length} provided
            </span>
          </div>
        </div>

        {/* Unsupported Features Alert */}
        {unsupportedFeatures.length > 0 && (
          <div className="mt-4 p-4 border border-redpen-border bg-redpen-faint text-redpen text-xs rounded-[2px] space-y-1 font-mono">
            <span className="font-bold block">[Unsupported Feature Detected]</span>
            {unsupportedFeatures.map((feat, idx) => (
              <p key={idx}>&bull; {feat}</p>
            ))}
          </div>
        )}

        {/* Unparsed Lines Banner */}
        {unparsedLines.length > 0 && (
          <div className="mt-4 p-4 border border-ink-rule bg-paper-bg text-ink-secondary text-xs rounded-[2px] space-y-2">
            <span className="font-mono text-[11px] font-bold text-ink block">
              Unparsed Content Notice ({unparsedLines.length} line
              {unparsedLines.length > 1 ? "s" : ""}):
            </span>
            <p className="text-[11px]">
              The following lines were not identified as standard question text and have been preserved:
            </p>
            <div className="p-2.5 bg-paper-surface border border-ink-faint font-mono text-[11px] text-ink-secondary max-h-32 overflow-y-auto space-y-1">
              {unparsedLines.map((line, idx) => (
                <div key={idx} className="truncate">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parse Warnings */}
        {parseWarnings.length > 0 && (
          <div className="mt-4 p-3 border border-ink-rule/80 bg-paper-bg text-ink text-xs font-mono rounded-[2px] space-y-1">
            <span className="font-bold text-ink-secondary block">Parser Notices:</span>
            {parseWarnings.map((w, idx) => (
              <p key={idx}>&bull; {w}</p>
            ))}
          </div>
        )}

        {/* Empty state */}
        {questions.length === 0 ? (
          <div className="mt-8 py-12 text-center border border-dashed border-ink-rule rounded-[2px]">
            <h3 className="font-serif text-lg text-ink font-semibold">No questions extracted</h3>
            <p className="font-mono text-xs text-ink-muted mt-1 mb-4">
              Return to Step 1 to verify text or add questions manually.
            </p>
            <button
              onClick={onBackToAddPaper}
              className="px-4 py-2 border border-ink text-ink font-mono text-xs rounded-[2px]"
            >
              &larr; Back to Add Paper
            </button>
          </div>
        ) : (
          /* Printed Exam Sheet Rows */
          <div className="mt-6 divide-y divide-ink-rule border-y border-ink-rule">
            {questions.map((q, idx) => {
              const hasMarks = q.marks !== null && Number.isInteger(q.marks) && q.marks > 0;
              const prevQ = idx > 0 ? questions[idx - 1] : null;
              const showSectionHeader = q.section && (!prevQ || prevQ.section !== q.section);

              return (
                <React.Fragment key={q.id}>
                  {showSectionHeader && (
                    <div className="py-2 px-3 bg-paper-bg border-b border-ink-rule">
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-ink">
                        {q.section}
                      </span>
                    </div>
                  )}
                  <div
                    className="py-4 px-2 hover:bg-paper-bg/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    {/* Left: Number + statement + options */}
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="font-mono text-xs font-bold text-ink min-w-[28px] pt-0.5">
                        Q{q.number}.
                      </span>

                      <div className="flex-1 space-y-2">
                        <p className="font-serif text-base text-ink leading-snug">
                          {q.text || <span className="italic text-redpen">Empty statement</span>}
                        </p>

                        {/* Sub-parts for case-based / senior questions */}
                        {q.subParts && q.subParts.length > 0 && (
                          <div className="pl-3 border-l-2 border-ink-rule/80 space-y-1.5 my-2 font-serif text-sm text-ink">
                            {q.subParts.map((sp, sIdx) => (
                              <div key={sIdx} className="flex justify-between items-baseline gap-2">
                                <div>
                                  <span className="font-mono font-bold text-xs mr-1.5 text-ink-secondary">
                                    {sp.label}
                                  </span>
                                  <span>{sp.text}</span>
                                </div>
                                {sp.marks !== null && sp.marks !== undefined && (
                                  <span className="font-mono text-xs text-ink-muted flex-shrink-0">
                                    [{sp.marks} mark{sp.marks > 1 ? "s" : ""}]
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* MCQ Options display */}
                        {q.type === "mcq" && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs text-ink-secondary">
                            {q.options.map((opt) => (
                              <div
                                key={opt.label}
                                className={`p-1.5 border rounded-[2px] flex items-center space-x-1.5 ${
                                  q.answerKey &&
                                  q.answerKey.trim().toUpperCase() === opt.label.toUpperCase()
                                    ? "border-pencil-green bg-pencil-faint text-pencil-green font-semibold"
                                    : "border-ink-faint bg-paper-surface"
                                }`}
                              >
                                <span className="font-bold">({opt.label})</span>
                                <span className="truncate">{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Question meta badges */}
                        <div className="flex items-center space-x-3 font-mono text-[10px] text-ink-muted pt-1">
                          <span className="uppercase">
                            Type: {q.type === "mcq" ? "MCQ" : "Short Answer"}
                          </span>
                          {q.answerKey && (
                            <span className="text-pencil-green font-semibold">
                              Key: {q.answerKey}
                            </span>
                          )}
                          {q.section && (
                            <span className="text-ink-secondary">
                              Section: {q.section}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Marks in brackets + actions */}
                    <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-2 pt-1 pl-9 md:pl-0 flex-shrink-0">
                      <span
                        className={`font-mono text-xs font-bold ${
                          hasMarks ? "text-ink" : "text-redpen"
                        }`}
                      >
                        [{hasMarks ? `${q.marks} mark${q.marks! > 1 ? "s" : ""}` : "Missing marks"}]
                      </span>

                      <div className="flex items-center space-x-2 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleEditClick(q)}
                          className="text-ink-secondary hover:text-ink hover:underline"
                        >
                          [edit]
                        </button>
                        <span className="text-ink-muted">&bull;</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(q.id)}
                          className="text-ink-secondary hover:text-redpen hover:underline"
                        >
                          [remove]
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Navigation Row */}
        <div className="mt-8 pt-4 border-t border-ink-rule flex justify-between items-center">
          <button
            type="button"
            onClick={onBackToAddPaper}
            className="font-mono text-xs text-ink-secondary hover:text-ink"
          >
            &larr; Back to Add Paper
          </button>

          <button
            type="button"
            onClick={onProceedToReview}
            disabled={questions.length === 0}
            className="px-6 py-2.5 bg-ink hover:bg-black text-paper-surface font-mono text-xs font-semibold rounded-[2px] transition-colors disabled:opacity-40 focus:ring-2 focus:ring-redpen"
          >
            Run Checks &amp; Review &rarr;
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      <QuestionEditorModal
        question={editingQuestion}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />
    </div>
  );
};
