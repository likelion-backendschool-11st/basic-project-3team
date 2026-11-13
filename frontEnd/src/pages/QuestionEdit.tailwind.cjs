// Generated from Stitch screen "Dev in_ 질문 수정 (22번)". Scoped to #page-question-edit so it can't clash with other screens.
module.exports = {
  important: "#page-question-edit",
  // 공통 컴포넌트(Header·검색창·FieldError 등)의 클래스도 이 화면 CSS에 만든다.
  content: ["./src/pages/QuestionEdit.tsx", "./src/components/**/*.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          "cream-bg": "#FFFDF5",
          "neo-yellow": "#FACC15",
          "neo-blue": "#2563EB",
          "neo-blue-hover": "#1D4ED8",
          "neo-dark": "#111827",
        },
        boxShadow: {
          "neo-sm": "2px 2px 0 #111111",
          "neo-md": "3.5px 3.5px 0 #111111",
          "neo-hard": "5px 5px 0 #111111",
          "neo-hard-hover": "2px 2px 0 #111111",
        },
        borderWidth: {
          3: "2.5px",
        },
      },
    },
  },
};
