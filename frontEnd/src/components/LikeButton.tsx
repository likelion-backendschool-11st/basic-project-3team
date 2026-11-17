// 질문·답변 좋아요 버튼 (#66, REQ-QUESTION-010, REQ-ANSWER-007). 누르면 좋아요, 다시 누르면 취소.
// 모양(className)은 쓰는 곳이 정하고 동작만 여기서 맡는다. 숫자는 미리 바꾸지 않고 서버 응답으로만 바꾼다.
import { useEffect, useState } from "react";
import { getErrorCode, getErrorMessage } from "../api/client";
import { setLike, type LikeTarget } from "../api/like";
import { useAuth } from "../hooks/useAuth";
import { useLoginPrompt } from "../hooks/useLoginPrompt";
import { formatNumber } from "./writer";

const MESSAGE_SHOW_MS = 2500;

export default function LikeButton({
  target,
  targetId,
  liked: initialLiked,
  likeCount: initialCount,
  isMine,
  className,
}: {
  target: LikeTarget;
  targetId: number;
  liked: boolean;
  likeCount: number;
  isMine: boolean;
  className: string;
}) {
  const openLoginPrompt = useLoginPrompt();
  const { user } = useAuth();
  const [state, setState] = useState({ liked: initialLiked, likeCount: initialCount });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 목록을 다시 불러오면 새 값으로 맞춘다.
  useEffect(() => {
    setState({ liked: initialLiked, likeCount: initialCount });
  }, [initialLiked, initialCount]);

  useEffect(() => {
    if (message === null) return;
    const timer = setTimeout(() => setMessage(null), MESSAGE_SHOW_MS);
    return () => clearTimeout(timer);
  }, [message]);

  async function toggle() {
    if (busy) return;
    if (!user) {
      openLoginPrompt("좋아요를 누르려면 로그인이 필요해요."); // 비로그인이면 로그인 안내 팝업
      return;
    }
    setBusy(true);
    try {
      setState(await setLike(target, targetId, !state.liked));
    } catch (error) {
      // 다른 탭 등에서 이미 바꿔 둔 경우: 서버 상태에 맞춘다 (숫자는 그대로)
      const code = getErrorCode(error);
      if (code === "ALREADY_LIKED") setState((prev) => ({ ...prev, liked: true }));
      else if (code === "LIKE_NOT_FOUND") setState((prev) => ({ ...prev, liked: false }));
      else setMessage(getErrorMessage(error)); // 삭제된 글, 정지 회원 등
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {/* 비활성(본인 글·처리 중) 모양은 쓰는 곳의 buttonClass가 맡는다 */}
      <button
        aria-label={state.liked ? "좋아요 취소" : "좋아요"}
        aria-pressed={state.liked}
        className={className}
        disabled={isMine || busy}
        title={isMine ? "본인 글에는 좋아요를 누를 수 없어요" : undefined}
        type="button"
        onClick={toggle}
      >
        {/* 누른 상태는 채운 하트로 구분한다. 빨강은 위험·오류에만 쓰므로 색은 바꾸지 않는다 (ui-guide.md 1절) */}
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[18px] leading-none"
          style={state.liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          favorite
        </span>
        <span className="tabular-nums">좋아요 {formatNumber(state.likeCount)}</span>
      </button>
      {message && (
        <span className="text-xs font-bold text-devin-red" role="alert">
          {message}
        </span>
      )}
    </span>
  );
}
