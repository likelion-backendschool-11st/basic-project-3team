// 질문 상세 화면의 답변 영역 (#26): 목록·작성·수정·삭제·채택. 디자인은 Answers(24번) 화면을 따른다.
// QuestionDetail.tailwind.cjs의 테마(border-thick, neoBlack 등)로 스타일이 만들어진다.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import ConfirmModal from "../ConfirmModal";
import LikeButton from "../LikeButton";
import Markdown from "../markdown/Markdown";
import FieldError from "../FieldError";
import ReportDialog from "../report/ReportDialog";
import { GRADES, formatDate, profilePath, writerSummary } from "../writer";
import ReplyThread from "./ReplyThread";

// 서버(answer.controller.js)와 같은 규칙. 통과하면 null
function validateContent(content: string) {
  if (charLength(content.trim()) < RULES.contentMin) return `내용은 ${RULES.contentMin}자 이상 입력해주세요.`;
  if (charLength(content) > RULES.contentMax)
    return `내용은 ${RULES.contentMax.toLocaleString()}자 이하로 입력해주세요.`;
  return null;
}

// 400이면 content 필드 문구, 아니면 서버 메시지
function errorText(error: unknown) {
  return getFieldErrors(error)[0]?.reason ?? getErrorMessage(error);
}

const CONFIRM = {
  delete: {
    tone: "danger",
    title: "정말 삭제하시겠습니까?",
    message: "삭제한 답변은 복구할 수 없습니다.",
    confirmLabel: "삭제",
  },
  accept: {
    tone: "accept",
    title: "이 답변을 채택하시겠습니까?",
    message: "채택 후에는 취소할 수 없습니다.",
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
  const navigate = useNavigate();
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
  useEffect(() => {
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
  }, [questionId, reloadKey]);
  const reload = () => setReloadKey((key) => key + 1);

  // 메뉴 바깥을 누르면 닫는다.
  useEffect(() => {
    if (menuOpenId === null) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpenId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
        <div className="flex items-end justify-between border-b-2 border-black/10 pb-2">
          <h2 className="text-xl font-black flex items-center gap-2">
            <span>답변</span>
            <span className="bg-[#2563EB] text-white text-xs px-2 py-0.5 rounded-full border-thick border-neoBlack">
              {answers.length}
            </span>
          </h2>
          <span className="text-xs font-bold text-gray-500">채택 → 추천순 → 최신순</span>
        </div>

        {state.status === "loading" && (
          <p className="p-6 text-center text-sm font-semibold text-gray-600">답변을 불러오는 중입니다...</p>
        )}
        {state.status === "error" && (
          <p className="p-6 text-center text-sm font-semibold text-gray-600" role="alert">
            {state.message}
          </p>
        )}
        {state.status === "done" && answers.length === 0 && (
          <p className="bg-white border-thick border-neoBlack rounded-xl shadow-brutal-sm p-6 text-center text-sm font-bold text-gray-600">
            아직 답변이 없습니다. 첫 답변을 남겨보세요.
          </p>
        )}

        {answers.map((answer) => {
          const isAnswerWriter = user?.memberId === answer.writer.memberId;
          // 서버에서도 다시 검사한다: 수정은 작성자(채택 전), 삭제는 작성자(채택 전)·관리자, 채택은 질문 작성자(남의 답변, 해결 전)
          const canEdit = isAnswerWriter && !answer.accepted;
          const canDelete = canEdit || user?.role === "ROLE_ADMIN";
          const canAccept = isQuestionWriter && !isAnswerWriter && !questionAccepted;
          const isEditing = editing?.answerId === answer.answerId;
          const summary = writerSummary(answer.writer);

          return (
            <article
              key={answer.answerId}
              className={`border-thick rounded-xl p-5 shadow-brutal ${
                answer.accepted ? "bg-[#F0FDF4] border-emerald-600" : "bg-white border-neoBlack"
              }`}
              data-purpose={answer.accepted ? "accepted-answer" : "standard-answer"}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link className="font-extrabold text-base hover:underline" to={profilePath(answer.writer.memberId)}>
                      {answer.writer.nickname}
                    </Link>
                    <span
                      className="text-sm"
                      style={{ color: GRADES[answer.writer.grade].color }}
                      title={`${GRADES[answer.writer.grade].label} 등급`}
                    >
                      ★
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {summary && (
                      <>
                        {summary}
                        <span className="text-gray-400 mx-1">|</span>
                      </>
                    )}
                    <time dateTime={answer.createdAt}>{formatDate(answer.createdAt)}</time>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {answer.accepted && (
                    <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-lg border-thick border-neoBlack shadow-brutal-sm">
                      ✓ 채택됨
                    </span>
                  )}
                  {canAccept && (
                    <button
                      className="bg-[#22C55E] hover:bg-emerald-400 text-white border-thick border-neoBlack font-bold text-xs px-3 py-1.5 rounded-lg shadow-brutal-sm"
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
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 border-thick border-neoBlack rounded-lg shadow-brutal-sm font-bold text-gray-700"
                        type="button"
                        onClick={() => setMenuOpenId(menuOpenId === answer.answerId ? null : answer.answerId)}
                      >
                        ⋮
                      </button>
                      {menuOpenId === answer.answerId && (
                        <div
                          className="absolute right-0 top-9 w-24 bg-white border-thick border-neoBlack rounded-lg shadow-brutal p-1 z-20"
                          role="menu"
                        >
                          {canEdit && (
                            <button
                              className="w-full text-left text-xs font-bold px-2 py-1.5 hover:bg-gray-100 rounded"
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
                              수정
                            </button>
                          )}
                          <button
                            className="w-full text-left text-xs font-bold text-red-600 px-2 py-1.5 hover:bg-red-50 rounded"
                            role="menuitem"
                            type="button"
                            onClick={() => {
                              setMenuOpenId(null);
                              setConfirm({ kind: "delete", answerId: answer.answerId, busy: false, error: null });
                            }}
                          >
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
                    className="w-full bg-[#FFFDF5] border-thick border-neoBlack rounded-lg p-3.5 text-sm font-medium focus:ring-0 focus:outline-none resize-y min-h-[120px] font-mono"
                    rows={5}
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value, error: null })}
                  />
                  <FieldError message={editing.error ?? undefined} />
                  <div className="flex justify-end gap-2">
                    <button
                      className="bg-white hover:bg-gray-100 border-thick border-neoBlack font-bold text-xs px-4 py-1.5 rounded-lg shadow-brutal-sm"
                      type="button"
                      onClick={() => setEditing(null)}
                    >
                      취소
                    </button>
                    <button
                      className="bg-[#2563EB] hover:bg-blue-700 text-white border-thick border-neoBlack font-bold text-xs px-4 py-1.5 rounded-lg shadow-brutal-sm disabled:opacity-60"
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
                <div className="text-sm font-medium text-gray-800 leading-relaxed my-4">
                  <Markdown content={answer.content} />
                </div>
              )}

              {/* 좋아요(#66)·신고·답글(#72) */}
              <div
                className={`flex items-center justify-between pt-2 border-t ${
                  answer.accepted ? "border-emerald-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LikeButton
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 border-thick border-neoBlack px-3 py-1 rounded-md text-xs font-bold shadow-brutal-sm"
                    isMine={isAnswerWriter}
                    likeCount={answer.likeCount}
                    liked={answer.liked}
                    target="ANSWER"
                    targetId={answer.answerId}
                  />
                  {/* 본인 답변은 신고할 수 없어 숨긴다 (서버도 400). 비로그인이면 로그인 화면으로 */}
                  {!isAnswerWriter && (
                    <button
                      className="bg-white hover:bg-gray-100 border-thick border-neoBlack px-2.5 py-1 rounded-md text-xs font-semibold text-gray-600 shadow-brutal-sm"
                      type="button"
                      onClick={() => (user ? setReportAnswerId(answer.answerId) : navigate("/login"))}
                    >
                      신고
                    </button>
                  )}
                </div>
                {/* 답글이 있으면 "답글 n", 없으면 "답글 달기". 누르면 펼치기/접기 (REQ-ANSWER-009) */}
                <button
                  aria-expanded={openReplies.has(answer.answerId)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#FFDE59] hover:bg-yellow-300 border-thick border-neoBlack rounded-lg shadow-brutal-sm text-xs font-extrabold text-black"
                  type="button"
                  onClick={() => toggleReplies(answer.answerId)}
                >
                  {answer.replyCount > 0 ? (
                    <>
                      <span>답글</span>
                      <span className="bg-black text-white rounded-full px-1.5 text-[10px]">{answer.replyCount}</span>
                    </>
                  ) : (
                    <span>답글 달기</span>
                  )}
                  <span aria-hidden="true">{openReplies.has(answer.answerId) ? "▲" : "▼"}</span>
                </button>
              </div>
              {openReplies.has(answer.answerId) && <ReplyThread answerId={answer.answerId} onChanged={reload} />}
            </article>
          );
        })}
      </section>

      {/* 답변 작성 — 비로그인이면 로그인 유도 (REQ-ANSWER-001) */}
      <section className="space-y-3 pt-8" data-purpose="answer-compose-form">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight">답변 작성</h3>
          <span className="text-xs text-gray-500 font-semibold">코드 블록(```) 사용 가능</span>
        </div>
        {!initializing && !user ? (
          <div className="bg-white border-thick border-neoBlack rounded-xl p-6 shadow-brutal text-center space-y-4">
            <p className="text-sm font-bold text-gray-700">로그인하고 답변을 남겨보세요.</p>
            <Link
              className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm px-6 py-2 rounded-lg border-thick border-neoBlack shadow-brutal-sm"
              to="/login"
            >
              로그인하기
            </Link>
          </div>
        ) : (
          <form
            className="bg-white border-thick border-neoBlack rounded-xl p-4 shadow-brutal space-y-3"
            noValidate
            onSubmit={handleCreate}
          >
            <textarea
              aria-label="답변 내용"
              className="w-full bg-[#FFFDF5] border-thick border-neoBlack rounded-lg p-3.5 text-sm font-medium focus:ring-0 focus:outline-none placeholder-gray-400 resize-y min-h-[120px] font-mono"
              placeholder={`답변을 입력하세요 (${RULES.contentMin}자 이상, 코드 블럭 \`\`\` 사용 가능)`}
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setFormError(null);
              }}
            />
            <FieldError message={formError ?? undefined} />
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-gray-400 font-medium">
                동의하지 않는 내용이 있다면 정중한 어조로 건전한 토론을 지향해주세요.
              </div>
              <button
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-black text-sm px-6 py-2 rounded-lg border-thick border-neoBlack shadow-brutal-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
                type="submit"
              >
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
