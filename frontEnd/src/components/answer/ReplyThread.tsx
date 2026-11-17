// 답변 하나의 답글 목록·작성·수정·삭제 (#72, REQ-ANSWER-009~011). 모양은 docs/ui-guide.md 공통 값(uiStyles)을 쓴다 (#188).
// 답글에는 다시 답글을 달 수 없다 (1단계). 답글 신고는 docs/api.md 8장상 범위 밖이라 버튼을 두지 않는다.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import { REPLY_CONTENT_MAX, createReply, deleteReply, getReplies, updateReply, type Reply } from "../../api/reply";
import { useAuth } from "../../hooks/useAuth";
import { charLength } from "../../hooks/useQuestionForm";
import AuthorPopover from "../AuthorPopover";
import ConfirmModal from "../ConfirmModal";
import FieldError from "../FieldError";
import GradeIcon from "../GradeIcon";
import ListStatus from "../ListStatus";
import { buttonClass, CARD, INPUT, MENU } from "../uiStyles";
import { formatDateTime } from "../writer";

// 서버(reply.controller.js)와 같은 규칙. 통과하면 null
function validate(content: string) {
  if (content.trim() === "") return "답글 내용을 입력해 주세요.";
  if (charLength(content) > REPLY_CONTENT_MAX) return `답글은 ${REPLY_CONTENT_MAX}자 이하로 입력해 주세요.`;
  return null;
}

const errorText = (error: unknown) => getFieldErrors(error)[0]?.reason ?? getErrorMessage(error);

// Enter로 등록·저장한다. 한글 조합 중 Enter는 글자 확정이므로 무시한다 (Safari는 keyCode 229로 알린다).
// 폼 자동 제출이 이 처리를 건너뛰지 않도록 작성칸은 <form>으로 감싸지 않는다.
function onEnter(action: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    action();
  };
}

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "done"; replies: Reply[] };
type Editing = { replyId: number; content: string; error: string | null; saving: boolean };
type Deleting = { replyId: number; busy: boolean; error: string | null };

