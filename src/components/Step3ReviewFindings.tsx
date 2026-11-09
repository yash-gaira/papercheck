"use client";

import React, { useState } from "react";
import {
  Question,
  PaperMetadata,
  Finding,
  CheckReport,
  ProposedCorrection,
} from "@/types/paper";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw,
  Undo2,
  Sparkles,
  ShieldCheck,
  Edit,
  Check,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

  // Filter logic
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
    onQuestionsChange(updatedList, true); // marks stale!
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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Summary Card */}
      <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-warm-200">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-navy-900 tracking-tight">
                3. Review Paper Findings
              </h2>
              {checkReport.isStale && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                  Findings Stale (Edits Made)
                </span>
              )}
            </div>
            <p className="text-xs text-navy-600 mt-1">
              Examine rule-based and AI-assisted findings. You stay in control of all edits and decisions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {hasUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="text-xs bg-warm-100 hover:bg-warm-200 text-navy-800 border border-warm-300 font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition"
                title="Undo last question edit"
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRecheck}
              disabled={aiLoading}
              className={`text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition ${
                checkReport.isStale
                  ? "bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-300"
                  : "bg-navy-900 hover:bg-navy-800 text-white"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`} />
              <span>{aiLoading ? "Checking..." : "Recheck Paper"}</span>
            </button>

            <button
              type="button"
              onClick={onProceedToExport}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
            >
              <span>Export Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stale Alert Banner */}
        {checkReport.isStale && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Findings are outdated</p>
                <p className="text-amber-800">
                  You modified question content or applied a proposed correction. Click &ldquo;Recheck Paper&rdquo; to re-verify the revised paper.
                </p>
              </div>
            </div>
            <button
              onClick={onRecheck}
              disabled={aiLoading}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs transition"
            >
              Recheck Now
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-warm-50 p-3 rounded-lg border border-warm-200">
            <span className="text-[11px] font-semibold text-navy-500 uppercase block">
              Marks Arithmetic
            </span>
            <div className="mt-1 flex items-baseline space-x-1">
              <span
                className={`text-lg font-bold ${
                  checkReport.isMarksSumReliable &&
                  checkReport.marksSum === metadata.expectedTotalMarks
                    ? "text-teal-700"
                    : "text-red-600"
                }`}
              >
                {checkReport.isMarksSumReliable ? checkReport.marksSum : "Unreliable"}
              </span>
              <span className="text-xs text-navy-500">
                / {metadata.expectedTotalMarks} expected
              </span>
            </div>
          </div>

          <div className="bg-red-50/50 p-3 rounded-lg border border-red-200">
            <span className="text-[11px] font-semibold text-red-600 uppercase block">
              Errors
            </span>
            <span className="text-lg font-bold text-red-700 mt-1 block">
              {errorCount}
            </span>
          </div>

          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-600 uppercase block">
              Warnings
            </span>
            <span className="text-lg font-bold text-amber-700 mt-1 block">
              {warningCount}
            </span>
          </div>

          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-600 uppercase block">
              Notes
            </span>
            <span className="text-lg font-bold text-blue-700 mt-1 block">
              {noteCount}
            </span>
          </div>
        </div>

        {/* AI Review Status Notice */}
        {!aiConfigured ? (
          <div className="mt-4 p-3 bg-navy-50 border border-navy-200 rounded-lg text-xs text-navy-800 flex items-start space-x-2">
            <Info className="w-4 h-4 text-navy-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy-900">
                AI review unavailable — BharatCode key not configured.
              </p>
              <p className="text-navy-600">
                All deterministic rule-based checks (marks sum, duplicate questions, numbering continuity, MCQ option integrity) are fully operational. To enable mathematical ambiguity and answer checking, configure <code>BHARATCODE_API_KEY</code>.
              </p>
            </div>
          </div>
        ) : aiErrorMessage ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">AI Review Notification</p>
              <p>{aiErrorMessage}</p>
            </div>
          </div>
        ) : null}

        {/* Checks Performed / Not Performed Accordion */}
        <div className="mt-4 border-t border-warm-200 pt-3">
          <button
            type="button"
            onClick={() => setShowChecksList(!showChecksList)}
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center space-x-1"
          >
            <span>Quality Audit Scope ({checkReport.checksPerformed.length} checks performed)</span>
            {showChecksList ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showChecksList && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-warm-50 p-3.5 rounded-lg border border-warm-200">
              <div>
                <p className="font-bold text-teal-900 mb-1 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Checks Performed</span>
                </p>
                <ul className="space-y-1 pl-4 list-disc text-navy-700">
                  {checkReport.checksPerformed.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  {aiConfigured && !aiErrorMessage && (
                    <li>BharatCode mathematical correctness & MCQ ambiguity review</li>
                  )}
                </ul>
              </div>

              <div>
                <p className="font-bold text-navy-900 mb-1 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-navy-500" />
                  <span>Checks Not Performed</span>
                </p>
                <ul className="space-y-1 pl-4 list-disc text-navy-600">
                  {!aiConfigured && (
                    <li>BharatCode AI review (API key not configured)</li>
                  )}
                  {checkReport.checksNotPerformed.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  <li>Diagram / geometry rendering validation (non-text MVP limitation)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-warm-200 shadow-xs text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-navy-700">Filter Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 border border-warm-300 rounded-md bg-white text-navy-800 focus:outline-none"
          >
            <option value="all">All Severities ({activeFindings.length})</option>
            <option value="error">Errors only ({errorCount})</option>
            <option value="warning">Warnings only ({warningCount})</option>
            <option value="note">Notes only ({noteCount})</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-navy-700">Source:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2.5 py-1.5 border border-warm-300 rounded-md bg-white text-navy-800 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="rule">Rule checks only</option>
            <option value="ai">AI review only</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-200 p-12 text-center shadow-xs">
          <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No Open Findings</h3>
          <p className="text-xs text-navy-600 max-w-md mx-auto mt-1 mb-6">
            {checkReport.findings.length > 0
              ? "All findings match the current filter or have been dismissed by the teacher."
              : "No issues detected! Your question paper passed all performed checks."}
          </p>
          <button
            onClick={onProceedToExport}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Proceed to Export
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isApplied = appliedFindingIds.has(finding.id);

            return (
              <div
                key={finding.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition ${
                  finding.severity === "error"
                    ? "border-red-200 hover:border-red-300"
                    : finding.severity === "warning"
                    ? "border-amber-200 hover:border-amber-300"
                    : "border-blue-200 hover:border-blue-300"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-warm-200">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        finding.severity === "error"
                          ? "bg-red-100 text-red-800"
                          : finding.severity === "warning"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {finding.severity}
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warm-100 text-navy-800">
                      {finding.questionNumber !== null && finding.questionNumber !== undefined
                        ? `Question ${finding.questionNumber}`
                        : "Whole Paper"}
                    </span>

                    {finding.source === "ai" ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>AI Review</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy-50 text-navy-700 border border-navy-200 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-navy-600" />
                        <span>Rule Check</span>
                      </span>
                    )}

                    {finding.needsTeacherReview && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                        Needs teacher review
                      </span>
                    )}
                  </div>

                  {checkReport.isStale && (
                    <span className="text-[11px] text-amber-700 font-semibold italic">
                      May be outdated (Recheck advised)
                    </span>
                  )}
                </div>

                {/* Finding Details */}
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-bold text-navy-900">
                    {finding.title}
                  </h4>

                  {finding.relevantText && (
                    <div className="bg-warm-50 p-2.5 rounded border border-warm-200 font-mono text-xs text-navy-800">
                      <span className="text-navy-500 font-sans block text-[11px] mb-0.5">
                        Relevant text / calculation:
                      </span>
                      {finding.relevantText}
                    </div>
                  )}

                  <p className="text-xs text-navy-700 leading-relaxed">
                    {finding.explanation}
                  </p>

                  {/* Proposed Correction */}
                  {finding.proposedCorrection && (
                    <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-900">
                          Proposed Correction:
                        </span>
                        {isApplied && (
                          <span className="text-[11px] font-bold text-teal-700 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied (Recheck to verify)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-teal-950 font-medium">
                        {finding.proposedCorrection.label}
                      </p>
                      <div className="bg-white p-2 rounded border border-teal-200 font-mono text-xs text-teal-950">
                        {String(finding.proposedCorrection.newValue)}
                      </div>

                      {!isApplied && (
                        <button
                          type="button"
                          onClick={() => handleApplyClick(finding)}
                          className="mt-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-xs transition flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Proposed Correction</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Teacher Action Controls */}
                <div className="mt-4 pt-3 border-t border-warm-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {finding.questionId && (
                      <button
                        type="button"
                        onClick={() => handleEditQuestion(finding.questionId)}
                        className="text-xs font-semibold px-3 py-1.5 border border-warm-300 hover:bg-warm-100 text-navy-800 rounded-md transition flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-navy-600" />
                        <span>Edit Question</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setDismissingFindingId(
                          dismissingFindingId === finding.id ? null : finding.id
                        )
                      }
                      className="text-xs font-semibold px-3 py-1.5 border border-warm-300 hover:bg-warm-100 text-navy-600 rounded-md transition flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-navy-500" />
                      <span>Dismiss with note</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-navy-400">
                    Finding ID: {finding.id}
                  </span>
                </div>

                {/* Dismiss Dialog Box */}
                {dismissingFindingId === finding.id && (
                  <div className="mt-3 p-3 bg-warm-50 border border-warm-300 rounded-lg text-xs space-y-2">
                    <label className="font-semibold text-navy-900 block">
                      Teacher Rationale for Dismissal (Optional)
                    </label>
                    <input
                      type="text"
                      value={dismissNote}
                      onChange={(e) => setDismissNote(e.target.value)}
                      placeholder="e.g. Teacher verified phrasing matches textbook syllabus"
                      className="w-full px-3 py-1.5 border border-warm-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setDismissingFindingId(null)}
                        className="px-3 py-1 border border-warm-300 text-navy-700 rounded text-xs hover:bg-warm-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmDismiss(finding.id)}
                        className="px-3 py-1 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-navy-800"
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
        <div className="bg-white rounded-xl border border-warm-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-warm-200">
            <h3 className="text-sm font-bold text-navy-900">
              Dismissed by Teacher ({dismissedFindings.length})
            </h3>
            <span className="text-xs text-navy-500">
              Preserved for review audit report
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {dismissedFindings.map((df) => (
              <div
                key={df.id}
                className="p-3 bg-warm-50 rounded-lg border border-warm-200 text-xs flex items-start justify-between gap-3 opacity-80 hover:opacity-100 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-navy-900">{df.title}</span>
                    <span className="px-2 py-0.5 rounded bg-warm-200 text-navy-700 font-semibold">
                      {df.questionNumber ? `Q${df.questionNumber}` : "Paper"}
                    </span>
                  </div>
                  {df.dismissedNote && (
                    <p className="mt-1 text-teal-900 italic font-medium">
                      Teacher Note: &ldquo;{df.dismissedNote}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRestoreFinding(df.id)}
                  className="px-2.5 py-1 text-xs border border-warm-300 text-navy-700 hover:bg-white rounded font-medium transition flex-shrink-0"
                >
                  Restore Finding
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-warm-200">
        <button
          type="button"
          onClick={onBackToConfirm}
          className="px-4 py-2 border border-warm-300 text-navy-700 hover:bg-warm-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Confirm Questions</span>
        </button>

        <button
          type="button"
          onClick={onProceedToExport}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-sm transition"
        >
          <span>Proceed to Export</span>
          <ArrowRight className="w-4 h-4" />
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

