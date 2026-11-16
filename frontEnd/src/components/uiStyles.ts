// docs/ui-guide.md의 기준을 클래스로 모은 파일. 화면에서는 이 상수와 함수를 조합해 쓴다.
// 색·테두리·그림자 이름(devin-*)은 frontEnd/tailwind.preset.cjs에 있다.

// 누르면 그림자만큼 내려가고, 비활성이면 흐리게 (ui-guide.md 4절)
const PRESS = "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
const DISABLED =
  "disabled:opacity-[.45] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed";

export const BUTTON = {
  base: `inline-flex items-center justify-center gap-1.5 border-devin border-devin-ink rounded-lg shadow-devin-sm font-bold whitespace-nowrap transition-all ${PRESS} ${DISABLED}`,
  size: {
    md: "h-10 px-4 text-sm",
    sm: "h-8 px-3 text-[13px]",
  },
  variant: {
    primary: "bg-devin-blue text-white hover:bg-devin-blue-dark",
    secondary: "bg-devin-paper text-devin-ink hover:bg-devin-paper-hover",
    accent: "bg-devin-yellow text-devin-ink hover:bg-devin-yellow-dark",
    danger: "bg-devin-red text-white hover:bg-devin-red-dark",
  },
  // 테두리·그림자 없는 글자 버튼 (더보기, 닫기)
  text: "inline-flex items-center gap-1 h-8 px-1 font-bold underline underline-offset-[3px] hover:text-devin-gray disabled:opacity-[.45] disabled:cursor-not-allowed",
};

export type ButtonVariant = keyof typeof BUTTON.variant;
export type ButtonSize = keyof typeof BUTTON.size;

// 예: <button className={buttonClass("primary")}>질문 등록</button>
export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md") {
  return `${BUTTON.base} ${BUTTON.size[size]} ${BUTTON.variant[variant]}`;
}

// 입력칸 (ui-guide.md 5절). textarea는 높이 없는 box를 쓴다.
const INPUT_BOX =
  "w-full px-3 bg-devin-paper border-devin border-devin-ink rounded-lg text-sm font-medium text-devin-ink placeholder:text-devin-gray-light focus:outline-none focus:ring-0 focus:shadow-devin-sm disabled:bg-devin-disabled disabled:text-[#8C897F] disabled:cursor-not-allowed";

export const INPUT = {
  base: `h-10 ${INPUT_BOX}`,
  box: `py-2.5 ${INPUT_BOX}`,
  // 오류일 때 base(또는 box) 뒤에 붙인다
  error: "border-devin-red bg-devin-red-soft",
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
  "inline-flex items-center h-[22px] px-[7px] rounded bg-devin-tag text-xs font-semibold text-[#3F3D37] hover:bg-devin-yellow hover:text-devin-ink";

// 안내 상자 (ui-guide.md 8절)
const NOTICE_BASE = "flex items-start gap-2 px-3 py-2.5 border-[1.5px] rounded-lg text-[13px] font-semibold";
export const NOTICE = {
  success: `${NOTICE_BASE} bg-devin-green-soft border-devin-ink text-devin-ink`,
  error: `${NOTICE_BASE} bg-devin-red-soft border-devin-red text-[#9F1239]`,
  info: `${NOTICE_BASE} bg-devin-paper border-devin-ink text-devin-ink`,
};

// 화면 배경: 크림 + 점무늬 18px (ui-guide.md 11절)
export const PAGE_BACKGROUND = "bg-devin-bg bg-devin-dots bg-[length:18px_18px]";
