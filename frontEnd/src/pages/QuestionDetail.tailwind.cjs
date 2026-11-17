// Generated from Stitch screen "Dev in_ 질문 상세 (23번)". Scoped to #page-question-detail so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-question-detail",
  // 공통 컴포넌트(Header·검색창·FieldError 등)의 클래스도 이 화면 CSS에 만든다.
  content: ["./src/pages/QuestionDetail.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
