import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASTER_EGG_EVENT, prefersReducedMotion, type EasterEgg } from "./easterEggs";

const TOAST_DURATION_MS = 3000;
// 빨간 테두리가 있는 알림(git push --force)은 테두리 깜빡임(index.css .egg-flash-border, 0.8초 × 3번)과 같이 끈다.
const FLASH_TOAST_DURATION_MS = 2400;

interface Toast {
  id: number;
  message: string;
  center: boolean;
  flash: boolean;
}

// 이스터에그 알림창과 빨간 테두리 (App.tsx에 한 번만 둔다). 화면이 바뀌어도 사라지지 않는다.
// 알림창은 헤더(높이 64px) 바로 아래 가운데(검색창 밑)에 띄우고, 경고(git push --force)는 화면 가운데에 띄운다.
// 화면별 Tailwind 설정(#page-* 안에서만 적용)과 상관없게 body에 그린다.
export default function EasterEggToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    function handleEgg(event: Event) {
      const egg = (event as CustomEvent<EasterEgg>).detail;
      const { message } = egg;
      if (!message) return;
      const flash = egg.effect === "flashBorder" && !prefersReducedMotion();
      setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, center: egg.toastAt === "center", flash }));
    }
    window.addEventListener(EASTER_EGG_EVENT, handleEgg);
    return () => window.removeEventListener(EASTER_EGG_EVENT, handleEgg);
  }, []);

  // 새 알림이 뜰 때마다 시간을 다시 센다. 알림과 빨간 테두리를 같이 끈다.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.flash ? FLASH_TOAST_DURATION_MS : TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return createPortal(
    <>
      {toast?.flash && (
        <div
          key={toast.id}
          className="egg-flash-border fixed inset-0 z-[100] pointer-events-none border-[6px] border-red-600"
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed ${toast?.center ? "top-1/2 -translate-y-1/2" : "top-[76px]"} left-1/2 -translate-x-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] pointer-events-none`}
        role="status"
      >
        {toast && (
          <p
            key={toast.id}
            className="egg-toast bg-black text-green-400 font-mono text-sm sm:text-base font-bold text-center px-5 py-3 rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.35)]"
          >
            {toast.message}
          </p>
        )}
      </div>
    </>,
    document.body,
  );
}
