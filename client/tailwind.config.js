/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          bg: "#020817",
          deep: "#041220",
          secondary: "#071A2C",
          surface: "#0B2238",
          card: "#10263D",
          elevated: "#132D47",
          sidebar: "#05101B",
          navbar: "rgba(5, 16, 27, 0.75)",
        },
        mint: {
          DEFAULT: "#A7F3D0",
          sage: "#84CCB3",
          seafoam: "#6EE7C8",
          emerald: "#34D399",
          darkEmerald: "#10B981",
          forest: "#047857",
          muted: "#2F6F63",
        },
        royalBlue: {
          DEFAULT: "#3B82F6",
          ocean: "#1E40AF",
          navy: "#12385C",
          deep: "#0A2540",
        },
        primary: {
          DEFAULT: "#34D399",
          light: "#A7F3D0",
          dark: "#10B981",
        },
        accent: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        background: {
          dark: "#020817",
          darker: "#020817",
          card: "#10263D",
          cardBorder: "rgba(255, 255, 255, 0.06)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        glass: "0 12px 40px rgba(0, 0, 0, 0.28)",
        glow: "0 0 25px -5px rgba(52, 211, 153, 0.3)",
        "glow-blue": "0 0 25px -5px rgba(59, 130, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
