"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, Sparkles, AlertCircle } from "lucide-react";

interface HeaderProps {
  aiConfigured: boolean;
  modelName: string | null;
}

export const Header: React.FC<HeaderProps> = ({ aiConfigured, modelName }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="no-print bg-navy-900 border-b border-navy-800 text-warm-50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-teal-600 text-white p-2 rounded-lg shadow-inner flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-bold tracking-tight text-lg text-white">
                PRAYAAS <span className="text-teal-400 font-light">/</span> PaperCheck
              </span>
              <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-teal-300 border border-navy-700 font-medium">
                Question paper review
              </span>
            </div>
            <p className="text-xs text-navy-300 hidden sm:block">
              Catch question-paper mistakes before students encounter them
            </p>
          </div>
        </div>

        {/* Status & Help */}
        <div className="flex items-center space-x-3">
          {aiConfigured ? (
            <div className="flex items-center space-x-1.5 text-xs bg-teal-950/60 text-teal-200 border border-teal-800/80 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>BharatCode Connected ({modelName || "qwen-3.8-27b"})</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs bg-navy-800 text-navy-300 border border-navy-700 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Deterministic Mode (AI Key Not Set)</span>
            </div>
          )}

          <button
            onClick={() => setShowInfo(true)}
            aria-label="Product Information and Guidelines"
            className="p-1.5 rounded-lg text-navy-300 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-navy-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-warm-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-navy-900">About Prayaas PaperCheck</h3>
                <p className="text-xs text-navy-600">BharatCode Build League Hackathon MVP</p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-navy-400 hover:text-navy-700 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-navy-700">
              <div className="bg-navy-50 p-3 rounded-lg border border-navy-100">
                <p className="font-semibold text-navy-900 mb-1">Target Scope</p>
                <p className="text-xs leading-relaxed">
                  Engineered specifically for school teachers reviewing English-language Mathematics
                  papers (Classes 6–8) with up to 20 compulsory questions.
                </p>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                <p className="font-semibold text-teal-900 mb-1">Two-Tier Checking Engine</p>
                <ul className="text-xs space-y-1 list-disc pl-4 text-teal-950">
                  <li>
                    <strong>Deterministic Engine:</strong> Sum of marks, gaps & duplicates in numbering, exact duplicate question text, MCQ option counts, and answer key consistency.
                  </li>
                  <li>
                    <strong>BharatCode AI:</strong> Mathematical errors, ambiguous wording, single-answer MCQs with multiple/zero correct choices, and suggested rewrites.
                  </li>
                </ul>
              </div>

              <div className="bg-warm-100 p-3 rounded-lg border border-warm-200 text-xs">
                <p className="font-semibold text-navy-900 mb-1">Privacy & Data Handling</p>
                <p>
                  Paper drafts are kept strictly in browser memory during the session and never silently saved to any database. Running AI review sends question text securely over HTTPS to the server-side BharatCode endpoint.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

