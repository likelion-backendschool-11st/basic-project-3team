// Generated from Stitch screen "Dev in_ 질문하기 (20번)". Scoped to #page-ask so it can't clash with other screens.
module.exports = {
  important: "#page-ask",
  content: ["./src/pages/Ask.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            blue: "#2563EB",
            dark: "#111827",
            gray: "#F3F4F6",
            border: "#000000",
          },
        },
        boxShadow: {
          brutal: "3px 3px 0px #000000",
          "brutal-sm": "2px 2px 0px #000000",
          "brutal-lg": "5px 5px 0px #000000",
        },
      },
    },
  },
};
