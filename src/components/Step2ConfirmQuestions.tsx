"use client";

import React, { useState } from "react";
import { Question, PaperMetadata } from "@/types/paper";
import {
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
} from "lucide-react";
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
    if (confirm("Are you sure you want to delete this question?")) {
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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-warm-200">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-navy-900 tracking-tight">
                2. Confirm Extracted Questions
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-100 text-teal-800">
                {questions.length} / 20 Questions
              </span>
            </div>
            <p className="text-xs text-navy-600 mt-1">
              Verify question wording, marks, and answer keys before running quality analysis.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleAddNewQuestion}
              disabled={questions.length >= 20}
              className="text-xs bg-navy-900 hover:bg-navy-800 text-white font-medium px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>

            <button
              type="button"
              onClick={onProceedToReview}
              disabled={questions.length === 0}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition disabled:opacity-50"
            >
              <span>Run Checks & Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Stats strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-warm-50 p-3.5 rounded-lg border border-warm-200 text-xs">
          <div>
            <span className="text-navy-500 block">Class & Subject:</span>
            <span className="font-semibold text-navy-900">
              {metadata.classGrade} — {metadata.subject}
            </span>
          </div>
          <div>
            <span className="text-navy-500 block">Expected Total Marks:</span>
            <span className="font-semibold text-navy-900">
              {metadata.expectedTotalMarks} marks
            </span>
          </div>
          <div>
            <span className="text-navy-500 block">Current Marks Sum:</span>
            <span
              className={`font-semibold ${
                allQuestionsHaveMarks && totalCalculatedMarks === metadata.expectedTotalMarks
                  ? "text-teal-700"
                  : "text-amber-700"
              }`}
            >
              {allQuestionsHaveMarks ? `${totalCalculatedMarks} marks` : "Unreliable (Missing marks)"}
            </span>
          </div>
          <div>
            <span className="text-navy-500 block">Answer Keys Present:</span>
            <span className="font-semibold text-navy-900">
              {questions.filter((q) => q.answerKey && q.answerKey.trim().length > 0).length} of{" "}
              {questions.length}
            </span>
          </div>
        </div>

        {/* Unsupported Features Alert */}
        {unsupportedFeatures.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold text-red-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Unsupported Feature Detected:</span>
            </div>
            {unsupportedFeatures.map((feat, idx) => (
              <p key={idx} className="pl-6 text-red-800 leading-relaxed">
                • {feat}
              </p>
            ))}
          </div>
        )}

        {/* Unparsed Text Alert - Never discard unparsed text! */}
        {unparsedLines.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-800">
              <HelpCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Unparsed Content Notice ({unparsedLines.length} line
                {unparsedLines.length > 1 ? "s" : ""})
              </span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              The following lines were not recognized as part of any question and were preserved so no content is discarded:
            </p>
            <div className="bg-white/80 p-2.5 rounded border border-amber-200 font-mono text-[11px] text-amber-950 max-h-36 overflow-y-auto space-y-1">
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
          <div className="mt-4 p-3 bg-warm-100 border border-warm-300 text-navy-800 rounded-lg text-xs space-y-1">
            <span className="font-semibold block text-navy-900">Parser Warnings:</span>
            {parseWarnings.map((w, idx) => (
              <p key={idx} className="text-navy-700">
                • {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-200 p-12 text-center shadow-xs">
          <FileQuestion className="w-12 h-12 text-navy-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No Questions Extracted</h3>
          <p className="text-xs text-navy-600 max-w-md mx-auto mt-1 mb-6">
            We could not parse any questions from your text. Please verify formatting in Step 1 or add questions manually.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onBackToAddPaper}
              className="px-4 py-2 border border-warm-300 text-navy-700 rounded-lg text-xs font-semibold hover:bg-warm-50"
            >
              Back to Add Paper
            </button>
            <button
              onClick={handleAddNewQuestion}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
            >
              Add First Question
            </button>
          </div>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-3">
          {questions.map((q) => {
            const hasMarks = q.marks !== null && Number.isInteger(q.marks) && q.marks > 0;
            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-warm-200 p-5 shadow-xs hover:border-navy-300 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-md bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
                      Q{q.number}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase ${
                            q.type === "mcq"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {q.type === "mcq" ? "MCQ" : "Short Answer"}
                        </span>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            hasMarks
                              ? "bg-teal-50 text-teal-800 border-teal-200"
                              : "bg-red-50 text-red-700 border-red-200 font-bold"
                          }`}
                        >
                          {hasMarks ? `${q.marks} Mark${q.marks! > 1 ? "s" : ""}` : "Missing Marks"}
                        </span>

                        {q.answerKey && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-warm-100 text-navy-800 border border-warm-200">
                            Key: <strong>{q.answerKey}</strong>
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-navy-900 mt-1 leading-relaxed">
                        {q.text || <span className="italic text-red-500">Empty question statement</span>}
                      </p>

                      {/* MCQ Options preview */}
                      {q.type === "mcq" && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded border flex items-center space-x-2 ${
                                q.answerKey &&
                                q.answerKey.trim().toUpperCase() === opt.label.toUpperCase()
                                  ? "bg-teal-50/70 border-teal-300 font-semibold text-teal-900"
                                  : "bg-warm-50 border-warm-200 text-navy-800"
                              }`}
                            >
                              <span className="w-5 text-center font-bold text-navy-600">
                                {opt.label}.
                              </span>
                              <span className="truncate">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Question Actions */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(q)}
                      className="p-1.5 text-navy-600 hover:text-navy-900 hover:bg-warm-100 rounded-lg transition"
                      title="Edit question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(q.id)}
                      className="p-1.5 text-navy-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-warm-200">
        <button
          type="button"
          onClick={onBackToAddPaper}
          className="px-4 py-2 border border-warm-300 text-navy-700 hover:bg-warm-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Add Paper</span>
        </button>

        <button
          type="button"
          onClick={onProceedToReview}
          disabled={questions.length === 0}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
        >
          <span>Confirm & Review Findings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
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

