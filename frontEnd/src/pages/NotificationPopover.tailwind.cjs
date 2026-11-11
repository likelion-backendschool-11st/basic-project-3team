// Generated from Stitch screen "Dev in_ 알림 팝오버 (7번)". Scoped to #page-notification-popover so it can't clash with other screens.
module.exports = {
  important: "#page-notification-popover",
  content: ["./src/pages/NotificationPopover.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: "#111827",
          wireframeBg: "#ffffff",
          unreadBg: "#f8fafc",
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
