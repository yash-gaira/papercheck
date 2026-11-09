"use client";

import React, { useEffect, useState } from "react";

export type ThemeMode = "paper" | "ink" | "contrast" | "system";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>("paper");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("papercheck-theme") as ThemeMode | null;
      if (stored && ["paper", "ink", "contrast", "system"].includes(stored)) {
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        setTheme("paper");
        document.documentElement.setAttribute("data-theme", "paper");
      }
    } catch {
      // fallback
    }
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
    try {
      localStorage.setItem("papercheck-theme", mode);
      document.documentElement.setAttribute("data-theme", mode);
      // Dispatch custom event for canvas or other components that want instant reactivity
      window.dispatchEvent(new CustomEvent("papercheck-theme-change", { detail: { theme: mode } }));
    } catch {
      // ignore
    }
  };

  const themeLabels: Record<ThemeMode, { label: string; badge: string }> = {
    paper: { label: "Paper", badge: "Warm" },
    ink: { label: "Ink", badge: "Dark" },
    contrast: { label: "Contrast", badge: "High" },
    system: { label: "System", badge: "Auto" },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Color Theme"
        aria-expanded={isOpen}
        className="font-mono text-[11px] text-ink-secondary hover:text-ink px-2 py-1 border border-ink-rule hover:border-ink rounded-[2px] transition-colors flex items-center space-x-1.5"
      >
        <span
          className="w-2 h-2 rounded-full inline-block border border-ink-rule"
          style={{
            backgroundColor:
              theme === "ink"
                ? "#1C1C1A"
                : theme === "contrast"
                ? "#000000"
                : theme === "system"
                ? "#8C897E"
                : "#FBFAF6",
          }}
        />
        <span>{themeLabels[theme]?.label || "Theme"}</span>
        <span className="text-[9px] text-ink-muted">▾</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 mt-1 w-36 bg-paper-surface border border-ink-rule shadow-sheet-lifted rounded-[2px] py-1 z-50 font-mono text-xs"
          >
            {(["paper", "ink", "contrast", "system"] as ThemeMode[]).map((mode) => {
              const active = theme === mode;
              return (
                <button
                  key={mode}
                  role="menuitem"
                  type="button"
                  onClick={() => handleSelectTheme(mode)}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                    active
                      ? "bg-paper-bg text-ink font-semibold"
                      : "text-ink-secondary hover:bg-paper-bg/60 hover:text-ink"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block border border-ink-rule"
                      style={{
                        backgroundColor:
                          mode === "ink"
                            ? "#1C1C1A"
                            : mode === "contrast"
                            ? "#000000"
                            : mode === "system"
                            ? "#8C897E"
                            : "#FBFAF6",
                      }}
                    />
                    <span>{themeLabels[mode].label}</span>
                  </span>
                  <span className="text-[10px] text-ink-muted font-normal">
                    {themeLabels[mode].badge}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

