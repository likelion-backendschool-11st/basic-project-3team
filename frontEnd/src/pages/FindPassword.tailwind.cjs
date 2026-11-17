// Generated from Stitch screen "Dev in_ 비밀번호 찾기". Scoped to #page-find-password so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-find-password",
  content: ["./src/pages/FindPassword.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
