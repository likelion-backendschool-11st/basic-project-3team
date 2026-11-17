// Generated from Stitch screen "Dev in_ 검색 결과 (9번)". Scoped to #page-search-results so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-search-results",
  content: ["./src/pages/SearchResults.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
