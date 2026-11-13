// Generated from Stitch screen "Dev in_ 비밀번호 찾기". Scoped to #page-find-password so it can't clash with other screens.
module.exports = {
  important: "#page-find-password",
  content: ["./src/pages/FindPassword.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FFFDF5",
            dark: "#111111",
            yellow: "#FFDE59",
            gray: "#E5E7EB",
            boxGray: "#D9D9D9",
            lightGray: "#F3F4F6",
          },
        },
        boxShadow: {
          "brutal-sm": "2.5px 2.5px 0 #111111",
          brutal: "4px 4px 0 #111111",
          "brutal-lg": "6px 6px 0 #111111",
        },
      },
    },
  },
};
