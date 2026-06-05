import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#1F4B99",
          light: "#EEF3FF",
          mid: "#4F7FE6",
          50: "#EEF3FF",
          100: "#D6E4FF",
          500: "#1F4B99",
          600: "#1a3e85",
          700: "#163270",
        },
        gold: {
          DEFAULT: "#C8A04D",
          light: "#FDF6E7",
          500: "#C8A04D",
          600: "#b08a38",
        },
        success: {
          DEFAULT: "#15803D",
          bg: "#F0FDF4",
          50: "#F0FDF4",
          600: "#15803D",
        },
        warning: {
          DEFAULT: "#D97706",
          bg: "#FFFBEB",
          50: "#FFFBEB",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#DC2626",
          bg: "#FEF2F2",
          50: "#FEF2F2",
          600: "#DC2626",
        },
        draft: {
          DEFAULT: "#64748B",
          bg: "#F8FAFC",
        },
        info: {
          DEFAULT: "#2563EB",
          bg: "#EFF6FF",
        },
        surface: "#FFFFFF",
        background: "#FAFBFC",
        border: "#E6EAF0",
        muted: "#6B7280",
        heading: "#111827",
      },
      borderRadius: {
        btn: "10px",
        card: "14px",
        input: "10px",
        dialog: "20px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
