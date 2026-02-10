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
        primary: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
        },
        accent: {
          50: "#fff4e6",
          100: "#ffe8cc",
          200: "#ffd8a8",
          300: "#ffc078",
          400: "#ffa94d",
          500: "#ff922b",
          600: "#fd7e14",
          700: "#f76707",
          800: "#e8590c",
          900: "#d9480f",
        },
      },
      animation: {
        "card-play": "cardPlay 0.4s ease-out",
        "damage-shake": "damageShake 0.3s ease-in-out",
        "heal-glow": "healGlow 0.5s ease-in-out",
        "shield-up": "shieldUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        cardPlay: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "50%": { transform: "translateY(-40px) scale(1.1)", opacity: "0.8" },
          "100%": { transform: "translateY(-80px) scale(0.8)", opacity: "0" },
        },
        damageShake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
        healGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(72, 187, 120, 0)" },
          "50%": { boxShadow: "0 0 20px 10px rgba(72, 187, 120, 0.3)" },
        },
        shieldUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
