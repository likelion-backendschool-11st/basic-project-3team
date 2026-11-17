// 질문 상세 화면의 답변 영역 (#26): 목록·작성·수정·삭제·채택. 모양은 docs/ui-guide.md 공통 값(uiStyles)을 쓴다 (#188).
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ANSWER_RULES as RULES,
  acceptAnswer,
  createAnswer,
  deleteAnswer,
  getAnswers,
  updateAnswer,
  type Answer,
} from "../../api/answer";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import { charLength } from "../../hooks/useQuestionForm";
import { useAuth } from "../../hooks/useAuth";
import { useLoginPrompt } from "../../hooks/useLoginPrompt";
import AuthorPopover from "../AuthorPopover";
import ConfirmModal from "../ConfirmModal";
import LikeButton from "../LikeButton";
import Markdown from "../markdown/Markdown";
import FieldError from "../FieldError";
import ReportDialog from "../report/ReportDialog";
import GradeIcon from "../GradeIcon";
import ListStatus from "../ListStatus";
import StatusBadge from "../StatusBadge";
import { buttonClass, CARD, INPUT, MENU, tabCountClass } from "../uiStyles";
import { formatDateTime, formatNumber, writerSummary } from "../writer";
import ReplyThread from "./ReplyThread";

// 서버(answer.controller.js)와 같은 규칙. 통과하면 null
function validateContent(content: string) {
  if (charLength(content.trim()) < RULES.contentMin) return `내용은 ${RULES.contentMin}자 이상 입력해 주세요.`;
  if (charLength(content) > RULES.contentMax) return `내용은 ${formatNumber(RULES.contentMax)}자 이하로 입력해 주세요.`;
  return null;
}

// 400이면 content 필드 문구, 아니면 서버 메시지
function errorText(error: unknown) {
  return getFieldErrors(error)[0]?.reason ?? getErrorMessage(error);
}

const CONFIRM = {
  delete: {
    tone: "danger",
    title: "답변을 삭제할까요?",
    message: "삭제한 답변은 되돌릴 수 없어요.",
    confirmLabel: "삭제",
  },
  accept: {
    tone: "accent",
    title: "이 답변을 채택할까요?",
    message: "채택하면 취소할 수 없어요.",
    confirmLabel: "채택",
  },
} as const;

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "done"; answers: Answer[] };
type Editing = { answerId: number; content: string; error: string | null; saving: boolean };
type Confirm = { kind: keyof typeof CONFIRM; answerId: number; busy: boolean; error: string | null };

