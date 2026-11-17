import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationType } from "../../api/notification";
import { useNotifications } from "../../hooks/notificationContext";
import { HEADER_BUTTON_COLOR, HEADER_ICON_BUTTON_CLASS } from "../headerStyles";
import ListStatus from "../ListStatus";
import { detailPath } from "../questionList";
import { BUTTON, FOCUS, MENU, NOTICE, tabCountClass } from "../uiStyles";
import { formatRelative } from "../writer";

// 알림 종류별 아이콘과 머리말 (ui-guide.md 9절: 색 대신 아이콘으로 구분한다)
const TYPE_STYLE: Record<NotificationType, { label: string; icon: string }> = {
  ANSWER_CREATED: { label: "답변", icon: "chat_bubble" },
  ANSWER_ACCEPTED: { label: "채택", icon: "check_circle" },
  CATEGORY_QUESTION: { label: "관심", icon: "bookmark" },
};

const headerButton = `relative ${HEADER_ICON_BUTTON_CLASS} ${HEADER_BUTTON_COLOR.white}`;
// 안 읽은 알림 수 (헤더 버튼 위 빨간 원). 휴대폰 폭에서는 아이콘 버튼 오른쪽 위에 겹쳐 둔다.
const BADGE =
  "absolute -top-2 -right-2 lg:static inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full border-[1.5px] border-devin-ink bg-devin-red text-white text-[11px] font-extrabold leading-none tabular-nums";

// 헤더 알림 버튼 + 알림 팝오버 (REQ-MAIN-005, #70). 로그인한 상태에서만 헤더가 그린다.
export default function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
      setActionError("모두 읽음으로 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  // #152: 확인 없이 바로 지운다. 삭제 중에는 버튼을 막아 요청이 두 번 가지 않게 한다.
  async function handleDeleteAll() {
    if (deleting) return;
    setActionError(null);
    setDeleting(true);
    try {
      await deleteAll();
    } catch {
      setActionError("알림을 지우지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  }

  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  // #147: 휴대폰 폭에서는 알림 버튼이 오른쪽 끝이 아니라 팝오버가 화면 왼쪽으로 잘린다.
  // sm 미만에서는 기준을 헤더로 옮겨 헤더 좌우 여백(16px)에 맞춘다.
  return (
    <div className="sm:relative" ref={boxRef}>
      <button
        className={headerButton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `알림, 안 읽은 알림 ${unreadCount}개` : "알림"}
        onClick={toggle}
      >
        <span className={`lg:hidden ${MENU.icon}`} aria-hidden="true">
          notifications
        </span>
        <span className="hidden lg:inline">알림</span>
        {unreadCount > 0 && (
          <span className={BADGE} aria-hidden="true">
            {badge}
          </span>
        )}
      </button>

      {/* 알림 팝오버: 메뉴와 같은 모양 (ui-guide.md 12절) */}
      {open && (
        <div
          className={`${MENU.panel} absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-[360px] sm:max-w-[calc(100vw-2rem)] z-50`}
          role="dialog"
          aria-label="알림 목록"
          data-purpose="notification-dropdown-panel"
        >
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-devin-ink">
              새 알림
              <span className={tabCountClass(false)}>{unreadCount}</span>
            </h2>
            <button
              className={`${BUTTON.text} text-xs`}
              type="button"
              disabled={unreadCount === 0}
              onClick={handleReadAll}
            >
              모두 읽음
            </button>
          </div>

          {actionError && (
            <p className={`${NOTICE.error} mx-1 mb-1 text-xs`} role="alert">
              {actionError}
            </p>
          )}

          <div className={MENU.divider} role="separator" />

          <ul className="text-left max-h-[380px] overflow-y-auto" aria-busy={loading}>
            {error && (
              <li>
                <ListStatus kind="error">{error}</ListStatus>
              </li>
            )}
            {!error && loading && items.length === 0 && (
              <li>
                <ListStatus kind="loading">알림을 불러오는 중이에요.</ListStatus>
              </li>
            )}
            {!error && !loading && items.length === 0 && (
              <li>
                <ListStatus kind="empty">아직 받은 알림이 없어요.</ListStatus>
              </li>
            )}
            {items.map((n) => {
              const style = TYPE_STYLE[n.type];
              return (
                <li key={n.notificationId}>
                  {/* 안 읽은 알림은 크림 바탕 + 굵은 글자, 읽은 알림은 회색 글자 */}
                  <button
                    className={`flex w-full items-start gap-2 p-2.5 rounded-lg text-left transition-colors hover:bg-devin-yellow ${FOCUS} ${
                      n.read ? "text-devin-gray" : "bg-devin-bg text-devin-ink"
                    }`}
                    type="button"
                    onClick={() => openNotification(n.notificationId, n.questionId)}
                  >
                    <span className={`${MENU.icon} mt-px`} aria-hidden="true">
                      {style.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-xs leading-snug ${n.read ? "" : "font-bold"}`}>
                        <span className="font-extrabold">[{style.label}]</span> {n.message}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-devin-gray">
                        {!n.read && <span className="font-extrabold text-devin-ink">새 알림 ·</span>}
                        {formatRelative(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* #152: 목록 아래 위험 항목. 지울 알림이 없으면 숨긴다. */}
          {items.length > 0 && (
            <>
              <div className={MENU.divider} role="separator" />
              <button
                className={`${MENU.item} ${MENU.danger}`}
                type="button"
                disabled={deleting}
                onClick={handleDeleteAll}
              >
                <span className={MENU.icon} aria-hidden="true">
                  delete
                </span>
                {deleting ? "삭제 중..." : "모두 삭제"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
