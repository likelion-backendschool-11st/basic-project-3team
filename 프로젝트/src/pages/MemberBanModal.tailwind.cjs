// Generated from Stitch screen "Dev in_ 회원 추방 모달 (13번)". Scoped to #page-member-ban-modal so it can't clash with other screens.
module.exports = {
  important: "#page-member-ban-modal",
  content: ["./src/pages/MemberBanModal.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          neoRed: "#EF4444",
          neoDark: "#1E1E1E",
          neoBg: "#F3F4F6",
        },
        boxShadow: {
          neo: "3px 3px 0px #000000",
          "neo-lg": "5px 5px 0px #000000",
          "neo-dark": "4px 4px 0px #000000",
        },
      },
    },
  },
};
