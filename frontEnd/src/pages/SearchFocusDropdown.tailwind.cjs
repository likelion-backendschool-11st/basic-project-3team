// Generated from Stitch screen "Dev in_ 검색 포커스 드롭다운 (6번)". Scoped to #page-search-focus-dropdown so it can't clash with other screens.
module.exports = {
  important: "#page-search-focus-dropdown",
  content: ["./src/pages/SearchFocusDropdown.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brutal: {
            bg: "#fcfcfc",
            border: "#111827",
            accent: "#facc15",
            hover: "#fef08a",
          },
        },
        boxShadow: {
          "brutal-sm": "2px 2px 0px 0px #111827",
          brutal: "4px 4px 0px 0px #111827",
          "brutal-lg": "6px 6px 0px 0px #111827",
        },
      },
    },
  },
};
