import { BUTTON } from "./uiStyles";

// 헤더 버튼 공통 모양. 공통 Header, 알림 버튼, 로그인 관련 화면의 AuthHeader가 같이 쓴다.
// 값은 uiStyles의 보통 크기 버튼(docs/ui-guide.md 4절)과 같다.
export const HEADER_BUTTON_CLASS = `${BUTTON.base} ${BUTTON.size.md}`;

// #147: 공통 헤더 버튼 (ui-guide.md 13절). lg 미만은 정사각 아이콘 버튼(휴대폰 폭 36px, sm 이상 40px), lg 이상은 위와 같은 글자 버튼.
// 글자는 <span className={HEADER_LABEL_CLASS}>로 감싸 lg 미만에서는 화면 읽기 프로그램에만 읽히게 한다.
// not-sr-only가 white-space를 normal로 되돌리므로 nowrap을 다시 넣는다.
export const HEADER_ICON_BUTTON_CLASS = `${BUTTON.base} h-9 w-9 px-0 text-sm sm:h-10 sm:w-10 lg:w-auto lg:px-4`;
export const HEADER_LABEL_CLASS = "sr-only lg:not-sr-only lg:whitespace-nowrap";

export const HEADER_BUTTON_COLOR = {
  white: BUTTON.variant.secondary,
  yellow: BUTTON.variant.accent,
  blue: BUTTON.variant.primary,
};
