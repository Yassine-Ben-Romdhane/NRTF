import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
theme: {
    extend: {
      colors: {
        nrtf: {
          bg:        "hsl(var(--nrtf-bg) / <alpha-value>)",
          surface:   "hsl(var(--nrtf-surface) / <alpha-value>)",
          primary:   "hsl(var(--nrtf-primary) / <alpha-value>)",
          secondary: "hsl(var(--nrtf-secondary) / <alpha-value>)",
          accent:    "hsl(var(--nrtf-accent) / <alpha-value>)",
          light:     "hsl(var(--nrtf-light) / <alpha-value>)",
          text:      "hsl(var(--nrtf-text) / <alpha-value>)",
          muted:     "hsl(var(--nrtf-muted) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans:    ["var(--font-syne)", "system-ui", "sans-serif"],
        display: ["var(--font-alro)", "system-ui", "sans-serif"],
        serif:   ["var(--font-syne)", "system-ui", "sans-serif"],
        syne:    ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(109,217,207,0.15)" },
          "50%":      { boxShadow: "0 0 40px rgba(109,217,207,0.3)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
      },
      animation: {
        "fade-up":   "fade-up 0.7s ease-out forwards",
        "fade-in":   "fade-in 1s ease-out forwards",
        float:       "float 4s ease-in-out infinite",
        glow:        "glow 3s ease-in-out infinite",
        shimmer:     "shimmer 3s linear infinite",
        blink:       "blink 0.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
