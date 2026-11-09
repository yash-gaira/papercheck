"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
}

const STEPS = [
  { step: 1, label: "Add paper", desc: "Paste text or load sample" },
  { step: 2, label: "Confirm questions", desc: "Verify extracted items" },
  { step: 3, label: "Review findings", desc: "Rule & AI checks" },
  { step: 4, label: "Export", desc: "Student paper & key" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep,
}) => {
  return (
    <nav aria-label="Progress" className="no-print bg-white border-b border-warm-200 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            const isClickable = canNavigateToStep(s.step);

            return (
              <li key={s.step} className="relative">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(s.step)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                    isCurrent
                      ? "border-teal-600 bg-teal-50/60 ring-1 ring-teal-600"
                      : isCompleted
                      ? "border-navy-200 bg-white hover:bg-warm-50 cursor-pointer"
                      : "border-warm-200 bg-warm-50/50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                      isCompleted
                        ? "bg-navy-900 text-white"
                        : isCurrent
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-warm-200 text-warm-500"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? "text-teal-900"
                          : isCompleted
                          ? "text-navy-900"
                          : "text-navy-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className="text-xs text-navy-500 truncate mt-0.5">{s.desc}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

