"use client";

import React, { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  aiConfigured: boolean;
  modelName: string | null;
}

export const Header: React.FC<HeaderProps> = ({ aiConfigured, modelName }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="no-print bg-paper-surface border-b border-ink-rule sticky top-0 z-40">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-baseline space-x-2.5">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink font-semibold">
            PRAYAAS
          </span>
          <span className="text-ink-muted text-xs font-light">/</span>
          <span className="font-serif italic text-base tracking-tight text-ink font-medium">
            PaperCheck
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-ink-secondary pl-2 border-l border-ink-rule">
            Classes 6–12 &bull; Maths &amp; Science
          </span>
        </div>

        {/* Quiet status chip, theme toggle & info trigger */}
        <div className="flex items-center space-x-3 text-xs">
          {aiConfigured ? (
            <div className="hidden xs:flex items-center space-x-2 font-mono text-[11px] text-pencil-green bg-pencil-faint border border-pencil-border px-2.5 py-1 rounded-[3px]">
              <span className="w-1.5 h-1.5 rounded-full bg-pencil-green inline-block" />
              <span>BharatCode active ({modelName || "qwen-3.8-27b"})</span>
            </div>
          ) : (
            <div className="hidden xs:flex items-center space-x-2 font-mono text-[11px] text-ink-secondary bg-paper-bg border border-ink-rule px-2.5 py-1 rounded-[3px]">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-muted inline-block" />
              <span>Deterministic Mode (AI Key Not Set)</span>
            </div>
          )}

          {/* Theme Selector */}
          <ThemeToggle />

          <button
            onClick={() => setShowInfo(true)}
            aria-label="Product Information and Guidelines"
            className="font-mono text-[11px] text-ink-secondary hover:text-ink px-2 py-1 border border-ink-rule hover:border-ink rounded-[2px] transition-colors"
          >
            [Notes]
          </button>
        </div>
      </div>

      {/* Archival Specimen Notes Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
          <div className="bg-paper-surface text-ink max-w-lg w-full p-6 border border-ink-rule shadow-sheet-lifted rounded-[3px]">
            <div className="flex justify-between items-baseline pb-3 border-b border-ink-rule">
              <div>
                <span className="font-mono text-[10px] tracking-wider uppercase text-ink-secondary block">
                  Auditor Reference Note
                </span>
                <h3 className="font-serif text-lg text-ink font-semibold">
                  Prayaas PaperCheck Specification
                </h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="font-mono text-xs text-ink-secondary hover:text-ink px-1.5 py-0.5 border border-ink-rule rounded-[2px]"
              >
                Close [esc]
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-ink-secondary leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="pb-3 border-b border-ink-faint">
                <span className="font-mono text-[10px] uppercase font-bold text-ink block mb-1">
                  Scope &amp; Standard
                </span>
                <p>
                  Engineered specifically for school teachers reviewing English-language Mathematics
                  and Science question papers (Classes 6–12) with up to 20 compulsory questions.
                </p>
              </div>

              <div className="pb-3 border-b border-ink-faint">
                <span className="font-mono text-[10px] uppercase font-bold text-ink block mb-1">
                  Verification System
                </span>
                <ul className="space-y-1 font-mono text-[11px] text-ink">
                  <li>01. Deterministic rules: Marks sums, gaps, duplicate wording, MCQ structure.</li>
                  <li>02. Science rules: SI unit consistency, IUPAC formula casing, equation balance.</li>
                  <li>03. Senior classes: Section dividers, case-based sub-parts (a, b, c) summation.</li>
                  <li>04. BharatCode review: Semantic ambiguity, multiple primes/answers, missing context.</li>
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-ink block mb-1">
                  Paper Privacy
                </span>
                <p>
                  All parsing and deterministic rules execute entirely inside the client or server memory.
                  No papers or answer keys are stored in any database.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
