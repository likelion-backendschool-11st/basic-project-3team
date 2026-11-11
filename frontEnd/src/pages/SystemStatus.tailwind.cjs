// Generated from Stitch screen "Dev in_ 시스템 상태 및 예외 화면 (29번)". Scoped to #page-system-status so it can't clash with other screens.
module.exports = {
  important: "#page-system-status",
  content: ["./src/pages/SystemStatus.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{
    theme: {
      extend: {
        fontFamily: {
          sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "sans-serif"],
          mono: ["JetBrains Mono", "monospace"],
          display: ["Plus Jakarta Sans", "Pretendard", "sans-serif"],
        },
        colors: {
          cream: "#FFFDF5",
          "neo-yellow": "#FDE047",
          "neo-blue": "#38BDF8",
          "neo-dark-blue": "#2563EB",
          "neo-pink": "#F472B6",
          "neo-red": "#EF4444",
          "neo-green": "#4ADE80",
        },
        boxShadow: {
          "brutal-sm": "2.5px 2.5px 0px 0px #000000",
          brutal: "4px 4px 0px 0px #000000",
          "brutal-lg": "5px 5px 0px 0px #000000",
          "brutal-xl": "7px 7px 0px 0px #000000",
        },
      },
    },
  },
};
