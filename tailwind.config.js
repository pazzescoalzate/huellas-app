/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg0: "#0E0F12",
        bg1: "#131419",
        bg2: "#181A20",
        bg3: "#1F222A",
        ink: {
          DEFAULT: "rgba(245,242,237,0.80)",
          strong: "#F5F2ED",
          soft: "rgba(245,242,237,0.58)",
          faint: "rgba(245,242,237,0.40)",
          ghost: "rgba(245,242,237,0.16)",
        },
        terracota: { DEFAULT: "#D2734F", soft: "#E89571", deep: "#B0532F" },
        arena: "#D9C2A3",
        salvia: "#8AA590",
        piedra: "#8A8F98",
        azul: { DEFAULT: "#5C7FB0", deep: "#2C4768" },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          deep: "var(--accent-deep)",
          on: "#1A0F09",
        },
        cardstroke: "rgba(245,242,237,0.09)",
        glassstroke: "rgba(245,242,237,0.12)",
      },
      borderRadius: { sm: "10px", md: "16px", lg: "22px", xl: "30px" },
      fontFamily: {
        sans: ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        elev1: "0 2px 6px rgba(0,0,0,0.28)",
        elev2: "0 8px 24px rgba(0,0,0,0.38)",
        elev3: "0 20px 56px rgba(0,0,0,0.50)",
      },
      backdropBlur: { glass: "28px" },
    },
  },
  corePlugins: { preflight: false },
  plugins: [],
};
