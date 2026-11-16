import { BUTTON } from "./uiStyles";

// 헤더 버튼 공통 모양. 공통 Header, 알림 버튼, 로그인 관련 화면의 AuthHeader가 같이 쓴다.
// 값은 uiStyles의 보통 크기 버튼(docs/ui-guide.md 4절)과 같다.
export const HEADER_BUTTON_CLASS = `${BUTTON.base} ${BUTTON.size.md}`;

export const HEADER_BUTTON_COLOR = {
  white: BUTTON.variant.secondary,
  yellow: BUTTON.variant.accent,
  blue: BUTTON.variant.primary,
};
