// Generated from Stitch screen "Dev in_ 닉네임 메뉴 드롭다운 (8번)". Scoped to #page-nickname-menu-dropdown so it can't clash with other screens.
module.exports = {
  important: "#page-nickname-menu-dropdown",
  content: ["./src/pages/NicknameMenuDropdown.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily: {
          mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
          sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        },
        boxShadow: {
          brutal: "3px 3px 0px #000000",
          "brutal-lg": "5px 5px 0px #000000",
        },
      },
    },
  },
};
