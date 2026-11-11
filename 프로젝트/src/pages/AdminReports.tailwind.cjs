// Generated from Stitch screen "Dev in_ 관리자 신고 관리 (11번)". Scoped to #page-admin-reports so it can't clash with other screens.
module.exports = {
  important: "#page-admin-reports",
  content: ["./src/pages/AdminReports.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Noto Sans KR"', '"Space Grotesk"', "sans-serif"],
          mono: ['"Space Grotesk"', "monospace"],
        },
        colors: {
          brand: {
            yellow: "#FFD43B",
            primary: "#FF6B6B",
            dark: "#121212",
            lightGray: "#F4F4F0",
          },
        },
        boxShadow: {
          brutal: "3px 3px 0px #121212",
          "brutal-lg": "5px 5px 0px #121212",
          "brutal-sm": "2px 2px 0px #121212",
        },
      },
    },
  },
};
