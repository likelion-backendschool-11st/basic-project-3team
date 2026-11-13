// Generated from Stitch screen "Dev in_ 등급 및 뱃지 (19번)". Scoped to #page-grades-badges so it can't clash with other screens.
module.exports = {
  important: "#page-grades-badges",
  // 공통 헤더(components/Header) 스타일도 이 화면 범위로 만든다
  content: ["./src/pages/GradesBadges.tsx", "./src/components/**/*.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            yellow: "#FACC15",
            blue: "#60A5FA",
            dark: "#1E293B",
            bg: "#F8FAFC",
          },
        },
        boxShadow: {
          brutal: "4px 4px 0px 0px #0F172A",
          "brutal-sm": "2px 2px 0px 0px #0F172A",
          "brutal-lg": "6px 6px 0px 0px #0F172A",
        },
      },
    },
  },
};
