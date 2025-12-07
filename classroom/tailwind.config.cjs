/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        classroom: {
          // calm, warm study palette
          primary: "#0ea5a4", // teal-ish (feel-good)
          accent: "#f59e0b", // warm amber accent
          surface: "#fbfdfe", // near-white surface
          muted: "#94a3b8", // muted text
        },
      },
      boxShadow: {
        "soft-card": "0 6px 18px rgba(8,15,26,0.06)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
