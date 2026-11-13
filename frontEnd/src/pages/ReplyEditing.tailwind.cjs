// Generated from Stitch screen "Dev in_ 답변/답글 수정 중 (26번)". Scoped to #page-reply-editing so it can't clash with other screens.
module.exports = {
  important: "#page-reply-editing",
  content: ["./src/pages/ReplyEditing.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            yellow: "#FFE600",
            blue: "#2563EB",
            "blue-light": "#EFF6FF",
            green: "#22C55E",
            "green-light": "#DCFCE7",
            red: "#EF4444",
            dark: "#111827",
          },
        },
        fontFamily: {
          sans: ["Pretendard", "Plus Jakarta Sans", "sans-serif"],
          mono: ["Fira Code", "monospace"],
        },
        boxShadow: {
          brutal: "4px 4px 0px 0px #000000",
          "brutal-sm": "2.5px 2.5px 0px 0px #000000",
          "brutal-hover": "1px 1px 0px 0px #000000",
          "brutal-blue": "4px 4px 0px 0px #2563EB",
        },
      },
    },
  },
};
