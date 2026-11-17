// Generated from Stitch screen "Dev in_ 아이디 찾기". Scoped to #page-find-id so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-find-id",
  content: ["./src/pages/FindId.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
