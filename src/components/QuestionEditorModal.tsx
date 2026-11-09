"use client";

import React, { useState, useEffect } from "react";
import { Question, QuestionOption } from "@/types/paper";
import { Plus, Trash2, X, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-warm-200 text-navy-900 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-warm-200">
          <div>
            <h3 className="text-lg font-bold text-navy-900">
              Edit Question {question.number}
            </h3>
            <p className="text-xs text-navy-500">Internal ID: {question.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-warm-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1">
                Display Number
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1">
                Marks (Positive Integer)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="e.g. 3"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1">
                Question Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "mcq" | "short_answer")}
                className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">
              Question Text
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none font-sans"
              placeholder="Enter the mathematical problem statement..."
              required
            />
          </div>

          {type === "mcq" && (
            <div className="bg-warm-50 p-4 rounded-lg border border-warm-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-800">
                  MCQ Options ({options.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionLabelChange(idx, e.target.value)}
                    className="w-12 text-center font-bold px-2 py-1.5 border border-warm-300 rounded-md text-sm uppercase bg-white"
                    maxLength={3}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${opt.label} content`}
                    className="flex-1 px-3 py-1.5 border border-warm-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1.5 text-navy-400 hover:text-red-600 transition"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">
              Answer Key (Optional)
            </label>
            <input
              type="text"
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
              placeholder={type === "mcq" ? "e.g. A" : "e.g. 26 cm or -11"}
              className="w-full px-3 py-2 border border-warm-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
            <p className="text-xs text-navy-500 mt-1">
              For MCQs, specify the correct option letter (e.g. &apos;A&apos;). For short answers, specify the expected numerical or algebraic value.
            </p>
          </div>

          <div className="pt-4 border-t border-warm-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-warm-300 text-navy-700 hover:bg-warm-100 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

