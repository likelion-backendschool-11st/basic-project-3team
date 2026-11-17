import { useEffect, useState, type RefObject } from "react";
import {
  EASTER_EGG_EVENT,
  easterEggState,
  LOGO_BLINK_MS,
  LOGO_TYPE_STEP_MS,
  LOGO_TYPE_STEPS,
  playAnimation,
} from "./easterEggs";

// 로고 이스터에그 상태. word: 상자 안 글자, shown: 보이는 글자 수("Dev in_" 6자 중), blink: "_" 깜빡임,
// hop: 상자가 위로 폴짝 (cd ..: "out_"으로 바뀔 때와 "in_"으로 돌아올 때)
export interface LogoState {
  word: "in" | "out";
  shown: number;
  blink: boolean;
  hop: boolean;
  active: boolean;
}

const NORMAL_LOGO: LogoState = { word: "in", shown: LOGO_TYPE_STEPS, blink: false, hop: false, active: false };
// index.css .egg-logo-hop 애니메이션 길이와 같게 둔다.
const HOP_MS = 400;
const TYPE_DONE_MS = LOGO_TYPE_STEP_MS * (LOGO_TYPE_STEPS - 1);

function readLogo(now: number): LogoState {
  const { logoOutUntil } = easterEggState;
  if (now < logoOutUntil) return { word: "out", shown: LOGO_TYPE_STEPS, blink: true, hop: true, active: true };
  if (now < logoOutUntil + HOP_MS) return { ...NORMAL_LOGO, hop: true, active: true };
  const elapsed = now - easterEggState.logoTypeStart;
  if (elapsed < TYPE_DONE_MS + LOGO_BLINK_MS) {
    const shown = Math.min(LOGO_TYPE_STEPS, Math.floor(elapsed / LOGO_TYPE_STEP_MS) + 1);
    return { word: "in", shown, blink: elapsed >= TYPE_DONE_MS, hop: false, active: true };
  }
  return NORMAL_LOGO;
}

function sameLogo(a: LogoState, b: LogoState) {
  return a.word === b.word && a.shown === b.shown && a.blink === b.blink && a.hop === b.hop && a.active === b.active;
}

// 로고: `cd ..`(3초 "out_"), `devin`(다시 타이핑 + 커서 깜빡임) 이스터에그 상태.
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
