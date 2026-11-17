// 개발자용 이스터에그: 헤더 검색창에 아래 검색어를 정확히 입력하면 검색은 그대로 하고 알림·효과를 더한다.
export type EasterEggEffect = "none" | "shakeSearch" | "flashBorder" | "logoOut" | "logoType";

export interface EasterEgg {
  // 로고·검색창이 움직이는 이스터에그는 그 효과가 잘 보이게 알림을 띄우지 않는다.
  message?: string;
  effect: EasterEggEffect;
}

// 키는 앞뒤 공백을 지우고 소문자로 바꾼 검색어
const EASTER_EGGS: Record<string, EasterEgg> = {
  "try catch": { effect: "shakeSearch" },
  "system.out.println": { message: "Hello, World! 👋", effect: "none" },
  "git push --force": { message: "⚠️ 팀원들이 당신을 찾고 있습니다…", effect: "flashBorder" },
  "cd ..": { effect: "logoOut" },
};

// `dev in`, `devin`은 띄어쓰기도 무시한다.
const DEVIN_EGG: EasterEgg = { effect: "logoType" };

// 알림창·로고·검색창이 이 이벤트를 각각 받는다.
export const EASTER_EGG_EVENT = "devin:easter-egg";

export const LOGO_OUT_MS = 3000;
// 로고 다시 타이핑: "D" → "De" → "Dev" → "Dev i" → "Dev in" → "Dev in_" (글자당 0.15초), 끝나면 커서 3초 깜빡임
export const LOGO_TYPE_STEPS = 6;
export const LOGO_TYPE_STEP_MS = 150;
export const LOGO_BLINK_MS = 3000;
// 검색 결과 화면으로 넘어가며 헤더가 새로 그려져도 새 검색창이 흔들리게, 이 시간 안에 생긴 검색창은 흔든다.
const SEARCH_SHAKE_WINDOW_MS = 1000;

// 화면이 바뀌면 Header(로고·검색창)가 새로 그려지므로 상태를 모듈에 둔다.
export const easterEggState = { logoOutUntil: 0, logoTypeStart: 0, searchShakeUntil: 0 };

export function findEasterEgg(input: string): EasterEgg | undefined {
  const keyword = input.trim().toLowerCase();
  if (keyword.replace(/\s+/g, "") === "devin") return DEVIN_EGG;
  return EASTER_EGGS[keyword];
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function runEasterEgg(egg: EasterEgg) {
  const now = Date.now();
  // 로고 효과 두 개는 나중 것만 보여준다.
  if (egg.effect === "logoOut") {
    easterEggState.logoOutUntil = now + LOGO_OUT_MS;
    easterEggState.logoTypeStart = 0;
  }
  if (egg.effect === "logoType") {
    easterEggState.logoTypeStart = now;
    easterEggState.logoOutUntil = 0;
  }
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
