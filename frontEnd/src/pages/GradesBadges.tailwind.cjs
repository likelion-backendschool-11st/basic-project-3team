// Generated from Stitch screen "Dev in_ 등급 및 뱃지 (19번)". Scoped to #page-grades-badges so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-grades-badges",
  content: ["./src/pages/GradesBadges.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
