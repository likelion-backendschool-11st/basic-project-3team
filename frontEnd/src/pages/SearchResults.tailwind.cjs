// Generated from Stitch screen "Dev in_ 검색 결과 (9번)". Scoped to #page-search-results so it can't clash with other screens.
module.exports = {
  important: "#page-search-results",
  content: ["./src/pages/SearchResults.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          "neo-bg": "#FFFDF5",
          "neo-yellow": "#FFD43B",
          "neo-blue": "#2563EB",
          "neo-dark": "#111111",
          "neo-green": "#10B981",
          "neo-gray": "#E5E7EB",
        },
        boxShadow: {
          neo: "5px 5px 0px #111111",
          "neo-sm": "3px 3px 0px #111111",
          "neo-hover": "2px 2px 0px #111111",
        },
      },
    },
  },
};
