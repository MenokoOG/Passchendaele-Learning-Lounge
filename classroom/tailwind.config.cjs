/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // controlled by .dark on root
  theme: {
    extend: {
      colors: {
        /* runtime-color tokens map to CSS variables so theme switching is dynamic */
        brand: "var(--classroom-primary)",
        "brand-600": "var(--classroom-primary-600)",
        surface: "var(--surface-bg)",
        "surface-contrast": "var(--surface-contrast)",
        muted: "var(--text-muted)",
        "text-default": "var(--text-default)",
        accent: "var(--accent)",
        success: "var(--success)",
        error: "var(--error)",
      },
      boxShadow: {
        "soft-card": "var(--shadow-md)",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
