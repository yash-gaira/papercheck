"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
}

const STEPS = [
  { step: 1, num: "01", label: "Add paper", desc: "Paste draft" },
  { step: 2, num: "02", label: "Confirm questions", desc: "Verify items" },
  { step: 3, num: "03", label: "Review findings", desc: "Rules & AI" },
  { step: 4, num: "04", label: "Export", desc: "Print & key" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  canNavigateToStep,
}) => {
  return (
    <nav aria-label="Progress" className="no-print bg-paper-surface border-b border-ink-rule py-2.5">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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
                  className={`w-full text-left py-2 px-2.5 rounded-[2px] transition-all border-b-2 ${
                    isCurrent
                      ? "border-redpen bg-redpen-faint/40 text-ink"
                      : isCompleted
                      ? "border-pencil-green bg-transparent text-ink hover:bg-paper-bg cursor-pointer"
                      : "border-transparent text-ink-muted opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs font-bold tracking-tight">
                      {s.num}
                    </span>
                    {isCompleted && (
                      <span className="font-serif italic text-xs text-pencil-green font-bold">
                        ✓ checked
                      </span>
                    )}
                    {isCurrent && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-redpen font-semibold">
                        active
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <p
                      className={`text-xs font-medium tracking-tight ${
                        isCurrent
                          ? "text-ink font-semibold"
                          : isCompleted
                          ? "text-ink"
                          : "text-ink-muted"
                      }`}
                    >
                      {s.label}
                    </p>
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
