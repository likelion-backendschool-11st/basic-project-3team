// Generated from Stitch screen "Dev in_ 로그인". Scoped to #page-login so it can't clash with other screens.
module.exports = {
  important: "#page-login",
  content: ["./src/pages/Login.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            yellow: "#FFD43B",
            blue: "#2563EB",
            dark: "#121212",
            card: "#FFFFFF",
            subtle: "#F4F0EA",
          },
        },
        fontFamily: {
          sans: ['"Noto Sans KR"', "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
        },
      },
    },
  },
};
