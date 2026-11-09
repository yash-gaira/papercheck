"use client";

import React, { useState } from "react";
import {
  Question,
  PaperMetadata,
  Finding,
  CheckReport,
  ProposedCorrection,
} from "@/types/paper";
import { QuestionEditorModal } from "./QuestionEditorModal";

interface Step3ReviewFindingsProps {
  questions: Question[];
  metadata: PaperMetadata;
  checkReport: CheckReport;
  aiConfigured: boolean;
  aiLoading: boolean;
  aiErrorMessage?: string;
  hasUndo: boolean;
  onUndo: () => void;
  onQuestionsChange: (questions: Question[], markStale?: boolean) => void;
  onApplyCorrection: (findingId: string, correction: ProposedCorrection) => void;
  onDismissFinding: (findingId: string, note?: string) => void;
  onRestoreFinding: (findingId: string) => void;
  onRecheck: () => void;
  onProceedToExport: () => void;
  onBackToConfirm: () => void;
}

export const Step3ReviewFindings: React.FC<Step3ReviewFindingsProps> = ({
  questions,
  metadata,
  checkReport,
  aiConfigured,
  aiLoading,
  aiErrorMessage,
  hasUndo,
  onUndo,
  onQuestionsChange,
  onApplyCorrection,
  onDismissFinding,
  onRestoreFinding,
  onRecheck,
  onProceedToExport,
  onBackToConfirm,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [dismissingFindingId, setDismissingFindingId] = useState<string | null>(null);
  const [dismissNote, setDismissNote] = useState<string>("");
  const [showChecksList, setShowChecksList] = useState(false);
  const [appliedFindingIds, setAppliedFindingIds] = useState<Set<string>>(new Set());

  const activeFindings = checkReport.findings.filter((f) => !f.dismissed);
  const dismissedFindings = checkReport.findings.filter((f) => f.dismissed);

  const filteredFindings = activeFindings.filter((f) => {
    if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
    if (filterSource !== "all" && f.source !== filterSource) return false;
    return true;
  });

  const errorCount = activeFindings.filter((f) => f.severity === "error").length;
  const warningCount = activeFindings.filter((f) => f.severity === "warning").length;
  const noteCount = activeFindings.filter((f) => f.severity === "note").length;

  const handleEditQuestion = (qId: string | null) => {
    if (!qId) return;
    const q = questions.find((item) => item.id === qId);
    if (q) {
      setEditingQuestion(q);
      setIsEditorOpen(true);
    }
  };

  const handleSaveEditedQuestion = (updated: Question) => {
    const updatedList = questions.map((q) => (q.id === updated.id ? updated : q));
    onQuestionsChange(updatedList, true);
  };

  const handleApplyClick = (finding: Finding) => {
    if (!finding.proposedCorrection) return;
    onApplyCorrection(finding.id, finding.proposedCorrection);
    setAppliedFindingIds((prev) => new Set(prev).add(finding.id));
  };

  const handleConfirmDismiss = (findingId: string) => {
    onDismissFinding(findingId, dismissNote.trim() || undefined);
    setDismissingFindingId(null);
    setDismissNote("");
  };

  return (
    <div className="space-y-6 step-fade-in">
      {/* Paper Surface Review Panel */}
      <div className="bg-paper-surface border border-ink-rule rounded-[3px] p-6 sm:p-8 shadow-sheet">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between pb-5 border-b border-ink-rule gap-3">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="font-serif text-2xl text-ink font-semibold tracking-tight">
                Review Findings
              </h2>
              {checkReport.isStale && (
                <span className="font-mono text-[10px] uppercase font-bold text-redpen bg-redpen-faint px-2 py-0.5 border border-redpen-border rounded-[2px]">
                  [Outdated &mdash; Edits Applied]
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-ink-secondary mt-0.5">
              Review arithmetic checks, potential duplicate questions, and curriculum warnings.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {hasUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="font-mono text-xs text-ink-secondary hover:text-ink px-3 py-1.5 border border-ink-rule rounded-[2px]"
              >
                &larr; Undo Edit
              </button>
            )}

            <button
              type="button"
              onClick={onRecheck}
              disabled={aiLoading}
              className={`font-mono text-xs font-semibold px-4 py-1.5 rounded-[2px] transition-colors ${
                checkReport.isStale
                  ? "bg-redpen text-paper-surface hover:bg-redpen-dark"
                  : "bg-paper-bg hover:bg-paper-surface text-ink border border-ink-rule"
              }`}
            >
              {aiLoading ? "Re-checking..." : "Recheck Paper"}
            </button>

            <button
              type="button"
              onClick={onProceedToExport}
              className="font-mono text-xs font-semibold px-4 py-1.5 bg-ink text-paper-surface hover:bg-black rounded-[2px] transition-colors focus:ring-2 focus:ring-redpen"
            >
              Proceed to Export &rarr;
            </button>
          </div>
        </div>

        {/* Stale Findings Alert */}
        {checkReport.isStale && (
          <div className="mt-4 p-3.5 border-l-2 border-redpen bg-redpen-faint text-redpen text-xs font-mono rounded-[2px] flex items-center justify-between">
            <div>
              <span className="font-bold block">[Paper text modified]</span>
              <span>Previous review findings may be outdated. Recheck paper to verify corrections.</span>
            </div>
            <button
              onClick={onRecheck}
              disabled={aiLoading}
              className="px-3 py-1 bg-redpen text-paper-surface rounded-[2px] font-semibold text-xs ml-4 flex-shrink-0"
            >
              Recheck Now
            </button>
          </div>
        )}

        {/* Paper Marks & Audit Ledger */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 bg-paper-bg border border-ink-rule/80 rounded-[2px] font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Marks Sum Ledger</span>
            <span
              className={`text-base font-bold ${
                checkReport.isMarksSumReliable &&
                checkReport.marksSum === metadata.expectedTotalMarks
                  ? "text-pencil-green"
                  : "text-redpen"
              }`}
            >
              {checkReport.isMarksSumReliable ? `${checkReport.marksSum}` : "Unreliable"}{" "}
              <span className="text-xs text-ink-muted font-normal">/ {metadata.expectedTotalMarks}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-redpen block">Red Pen Errors</span>
            <span className="text-base font-bold text-redpen">{errorCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-ink-secondary block">Warnings</span>
            <span className="text-base font-bold text-ink">{warningCount}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-ink-muted block">Auditor Notes</span>
            <span className="text-base font-bold text-ink-muted">{noteCount}</span>
          </div>
        </div>

        {/* Keyless Mode / Status Note */}
        {!aiConfigured ? (
          <div className="mt-4 p-3 bg-paper-bg border border-ink-rule rounded-[2px] text-xs font-mono text-ink-secondary flex items-baseline space-x-2">
            <span className="font-bold text-ink">&bull; Note:</span>
            <span>
              AI review unavailable &mdash; BharatCode key not configured. Deterministic rules (marks arithmetic, duplicate questions, numbering continuity, MCQ option integrity) are fully verified.
            </span>
          </div>
        ) : aiErrorMessage ? (
          <div className="mt-4 p-3 bg-redpen-faint border border-redpen-border rounded-[2px] text-xs font-mono text-redpen flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold block">[BharatCode Review Notice]</span>
              <span>{aiErrorMessage}</span>
            </div>
            <button
              type="button"
              onClick={onRecheck}
              disabled={aiLoading}
              className="px-2.5 py-1 bg-paper-surface border border-redpen-border hover:border-redpen text-redpen text-[11px] font-semibold rounded-[2px] self-start sm:self-auto flex-shrink-0 transition-colors"
            >
              {aiLoading ? "Rechecking..." : "Retry Review"}
            </button>
          </div>
        ) : null}

        {/* Checks Performed / Scope Toggle */}
        <div className="mt-4 pt-3 border-t border-ink-rule/60 text-xs">
          <button
            type="button"
            onClick={() => setShowChecksList(!showChecksList)}
            className="font-mono text-[11px] text-ink-secondary hover:text-ink underline"
          >
            {showChecksList
              ? "[-] Hide verification checklist"
              : `[+] View verification scope (${checkReport.checksPerformed.length} checks performed)`}
          </button>

          {showChecksList && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-paper-bg border border-ink-rule rounded-[2px] text-xs">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-pencil-green block mb-1.5">
                  Verified Checks
                </span>
                <ul className="space-y-1 font-mono text-[11px] text-ink">
                  {checkReport.checksPerformed.map((c, i) => (
                    <li key={i}>&bull; {c}</li>
                  ))}
                  {aiConfigured && !aiErrorMessage && (
                    <li>&bull; BharatCode mathematical correctness &amp; ambiguity review</li>
                  )}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-ink-muted block mb-1.5">
                  Checks Not Performed / Out of Scope
                </span>
                <ul className="space-y-1 font-mono text-[11px] text-ink-secondary">
                  {!aiConfigured && <li>&bull; BharatCode AI review (API key not configured)</li>}
                  {checkReport.checksNotPerformed.map((c, i) => (
                    <li key={i}>&bull; {c}</li>
                  ))}
                  <li>&bull; Diagram visual rendering (text-only MVP)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-paper-surface border border-ink-rule rounded-[2px] font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-ink-secondary uppercase text-[10px]">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-paper-bg border border-ink-rule text-ink px-2 py-1 rounded-[2px] text-xs focus:outline-none"
          >
            <option value="all">All Severities ({activeFindings.length})</option>
            <option value="error">Errors ({errorCount})</option>
            <option value="warning">Warnings ({warningCount})</option>
            <option value="note">Notes ({noteCount})</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-ink-secondary uppercase text-[10px]">Source:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-paper-bg border border-ink-rule text-ink px-2 py-1 rounded-[2px] text-xs focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="rule">Rule Checks Only</option>
            <option value="ai">AI Review Only</option>
          </select>
        </div>
      </div>

      {/* Red Pen Annotations List */}
      {filteredFindings.length === 0 ? (
        <div className="bg-paper-surface border border-ink-rule p-10 text-center rounded-[2px]">
          <div className="font-serif italic text-2xl text-pencil-green mb-1">✓</div>
          <h3 className="font-serif text-lg text-ink font-semibold">No open findings</h3>
          <p className="font-mono text-xs text-ink-muted mt-1 mb-4">
            {checkReport.findings.length > 0
              ? "All findings match filters or were dismissed by the teacher."
              : "Question paper passed all deterministic and AI checks."}
          </p>
          <button
            onClick={onProceedToExport}
            className="px-5 py-2 bg-ink text-paper-surface hover:bg-black font-mono text-xs rounded-[2px]"
          >
            Proceed to Export &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => {
            const isApplied = appliedFindingIds.has(finding.id);
            const isError = finding.severity === "error";

            return (
              <div
                key={finding.id}
                className={`bg-paper-surface border rounded-[2px] p-5 transition-colors stagger-item ${
                  isError
                    ? "border-redpen/60 border-l-4 border-l-redpen"
                    : "border-ink-rule border-l-4 border-l-ink-muted"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-ink-rule/60 font-mono text-xs">
                  <div className="flex items-baseline space-x-2.5">
                    <span
                      className={`font-bold uppercase tracking-wider text-[11px] ${
                        isError ? "text-redpen" : "text-ink-secondary"
                      }`}
                    >
                      [{finding.severity}]
                    </span>

                    <span className="font-semibold text-ink">
                      {finding.questionNumber !== null && finding.questionNumber !== undefined
                        ? `Question ${finding.questionNumber}`
                        : "Whole Paper"}
                    </span>

                    <span className="text-[10px] text-ink-muted border border-ink-rule px-1.5 py-0.2 rounded-[2px]">
                      {finding.source === "ai" ? "BharatCode AI" : "Rule Check"}
                    </span>

                    {finding.needsTeacherReview && (
                      <span className="text-[10px] text-redpen font-semibold underline">
                        Needs teacher review
                      </span>
                    )}
                  </div>

                  {checkReport.isStale && (
                    <span className="text-[10px] text-redpen italic">
                      [May be outdated &mdash; recheck advised]
                    </span>
                  )}
                </div>

                {/* Finding Details */}
                <div className="mt-3 space-y-2">
                  <h4 className="font-serif text-base text-ink font-semibold">
                    {finding.title}
                  </h4>

                  {finding.relevantText && (
                    <div className="p-2.5 bg-paper-bg border border-ink-faint font-mono text-xs text-ink">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-muted block mb-0.5">
                        Relevant citation:
                      </span>
                      {finding.relevantText}
                    </div>
                  )}

                  <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                    {finding.explanation}
                  </p>

                  {/* Proposed Correction Red-Pen Box */}
                  {finding.proposedCorrection && (
                    <div className="mt-3 p-3 bg-redpen-faint/60 border border-redpen-border rounded-[2px] text-xs font-mono space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-redpen uppercase text-[10px] tracking-wider">
                          Red Pen Proposed Correction:
                        </span>
                        {isApplied && (
                          <span className="text-[10px] font-bold text-pencil-green">
                            [Applied &mdash; Recheck needed]
                          </span>
                        )}
                      </div>

                      <p className="text-ink font-semibold text-[11px]">
                        {finding.proposedCorrection.label}
                      </p>

                      <div className="p-1.5 bg-paper-surface border border-redpen-border/60 text-ink text-xs">
                        {String(finding.proposedCorrection.newValue)}
                      </div>

                      {!isApplied && (
                        <button
                          type="button"
                          onClick={() => handleApplyClick(finding)}
                          className="mt-1 px-3 py-1 bg-redpen hover:bg-redpen-dark text-paper-surface rounded-[2px] font-semibold text-[11px] transition-colors"
                        >
                          Apply Correction to Paper
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Teacher Action Controls */}
                <div className="mt-4 pt-3 border-t border-ink-rule/50 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    {finding.questionId && (
                      <button
                        type="button"
                        onClick={() => handleEditQuestion(finding.questionId)}
                        className="text-ink-secondary hover:text-ink underline"
                      >
                        [Edit Question]
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDismissingFindingId(
                          dismissingFindingId === finding.id ? null : finding.id
                        )
                      }
                      className="text-ink-muted hover:text-ink underline"
                    >
                      [Dismiss with note]
                    </button>
                  </div>

                  <span className="text-[10px] text-ink-muted">
                    ID: {finding.id}
                  </span>
                </div>

                {/* Dismiss Dialog Input */}
                {dismissingFindingId === finding.id && (
                  <div className="mt-3 p-3 bg-paper-bg border border-ink-rule rounded-[2px] text-xs space-y-2">
                    <label className="font-mono text-[10px] uppercase font-bold text-ink block">
                      Teacher Rationale for Dismissal:
                    </label>
                    <input
                      type="text"
                      value={dismissNote}
                      onChange={(e) => setDismissNote(e.target.value)}
                      placeholder="e.g. Verified wording matches curriculum textbook"
                      className="w-full px-2.5 py-1.5 border border-ink-rule bg-paper-surface rounded-[2px] text-xs focus-pen"
                    />
                    <div className="flex justify-end space-x-2 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDismissingFindingId(null)}
                        className="px-2 py-1 text-ink-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmDismiss(finding.id)}
                        className="px-3 py-1 bg-ink text-paper-surface rounded-[2px] font-semibold"
                      >
                        Confirm Dismissal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dismissed Findings Accordion */}
      {dismissedFindings.length > 0 && (
        <div className="bg-paper-surface border border-ink-rule rounded-[2px] p-5 text-xs">
          <div className="flex justify-between items-baseline pb-2 border-b border-ink-rule font-mono">
            <span className="font-bold text-ink uppercase tracking-wider text-[11px]">
              Dismissed by Teacher ({dismissedFindings.length})
            </span>
            <span className="text-ink-muted text-[10px]">Archived for audit report</span>
          </div>

          <div className="mt-3 space-y-2">
            {dismissedFindings.map((df) => (
              <div
                key={df.id}
                className="p-2.5 bg-paper-bg border border-ink-faint rounded-[2px] flex items-baseline justify-between gap-3 text-ink-secondary font-mono text-[11px]"
              >
                <div>
                  <span className="font-bold text-ink">{df.title}</span>
                  {df.dismissedNote && (
                    <span className="italic ml-2">&ldquo;{df.dismissedNote}&rdquo;</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRestoreFinding(df.id)}
                  className="text-ink underline hover:text-redpen"
                >
                  [Restore]
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Row */}
      <div className="mt-8 pt-4 border-t border-ink-rule flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToConfirm}
          className="font-mono text-xs text-ink-secondary hover:text-ink"
        >
          &larr; Back to Confirm Questions
        </button>

        <button
          type="button"
          onClick={onProceedToExport}
          className="px-6 py-2.5 bg-ink hover:bg-black text-paper-surface font-mono text-xs font-semibold rounded-[2px] transition-colors focus:ring-2 focus:ring-redpen"
        >
          Proceed to Export &rarr;
        </button>
      </div>

      {/* Question Editor Modal */}
      <QuestionEditorModal
        question={editingQuestion}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveEditedQuestion}
      />
    </div>
  );
};
