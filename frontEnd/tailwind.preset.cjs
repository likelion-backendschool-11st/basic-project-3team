// docs/ui-guide.md의 기준 값. 전역 설정과 화면별 설정(src/pages/*.tailwind.cjs)이 모두 presets로 불러온다.
// 화면별 설정에 이미 있는 이름(brutal, cream 등)과 겹치지 않게 새 값은 devin-* 이름을 쓴다.
// 둥글기는 Tailwind 기본값을 쓴다: 버튼·입력칸 rounded-lg(8px), 카드·모달 rounded-xl(12px), 상태 배지 rounded-full, 태그 rounded(4px).

// JetBrains Mono에는 한글이 없으므로, 고정폭 안의 한글도 Noto Sans KR로 보이게 대체 글꼴로 둔다.
const sans = ['"Noto Sans KR"', "sans-serif"];
const mono = ['"JetBrains Mono"', '"Noto Sans KR"', "monospace"];

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans,
        mono,
        // Stitch에서 만든 화면이 쓰는 이름. 클래스는 그대로 두고 같은 글꼴로 연결한다.
        display: sans,
        "headline-xl": sans,
        "headline-xl-mobile": sans,
        "headline-lg": sans,
        "headline-md": sans,
        "headline-sm": sans,
        "body-lg": sans,
        "body-md": sans,
        "body-sm": sans,
        "label-lg": sans,
        "label-md": sans,
        "label-sm": sans,
        "code-block": mono,
      },
      // ui-guide.md 1절. 예: bg-devin-blue, text-devin-gray, border-devin-ink
      colors: {
        devin: {
          bg: "#FFFDF5",
          paper: "#FFFFFF",
          "paper-hover": "#F3F2EE",
          ink: "#111111",
          gray: "#4B5563",
          "gray-light": "#9CA3AF",
          yellow: "#FFD43B",
          "yellow-dark": "#F5C400",
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          red: "#E11D48",
          "red-dark": "#BE123C",
          "green-soft": "#DCFCE7",
          "red-soft": "#FFF1F3",
          tag: "#F1F0EB",
          disabled: "#ECEAE3",
          dot: "#D9D4C3",
        },
      },
      // ui-guide.md 2절. border-devin(2px), shadow-devin-sm(버튼·입력칸), shadow-devin(카드·모달)
      // 2.5px는 브라우저가 화면 픽셀 단위로 내려서 배율 100%·150% 화면에서 2px로 보이므로 2px로 정했다.
      borderWidth: { devin: "2px" },
      boxShadow: {
        "devin-sm": "2px 2px 0 #111111",
        devin: "4px 4px 0 #111111",
      },
      // ui-guide.md 11절. 넓게 max-w-6xl, 보통 max-w-3xl, 좁게 max-w-devin-narrow
      maxWidth: { "devin-narrow": "460px" },
      // 화면 배경 점무늬: bg-devin-dots + bg-[length:18px_18px]
      backgroundImage: { "devin-dots": "radial-gradient(#D9D4C3 1.2px, transparent 1.2px)" },
    },
  },
};
