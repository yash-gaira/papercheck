"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StepIndicator } from "@/components/StepIndicator";
import { Step1AddPaper } from "@/components/Step1AddPaper";
import { Step2ConfirmQuestions } from "@/components/Step2ConfirmQuestions";
import { Step3ReviewFindings } from "@/components/Step3ReviewFindings";
import { Step4Export } from "@/components/Step4Export";
import {
  Question,
  PaperMetadata,
  CheckReport,
  Finding,
  ProposedCorrection,
  PaperDraft,
} from "@/types/paper";
import { parsePaperText } from "@/lib/parser";
import { runDeterministicChecks } from "@/lib/checker";
import { runScienceChecks } from "@/lib/scienceChecker";
import { SamplePaper } from "@/lib/samples";
import { InteractivePaperCanvas } from "@/components/InteractivePaperCanvas";

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [aiConfigured, setAiConfigured] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiErrorMessage, setAiErrorMessage] = useState<string | undefined>(undefined);
  const [isAIStructuring, setIsAIStructuring] = useState<boolean>(false);

  // Metadata
  const [metadata, setMetadata] = useState<PaperMetadata>({
    title: "",
    classGrade: "Class 7",
    subject: "Mathematics",
    expectedTotalMarks: 20,
    timeAllowedMinutes: 45,
    instructions: [
      "All questions are compulsory.",
      "Check your calculations before submitting.",
    ],
  });

  // Raw inputs
  const [rawPaperText, setRawPaperText] = useState<string>("");
  const [rawAnswerKeyText, setRawAnswerKeyText] = useState<string>("");

  // Extracted data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [unparsedLines, setUnparsedLines] = useState<string[]>([]);
  const [unsupportedFeatures, setUnsupportedFeatures] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);

  // History for Undo
  const [history, setHistory] = useState<Question[][]>([]);

  // Findings Report
  const [checkReport, setCheckReport] = useState<CheckReport>({
    findings: [],
    isStale: false,
    lastCheckedAt: "",
    checksPerformed: [],
    checksNotPerformed: [],
    marksSum: null,
    isMarksSumReliable: false,
    expectedMarks: 20,
  });

  // Check AI configuration status on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setAiConfigured(Boolean(data.aiConfigured));
          setModelName(data.modelName || null);
        }
      } catch {
        // Deterministic mode fallback
        setAiConfigured(false);
      }
    }
    checkStatus();
  }, []);

  // Quick Load Sample
  const handleLoadSample = (sample: SamplePaper) => {
    setMetadata(sample.metadata);
    setRawPaperText(sample.rawPaperText);
    setRawAnswerKeyText(sample.rawAnswerKeyText);

    // Parse immediately for convenience
    const parsed = parsePaperText(sample.rawPaperText, sample.rawAnswerKeyText);
    setQuestions(parsed.questions);
    setUnparsedLines(parsed.unparsedLines);
    setUnsupportedFeatures(parsed.unsupportedFeaturesDetected);
    setParseWarnings(parsed.parseWarnings);
    setHistory([]);
  };

  // Step 1 -> Step 2
  const handleContinueToConfirm = () => {
    const parsed = parsePaperText(rawPaperText, rawAnswerKeyText);
    setQuestions(parsed.questions);
    setUnparsedLines(parsed.unparsedLines);
    setUnsupportedFeatures(parsed.unsupportedFeaturesDetected);
    setParseWarnings(parsed.parseWarnings);
    setHistory([]);
    setStep(2);
  };

  // Optional AI Structuring
  const handleAIStructureAssist = async () => {
    if (!rawPaperText.trim()) return;
    setIsAIStructuring(true);
    try {
      const res = await fetch("/api/parse-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawPaperText }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
        setStep(2);
      } else {
        alert(data.error || "AI structuring did not return structured questions.");
      }
    } catch {
      alert("Error contacting AI structuring assistant.");
    } finally {
      setIsAIStructuring(false);
    }
  };

  // Core Check Execution: Deterministic + BharatCode AI (if configured)
  const runAllChecks = async (questionsToTest: Question[]) => {
    // 1. Deterministic Checks (Mathematics vs Science)
    const deterministicReport =
      metadata.subject === "Science"
        ? runScienceChecks(questionsToTest, metadata, unsupportedFeatures)
        : runDeterministicChecks(questionsToTest, metadata, unsupportedFeatures);

    // If AI is not configured, we're done
    if (!aiConfigured) {
      deterministicReport.checksNotPerformed.push(
        "BharatCode AI review: not performed (API key not configured)"
      );
      setCheckReport(deterministicReport);
      setAiErrorMessage(undefined);
      return;
    }

    // 2. BharatCode AI Review
    setAiLoading(true);
    setAiErrorMessage(undefined);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questionsToTest,
          metadata,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.findings)) {
        // Merge findings
        const combinedFindings: Finding[] = [
          ...deterministicReport.findings,
          ...data.findings,
        ];

        setCheckReport({
          ...deterministicReport,
          findings: combinedFindings,
          checksPerformed: [
            ...deterministicReport.checksPerformed,
            `BharatCode AI mathematical correctness & single-answer MCQ review (${data.modelUsed || "qwen-3.8-27b"})`,
          ],
          lastCheckedAt: new Date().toISOString(),
          isStale: false,
        });
      } else {
        setAiErrorMessage(data.error || "AI review returned an error.");
        deterministicReport.checksNotPerformed.push(
          `BharatCode AI review: failed (${data.error || "API error"})`
        );
        setCheckReport(deterministicReport);
      }
    } catch (err: unknown) {
      setAiErrorMessage(`Network error contacting BharatCode review: ${(err as Error)?.message}`);
      deterministicReport.checksNotPerformed.push(
        "BharatCode AI review: network error"
      );
      setCheckReport(deterministicReport);
    } finally {
      setAiLoading(false);
    }
  };

  // Step 2 -> Step 3
  const handleProceedToReview = async () => {
    setStep(3);
    await runAllChecks(questions);
  };

  // Question editing handler with history tracking & stale marking
  const handleQuestionsChange = (
    updatedQuestions: Question[],
    markStale: boolean = false
  ) => {
    setHistory((prev) => [...prev, questions]);
    setQuestions(updatedQuestions);
    if (markStale) {
      setCheckReport((prev) => ({ ...prev, isStale: true }));
    }
  };

  // Undo teacher action
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setQuestions(previous);
    setCheckReport((prev) => ({ ...prev, isStale: true }));
  };

  // Apply Proposed Correction
  const handleApplyCorrection = (
    findingId: string,
    correction: ProposedCorrection
  ) => {
    const finding = checkReport.findings.find((f) => f.id === findingId);
    if (!finding || !finding.questionId) return;

    const qIndex = questions.findIndex((q) => q.id === finding.questionId);
    if (qIndex === -1) return;

    setHistory((prev) => [...prev, questions]);

    const updated = [...questions];
    const targetQ = { ...updated[qIndex] };

    if (correction.field === "text") {
      targetQ.text = String(correction.newValue);
    } else if (correction.field === "optionText" && correction.targetOptionLabel) {
      const optIdx = targetQ.options.findIndex(
        (o) => o.label.toUpperCase() === correction.targetOptionLabel!.toUpperCase()
      );
      if (optIdx !== -1) {
        const updatedOptions = [...targetQ.options];
        updatedOptions[optIdx] = {
          ...updatedOptions[optIdx],
          text: String(correction.newValue),
        };
        targetQ.options = updatedOptions;
      }
    } else if (correction.field === "answerKey") {
      targetQ.answerKey = String(correction.newValue);
    } else if (correction.field === "marks") {
      targetQ.marks = Number(correction.newValue);
    }

    updated[qIndex] = targetQ;
    setQuestions(updated);

    // Stale report update
    setCheckReport((prev) => ({ ...prev, isStale: true }));
  };

  // Dismiss finding with optional note
  const handleDismissFinding = (findingId: string, note?: string) => {
    setCheckReport((prev) => ({
      ...prev,
      findings: prev.findings.map((f) =>
        f.id === findingId ? { ...f, dismissed: true, dismissedNote: note } : f
      ),
    }));
  };

  // Restore dismissed finding
  const handleRestoreFinding = (findingId: string) => {
    setCheckReport((prev) => ({
      ...prev,
      findings: prev.findings.map((f) =>
        f.id === findingId ? { ...f, dismissed: false, dismissedNote: undefined } : f
      ),
    }));
  };

  // Recheck paper
  const handleRecheck = async () => {
    await runAllChecks(questions);
  };

  // Restore draft from JSON file
  const handleRestoreDraft = (draft: PaperDraft) => {
    setMetadata(draft.metadata);
    setQuestions(draft.questions);
    setRawPaperText(draft.rawPaperText || "");
    setRawAnswerKeyText(draft.rawAnswerKeyText || "");
    setStep(2);
  };

  const canNavigateToStep = (targetStep: number): boolean => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return questions.length > 0 || rawPaperText.trim().length > 0;
    if (targetStep === 3) return questions.length > 0;
    if (targetStep === 4) return questions.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-bg text-ink selection:bg-redpen-faint selection:text-redpen">
      {/* Top Header */}
      <Header aiConfigured={aiConfigured} modelName={modelName} />

      {/* Functional Workspace Header */}
      <section className="no-print border-b border-ink-rule bg-paper-surface">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              Check a Question Paper
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-secondary mt-1 max-w-xl">
              Paste or upload an exam paper to verify marks arithmetic, single-answer MCQs, scientific units, and question clarity.
            </p>
          </div>

          <div className="hidden sm:block flex-shrink-0 ml-4">
            <InteractivePaperCanvas
              step={step}
              findingCount={checkReport.findings.filter((f) => !f.dismissed).length}
            />
          </div>
        </div>
      </section>

      {/* Progress Workflow Margin Index */}
      <StepIndicator
        currentStep={step}
        onStepClick={(s) => setStep(s)}
        canNavigateToStep={canNavigateToStep}
      />

      {/* Main Content View per Step */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8">
        {step === 1 && (
          <Step1AddPaper
            metadata={metadata}
            rawPaperText={rawPaperText}
            rawAnswerKeyText={rawAnswerKeyText}
            aiConfigured={aiConfigured}
            onMetadataChange={setMetadata}
            onPaperTextChange={setRawPaperText}
            onAnswerKeyTextChange={setRawAnswerKeyText}
            onContinue={handleContinueToConfirm}
            onLoadSample={handleLoadSample}
            onAIStructureAssist={handleAIStructureAssist}
            isAIStructuring={isAIStructuring}
          />
        )}

        {step === 2 && (
          <Step2ConfirmQuestions
            questions={questions}
            metadata={metadata}
            unparsedLines={unparsedLines}
            unsupportedFeatures={unsupportedFeatures}
            parseWarnings={parseWarnings}
            onQuestionsChange={(qs) => setQuestions(qs)}
            onProceedToReview={handleProceedToReview}
            onBackToAddPaper={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3ReviewFindings
            questions={questions}
            metadata={metadata}
            checkReport={checkReport}
            aiConfigured={aiConfigured}
            aiLoading={aiLoading}
            aiErrorMessage={aiErrorMessage}
            hasUndo={history.length > 0}
            onUndo={handleUndo}
            onQuestionsChange={handleQuestionsChange}
            onApplyCorrection={handleApplyCorrection}
            onDismissFinding={handleDismissFinding}
            onRestoreFinding={handleRestoreFinding}
            onRecheck={handleRecheck}
            onProceedToExport={() => setStep(4)}
            onBackToConfirm={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <Step4Export
            questions={questions}
            metadata={metadata}
            checkReport={checkReport}
            rawPaperText={rawPaperText}
            rawAnswerKeyText={rawAnswerKeyText}
            onBackToReview={() => setStep(3)}
            onRestoreDraft={handleRestoreDraft}
          />
        )}
      </main>

      {/* Minimal Utility Footer */}
      <footer className="no-print mt-auto py-4 border-t border-ink-rule text-center font-mono text-[11px] text-ink-secondary">
        <p>
          PaperCheck &bull; School Question Paper Quality Assurance &bull; In-memory execution
        </p>
      </footer>
    </div>
  );
}
