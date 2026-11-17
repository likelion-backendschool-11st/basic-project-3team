import { useEffect, useState, type RefObject } from "react";
import {
  EASTER_EGG_EVENT,
  easterEggState,
  LOGO_TYPE_STEP_MS,
  LOGO_TYPE_STEPS,
  LOGO_TYPINGS,
  playAnimation,
} from "./easterEggs";

// 로고 이스터에그 상태. word: 상자 안 글자, text: 로고 대신 보여줄 글자(없으면 로고),
// shown: 타이핑으로 보이는 글자 수("_" 포함), blink: "_" 깜빡임,
// hop: 상자가 위로 폴짝 (cd ..: "out_"으로 바뀔 때와 "in_"으로 돌아올 때)
export interface LogoState {
  word: "in" | "out";
  text: string | null;
  shown: number;
  blink: boolean;
  hop: boolean;
  active: boolean;
}

const NORMAL_LOGO: LogoState = {
  word: "in",
  text: null,
  shown: LOGO_TYPE_STEPS,
  blink: false,
  hop: false,
  active: false,
};
// index.css .egg-logo-hop 애니메이션 길이와 같게 둔다.
const HOP_MS = 400;

function readLogo(now: number): LogoState {
  const { logoOutUntil } = easterEggState;
  if (now < logoOutUntil) return { ...NORMAL_LOGO, word: "out", blink: true, hop: true, active: true };
  if (now < logoOutUntil + HOP_MS) return { ...NORMAL_LOGO, hop: true, active: true };
  const typing = easterEggState.logoTyping;
  if (typing) {
    const { text, steps, blinkMs } = LOGO_TYPINGS[typing.kind];
    const doneMs = LOGO_TYPE_STEP_MS * (steps - 1);
    const elapsed = now - typing.start;
    if (elapsed < doneMs + blinkMs) {
      const shown = Math.min(steps, Math.floor(elapsed / LOGO_TYPE_STEP_MS) + 1);
      return { ...NORMAL_LOGO, text, shown, blink: elapsed >= doneMs, active: true };
    }
  }
  return NORMAL_LOGO;
}

function sameLogo(a: LogoState, b: LogoState) {
  return (
    a.word === b.word &&
    a.text === b.text &&
    a.shown === b.shown &&
    a.blink === b.blink &&
    a.hop === b.hop &&
    a.active === b.active
  );
}

// 로고: `cd ..`(3초 "out_"), `devin`(다시 타이핑), `System.out.println`("Hello, World!" 타이핑) 이스터에그 상태.
// 화면이 바뀌어 로고가 새로 그려져도 시작 시각을 기준으로 이어진다.
export function useLogoEasterEgg() {
  const [logo, setLogo] = useState(() => readLogo(Date.now()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function tick() {
      clearTimeout(timer);
      const next = readLogo(Date.now());
      setLogo((prev) => (sameLogo(prev, next) ? prev : next));
      if (next.active) timer = setTimeout(tick, 50);
    }
    tick();
    window.addEventListener(EASTER_EGG_EVENT, tick);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(EASTER_EGG_EVENT, tick);
    };
  }, []);

  return logo;
}

// 검색창: `try catch` 이스터에그가 실행되면 좌우로 흔든다. 검색 결과 화면에서 새로 그려진 검색창도 흔든다.
export function useSearchShake(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    function shake() {
      if (Date.now() < easterEggState.searchShakeUntil) playAnimation(ref.current, "egg-shake-search");
    }
    shake();
    window.addEventListener(EASTER_EGG_EVENT, shake);
    return () => window.removeEventListener(EASTER_EGG_EVENT, shake);
  }, [ref]);
}
