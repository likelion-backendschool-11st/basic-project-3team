// Generated from Stitch screen "Dev in_ 프로필 수정 (18번)". Scoped to #page-profile-edit so it can't clash with other screens.
module.exports = {
  important: "#page-profile-edit",
  content: ["./src/pages/ProfileEdit.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            surface: "#f3f4f6",
            border: "#111827",
            primary: "#bfdbfe",
            accent: "#3b82f6",
            tag: "#f9fafb",
          },
        },
        boxShadow: {
          brutal: "3px 3px 0px #111827",
          "brutal-sm": "2px 2px 0px #111827",
          "brutal-lg": "4px 4px 0px #111827",
        },
      },
    },
  },
};
