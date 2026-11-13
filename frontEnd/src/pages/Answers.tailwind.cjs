// Generated from Stitch screen "Dev in_ 답변 목록 및 작성 (24번)". Scoped to #page-answers so it can't clash with other screens.
module.exports = {
  important: "#page-answers",
  content: ["./src/pages/Answers.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          cream: "#FFFDF5",
          neoBlack: "#121212",
          neoPrimary: "#2563EB",
          neoGreen: "#22C55E",
          neoGreenBg: "#F0FDF4",
          neoGrayBg: "#F8FAFC",
          neoBadgeResolved: "#DCFCE7",
          neoBadgeResolvedText: "#15803D",
          neoBadgeUnresolved: "#F1F5F9",
          neoBadgeUnresolvedText: "#64748B",
          neoGold: "#F59E0B",
        },
        boxShadow: {
          brutal: "5px 5px 0px #121212",
          "brutal-sm": "3px 3px 0px #121212",
          "brutal-hover": "1px 1px 0px #121212",
        },
        borderWidth: {
          3: "2.5px",
        },
      },
    },
  },
};
