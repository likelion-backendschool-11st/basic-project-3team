// Generated from Stitch screen "Dev in_ 관리자 신고 관리 (11번)". Scoped to #page-admin-reports so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-admin-reports",
  content: ["./src/pages/AdminReports.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
