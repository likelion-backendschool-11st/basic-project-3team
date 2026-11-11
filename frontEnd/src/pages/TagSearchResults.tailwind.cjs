// Generated from Stitch screen "Dev in_ 태그 검색 결과 (10번)". Scoped to #page-tag-search-results so it can't clash with other screens.
module.exports = {
  important: "#page-tag-search-results",
  content: ["./src/pages/TagSearchResults.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          "brutal-bg": "#FFFDF5",
          "brutal-yellow": "#FFE600",
          "brutal-black": "#111111",
          "brutal-card": "#FFFFFF",
          "brutal-accent": "#FF5C00",
        },
        boxShadow: {
          "brutal-sm": "2px 2px 0px #111111",
          brutal: "3.5px 3.5px 0px #111111",
          "brutal-lg": "5px 5px 0px #111111",
        },
        borderWidth: {
          brutal: "2.5px",
        },
      },
    },
  },
};
