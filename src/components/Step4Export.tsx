"use client";

import React, { useState } from "react";
import { Question, PaperMetadata, CheckReport, PaperDraftSchema, PaperDraft } from "@/types/paper";

interface Step4ExportProps {
  questions: Question[];
  metadata: PaperMetadata;
  checkReport: CheckReport;
  rawPaperText: string;
  rawAnswerKeyText: string;
  onBackToReview: () => void;
  onRestoreDraft: (draft: PaperDraft) => void;
}

export const Step4Export: React.FC<Step4ExportProps> = ({
  questions,
  metadata,
  checkReport,
  rawPaperText,
  rawAnswerKeyText,
  onBackToReview,
  onRestoreDraft,
}) => {
  const [activeTab, setActiveTab] = useState<"student" | "key" | "audit" | "json">(
    "student"
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const draft: PaperDraft = {
      version: "1.0",
      metadata,
      questions,
      rawPaperText,
      rawAnswerKeyText,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(draft, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const cleanTitle = metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadAnchor.setAttribute("download", `${cleanTitle}-draft.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = PaperDraftSchema.safeParse(parsed);
        if (!result.success) {
          setImportError(
            `Invalid draft format: ${result.error.issues.map((i) => i.message).join(", ")}`
          );
          return;
        }

        onRestoreDraft(result.data);
        setImportSuccess("Draft successfully imported from JSON.");
      } catch {
        setImportError("Failed to parse JSON file. Please ensure it is a valid exported draft.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 step-fade-in pb-16">
      {/* Control Strip (no-print) */}
      <div className="no-print bg-paper-surface border border-ink-rule rounded-[3px] p-6 shadow-sheet">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between pb-5 border-b border-ink-rule gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink font-semibold tracking-tight">
              Export &amp; Print
            </h2>
            <p className="font-sans text-xs text-ink-secondary mt-0.5">
              Printable student question paper, teacher answer key, and audit report.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBackToReview}
              className="font-mono text-xs text-ink-secondary hover:text-ink px-3 py-1.5 border border-ink-rule rounded-[2px]"
            >
              &larr; Back to Findings
            </button>

            {activeTab !== "json" && (
              <button
                type="button"
                onClick={handlePrint}
                className="font-mono text-xs font-semibold px-4 py-2 bg-ink text-paper-surface hover:bg-black rounded-[2px] transition-colors focus:ring-2 focus:ring-redpen"
              >
                Print Document [A4]
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("student")}
            className={`px-3 py-1.5 rounded-[2px] border transition-colors ${
              activeTab === "student"
                ? "border-ink bg-ink text-paper-surface font-semibold"
                : "border-ink-rule bg-paper-bg text-ink-secondary hover:text-ink"
            }`}
          >
            01. Student Paper
          </button>

          <button
            onClick={() => setActiveTab("key")}
            className={`px-3 py-1.5 rounded-[2px] border transition-colors ${
              activeTab === "key"
                ? "border-ink bg-ink text-paper-surface font-semibold"
                : "border-ink-rule bg-paper-bg text-ink-secondary hover:text-ink"
            }`}
          >
            02. Answer Key
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-[2px] border transition-colors ${
              activeTab === "audit"
                ? "border-ink bg-ink text-paper-surface font-semibold"
                : "border-ink-rule bg-paper-bg text-ink-secondary hover:text-ink"
            }`}
          >
            03. Audit Report
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1.5 rounded-[2px] border transition-colors ${
              activeTab === "json"
                ? "border-ink bg-ink text-paper-surface font-semibold"
                : "border-ink-rule bg-paper-bg text-ink-secondary hover:text-ink"
            }`}
          >
            04. JSON Backup
          </button>
        </div>
      </div>

      {/* 1. STUDENT QUESTION PAPER VIEW */}
      {activeTab === "student" && (
        <div className="bg-paper-surface border border-ink-rule p-8 sm:p-12 rounded-[2px] shadow-sheet font-serif text-ink printable-document">
          {/* Paper Header */}
          <div className="text-center pb-5 border-b-2 border-ink space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">
              {metadata.title}
            </h1>
            <div className="flex justify-between items-baseline font-mono text-xs pt-2 text-ink-secondary">
              <span>
                {metadata.classGrade} &bull; {metadata.subject}
                {metadata.subSubject ? ` (${metadata.subSubject})` : ""}
              </span>
              <span>Max Marks: {metadata.expectedTotalMarks}</span>
              {metadata.timeAllowedMinutes && <span>Time: {metadata.timeAllowedMinutes} Mins</span>}
            </div>
          </div>

          {/* General Instructions */}
          <div className="mt-4 pb-4 border-b border-ink-faint text-xs font-sans text-ink-secondary space-y-1">
            <p className="font-mono text-[10px] uppercase font-bold text-ink">General Instructions:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>All questions are compulsory.</li>
              <li>Read each question carefully before attempting calculations.</li>
              <li>Marks are indicated against each question.</li>
              <li>Calculators or electronic calculating aids are not permitted.</li>
            </ul>
          </div>

          {/* Questions Body */}
          <div className="mt-6 space-y-6">
            {questions.map((q, idx) => {
              const prevQ = idx > 0 ? questions[idx - 1] : null;
              const showSectionHeader = q.section && (!prevQ || prevQ.section !== q.section);

              return (
                <React.Fragment key={q.id}>
                  {showSectionHeader && (
                    <div className="pt-4 pb-2 border-b border-ink">
                      <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink">
                        {q.section}
                      </span>
                    </div>
                  )}
                  <div className="page-break-inside-avoid text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="leading-relaxed">
                          <span className="font-mono font-bold mr-1.5">Q{q.number}.</span>
                          {q.text}
                        </p>

                        {/* Sub-parts for case-based / senior questions */}
                        {q.subParts && q.subParts.length > 0 && (
                          <div className="mt-2 pl-4 space-y-1.5 font-serif text-sm text-ink">
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

                        {/* MCQ Options */}
                        {q.type === "mcq" && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pl-4 font-mono text-xs text-ink">
                            {q.options.map((opt) => (
                              <div key={opt.label} className="flex items-baseline space-x-1.5">
                                <span className="font-bold">({opt.label})</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0 font-mono text-xs font-semibold text-ink-secondary">
                        [{q.marks ?? 0} mark{q.marks !== 1 ? "s" : ""}]
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-12 text-center font-mono text-xs text-ink-muted border-t border-ink-rule pt-4">
            *** End of Question Paper ***
          </div>
        </div>
      )}

      {/* 2. SEPARATE ANSWER KEY VIEW */}
      {activeTab === "key" && (
        <div className="bg-paper-surface border border-ink-rule p-8 sm:p-12 rounded-[2px] shadow-sheet font-serif text-ink printable-document">
          <div className="text-center pb-5 border-b-2 border-ink space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-redpen block">
              Confidential &mdash; Teacher Answer Key &amp; Marking Scheme
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">
              Answer Key
            </h1>
            <p className="font-mono text-xs text-ink-secondary">
              {metadata.title} &bull; {metadata.classGrade} ({metadata.subject}
              {metadata.subSubject ? ` - ${metadata.subSubject}` : ""})
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-ink text-ink font-bold">
                  <th className="py-2.5 w-14">Q#</th>
                  <th className="py-2.5 w-24">Type</th>
                  <th className="py-2.5">Question Statement</th>
                  <th className="py-2.5 w-32">Correct Key</th>
                  <th className="py-2.5 w-20 text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-faint">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-paper-bg/50 page-break-inside-avoid">
                    <td className="py-2.5 font-bold">Q{q.number}</td>
                    <td className="py-2.5 uppercase text-[10px] text-ink-secondary">
                      {q.type === "mcq" ? "MCQ" : "Short Ans"}
                    </td>
                    <td className="py-2.5 font-serif text-sm pr-3 text-ink">
                      <p className="line-clamp-2">{q.text}</p>
                    </td>
                    <td className="py-2.5 font-bold text-pencil-green">
                      {q.answerKey || <span className="text-ink-muted italic">Not specified</span>}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-ink">
                      {q.marks ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-4 border-t border-ink-rule flex justify-between font-mono text-xs text-ink-secondary">
            <span>Total Questions: {questions.length}</span>
            <span>Total Marks: {questions.reduce((a, b) => a + (b.marks || 0), 0)} marks</span>
          </div>
        </div>
      )}

      {/* 3. REVIEW AUDIT REPORT VIEW */}
      {activeTab === "audit" && (
        <div className="bg-paper-surface border border-ink-rule p-8 sm:p-12 rounded-[2px] shadow-sheet font-serif text-ink printable-document">
          <div className="pb-5 border-b-2 border-ink space-y-1">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-secondary block">
                  Prayaas PaperCheck Quality Assurance
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Question Paper Quality &amp; Audit Log
                </h1>
              </div>
              <div className="text-right font-mono text-[11px] text-ink-secondary">
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Status: {checkReport.isStale ? "Edits Pending Recheck" : "Verified"}</p>
              </div>
            </div>
            <p className="font-mono text-xs text-ink-secondary pt-1">
              Paper: {metadata.title} &bull; {metadata.classGrade} ({metadata.subject})
            </p>
          </div>

          {/* Audit Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs py-3 px-4 bg-paper-bg border border-ink-rule rounded-[2px]">
            <div>
              <span className="text-[10px] uppercase text-ink-muted block">Marks Total</span>
              <span className="font-bold text-ink">
                {checkReport.marksSum ?? "Unreliable"} / {metadata.expectedTotalMarks}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-ink-muted block">Total Findings</span>
              <span className="font-bold text-ink">{checkReport.findings.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-ink-muted block">Active Issues</span>
              <span className="font-bold text-ink">
                {checkReport.findings.filter((f) => !f.dismissed).length}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-ink-muted block">Teacher Dismissals</span>
              <span className="font-bold text-ink">
                {checkReport.findings.filter((f) => f.dismissed).length}
              </span>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="mt-6">
            <h3 className="font-mono text-[10px] uppercase tracking-wider font-bold text-ink mb-2">
              Findings Record:
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-ink text-ink font-bold">
                    <th className="py-2 w-14">Item</th>
                    <th className="py-2 w-20">Source</th>
                    <th className="py-2 w-20">Severity</th>
                    <th className="py-2">Issue &amp; Explanation</th>
                    <th className="py-2 w-44">Teacher Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-faint">
                  {checkReport.findings.map((f) => (
                    <tr key={f.id} className="hover:bg-paper-bg/50 page-break-inside-avoid">
                      <td className="py-2 font-bold">
                        {f.questionNumber ? `Q${f.questionNumber}` : "Paper"}
                      </td>
                      <td className="py-2 uppercase text-[10px]">{f.source}</td>
                      <td className="py-2 uppercase text-[10px] font-bold">
                        <span className={f.severity === "error" ? "text-redpen" : "text-ink"}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-sans text-xs">
                        <p className="font-semibold text-ink font-serif text-sm">{f.title}</p>
                        <p className="text-ink-secondary text-[11px]">{f.explanation}</p>
                      </td>
                      <td className="py-2">
                        {f.dismissed ? (
                          <div className="text-[10px] text-pencil-green">
                            <span className="font-bold block">Dismissed</span>
                            {f.dismissedNote && <span>&ldquo;{f.dismissedNote}&rdquo;</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink-muted">Active / Flagged</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff line */}
          <div className="mt-12 pt-6 border-t border-ink-rule flex justify-between items-end font-mono text-xs text-ink-secondary">
            <div>
              <p>Prayaas PaperCheck Verification Ledger</p>
              <p className="text-[10px] text-ink-muted">In-memory session review</p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-ink mb-1" />
              <p className="text-[11px]">Reviewing Teacher Signature</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. JSON DRAFT BACKUP VIEW */}
      {activeTab === "json" && (
        <div className="no-print bg-paper-surface border border-ink-rule rounded-[3px] p-8 shadow-sheet space-y-6">
          <div>
            <h3 className="font-serif text-xl text-ink font-semibold">Draft Backup &amp; Restoration</h3>
            <p className="font-mono text-xs text-ink-secondary mt-1">
              Download your reviewed questions and metadata as a validated JSON draft.
            </p>
          </div>

          {importError && (
            <div className="p-3 bg-redpen-faint border border-redpen-border text-redpen text-xs font-mono rounded-[2px]">
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="p-3 bg-pencil-faint border border-pencil-border text-pencil-green text-xs font-mono rounded-[2px]">
              {importSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-paper-bg border border-ink-rule rounded-[2px] space-y-3 font-mono text-xs">
              <span className="font-bold text-ink block text-sm">Download Paper Draft</span>
              <p className="text-ink-secondary leading-relaxed">
                Export all {questions.length} questions, marks, MCQ choices, answer keys, and exam metadata into a schema-validated <code>.json</code> file.
              </p>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="w-full py-2 bg-ink hover:bg-black text-paper-surface font-semibold rounded-[2px] transition-colors"
              >
                Download JSON Draft
              </button>
            </div>

            <div className="p-6 bg-paper-bg border border-ink-rule rounded-[2px] space-y-3 font-mono text-xs">
              <span className="font-bold text-ink block text-sm">Restore Draft</span>
              <p className="text-ink-secondary leading-relaxed">
                Restore an existing session file. The uploaded draft is verified against the PaperCheck schema.
              </p>
              <label className="block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-ink-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-[2px] file:border file:border-ink file:text-xs file:font-mono file:bg-paper-surface file:text-ink hover:file:bg-paper-bg"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
