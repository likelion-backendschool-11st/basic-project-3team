// Generated from Stitch screen "Dev in_ 개인정보 수정 (21번)". Scoped to #page-account-edit so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-account-edit",
  content: ["./src/pages/AccountEdit.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
