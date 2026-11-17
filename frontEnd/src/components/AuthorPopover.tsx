// 작성자 요약 팝오버 (#74, REQ-QNA-004). 디자인은 작성자 요약 팝오버(30번) 화면의 #author-popover 카드를 따른다.
// 닉네임에 마우스를 올리면(키보드는 포커스) 열리고, 닉네임·팝오버에서 벗어나면 닫힌다.
// 다른 회원의 프로필은 이 팝오버로만 본다: 닉네임을 눌러도 페이지가 바뀌지 않고, 팝오버 안에도 이동하는 링크를 두지 않는다.
// 예외: 내 팝오버에만 마이페이지로 가는 버튼을 둔다.
// 시안의 답변 수·채택 수·받은 좋아요·대표 뱃지·최근 채택된 답변은 프로필 조회 API에 없어서 빼 두었다.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorCode } from "../api/client";
import { getProfile, type Profile } from "../api/mypage";
import { useAuth } from "../hooks/useAuth";
import GradeIcon from "./GradeIcon";
import { buttonClass, TAG } from "./uiStyles";
import { formatPercent } from "./writer";

// 팝오버 안에는 이동하는 링크를 두지 않으므로 태그도 누르는 모양(마우스 올림 노랑)을 뺀다.
const STATIC_TAG = TAG.split(" ")
  .filter((name) => !name.startsWith("hover:"))
  .join(" ");

// 같은 회원을 다시 열면 이전 결과를 쓴다 (새로고침하면 비워진다). 실패한 결과는 넣지 않는다.
const profileCache = new Map<number, Profile>();

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "로그인하면 프로필을 볼 수 있어요",
  MEMBER_NOT_FOUND: "탈퇴한 회원이에요",
};
const DEFAULT_ERROR = "프로필을 불러오지 못했어요";

// 위로 열 때 sticky 헤더(z-40)에 가리는 만큼은 위쪽 공간에서 뺀다.
const HEADER_SELECTOR = '[data-purpose="global-header"]';

// 마우스가 닉네임 옆 빈 곳을 지나 카드로 대각선 이동할 때 바로 닫히지 않도록 잠깐 기다린다.
const CLOSE_DELAY_MS = 150;

// 화면 가장자리와 카드 사이에 남길 여백 (#159: 오른쪽 끝 닉네임에서 열면 화면 밖으로 나가지 않게)
const EDGE_GAP_PX = 8;

interface Props {
  memberId: number;
  nickname: string;
  className?: string;
}

