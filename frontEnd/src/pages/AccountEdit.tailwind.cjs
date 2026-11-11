// Generated from Stitch screen "Dev in_ 개인정보 수정 (21번)". Scoped to #page-account-edit so it can't clash with other screens.
module.exports = {
  important: "#page-account-edit",
  content: ["./src/pages/AccountEdit.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Noto Sans KR"', "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
        },
        colors: {
          cream: "#FFFDF5",
          "neo-black": "#111111",
          "neo-yellow": "#FACC15",
          "neo-blue": "#3B82F6",
          "neo-card": "#F4F1EA",
          "neo-disabled": "#E7E2D6",
          "neo-hint": "#6B7280",
        },
        boxShadow: {
          brutal: "5px 5px 0px #111111",
          "brutal-sm": "3px 3px 0px #111111",
          "brutal-pressed": "1px 1px 0px #111111",
        },
        borderWidth: {
          2.5: "2.5px",
        },
      },
    },
  },
};
