// Generated from Stitch screen "Dev in_ 질문 상세 (23번)". Scoped to #page-question-detail so it can't clash with other screens.
module.exports = {
  important: "#page-question-detail",
  // 공통 컴포넌트(Header·검색창·FieldError 등)의 클래스도 이 화면 CSS에 만든다.
  content: ["./src/pages/QuestionDetail.tsx", "./src/components/**/*.tsx"],
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
          neoBlack: "#121212",
          neoGreen: "#4ADE80",
          neoGreenLight: "#DCFCE7",
          neoYellow: "#FACC15",
          neoRed: "#EF4444",
          terminalBg: "#111111",
        },
        boxShadow: {
          brutal: "5px 5px 0px #121212",
          "brutal-sm": "3px 3px 0px #121212",
          "brutal-hover": "2px 2px 0px #121212",
        },
        borderWidth: {
          thick: "2.5px",
        },
      },
    },
  },
};
