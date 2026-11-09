import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: "var(--paper-bg)",
          surface: "var(--paper-surface)",
          ruled: "var(--paper-ruled)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          rule: "var(--ink-rule)",
          faint: "var(--ink-faint)",
        },
        redpen: {
          DEFAULT: "var(--redpen)",
          dark: "var(--redpen-dark)",
          faint: "var(--redpen-faint)",
          border: "var(--redpen-border)",
        },
        pencil: {
          green: "var(--pencil-green)",
          faint: "var(--pencil-faint)",
          border: "var(--pencil-border)",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        sheet: "0 1px 3px rgba(26,26,24,0.06), 0 1px 2px rgba(26,26,24,0.04)",
        "sheet-lifted": "0 10px 25px -5px rgba(26,26,24,0.08), 0 8px 10px -6px rgba(26,26,24,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
