// 답변 하나의 답글 목록·작성·수정·삭제 (#72, REQ-ANSWER-009~011). 디자인은 Replies(25번)·ReplyEditing(26번) 화면을 따른다.
// 답글에는 다시 답글을 달 수 없다 (1단계). 답글 신고는 docs/api.md 8장상 범위 밖이라 버튼을 두지 않는다.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import { REPLY_CONTENT_MAX, createReply, deleteReply, getReplies, updateReply, type Reply } from "../../api/reply";
import { useAuth } from "../../hooks/useAuth";
import { charLength } from "../../hooks/useQuestionForm";
import ConfirmModal from "../ConfirmModal";
import FieldError from "../FieldError";
import { GRADES, formatDate, profilePath } from "../writer";

// 서버(reply.controller.js)와 같은 규칙. 통과하면 null
function validate(content: string) {
  if (content.trim() === "") return "답글 내용을 입력해주세요.";
  if (charLength(content) > REPLY_CONTENT_MAX) return `답글은 ${REPLY_CONTENT_MAX}자 이하로 입력해주세요.`;
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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
    <section
      className="mt-4 -mx-5 -mb-5 bg-[#FFFDF5] border-t-thick border-neoBlack rounded-b-xl p-4 sm:p-6 space-y-3"
      data-purpose="replies-thread"
    >
      {state.status === "loading" && <p className="text-xs font-semibold text-gray-500">답글을 불러오는 중입니다...</p>}
      {state.status === "error" && (
        <p className="text-xs font-semibold text-gray-500" role="alert">
          {state.message}
        </p>
      )}

      {replies.map((reply) => {
        const isMine = user?.memberId === reply.writer.memberId;
        // 서버에서도 다시 검사한다: 수정은 작성자만, 삭제는 작성자·관리자 (REQ-ANSWER-011)
        const canDelete = isMine || user?.role === "ROLE_ADMIN";
        const isEditing = editing?.replyId === reply.replyId;
        const grade = GRADES[reply.writer.grade];

        return (
          <div
            key={reply.replyId}
            className="relative bg-white border-thick border-neoBlack rounded-xl p-4 shadow-brutal-sm"
            style={{ borderLeft: "3px solid rgb(255, 212, 59)" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  className="font-bold text-xs sm:text-sm text-slate-900 hover:underline"
                  to={profilePath(reply.writer.memberId)}
                >
                  {reply.writer.nickname}
                </Link>
                <span className="text-[11px] font-bold" style={{ color: grade.color }} title={`${grade.label} 등급`}>
                  ★
                </span>
                {isMine && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-300">
                    내 답글
                  </span>
                )}
                <time className="text-xs text-slate-400" dateTime={reply.createdAt}>
                  {formatDate(reply.createdAt)}
                </time>
              </div>

              {canDelete && !isEditing && (
                <div className="relative" ref={menuOpenId === reply.replyId ? menuRef : undefined}>
                  <button
                    aria-expanded={menuOpenId === reply.replyId}
                    aria-haspopup="menu"
                    aria-label="답글 관리 옵션"
                    className="p-1 rounded hover:bg-slate-100 text-slate-600 font-bold leading-none"
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === reply.replyId ? null : reply.replyId)}
                  >
                    ⋮
                  </button>
                  {menuOpenId === reply.replyId && (
                    <div
                      className="absolute right-0 top-6 w-24 bg-white border-thick border-neoBlack rounded-lg shadow-brutal z-20 py-1 text-xs font-bold divide-y divide-slate-100"
                      role="menu"
                    >
                      {isMine && (
                        <button
                          className="w-full text-left px-3 py-2 text-slate-800 hover:bg-yellow-100"
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            setEditing({ replyId: reply.replyId, content: reply.content, error: null, saving: false });
                          }}
                        >
                          수정
                        </button>
                      )}
                      <button
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setMenuOpenId(null);
                          setDeleting({ replyId: reply.replyId, busy: false, error: null });
                        }}
                      >
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
                    className="flex-1 bg-white border-thick border-neoBlack rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                    type="text"
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value, error: null })}
                    onKeyDown={onEnter(submitUpdate)}
                  />
                  <button
                    className="px-3 py-2 bg-white border-thick border-neoBlack rounded-lg text-xs font-bold shadow-brutal-sm"
                    type="button"
                    onClick={() => setEditing(null)}
                  >
                    취소
                  </button>
                  <button
                    className="px-3 py-2 bg-[#FFDE59] hover:bg-yellow-300 border-thick border-neoBlack rounded-lg text-xs font-extrabold shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-xs sm:text-sm text-slate-800 mt-2 font-medium whitespace-pre-wrap break-words">
                {reply.content}
              </p>
            )}
          </div>
        );
      })}

      {/* 답글 작성 — 비어 있으면 등록 비활성화, Enter 또는 등록으로 맨 아래에 추가 (REQ-ANSWER-009) */}
      <div className="pt-2">
        {!initializing && !user ? (
          <p className="text-xs font-semibold text-slate-600">
            <Link className="font-extrabold underline" to="/login">
              로그인
            </Link>
            하고 답글을 남겨보세요.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">↳</span>
              <input
                aria-label="답글 내용"
                className="w-full bg-white border-thick border-neoBlack rounded-lg pl-8 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-slate-400 font-medium shadow-brutal-sm"
                placeholder="답글을 입력하세요"
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
              className="px-5 py-2.5 bg-[#FFDE59] text-black font-extrabold text-xs sm:text-sm border-thick border-neoBlack rounded-lg shadow-brutal-sm hover:bg-yellow-300 self-end sm:self-auto shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || content.trim() === ""}
              type="button"
              onClick={submitCreate}
            >
              {submitting ? "등록 중..." : "등록"}
            </button>
          </div>
        )}
        <FieldError message={formError ?? undefined} />
        <p className="text-[11px] text-slate-500 mt-1.5 pl-1 font-medium">
          ※ 답글에는 재답글(대댓글)을 작성할 수 없습니다. (1단계 제한)
        </p>
      </div>

      {deleting && (
        <ConfirmModal
          tone="danger"
          title="정말 삭제하시겠습니까?"
          message="삭제한 답글은 복구할 수 없습니다."
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
