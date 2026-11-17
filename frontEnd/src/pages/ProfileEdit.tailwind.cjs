// Generated from Stitch screen "Dev in_ 프로필 수정 (18번)". Scoped to #page-profile-edit so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-profile-edit",
  content: ["./src/pages/ProfileEdit.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
