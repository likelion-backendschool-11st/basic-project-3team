// Generated from Stitch screen "Dev in_ 질문 신고 모달 (28번)". Scoped to #page-report-modal so it can't clash with other screens.
module.exports = {
  important: "#page-report-modal",
  content: ["./src/pages/ReportModal.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Noto Sans KR"', "sans-serif"],
        },
        colors: {
          brand: {
            cream: "#FFFDF9",
            dark: "#111827",
            red: "#E11D48",
            yellow: "#FACC15",
            grayBg: "#F3F4F6",
          },
        },
        boxShadow: {
          "brutal-sm": "2px 2px 0px #111827",
          brutal: "3px 3px 0px #111827",
          "brutal-lg": "6px 6px 0px #111827",
          "brutal-xl": "8px 8px 0px #111827",
        },
      },
    },
  },
};
