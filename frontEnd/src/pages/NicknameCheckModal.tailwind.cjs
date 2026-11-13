// Generated from Stitch screen "Dev in_ 닉네임 중복확인 모달 (15번)". Scoped to #page-nickname-check-modal so it can't clash with other screens.
module.exports = {
  important: "#page-nickname-check-modal",
  content: ["./src/pages/NicknameCheckModal.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: "#2563eb",
          dark: "#111827",
        },
        boxShadow: {
          brutal: "8px 8px 0px #111111",
          "brutal-sm": "4px 4px 0px #111111",
          "brutal-active": "0px 0px 0px #111111",
        },
      },
    },
  },
};
