// docs/ui-guide.md의 기준을 클래스로 모은 파일. 화면에서는 이 상수와 함수를 조합해 쓴다.
// 색·테두리·그림자 이름(devin-*)은 frontEnd/tailwind.preset.cjs에 있다.

// Tab 키로 이동했을 때만 보이는 파란 외곽선 (ui-guide.md 13절). 누를 수 있는 요소에는 모두 붙인다.
export const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-devin-blue focus-visible:outline-offset-2";

// 누르면 그림자만큼 내려가고, 비활성이면 흐리게 (ui-guide.md 4절)
const PRESS = "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
const DISABLED =
  "disabled:opacity-[.45] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed";

export const BUTTON = {
  base: `inline-flex items-center justify-center gap-1.5 border-devin border-devin-ink rounded-lg shadow-devin-sm font-bold whitespace-nowrap transition-all ${PRESS} ${DISABLED} ${FOCUS}`,
  size: {
    md: "h-10 px-4 text-sm",
    sm: "h-8 px-3 text-sm",
  },
  variant: {
    primary: "bg-devin-blue text-white hover:bg-devin-blue-dark",
    secondary: "bg-devin-paper text-devin-ink hover:bg-devin-paper-hover",
    accent: "bg-devin-yellow text-devin-ink hover:bg-devin-yellow-dark",
    danger: "bg-devin-red text-white hover:bg-devin-red-dark",
  },
  // 테두리·그림자 없는 글자 버튼 (더보기, 닫기)
  text: `inline-flex items-center gap-1 h-8 px-1 rounded text-sm font-bold underline underline-offset-[3px] hover:text-devin-gray disabled:opacity-[.45] disabled:cursor-not-allowed ${FOCUS}`,
};

export type ButtonVariant = keyof typeof BUTTON.variant;
export type ButtonSize = keyof typeof BUTTON.size;

// 예: <button className={buttonClass("primary")}>질문 등록</button>
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md") {
  return `${BUTTON.base} ${BUTTON.size[size]} ${BUTTON.variant[variant]}`;
}

// 입력칸 (ui-guide.md 5절). textarea는 높이 없는 box를 쓴다.
// focus:ring-0은 @tailwindcss/forms의 기본 테두리 고리를 끄는 것이고, 포커스 표시는 그림자 + FOCUS 외곽선이다.
const INPUT_BOX = `w-full px-3 bg-devin-paper border-devin border-devin-ink rounded-lg text-sm font-medium text-devin-ink placeholder:text-devin-gray-light focus:ring-0 focus:border-devin-ink focus:shadow-devin-sm disabled:bg-devin-disabled disabled:text-devin-disabled-ink disabled:cursor-not-allowed ${FOCUS}`;

export const INPUT = {
  base: `h-10 ${INPUT_BOX}`,
  box: `py-2.5 ${INPUT_BOX}`,
  // 오류일 때 base(또는 box) 뒤에 붙인다
  error: "border-devin-red bg-devin-red-soft focus:border-devin-red",
  label: "block mb-1.5 text-xs font-extrabold text-devin-ink",
  hint: "mt-1.5 text-xs text-devin-gray",
  errorText: "mt-1.5 text-xs font-bold text-devin-red",
};

// 카드·모달 (ui-guide.md 6절)
export const CARD = "bg-devin-paper border-devin border-devin-ink rounded-xl shadow-devin";

// 카테고리·태그 (ui-guide.md 7절)
export const CATEGORY =
  "inline-flex items-center gap-1.5 text-xs font-extrabold text-devin-ink whitespace-nowrap before:content-[''] before:w-2.5 before:h-2.5 before:rounded-[3px] before:bg-devin-yellow before:border-[1.5px] before:border-devin-ink";
export const TAG =
  "inline-flex items-center h-[22px] px-[7px] rounded bg-devin-tag text-xs font-semibold text-devin-tag-ink hover:bg-devin-yellow hover:text-devin-ink";

// 칩 (ui-guide.md 7절 "칩")
// 지울 수 있는 칩: 태그 모양 + 오른쪽 close 버튼
//   <span className={CHIP.removable}>mysql<button className={CHIP.remove} aria-label="mysql 지우기">
//     <span className="material-symbols-outlined text-[15px]" aria-hidden="true">close</span></button></span>
// 고를 수 있는 칩: chipClass(selected) + aria-pressed
const SELECTABLE_BASE = `inline-flex items-center gap-1 h-8 px-3 rounded-full border-[1.5px] border-devin-ink text-xs font-bold whitespace-nowrap transition-colors ${FOCUS}`;
const SELECTED = "bg-devin-ink text-white";
const UNSELECTED = "bg-devin-paper text-devin-ink hover:bg-devin-paper-hover";

