// Generated from Stitch screen "Dev in_ 회원가입 (14번)". Scoped to #page-signup so it can't clash with other screens.
module.exports = {
  important: "#page-signup",
  content: ["./src/pages/Signup.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        colors: {
          brand: {
            cream: "#FBF9F4",
            surface: "#FFFFFF",
            dark: "#121212",
            accent: "#3B82F6",
            border: "#1E1E1E",
            grayBg: "#F3F4F6",
            codeBg: "#1E2430",
          },
        },
        boxShadow: {
          brutal: "4px 4px 0px #1E1E1E",
          "brutal-sm": "2.5px 2.5px 0px #1E1E1E",
          "brutal-hover": "1px 1px 0px #1E1E1E",
        },
        borderWidth: {
          2.5: "2.5px",
        },
      },
    },
  },
};
