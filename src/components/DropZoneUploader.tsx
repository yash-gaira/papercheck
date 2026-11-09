"use client";

import React, { useState, useRef } from "react";
import { extractTextFromPhoto } from "@/lib/ocr";

interface DropZoneUploaderProps {
  onTextLoaded: (
    text: string,
    mode: "replace" | "append",
    metadata?: { source: "file" | "photo"; name: string; confidence?: number }
  ) => void;
  hasExistingText: boolean;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  buttonText?: string;
  targetName?: string;
}

export const DropZoneUploader: React.FC<DropZoneUploaderProps> = ({
  onTextLoaded,
  hasExistingText,
  disabled = false,
  label = "Drag & drop document or photo",
  sublabel = "Open-source Tesseract OCR extracts printed text automatically",
  buttonText = "Browse File or Photo",
  targetName = "draft",
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatusText, setOcrStatusText] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Text File Reading
  const handleTextFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        setNotice({
          type: "error",
          message: `The file "${file.name}" is empty.`,
        });
        return;
      }
      onTextLoaded(content, "replace", { source: "file", name: file.name });
      setNotice({
        type: "success",
        message: `Imported "${file.name}" (${(file.size / 1024).toFixed(1)} KB) successfully.`,
      });
    };
    reader.onerror = () => {
      setNotice({
        type: "error",
        message: `Failed to read file "${file.name}". Please try again.`,
      });
    };
    reader.readAsText(file);
  };

  // Handle Photo / Image File with Open-Source OCR
  const handlePhotoFile = async (file: File) => {
    setIsProcessingOcr(true);
    setOcrProgress(5);
    setOcrStatusText("Preparing open-source Tesseract OCR engine...");
    setNotice(null);

    // Create thumbnail preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      const result = await extractTextFromPhoto(file, (percent, status) => {
        setOcrProgress(percent);
        setOcrStatusText(status);
      });

      if (!result.text || result.text.trim().length === 0) {
        setNotice({
          type: "error",
          message:
            "No printed text could be recognized. Please ensure the photo has adequate lighting and sharp focus. Note: Handwritten papers are not supported.",
        });
        setIsProcessingOcr(false);
        return;
      }

      onTextLoaded(result.text, "replace", {
        source: "photo",
        name: file.name,
        confidence: result.confidence,
      });

      setNotice({
        type: "success",
        message: `Recognized printed text from "${file.name}" (Confidence: ${Math.round(
          result.confidence
        )}%). Please review extracted questions below.`,
      });
    } catch (err: unknown) {
      setNotice({
        type: "error",
        message: `OCR Processing error: ${
          (err as Error)?.message || "Failed to process photo."
        }`,
      });
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Dispatch incoming file based on MIME type
  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      handlePhotoFile(file);
    } else if (
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".json")
    ) {
      handleTextFile(file);
    } else {
      setNotice({
        type: "error",
        message: `Unsupported file type "${file.name}". Please provide a .txt/.md document or a photo (.png, .jpg, .webp).`,
      });
    }
  };

  // Drag and Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessingOcr) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isProcessingOcr) return;

    // Check for dropped files
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
      return;
    }

    // Check for dropped text selection
    const textData = e.dataTransfer.getData("text/plain");
    if (textData && textData.trim()) {
      onTextLoaded(textData, "append", { source: "file", name: "Dropped snippet" });
      setNotice({
        type: "success",
        message: "Inserted dropped text snippet into question draft.",
      });
    }
  };

  // Clipboard Paste Support (e.g. Win+Shift+S screenshot)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handlePhotoFile(file);
          return;
        }
      }
    }
  };

  // File Picker Change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // reset input so the same file can be picked again if desired
    e.target.value = "";
  };

  return (
    <div
      onPaste={handlePaste}
      className="space-y-2 text-xs font-mono"
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.text,image/png,image/jpeg,image/jpg,image/webp,image/bmp"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled || isProcessingOcr}
      />

      {/* Drag & Drop Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-[3px] p-3.5 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDragOver
            ? "border-redpen bg-redpen-faint/60 ring-2 ring-redpen/20"
            : "border-ink-rule hover:border-ink bg-paper-bg/40 hover:bg-paper-bg/70"
        }`}
      >
        {/* Left: Icon & Description */}
        <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
          <div className="w-7 h-7 rounded-[2px] border border-ink-rule flex items-center justify-center bg-paper-surface flex-shrink-0 text-ink">
            {isProcessingOcr ? (
              <svg className="animate-spin h-3.5 w-3.5 text-ink" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </div>

          <div>
            <div className="text-ink font-semibold flex items-baseline space-x-2">
              <span>{label}</span>
              <span className="text-[10px] text-ink-muted hidden md:inline">
                (.txt, .md, .png, .jpg, or clipboard paste)
              </span>
            </div>
            <p className="text-[10.5px] text-ink-secondary">
              {sublabel}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {hasExistingText && (
            <span className="text-[10px] text-ink-muted hidden lg:inline">
              (Replaces {targetName})
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessingOcr}
            className="px-3 py-1.5 bg-paper-surface border border-ink-rule hover:border-ink text-ink text-[11px] font-semibold rounded-[2px] transition-colors disabled:opacity-40"
          >
            {isProcessingOcr ? "Processing..." : buttonText}
          </button>
        </div>
      </div>

      {/* OCR Active Processing Bar */}
      {isProcessingOcr && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-paper-surface border border-ink-rule rounded-[2px] space-y-2 shadow-xs"
        >
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              {previewImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImage}
                  alt="Exam paper thumbnail"
                  className="w-7 h-7 object-cover rounded-[2px] border border-ink-rule flex-shrink-0"
                />
              )}
              <span className="w-2 h-2 rounded-full bg-redpen animate-pulse inline-block" />
              <span className="font-semibold text-ink">Open-Source Tesseract OCR:</span>
              <span className="text-ink-secondary truncate max-w-[180px] sm:max-w-xs">{ocrStatusText}</span>
            </div>
            <span className="font-bold text-ink">{ocrProgress}%</span>
          </div>

          {/* Progress track */}
          <div className="w-full h-1.5 bg-paper-bg rounded-full overflow-hidden border border-ink-rule">
            <div
              className="h-full bg-ink transition-all duration-200"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-ink-muted">
            <span>Model: Tesseract LSTM Engine (Apache 2.0 Open Source)</span>
            <span>Client-side private execution</span>
          </div>
        </div>
      )}

      {/* User Feedback Notice */}
      {notice && (
        <div
          className={`p-2.5 rounded-[2px] border text-[11px] flex items-start justify-between gap-2 ${
            notice.type === "success"
              ? "bg-pencil-faint border-pencil-border text-pencil-green font-medium"
              : notice.type === "error"
              ? "bg-redpen-faint border-redpen-border text-redpen font-medium"
              : "bg-paper-bg border-ink-rule text-ink-secondary"
          }`}
        >
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold">{notice.type === "error" ? "!" : "✓"}</span>
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="hover:underline text-[10px] uppercase font-bold opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