export const CHIP = {
  removable:
    "inline-flex items-center gap-0.5 h-[22px] pl-[7px] pr-0.5 rounded bg-devin-tag text-xs font-semibold text-devin-tag-ink",
  remove: `inline-flex items-center justify-center w-[18px] h-[18px] rounded text-devin-gray hover:text-devin-red ${FOCUS}`,
};

// 예: <button className={chipClass(active)} aria-pressed={active}>백엔드</button>
export function chipClass(selected: boolean) {
  return `${SELECTABLE_BASE} ${selected ? SELECTED : UNSELECTED}`;
}

// 탭 (ui-guide.md 12절). 고른 탭은 검정, 나머지는 흰 바탕 + 1.5px 테두리. 컴포넌트는 SortTabs.tsx.
const TAB_BASE = `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border-[1.5px] border-devin-ink text-xs font-bold whitespace-nowrap transition-colors ${FOCUS}`;

export function tabClass(selected: boolean) {
  return `${TAB_BASE} ${selected ? SELECTED : UNSELECTED}`;
}

// 탭 이름 옆 개수 상자 ("내 답변 3"). 고른 탭에서는 흰 바탕 검정 글자로 뒤집는다.
export function tabCountClass(selected: boolean) {
  return `inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[11px] font-extrabold tabular-nums ${
    selected ? "bg-devin-paper text-devin-ink" : "bg-devin-ink text-white"
  }`;
}

// 드롭다운·더보기 메뉴 (ui-guide.md 12절): 닉네임 메뉴, 더보기, 알림, 작성자 팝오버
// <div role="menu" className={MENU.panel}>
//   <button role="menuitem" className={MENU.item}>...</button>
//   <div role="separator" className={MENU.divider} />
//   <button role="menuitem" className={`${MENU.item} ${MENU.danger}`}>로그아웃</button>
// </div>
export const MENU = {
  panel: "bg-devin-paper border-devin border-devin-ink rounded-xl shadow-devin-sm p-1.5",
  item: `flex w-full items-center gap-2 h-9 px-2.5 rounded-lg text-sm font-semibold text-devin-ink text-left hover:bg-devin-yellow ${FOCUS}`,
  danger: "text-devin-red",
  divider: "my-1 border-t border-devin-line",
  icon: "material-symbols-outlined text-[18px] leading-none",
};

// 표 (ui-guide.md 12절). 휴대폰 폭에서 가로로 스크롤되도록 wrap 상자 안에 table을 둔다.
// <div className={TABLE.wrap}><table className={TABLE.table}>
//   <thead><tr><th className={TABLE.th}>닉네임</th><th className={`${TABLE.th} ${TABLE.num}`}>답변</th></tr></thead>
//   <tbody><tr className={TABLE.tr}><td className={TABLE.td}>...</td></tr></tbody>
// </table></div>
export const TABLE = {
  wrap: "overflow-x-auto bg-devin-paper border-devin border-devin-ink rounded-xl",
  table: "w-full border-collapse text-sm text-devin-ink [&_tbody_tr:last-child_td]:border-b-0",
  th: "px-4 py-3 bg-devin-bg text-left text-xs font-extrabold whitespace-nowrap border-b-2 border-devin-ink",
  tr: "hover:bg-devin-bg",
  td: "px-4 py-3 border-b border-devin-line",
  // 숫자 칸: th·td 둘 다 붙인다
  num: "text-right tabular-nums",
};

// 안내 상자 (ui-guide.md 8절)
const NOTICE_BASE = "flex items-start gap-2 px-3 py-2.5 border-[1.5px] rounded-lg text-sm font-semibold";
export const NOTICE = {
  success: `${NOTICE_BASE} bg-devin-green-soft border-devin-ink text-devin-ink`,
  error: `${NOTICE_BASE} bg-devin-red-soft border-devin-red text-devin-red-ink`,
  info: `${NOTICE_BASE} bg-devin-paper border-devin-ink text-devin-ink`,
};

// 화면 배경: 크림 + 점무늬 18px (ui-guide.md 11절)
export const PAGE_BACKGROUND = "bg-devin-bg bg-devin-dots bg-[length:18px_18px]";
