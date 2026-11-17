import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASTER_EGG_EVENT, prefersReducedMotion, type EasterEgg } from "./easterEggs";

const TOAST_DURATION_MS = 3000;

// 이스터에그 알림창과 빨간 테두리 (App.tsx에 한 번만 둔다). 화면이 바뀌어도 사라지지 않는다.
// 알림창은 헤더(높이 64px) 바로 아래 가운데, 검색창 밑에 띄운다.
// 화면별 Tailwind 설정(#page-* 안에서만 적용)과 상관없게 body에 그린다.
export default function EasterEggToast() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [flashId, setFlashId] = useState(0);

  useEffect(() => {
    function handleEgg(event: Event) {
      const egg = (event as CustomEvent<EasterEgg>).detail;
      setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message: egg.message }));
      if (egg.effect === "flashBorder" && !prefersReducedMotion()) setFlashId((id) => id + 1);
    }
    window.addEventListener(EASTER_EGG_EVENT, handleEgg);
    return () => window.removeEventListener(EASTER_EGG_EVENT, handleEgg);
  }, []);

  // 새 알림이 뜰 때마다 3초를 다시 센다.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return createPortal(
    <>
      {flashId > 0 && (
        <div
          key={flashId}
          className="egg-flash-border fixed inset-0 z-[100] pointer-events-none border-[6px] border-red-600"
          aria-hidden="true"
          onAnimationEnd={() => setFlashId(0)}
        />
      )}
      <div
        className="fixed top-[76px] left-1/2 -translate-x-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] pointer-events-none"
        role="status"
      >
        {toast && (
          <p
            key={toast.id}
            className="egg-toast bg-black text-green-400 font-mono text-base sm:text-lg font-bold text-center px-6 py-4 rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.35)]"
          >
            {toast.message}
          </p>
        )}
      </div>
    </>,
    document.body,
  );
}
