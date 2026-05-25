/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: "#00ff41",
        swe: "#3b82f6",
        darkbg: "#0a0a0a",
        cardbg: "#141414",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        spin: "spin 4s linear infinite",
        blink: "blink 1s step-end infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        blink: { "50%": { opacity: "0" } },
      },
    },
  },
  plugins: [],
};
