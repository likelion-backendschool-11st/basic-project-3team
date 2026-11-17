// Generated from Stitch screen "Dev in_ 회원가입 (14번)". Scoped to #page-signup so it can't clash with other screens.
module.exports = {
  presets: [require("../../tailwind.preset.cjs")],
  important: "#page-signup",
  content: ["./src/pages/Signup.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
};
