/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      colors: {
        "bg-primary": "#011C26",
        "bg-secondary": "#074A59",
        "bg-content": "#06242E",
        "accent-primary": "#0B9EBF",
        "accent-light": "#1FAFBF",
        "text-primary": "#F2F2F2",
        danger: "#E05252",
        warning: "#E0A048",
        success: "#3DB87A",
      },
      borderColor: {
        DEFAULT: "rgba(27, 175, 191, 0.25)",
      },
    },
  },
  plugins: [],
};