export default function ReplyThread({ answerId, onChanged }: { answerId: number; onChanged: () => void }) {
  const { user, initializing } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getReplies(answerId)
      .then((replies) => {
        if (!cancelled) setState({ status: "done", replies });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: getErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [answerId, reloadKey]);

  // 답글 목록과 답변의 "답글 n" 숫자를 함께 새로 고친다.
  function refresh() {
    setReloadKey((key) => key + 1);
    onChanged();
  }

  useEffect(() => {
    if (menuOpenId === null) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpenId(null);
    }
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setMenuOpenId(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpenId]);

  async function submitCreate() {
    if (submitting || content.trim() === "") return;
    const invalid = validate(content);
    setFormError(invalid);
    if (invalid) return;
    setSubmitting(true);
    try {
      await createReply(answerId, content);
      setContent("");
      refresh(); // 오래된 순이라 새 답글은 목록 맨 아래에 붙는다
    } catch (error) {
      setFormError(errorText(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitUpdate() {
    if (editing === null || editing.saving) return;
    const invalid = validate(editing.content);
    if (invalid) {
      setEditing({ ...editing, error: invalid });
      return;
    }
    setEditing({ ...editing, saving: true, error: null });
    try {
      await updateReply(editing.replyId, editing.content);
      setEditing(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setEditing({ ...editing, saving: false, error: errorText(error) });
    }
  }

  async function confirmDelete() {
    if (deleting === null) return;
    setDeleting({ ...deleting, busy: true });
    try {
      await deleteReply(deleting.replyId);
      setDeleting(null);
      refresh();
    } catch (error) {
      setDeleting({ ...deleting, busy: false, error: getErrorMessage(error) });
    }
  }

  const replies = state.status === "done" ? state.replies : [];

  return (
    // 답변 카드(p-4 sm:p-6)의 안쪽 여백만큼 바깥으로 넓혀 카드 아래쪽을 채운다
    <section
      className="mt-4 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-devin-bg border-t-devin border-devin-ink rounded-b-xl p-4 sm:p-6 space-y-3"
      data-purpose="replies-thread"
    >
      {state.status === "loading" && <ListStatus kind="loading">답글을 불러오는 중이에요.</ListStatus>}
      {state.status === "error" && <ListStatus kind="error">{state.message}</ListStatus>}

      {replies.map((reply) => {
        const isMine = user?.memberId === reply.writer.memberId;
        // 서버에서도 다시 검사한다: 수정은 작성자만, 삭제는 작성자·관리자 (REQ-ANSWER-011)
        const canDelete = isMine || user?.role === "ROLE_ADMIN";
        const isEditing = editing?.replyId === reply.replyId;

        return (
          <div key={reply.replyId} className={`${CARD} relative p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                <AuthorPopover
                  className="font-bold text-sm text-devin-ink hover:underline"
                  memberId={reply.writer.memberId}
                  nickname={reply.writer.nickname}
                />
                <GradeIcon grade={reply.writer.grade} />
                {isMine && <span className="text-xs font-bold text-devin-gray">내 답글</span>}
                <time className="text-xs text-devin-gray" dateTime={reply.createdAt}>
                  {formatDateTime(reply.createdAt)}
                </time>
              </div>

              {canDelete && !isEditing && (
                <div className="relative" ref={menuOpenId === reply.replyId ? menuRef : undefined}>
                  <button
                    aria-expanded={menuOpenId === reply.replyId}
                    aria-haspopup="menu"
                    aria-label="답글 관리 옵션"
                    className={`${buttonClass("secondary", "sm")} w-8 px-0`}
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === reply.replyId ? null : reply.replyId)}
                  >
                    <span className={MENU.icon} aria-hidden="true">
                      more_horiz
                    </span>
                  </button>
                  {menuOpenId === reply.replyId && (
                    <div className={`${MENU.panel} absolute right-0 top-10 w-28 z-20`} role="menu">
                      {isMine && (
                        <>
                          <button
                            className={MENU.item}
                            role="menuitem"
                            type="button"
                            onClick={() => {
                              setMenuOpenId(null);
                              setEditing({ replyId: reply.replyId, content: reply.content, error: null, saving: false });
                            }}
                          >
                            <span className={MENU.icon} aria-hidden="true">
                              edit
                            </span>
                            수정
                          </button>
                          <div role="separator" className={MENU.divider} />
                        </>
                      )}
                      <button
                        className={`${MENU.item} ${MENU.danger}`}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          setDeleting({ replyId: reply.replyId, busy: false, error: null });
                        }}
                      >
                        <span className={MENU.icon} aria-hidden="true">
                          delete
                        </span>
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    aria-label="답글 수정"
                    autoFocus
                    className={`${INPUT.base} ${editing.error ? INPUT.error : ""} flex-1`}
                    type="text"
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value, error: null })}
                    onKeyDown={onEnter(submitUpdate)}
                  />
                  <button className={buttonClass("secondary")} type="button" onClick={() => setEditing(null)}>
                    취소
                  </button>
                  <button
                    className={buttonClass("accent")}
                    disabled={editing.saving || editing.content.trim() === ""}
                    type="button"
                    onClick={submitUpdate}
                  >
                    {editing.saving ? "저장 중..." : "저장"}
                  </button>
                </div>
                <FieldError message={editing.error ?? undefined} />
              </div>
            ) : (
              <p className="text-sm text-devin-ink mt-2 font-medium whitespace-pre-wrap break-words">{reply.content}</p>
            )}
          </div>
        );
      })}

      {/* 답글 작성 — 비어 있으면 등록 비활성화, Enter 또는 등록으로 맨 아래에 추가 (REQ-ANSWER-009) */}
      <div className="pt-2">
        {!initializing && !user ? (
          <p className="text-xs font-semibold text-devin-gray">
            <Link className="font-extrabold text-devin-ink underline" to="/login">
              로그인
            </Link>
            하고 답글을 남겨 보세요.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span
                className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] leading-none text-devin-gray-light"
                aria-hidden="true"
              >
                subdirectory_arrow_right
              </span>
              <input
                aria-label="답글 내용"
                className={`${INPUT.base} ${formError ? INPUT.error : ""} pl-9`}
                placeholder="답글을 입력해 주세요"
                type="text"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setFormError(null);
                }}
                onKeyDown={onEnter(submitCreate)}
              />
            </div>
            <button
              className={`${buttonClass("accent")} self-end sm:self-auto shrink-0`}
              disabled={submitting || content.trim() === ""}
              type="button"
              onClick={submitCreate}
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        )}
        <FieldError message={formError ?? undefined} />
        <p className="text-xs text-devin-gray mt-1.5">답글에는 다시 답글을 달 수 없어요.</p>
      </div>

      {deleting && (
        <ConfirmModal
          tone="danger"
          title="답글을 삭제할까요?"
          message="삭제한 답글은 되돌릴 수 없어요."
          confirmLabel="삭제"
          busy={deleting.busy}
          error={deleting.error}
          onCancel={() => {
            if (deleting.error) refresh(); // 실패했으면(그사이 삭제됨 등) 최신 상태로 다시 불러온다
            setDeleting(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}
