import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        ink: { DEFAULT: "#0f172a", soft: "#334155", muted: "#64748b", faint: "#94a3b8" },
        canvas: "#fafafa",
        panel: "#ffffff",
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)" },
    },
  },
  plugins: [],
};
export default config;
