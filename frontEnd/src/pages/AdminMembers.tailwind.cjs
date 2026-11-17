// Generated from Stitch screen "Dev in_ 관리자 회원 관리 (12번)". Scoped to #page-admin-members so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-admin-members",
  content: ["./src/pages/AdminMembers.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
