// Generated from Stitch screen "Dev in_ 회원가입 완료 모달 (16번)". Scoped to #page-signup-complete-modal so it can't clash with other screens.
const { fontFamily } = require("../../tailwind.fonts.cjs");
module.exports = {
  important: "#page-signup-complete-modal",
  content: ["./src/pages/SignupCompleteModal.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily,
        colors: {
          brand: {
            yellow: "#FACC15",
            green: "#22C55E",
            blue: "#3B82F6",
            dark: "#111827",
            bg: "#F3F4F6",
          },
        },
        boxShadow: {
          "brutal-sm": "2px 2px 0px #000000",
          brutal: "4px 4px 0px #000000",
          "brutal-lg": "8px 8px 0px #000000",
        },
      },
    },
  },
};
