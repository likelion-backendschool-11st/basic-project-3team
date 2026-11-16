// 프론트 전체가 쓰는 글꼴. 전역 설정과 화면별 설정(src/pages/*.tailwind.cjs)이 모두 이 값을 불러온다.
// 본문은 Noto Sans KR, 코드·아이디·숫자 등 고정폭은 JetBrains Mono 두 가지만 쓴다.
// JetBrains Mono에는 한글이 없으므로, 고정폭 안의 한글도 Noto Sans KR로 보이게 대체 글꼴로 둔다.
const sans = ['"Noto Sans KR"', "sans-serif"];
const mono = ['"JetBrains Mono"', '"Noto Sans KR"', "monospace"];

module.exports = {
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
};
