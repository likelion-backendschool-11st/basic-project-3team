// Generated from Stitch screen "Dev in_ 관리자 회원 관리 (12번)". Scoped to #page-admin-members so it can't clash with other screens.
module.exports = {
  important: "#page-admin-members",
  content: ["./src/pages/AdminMembers.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          neoYellow: "#FFD43B",
          neoBg: "#FFFDF9",
          neoDark: "#121212",
          neoRed: "#FF6B6B",
          neoPurple: "#A573FF",
          neoGray: "#E5E7EB",
        },
        boxShadow: {
          neo: "3px 3px 0px #121212",
          neoHover: "1px 1px 0px #121212",
          neoCard: "4px 4px 0px #121212",
        },
      },
    },
  },
};
