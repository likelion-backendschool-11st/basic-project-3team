import { useEffect, useState, type RefObject } from "react";
import { EASTER_EGG_EVENT, easterEggState, playAnimation } from "./easterEggs";

// 로고: `cd ..` 이스터에그가 실행되면 3초 동안 true. 화면이 바뀌어 로고가 새로 그려져도 남은 시간만큼 이어진다.
export function useLogoOut() {
  const [out, setOut] = useState(() => Date.now() < easterEggState.logoOutUntil);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function sync() {
      clearTimeout(timer);
      const left = easterEggState.logoOutUntil - Date.now();
      setOut(left > 0);
      if (left > 0) timer = setTimeout(() => setOut(false), left);
    }
    sync();
    window.addEventListener(EASTER_EGG_EVENT, sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(EASTER_EGG_EVENT, sync);
    };
  }, []);

  return out;
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
