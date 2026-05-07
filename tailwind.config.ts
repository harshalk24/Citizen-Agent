import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   "#0b0d10",
          secondary: "#12161b",
          tertiary:  "#161b22",
          "paper-2": "#1c222b",
        },
        accent: {
          blue:       "#6aa6d8",
          "blue-dim": "rgba(106,166,216,0.14)",
          "blue-deep":"#4a8cc4",
          glow:       "rgba(106,166,216,0.20)",
        },
        tx: {
          primary:   "#f4f5f7",
          secondary: "#8a93a0",
          muted:     "#5b636e",
          "ink-2":   "#c8ced6",
        },
        border:    "#232932",
        "border-strong": "#2e3540",
        success:   "#5fb172",
        warning:   "#d6a35a",
        danger:    "#d9636b",
        verified:  "#6aa6d8",
        copilot:   "#b8a4ff",
        warm:      "#c9b48e",
        cream:     "#e8e4d6",
      },
      fontFamily: {
        sans:    ["var(--font-inter-tight)", "var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif:   ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      borderColor: {
        DEFAULT: "#232932",
      },
      boxShadow: {
        xs:           "0 1px 2px rgba(0,0,0,0.04)",
        sm:           "0 1px 2px rgba(0,0,0,0.08)",
        card:         "0 4px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 0 24px rgba(106,166,216,0.08)",
        "glow-blue":  "0 0 20px rgba(106,166,216,0.25)",
        "btn-glow":   "0 0 20px rgba(106,166,216,0.40)",
        glass:        "0 8px 32px rgba(0,0,0,0.5)",
        lg:           "0 12px 28px rgba(0,0,0,0.10)",
      },
      animation: {
        "fade-in":    "fadeIn 220ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-up": "fadeInUp 220ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-up":   "slideUp 220ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-down": "slideDown 220ms cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":   "scaleIn 220ms cubic-bezier(0.16,1,0.3,1) both",
        "pulse-live": "pulseLiveDot 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeInUp:     { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown:    { from: { opacity: "0", transform: "translateY(-10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn:      { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulseLiveDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
      },
    },
  },
  plugins: [],
};

export default config;
