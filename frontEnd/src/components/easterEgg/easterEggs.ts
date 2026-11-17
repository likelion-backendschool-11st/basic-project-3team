// 개발자용 이스터에그: 헤더 검색창에 아래 검색어를 정확히 입력하면 검색은 그대로 하고 알림·효과를 더한다.
export type EasterEggEffect = "none" | "shakeSearch" | "flashBorder" | "logoOut";

export interface EasterEgg {
  message: string;
  effect: EasterEggEffect;
}

// 키는 앞뒤 공백을 지우고 소문자로 바꾼 검색어
const EASTER_EGGS: Record<string, EasterEgg> = {
  "try catch": { message: "🧤 예외를 잡았습니다! 아무 일도 없었던 걸로…", effect: "shakeSearch" },
  "system.out.println": { message: "Hello, World! 👋", effect: "none" },
  "git push --force": { message: "⚠️ 팀원들이 당신을 찾고 있습니다…", effect: "flashBorder" },
  "cd ..": { message: "🚪 Dev in_에서 나가시게요? 3초 뒤에 다시 들어옵니다", effect: "logoOut" },
};

// 알림창·로고·검색창이 이 이벤트를 각각 받는다.
export const EASTER_EGG_EVENT = "devin:easter-egg";

export const LOGO_OUT_MS = 3000;
// 검색 결과 화면으로 넘어가며 헤더가 새로 그려져도 새 검색창이 흔들리게, 이 시간 안에 생긴 검색창은 흔든다.
const SEARCH_SHAKE_WINDOW_MS = 1000;

// 화면이 바뀌면 Header(로고·검색창)가 새로 그려지므로 상태를 모듈에 둔다.
export const easterEggState = { logoOutUntil: 0, searchShakeUntil: 0 };

export function findEasterEgg(input: string): EasterEgg | undefined {
  return EASTER_EGGS[input.trim().toLowerCase()];
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function runEasterEgg(egg: EasterEgg) {
  const now = Date.now();
  if (egg.effect === "logoOut") easterEggState.logoOutUntil = now + LOGO_OUT_MS;
  if (egg.effect === "shakeSearch" && !prefersReducedMotion()) {
    easterEggState.searchShakeUntil = now + SEARCH_SHAKE_WINDOW_MS;
  }
  window.dispatchEvent(new CustomEvent<EasterEgg>(EASTER_EGG_EVENT, { detail: egg }));
}

// 같은 클래스를 다시 붙여도 애니메이션이 처음부터 다시 돌게 한다.
export function playAnimation(element: HTMLElement | null, className: string) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  element.addEventListener("animationend", () => element.classList.remove(className), { once: true });
}
