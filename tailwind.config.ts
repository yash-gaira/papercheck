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
          bg: "#F6F3EC",
          surface: "#FBFAF6",
          ruled: "#EAE5D9",
        },
        ink: {
          DEFAULT: "#1A1A18",
          secondary: "#5C5A54",
          muted: "#8C897E",
          rule: "#D9D4C7",
          faint: "#EBE7DC",
        },
        redpen: {
          DEFAULT: "#C8372D",
          dark: "#A62B22",
          faint: "#FDF2F0",
          border: "#F3C5C1",
        },
        pencil: {
          green: "#3F6B4E",
          faint: "#F2F7F4",
          border: "#C8DC CF",
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