export default function AuthorPopover({ memberId, nickname, className }: Props) {
  const { user, initializing } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  // 닉네임 왼쪽 끝 기준으로 카드를 옆으로 옮기는 거리 (px, 0 또는 음수)
  const [shiftX, setShiftX] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const show = () => {
    cancelClose();
    setOpen(true);
  };
  const hide = () => {
    cancelClose();
    setOpen(false);
  };
  const hideLater = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(hide, CLOSE_DELAY_MS);
  };

  // 화면을 떠날 때 남은 타이머를 지운다.
  useEffect(() => cancelClose, []);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const loggedIn = user !== null;
  const isMe = user?.memberId === memberId;

  // 열 때 API를 부른다. 비로그인이면 401이 나므로 부르지 않고 바로 안내한다.
  useEffect(() => {
    if (!open || initializing) return;
    if (!loggedIn) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }
    const cached = profileCache.get(memberId);
    if (cached) {
      setProfile(cached);
      setError(null);
      return;
    }
    let cancelled = false;
    setProfile(null);
    setError(null);
    getProfile(memberId)
      .then((data) => {
        profileCache.set(memberId, data);
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(ERROR_MESSAGES[getErrorCode(err) ?? ""] ?? DEFAULT_ERROR);
      });
    return () => {
      cancelled = true;
    };
  }, [open, initializing, loggedIn, memberId]);

  // 아래 공간이 모자라고 위가 더 넓으면 위로 연다. 내용이 바뀌면(로딩 → 프로필) 높이가 달라지므로 다시 잰다.
  // 화면에 그리기 전에 재서 아래로 열렸다가 위로 튀는 깜빡임이 없다.
  useLayoutEffect(() => {
    if (!open || !wrapperRef.current || !popoverRef.current) return;
    const anchor = wrapperRef.current.getBoundingClientRect();
    const headerBottom = document.querySelector(HEADER_SELECTOR)?.getBoundingClientRect().bottom ?? 0;
    const needed = popoverRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchor.bottom;
    const spaceAbove = anchor.top - Math.max(headerBottom, 0);
    setPlacement(spaceBelow < needed && spaceAbove > spaceBelow ? "top" : "bottom");
    // 오른쪽이 화면을 넘으면 넘는 만큼 왼쪽으로 옮긴다. 화면 왼쪽 끝보다 더 가지는 않는다.
    const overflowRight =
      anchor.left + popoverRef.current.offsetWidth - (document.documentElement.clientWidth - EDGE_GAP_PX);
    setShiftX(Math.max(Math.min(0, -overflowRight), EDGE_GAP_PX - anchor.left));
  }, [open, profile, error]);

  // 키보드 사용자는 ESC로 닫는다.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hideLater}
      onFocus={show}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) hide();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={className}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
      >
        {nickname}
      </button>
      {/* pt-2/pb-2는 닉네임과 카드 사이 빈틈이다. 이 영역도 감싸는 span 안이라 카드로 옮겨 가는 동안 닫히지 않는다. */}
      {open && (
        <div
          ref={popoverRef}
          data-placement={placement}
          className={`absolute z-30 ${placement === "top" ? "bottom-full pb-2" : "top-full pt-2"}`}
          style={{ left: shiftX }}
        >
          {/* 작성자 팝오버: 메뉴와 같은 모양 (ui-guide.md 12절), 등급은 닉네임 옆 메달 아이콘만 (7절) */}
          <section
            id={popoverId}
            className="w-[min(360px,calc(100vw-2rem))] p-4 bg-devin-paper border-devin border-devin-ink rounded-xl shadow-devin-sm text-left font-normal text-devin-ink cursor-default"
            data-purpose="author-summary-popover"
          >
            <h3 className="flex items-center gap-1 min-w-0 pb-3 text-base font-extrabold">
              <span className="truncate">{profile?.nickname ?? nickname}</span>
              {profile && <GradeIcon grade={profile.grade} />}
            </h3>

            {error ? (
              <p className="text-sm font-semibold text-devin-gray">{error}</p>
            ) : !profile ? (
              <p className="text-sm font-semibold text-devin-gray">불러오는 중이에요.</p>
            ) : (
              <ProfileSummary profile={profile} />
            )}
            {isMe && (
              <Link to="/mypage" className={`${buttonClass("accent")} mt-4 w-full`}>
                마이페이지
              </Link>
            )}
          </section>
        </div>
      )}
    </span>
  );
}

function ProfileSummary({ profile }: { profile: Profile }) {
  const { bio, careerYears, techStacks, acceptRate } = profile;
  const hasCareerRow = careerYears !== null || techStacks.length > 0;

  return (
    <>
      {bio && (
        <p className="px-3 py-2 rounded-lg bg-devin-bg text-xs leading-relaxed break-words text-devin-ink">“{bio}”</p>
      )}
      {hasCareerRow && (
        <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
          {careerYears !== null && (
            <span className="flex items-center gap-1.5">
              <span className="text-devin-gray">경력</span>
              <span className="font-bold">{careerYears === 0 ? "신입" : `${careerYears}년차`}</span>
            </span>
          )}
          {techStacks.map((stack) => (
            <span key={stack} className={STATIC_TAG}>
              {stack}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-baseline justify-between pt-3 border-t border-devin-line">
        <span className="text-xs font-bold text-devin-gray">채택률</span>
        <span className="text-lg font-black tabular-nums">{formatPercent(acceptRate)}</span>
      </div>
    </>
  );
}
