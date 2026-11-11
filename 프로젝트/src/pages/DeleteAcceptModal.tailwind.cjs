// Generated from Stitch screen "Dev in_ 삭제 및 채택 확인 모달 (27번)". Scoped to #page-delete-accept-modal so it can't clash with other screens.
module.exports = {
  important: "#page-delete-accept-modal",
  content: ["./src/pages/DeleteAcceptModal.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            dark: "#111827",
            red: "#E11D48",
            green: "#16A34A",
            yellow: "#FBBF24",
            gray: "#F3F4F6",
          },
        },
        fontFamily: {
          sans: ['"Noto Sans KR"', "Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
        },
        boxShadow: {
          "brutal-sm": "3px 3px 0 #111111",
          brutal: "5px 5px 0 #111111",
          "brutal-lg": "8px 8px 0 #111111",
        },
      },
    },
  },
};
