import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationType } from "../../api/notification";
import { useNotifications } from "../../hooks/notificationContext";
import { detailPath } from "../questionList";

// 알림 종류별 머리말과 색 (Stitch "알림 팝오버 (7번)")
const TYPE_STYLE: Record<NotificationType, { label: string; color: string; unreadBg: string }> = {
  ANSWER_CREATED: { label: "[답변]", color: "text-[#2563EB]", unreadBg: "bg-blue-50/60 border-[#2563EB]" },
  ANSWER_ACCEPTED: { label: "[채택]", color: "text-[#D4A017]", unreadBg: "bg-amber-50/60 border-[#D4A017]" },
  CATEGORY_QUESTION: { label: "[관심]", color: "text-[#0B5D1E]", unreadBg: "bg-green-50/60 border-[#0B5D1E]" },
};

// "2026-11-13T17:20:00" → "5분 전" / 하루가 지나면 "2026.11.12"
function formatRelative(createdAt: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(createdAt).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return createdAt.slice(0, 10).replaceAll("-", ".");
}

const headerButton =
  "relative h-10 px-3 bg-white border-2 border-[#111111] text-sm font-bold shadow-[2px_2px_0_#111111] hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap flex items-center gap-1.5";

// 헤더 알림 버튼 + 알림 팝오버 (REQ-MAIN-005, #70). 로그인한 상태에서만 헤더가 그린다.
export default function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, loading, error, refresh, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // 바깥을 누르거나 Esc를 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setActionError(null);
    if (next) void refresh();
  }

  // 알림을 누르면 읽음 처리하고 그 질문으로 이동한다. 읽음 처리가 실패해도 이동은 한다.
  async function openNotification(notificationId: number, questionId: number) {
    setOpen(false);
    try {
      await markRead(notificationId);
    } catch {
      // 다음에 목록을 열 때 다시 안 읽음으로 보인다.
    }
    navigate(detailPath(questionId));
  }

  async function handleReadAll() {
    setActionError(null);
    try {
      await markAllRead();
    } catch {
      setActionError("모두 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative" ref={boxRef}>
      <button
        className={headerButton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `알림, 안 읽은 알림 ${unreadCount}개` : "알림"}
        onClick={toggle}
      >
        알림
        {unreadCount > 0 && (
          <span className="text-xs bg-[#E11D48] text-white px-1.5 py-0.5 border border-[#111111] leading-none font-bold rounded-full">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border-2 border-black shadow-[4px_4px_0_#111111] z-50"
          role="dialog"
          aria-label="알림 목록"
          data-purpose="notification-dropdown-panel"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black">
            <div className="flex items-baseline gap-2">
              <h2 className="font-black text-sm tracking-tight">알림</h2>
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                새 알림
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E11D48] text-white leading-none">
                  {unreadCount}
                </span>
              </span>
            </div>
            <button
              className="px-2 py-0.5 text-[11px] font-bold border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0_#111111] disabled:opacity-40 disabled:shadow-none"
              type="button"
              disabled={unreadCount === 0}
              onClick={handleReadAll}
            >
              모두 읽음
            </button>
          </div>

          {actionError && (
            <p className="px-4 py-2 text-xs font-bold text-[#E11D48] border-b border-gray-200">{actionError}</p>
          )}

          <ul className="divide-y divide-gray-200 text-left max-h-[380px] overflow-y-auto" aria-busy={loading}>
            {error && <li className="p-4 text-xs font-bold text-[#E11D48]">{error}</li>}
            {!error && loading && items.length === 0 && (
              <li className="p-4 text-xs text-gray-500">알림을 불러오는 중입니다...</li>
            )}
            {!error && !loading && items.length === 0 && (
              <li className="p-6 text-center text-xs text-gray-500">아직 받은 알림이 없습니다.</li>
            )}
            {items.map((n) => {
              const style = TYPE_STYLE[n.type];
              return (
                <li key={n.notificationId}>
                  <button
                    className={`w-full text-left p-3.5 transition-colors border-l-4 ${
                      n.read ? "bg-white border-transparent hover:bg-gray-50" : `${style.unreadBg} hover:brightness-95`
                    }`}
                    type="button"
                    onClick={() => openNotification(n.notificationId, n.questionId)}
                  >
                    <span className="flex items-start gap-2 mb-1">
                      <span
                        aria-label={n.read ? "읽음" : "읽지 않음"}
                        className={`inline-block w-2 h-2 rounded-full mt-1 shrink-0 ${n.read ? "bg-gray-300" : "bg-[#E11D48]"}`}
                      />
                      <span className={`text-xs leading-snug ${n.read ? "text-gray-600" : "font-bold text-gray-900"}`}>
                        <span className={`${style.color} font-black`}>{style.label}</span> {n.message}
                      </span>
                    </span>
                    <span className="block text-[11px] text-gray-400 pl-4">{formatRelative(n.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
