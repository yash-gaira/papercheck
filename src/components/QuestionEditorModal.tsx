"use client";

import React, { useState, useEffect } from "react";
import { Question, QuestionOption } from "@/types/paper";

interface QuestionEditorModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Question) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
}) => {
  const [number, setNumber] = useState<number>(1);
  const [text, setText] = useState<string>("");
  const [marks, setMarks] = useState<string>("3");
  const [type, setType] = useState<"mcq" | "short_answer">("short_answer");
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [answerKey, setAnswerKey] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setNumber(question.number);
      setText(question.text);
      setMarks(question.marks !== null ? String(question.marks) : "");
      setType(question.type);
      setOptions(question.options ? [...question.options] : []);
      setAnswerKey(question.answerKey || "");
      setErrorMsg(null);
    }
  }, [question, isOpen]);

  if (!isOpen || !question) return null;

  const handleAddOption = () => {
    const nextChar = String.fromCharCode(65 + options.length);
    setOptions([...options, { label: nextChar, text: "" }]);
  };

  const handleOptionChange = (index: number, newText: string) => {
    const copy = [...options];
    copy[index].text = newText;
    setOptions(copy);
  };

  const handleOptionLabelChange = (index: number, newLabel: string) => {
    const copy = [...options];
    copy[index].label = newLabel.toUpperCase();
    setOptions(copy);
  };

  const handleRemoveOption = (index: number) => {
    const filtered = options.filter((_, i) => i !== index);
    setOptions(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Question text cannot be empty.");
      return;
    }

    let parsedMarks: number | null = null;
    if (marks.trim()) {
      const parsed = parseInt(marks, 10);
      if (isNaN(parsed) || parsed <= 0) {
        setErrorMsg("Marks must be a positive whole integer (e.g. 1, 2, 3, 4).");
        return;
      }
      parsedMarks = parsed;
    }

    if (type === "mcq") {
      if (options.length < 2) {
        setErrorMsg("Multiple Choice Questions require at least 2 options.");
        return;
      }
      for (const opt of options) {
        if (!opt.text.trim()) {
          setErrorMsg("All option choices must have text.");
          return;
        }
      }
    }

    const updated: Question = {
      ...question,
      number,
      text: text.trim(),
      marks: parsedMarks,
      type,
      options: type === "mcq" ? options : [],
      answerKey: answerKey.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-[1px]">
      <div className="bg-paper-surface rounded-[3px] max-w-2xl w-full p-6 sm:p-8 shadow-sheet-lifted border border-ink-rule text-ink my-8">
        <div className="flex justify-between items-baseline pb-3 border-b border-ink-rule">
          <div>
            <span className="font-mono text-[10px] tracking-wider uppercase text-ink-secondary block">
              Question Editor &bull; ID: {question.id}
            </span>
            <h3 className="font-serif text-xl font-semibold text-ink">
              Edit Question {question.number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-ink-secondary hover:text-ink px-2 py-0.5 border border-ink-rule rounded-[2px]"
          >
            Cancel [esc]
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-redpen-faint border border-redpen-border text-redpen rounded-[2px] font-mono text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1">
                Display Number
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full pb-1 bg-transparent border-b border-ink-rule font-mono text-sm text-ink focus-pen"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1">
                Marks (Positive Int)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="3"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full pb-1 bg-transparent border-b border-ink-rule font-mono text-sm text-ink focus-pen"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1">
                Question Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "mcq" | "short_answer")}
                className="w-full py-1 bg-paper-bg border border-ink-rule font-mono text-xs text-ink rounded-[2px] focus:outline-none"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1">
              Question Statement
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 bg-paper-bg border border-ink-rule font-serif text-base text-ink focus:bg-paper-surface focus-pen rounded-[2px]"
              placeholder="Enter question statement..."
              required
            />
          </div>

          {type === "mcq" && (
            <div className="bg-paper-bg p-4 border border-ink-rule rounded-[2px] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[10px] uppercase tracking-wider text-ink">
                  MCQ Choices ({options.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-ink hover:underline text-[11px]"
                >
                  + Add Choice
                </button>
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                    className="w-10 text-center font-bold py-1 border border-ink-rule bg-paper-surface rounded-[2px] uppercase text-xs"
                    maxLength={3}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${opt.label} text`}
                    className="flex-1 px-2.5 py-1 border border-ink-rule bg-paper-surface rounded-[2px] text-xs focus-pen"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-ink-muted hover:text-redpen text-[11px] px-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-secondary mb-1">
              Answer Key (Optional)
            </label>
            <input
              type="text"
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              placeholder={type === "mcq" ? "e.g. A" : "e.g. 26 cm"}
              className="w-full pb-1 bg-transparent border-b border-ink-rule font-mono text-sm text-ink focus-pen"
            />
          </div>

          <div className="pt-4 border-t border-ink-rule flex justify-end space-x-2 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-ink-rule text-ink-secondary hover:text-ink rounded-[2px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-ink text-paper-surface hover:bg-black rounded-[2px] font-semibold"
            >
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
