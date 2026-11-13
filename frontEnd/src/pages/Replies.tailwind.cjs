// Generated from Stitch screen "Dev in_ 답글 목록 및 작성 (25번)". Scoped to #page-replies so it can't clash with other screens.
module.exports = {
  important: "#page-replies",
  content: ["./src/pages/Replies.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            yellow: "#FFDE59",
            green: "#22C55E",
            greenLight: "#DCFCE7",
            red: "#EF4444",
            redLight: "#FEE2E2",
            grayLight: "#F3F4F6",
          },
        },
        fontFamily: {
          sans: ["Inter", "system-ui", "sans-serif"],
          mono: ["JetBrains Mono", "monospace"],
        },
        boxShadow: {
          brutal: "4px 4px 0px 0px #000000",
          "brutal-sm": "2.5px 2.5px 0px 0px #000000",
          "brutal-lg": "6px 6px 0px 0px #000000",
        },
      },
    },
  },
};
