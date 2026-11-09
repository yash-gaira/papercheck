"use client";

import React, { useState } from "react";
import { Question, PaperMetadata, CheckReport, PaperDraftSchema, PaperDraft } from "@/types/paper";
import {
  Printer,
  Download,
  Upload,
  ArrowLeft,
  FileText,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
            `Invalid draft file format: ${result.error.issues.map((i) => i.message).join(", ")}`
          );
          return;
        }

        onRestoreDraft(result.data);
        setImportSuccess("Draft successfully imported from JSON!");
      } catch {
        setImportError("Failed to parse JSON file. Please ensure it is a valid exported draft.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Banner (hidden in print) */}
      <div className="no-print bg-white rounded-xl border border-warm-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-warm-200">
          <div>
            <h2 className="text-xl font-bold text-navy-900 tracking-tight">
              4. Export Question Paper & Reports
            </h2>
            <p className="text-xs text-navy-600 mt-1">
              Generate student-ready papers, confidential answer keys, audit logs, or portable JSON drafts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBackToReview}
              className="text-xs border border-warm-300 text-navy-700 hover:bg-warm-100 font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Findings</span>
            </button>

            {activeTab !== "json" && (
              <button
                type="button"
                onClick={handlePrint}
                className="text-xs bg-navy-900 hover:bg-navy-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("student")}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeTab === "student"
                ? "bg-teal-600 text-white"
                : "bg-warm-100 text-navy-700 hover:bg-warm-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Student Question Paper</span>
          </button>

          <button
            onClick={() => setActiveTab("key")}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeTab === "key"
                ? "bg-teal-600 text-white"
                : "bg-warm-100 text-navy-700 hover:bg-warm-200"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Separate Answer Key</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeTab === "audit"
                ? "bg-teal-600 text-white"
                : "bg-warm-100 text-navy-700 hover:bg-warm-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Audit Report</span>
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
              activeTab === "json"
                ? "bg-teal-600 text-white"
                : "bg-warm-100 text-navy-700 hover:bg-warm-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Draft Backup (JSON)</span>
          </button>
        </div>
      </div>

      {/* 1. STUDENT QUESTION PAPER VIEW */}
      {activeTab === "student" && (
        <div className="bg-white rounded-xl border border-warm-300 p-8 md:p-12 shadow-sm font-sans text-navy-950 printable-document">
          {/* Paper Header */}
          <div className="text-center pb-6 border-b-2 border-navy-950 space-y-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase">
              {metadata.title}
            </h1>
            <div className="flex flex-wrap justify-between items-center text-xs md:text-sm font-semibold pt-2 text-navy-800">
              <span>{metadata.classGrade}</span>
              <span>Subject: {metadata.subject}</span>
              <span>Max Marks: {metadata.expectedTotalMarks}</span>
              {metadata.timeAllowedMinutes && (
                <span>Time: {metadata.timeAllowedMinutes} Mins</span>
              )}
            </div>
          </div>

          {/* General Instructions */}
          <div className="mt-4 pb-4 border-b border-warm-200 text-xs text-navy-700 space-y-1">
            <p className="font-bold text-navy-900 uppercase tracking-wide">
              General Instructions:
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>All questions are compulsory.</li>
              <li>Read each question carefully before writing answers.</li>
              <li>Marks are indicated against each question.</li>
              <li>Calculators or electronic devices are not permitted.</li>
            </ul>
          </div>

          {/* Questions Body */}
          <div className="mt-6 space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="page-break-inside-avoid text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="leading-relaxed">
                      <span className="font-bold mr-1.5">Q{q.number}.</span>
                      {q.text}
                    </p>

                    {/* MCQ Options */}
                    {q.type === "mcq" && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-4 text-xs">
                        {q.options.map((opt) => (
                          <div key={opt.label} className="flex items-baseline space-x-2">
                            <span className="font-bold text-navy-800">
                              ({opt.label})
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 font-semibold text-xs text-navy-700">
                    [{q.marks ?? 0} mark{q.marks !== 1 ? "s" : ""}]
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-xs text-navy-500 border-t border-warm-200 pt-4">
            *** End of Question Paper ***
          </div>
        </div>
      )}

      {/* 2. SEPARATE ANSWER KEY VIEW */}
      {activeTab === "key" && (
        <div className="bg-white rounded-xl border border-warm-300 p-8 md:p-12 shadow-sm font-sans text-navy-950 printable-document">
          <div className="text-center pb-6 border-b-2 border-navy-950 space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              Confidential — Teacher Marking Key
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase mt-2">
              Answer Key &amp; Marking Scheme
            </h1>
            <p className="text-xs text-navy-700">
              {metadata.title} | {metadata.classGrade} ({metadata.subject})
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-navy-900 text-white font-semibold">
                  <th className="p-3 w-16">Q#</th>
                  <th className="p-3 w-28">Type</th>
                  <th className="p-3">Question Statement</th>
                  <th className="p-3 w-36">Correct Key</th>
                  <th className="p-3 w-20 text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-warm-50 page-break-inside-avoid">
                    <td className="p-3 font-bold">Q{q.number}</td>
                    <td className="p-3 uppercase text-[11px] font-semibold text-navy-600">
                      {q.type === "mcq" ? "MCQ" : "Short Ans"}
                    </td>
                    <td className="p-3 text-navy-800">
                      <p className="line-clamp-2">{q.text}</p>
                    </td>
                    <td className="p-3 font-bold text-teal-800">
                      {q.answerKey ? (
                        <span className="bg-teal-50 px-2 py-1 rounded border border-teal-200">
                          {q.answerKey}
                        </span>
                      ) : (
                        <span className="text-navy-400 italic">Not specified</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold text-navy-900">
                      {q.marks ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-4 border-t border-warm-200 flex justify-between text-xs text-navy-600">
            <span>Total Questions: {questions.length}</span>
            <span>
              Total Marks: {questions.reduce((a, b) => a + (b.marks || 0), 0)} marks
            </span>
          </div>
        </div>
      )}

      {/* 3. REVIEW AUDIT REPORT VIEW */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-warm-300 p-8 md:p-12 shadow-sm font-sans text-navy-950 printable-document">
          <div className="pb-6 border-b-2 border-navy-950 space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-teal-800">
                  Prayaas PaperCheck Quality Assurance
                </span>
                <h1 className="text-xl md:text-2xl font-bold tracking-wide mt-1">
                  Question Paper Quality &amp; Audit Report
                </h1>
              </div>
              <div className="text-right text-xs text-navy-500">
                <p>Generated: {new Date().toLocaleDateString()}</p>
                <p>Status: {checkReport.isStale ? "Outdated (Edits pending)" : "Verified"}</p>
              </div>
            </div>
            <p className="text-xs text-navy-700 pt-2">
              Paper: <strong>{metadata.title}</strong> | {metadata.classGrade} ({metadata.subject})
            </p>
          </div>

          {/* Audit Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-warm-50 p-4 rounded-lg border border-warm-200">
            <div>
              <span className="text-navy-500 block">Marks Sum:</span>
              <span className="font-bold text-navy-900">
                {checkReport.marksSum ?? "Unreliable"} / {metadata.expectedTotalMarks} marks
              </span>
            </div>
            <div>
              <span className="text-navy-500 block">Total Findings:</span>
              <span className="font-bold text-navy-900">
                {checkReport.findings.length}
              </span>
            </div>
            <div>
              <span className="text-navy-500 block">Active Issues:</span>
              <span className="font-bold text-navy-900">
                {checkReport.findings.filter((f) => !f.dismissed).length}
              </span>
            </div>
            <div>
              <span className="text-navy-500 block">Dismissed with Rationale:</span>
              <span className="font-bold text-navy-900">
                {checkReport.findings.filter((f) => f.dismissed).length}
              </span>
            </div>
          </div>

          {/* Checks Performed and Not Performed */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200">
              <p className="font-bold text-teal-900 mb-1">Checks Performed:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-teal-950">
                {checkReport.checksPerformed.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-warm-50 rounded-lg border border-warm-200">
              <p className="font-bold text-navy-900 mb-1">Checks Not Performed / Limitations:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-navy-700">
                {checkReport.checksNotPerformed.length > 0 ? (
                  checkReport.checksNotPerformed.map((c, i) => <li key={i}>{c}</li>)
                ) : (
                  <li>None</li>
                )}
                <li>Diagram / figure visual verification (text-only MVP)</li>
              </ul>
            </div>
          </div>

          {/* Findings Table */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
              Detailed Findings Log
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-navy-900 text-white font-semibold">
                    <th className="p-2.5 w-16">Item</th>
                    <th className="p-2.5 w-20">Source</th>
                    <th className="p-2.5 w-20">Severity</th>
                    <th className="p-2.5">Issue &amp; Explanation</th>
                    <th className="p-2.5 w-44">Teacher Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-200">
                  {checkReport.findings.map((f) => (
                    <tr key={f.id} className="hover:bg-warm-50 page-break-inside-avoid">
                      <td className="p-2.5 font-bold">
                        {f.questionNumber ? `Q${f.questionNumber}` : "Paper"}
                      </td>
                      <td className="p-2.5 uppercase text-[10px] font-semibold">
                        {f.source}
                      </td>
                      <td className="p-2.5 uppercase text-[10px] font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            f.severity === "error"
                              ? "bg-red-100 text-red-800"
                              : f.severity === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </td>
                      <td className="p-2.5 space-y-1">
                        <p className="font-semibold text-navy-900">{f.title}</p>
                        <p className="text-navy-600 text-[11px]">{f.explanation}</p>
                      </td>
                      <td className="p-2.5">
                        {f.dismissed ? (
                          <div className="text-[11px] text-teal-800">
                            <span className="font-semibold block">Dismissed</span>
                            {f.dismissedNote && <span>&ldquo;{f.dismissedNote}&rdquo;</span>}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-800 font-semibold">
                            Flagged / Unresolved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff */}
          <div className="mt-12 pt-6 border-t border-warm-300 flex justify-between items-end text-xs text-navy-700">
            <div>
              <p>Auditor Engine: Prayaas PaperCheck Deterministic + BharatCode AI</p>
              <p className="text-[11px] text-navy-500">
                Drafts are kept in-memory and not silently persisted to external databases.
              </p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-navy-400 mb-1" />
              <p className="font-semibold">Reviewing Teacher Signature</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. JSON DRAFT BACKUP VIEW */}
      {activeTab === "json" && (
        <div className="no-print bg-white rounded-xl border border-warm-200 p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Draft Backup &amp; Restoration
            </h3>
            <p className="text-xs text-navy-600 mt-1">
              Download your reviewed questions and metadata as a verified JSON draft to restore in future sessions.
            </p>
          </div>

          {importError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download */}
            <div className="p-6 bg-warm-50 rounded-xl border border-warm-200 text-xs space-y-4">
              <div className="flex items-center space-x-2 font-bold text-navy-900 text-sm">
                <Download className="w-4 h-4 text-teal-700" />
                <span>Download Current Paper Draft</span>
              </div>
              <p className="text-navy-600 leading-relaxed">
                Export all {questions.length} questions, marks, MCQ options, answer keys, and exam metadata into a schema-validated <code>.json</code> file.
              </p>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Draft</span>
              </button>
            </div>

            {/* Upload */}
            <div className="p-6 bg-warm-50 rounded-xl border border-warm-200 text-xs space-y-4">
              <div className="flex items-center space-x-2 font-bold text-navy-900 text-sm">
                <Upload className="w-4 h-4 text-teal-700" />
                <span>Restore Draft from File</span>
              </div>
              <p className="text-navy-600 leading-relaxed">
                Restore a previously saved paper draft. The uploaded file is strictly validated against the PaperCheck schema.
              </p>
              <label className="block w-full cursor-pointer">
                <span className="sr-only">Choose JSON draft file</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-navy-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