export default function AnswerSection({
  questionId,
  questionWriterId,
  questionAccepted,
  onAccepted,
}: {
  questionId: number;
  questionWriterId: number;
  questionAccepted: boolean;
  onAccepted: () => void;
}) {
  const openLoginPrompt = useLoginPrompt();
  const { user, initializing } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [reportAnswerId, setReportAnswerId] = useState<number | null>(null);
  // 답글을 펼친 답변들 (#72). 답변마다 따로 펼치고 접는다.
  const [openReplies, setOpenReplies] = useState<ReadonlySet<number>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  // 답변 목록 조회는 조회수를 올리지 않으므로 작성·수정·삭제·채택 뒤 목록만 다시 불러온다.
  // 로그인 복구(reissue)가 끝난 뒤 불러오고, 로그인한 사람이 바뀌면 답변마다 liked를 다시 받는다.
  const viewerId = user?.memberId ?? null;
  useEffect(() => {
    if (initializing) return;
    let cancelled = false;
    getAnswers(questionId)
      .then(({ answers }) => {
        if (!cancelled) setState({ status: "done", answers });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: getErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [questionId, reloadKey, initializing, viewerId]);
  const reload = () => setReloadKey((key) => key + 1);

  // 메뉴 바깥을 누르면 닫는다.
  useEffect(() => {
    if (menuOpenId === null) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpenId(null);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpenId(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpenId]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const invalid = validateContent(content);
    setFormError(invalid);
    if (invalid) return;
    setSubmitting(true);
    try {
      await createAnswer(questionId, content);
      setContent("");
      reload(); // REQ-ANSWER-001: 등록 즉시 목록에 추가
    } catch (error) {
      setFormError(errorText(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (editing === null || editing.saving) return;
    const invalid = validateContent(editing.content);
    if (invalid) {
      setEditing({ ...editing, error: invalid });
      return;
    }
    setEditing({ ...editing, saving: true, error: null });
    try {
      await updateAnswer(editing.answerId, editing.content);
      setEditing(null);
      reload();
    } catch (error) {
      // 409 ACCEPTED_ANSWER_LOCKED(그사이 채택됨) 등
      setEditing({ ...editing, saving: false, error: errorText(error) });
    }
  }

  async function handleConfirm() {
    if (confirm === null) return;
    setConfirm({ ...confirm, busy: true });
    try {
      if (confirm.kind === "delete") {
        await deleteAnswer(confirm.answerId);
      } else {
        await acceptAnswer(confirm.answerId);
        onAccepted(); // 질문 카드의 해결됨 표시
      }
      setConfirm(null);
      reload();
    } catch (error) {
      setConfirm({ ...confirm, busy: false, error: getErrorMessage(error) });
    }
  }

  function toggleReplies(answerId: number) {
    setOpenReplies((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return next;
    });
  }

  const answers = state.status === "done" ? state.answers : [];
  const isQuestionWriter = user?.memberId === questionWriterId;

  return (
    <>
      <section className="mt-10 space-y-4" data-purpose="answers-list-section">
        <div className="flex items-end justify-between border-b-devin border-devin-line pb-2">
          <h2 className="text-lg font-extrabold text-devin-ink flex items-center gap-2">
            <span>답변</span>
            <span className={tabCountClass(false)}>{answers.length}</span>
          </h2>
          <span className="text-xs font-bold text-devin-gray">채택 → 추천순 → 최신순</span>
        </div>

        {state.status === "loading" && <ListStatus kind="loading">답변을 불러오는 중이에요.</ListStatus>}
        {state.status === "error" && <ListStatus kind="error">{state.message}</ListStatus>}
        {state.status === "done" && answers.length === 0 && (
          <div className={CARD}>
            <ListStatus kind="empty">아직 답변이 없어요. 첫 답변을 남겨 보세요.</ListStatus>
          </div>
        )}

        {answers.map((answer) => {
          const isAnswerWriter = user?.memberId === answer.writer.memberId;
          // 서버에서도 다시 검사한다: 수정은 작성자(채택 전), 삭제는 작성자(채택 전)·관리자, 채택은 질문 작성자(남의 답변, 해결 전)
          const canEdit = isAnswerWriter && !answer.accepted;
          const canDelete = canEdit || user?.role === "ROLE_ADMIN";
          const canAccept = isQuestionWriter && !isAnswerWriter && !questionAccepted;
          const isEditing = editing?.answerId === answer.answerId;
          const summary = writerSummary(answer.writer);
          const repliesOpen = openReplies.has(answer.answerId);

          return (
            <article
              key={answer.answerId}
              className={`${CARD} p-4 sm:p-6`}
              data-purpose={answer.accepted ? "accepted-answer" : "standard-answer"}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <AuthorPopover
                      className="font-extrabold text-base hover:underline"
                      memberId={answer.writer.memberId}
                      nickname={answer.writer.nickname}
                    />
                    <GradeIcon grade={answer.writer.grade} />
                  </div>
                  {summary && <p className="text-xs text-devin-gray font-medium">{summary}</p>}
                </div>

                {/* #163: 작성일은 닉네임 줄 오른쪽 끝에 둬서 작성자 정보 줄을 짧게 한다 */}
                <div className="flex items-center gap-2 shrink-0">
                  <time className="text-xs text-devin-gray font-semibold whitespace-nowrap" dateTime={answer.createdAt}>
                    {formatDateTime(answer.createdAt)}
                  </time>
                  {answer.accepted && <StatusBadge kind="answerAccepted" />}
                  {canAccept && (
                    <button
                      className={buttonClass("accent", "sm")}
                      type="button"
                      onClick={() =>
                        setConfirm({ kind: "accept", answerId: answer.answerId, busy: false, error: null })
                      }
                    >
                      채택하기
                    </button>
                  )}
                  {canDelete && !isEditing && (
                    <div className="relative" ref={menuOpenId === answer.answerId ? menuRef : undefined}>
                      <button
                        aria-expanded={menuOpenId === answer.answerId}
                        aria-haspopup="menu"
                        aria-label="답변 옵션"
                        className={`${buttonClass("secondary", "sm")} w-8 px-0`}
                        type="button"
                        onClick={() => setMenuOpenId(menuOpenId === answer.answerId ? null : answer.answerId)}
                      >
                        <span className={MENU.icon} aria-hidden="true">
                          more_horiz
                        </span>
                      </button>
                      {menuOpenId === answer.answerId && (
                        <div className={`${MENU.panel} absolute right-0 top-10 w-28 z-20`} role="menu">
                          {canEdit && (
                            <>
                              <button
                                className={MENU.item}
                                role="menuitem"
                                type="button"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setEditing({
                                    answerId: answer.answerId,
                                    content: answer.content,
                                    error: null,
                                    saving: false,
                                  });
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
                              setConfirm({ kind: "delete", answerId: answer.answerId, busy: false, error: null });
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
              </div>

              {isEditing ? (
                <div className="my-4 space-y-2">
                  <textarea
                    aria-label="답변 수정"
                    className={`${INPUT.box} ${editing.error ? INPUT.error : ""} resize-y min-h-[120px] font-mono`}
                    rows={5}
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value, error: null })}
                  />
                  <FieldError message={editing.error ?? undefined} />
                  <div className="flex justify-end gap-2">
                    <button className={buttonClass("secondary", "sm")} type="button" onClick={() => setEditing(null)}>
                      취소
                    </button>
                    <button
                      className={buttonClass("primary", "sm")}
                      disabled={editing.saving}
                      type="button"
                      onClick={handleUpdate}
                    >
                      {editing.saving ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              ) : (
                // 마크다운으로 보여 준다 (#62). HTML 태그는 실행하지 않는다 (REQ-QNA-003).
                <div className="text-sm font-medium text-devin-ink leading-relaxed my-4">
                  <Markdown content={answer.content} />
                </div>
              )}

              {/* 좋아요(#66)·신고·답글(#72) */}
              <div className="flex items-center justify-between pt-3 border-t border-devin-line">
                <div className="flex items-center gap-2">
                  <LikeButton
                    className={buttonClass("secondary", "sm")}
                    isMine={isAnswerWriter}
                    likeCount={answer.likeCount}
                    liked={answer.liked}
                    target="ANSWER"
                    targetId={answer.answerId}
                  />
                  {/* 본인 답변은 신고할 수 없어 숨긴다 (서버도 400). 비로그인이면 로그인 안내 */}
                  {!isAnswerWriter && (
                    <button
                      className={buttonClass("secondary", "sm")}
                      type="button"
                      onClick={() =>
                        user ? setReportAnswerId(answer.answerId) : openLoginPrompt("신고하려면 로그인이 필요해요.")
                      }
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
                        flag
                      </span>
                      신고
                    </button>
                  )}
                </div>
                {/* 답글이 있으면 "답글 n", 없으면 "답글 달기". 누르면 펼치기/접기 (REQ-ANSWER-009) */}
                <button
                  aria-expanded={repliesOpen}
                  className={buttonClass("accent", "sm")}
                  type="button"
                  onClick={() => toggleReplies(answer.answerId)}
                >
                  {answer.replyCount > 0 ? (
                    <>
                      답글
                      <span className={tabCountClass(false)}>{answer.replyCount}</span>
                    </>
                  ) : (
                    "답글 달기"
                  )}
                  <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
                    {repliesOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>
              {repliesOpen && <ReplyThread answerId={answer.answerId} onChanged={reload} />}
            </article>
          );
        })}
      </section>

      {/* 답변 작성 — 비로그인이면 로그인 유도 (REQ-ANSWER-001) */}
      <section className="space-y-3 pt-8" data-purpose="answer-compose-form">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-devin-ink">답변 작성</h2>
          <span className="text-xs text-devin-gray font-semibold">코드 블록(```) 사용 가능</span>
        </div>
        {!initializing && !user ? (
          <div className={`${CARD} p-6 text-center space-y-4`}>
            <p className="text-sm font-bold text-devin-ink">로그인하고 답변을 남겨 보세요.</p>
            <Link className={buttonClass("primary")} to="/login">
              로그인하기
            </Link>
          </div>
        ) : (
          <form className={`${CARD} p-4 space-y-3`} noValidate onSubmit={handleCreate}>
            <textarea
              aria-label="답변 내용"
              className={`${INPUT.box} ${formError ? INPUT.error : ""} resize-y min-h-[120px] font-mono`}
              placeholder={`답변을 입력해 주세요 (${RULES.contentMin}자 이상, 코드 블록 \`\`\` 사용 가능)`}
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setFormError(null);
              }}
            />
            <FieldError message={formError ?? undefined} />
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs text-devin-gray">동의하지 않는 내용은 정중하게 이야기해 주세요.</p>
              <button className={`${buttonClass("primary")} shrink-0`} disabled={submitting} type="submit">
                {submitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        )}
      </section>

      {reportAnswerId !== null && (
        <ReportDialog targetType="ANSWER" targetId={reportAnswerId} onClose={() => setReportAnswerId(null)} />
      )}
      {confirm && (
        <ConfirmModal
          {...CONFIRM[confirm.kind]}
          busy={confirm.busy}
          error={confirm.error}
          onCancel={() => {
            if (confirm.error) reload(); // 실패했으면(그사이 삭제·채택됨 등) 최신 상태로 다시 불러온다
            setConfirm(null);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
