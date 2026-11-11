// Generated from Stitch screen "Dev in_ 작성자 요약 팝오버 (30번)". Scoped to #page-author-popover so it can't clash with other screens.
module.exports = {
  important: "#page-author-popover",
  content: ["./src/pages/AuthorPopover.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            surface: "#FFFFFF",
            yellow: "#FACC15",
            amber: "#FEF08A",
            green: "#22C55E",
            mint: "#DCFCE7",
            gray: {
              50: "#F9FAFB",
              100: "#F3F4F6",
              200: "#E5E7EB",
              700: "#374151",
              800: "#1F2937",
              900: "#111827",
            },
          },
        },
        fontFamily: {
          sans: ['"Noto Sans KR"', "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
        },
        boxShadow: {
          "brutal-sm": "2px 2px 0px #000000",
          "brutal-md": "4px 4px 0px #000000",
          "brutal-lg": "8px 8px 0px #000000",
          "brutal-button": "3px 3px 0px #000000",
        },
      },
    },
  },
};
