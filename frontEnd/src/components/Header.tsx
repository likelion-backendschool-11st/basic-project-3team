import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const MAIN_PATH = "/questions";
const SEARCH_PATH = "/search-results";

const buttonBase =
  "h-10 px-4 border-2 border-[#111111] text-sm font-bold shadow-[2px_2px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap";

// 닉네임을 누르면 뜨는 프로필 팝오버 (REQ-MAIN-002, 003)
function ProfileMenu({ nickname }: { nickname: string }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 팝오버 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate(MAIN_PATH);
  }

  const itemClass = "block w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-[#FFD43B]";

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`${buttonBase} bg-[#FFD43B] rounded-[10px] flex items-center gap-1.5`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{nickname}</span>
        <span className="text-[11px]">▼</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white border-2 border-[#111111] shadow-[3px_3px_0_#111111] divide-y-2 divide-[#111111] z-50"
          role="menu"
        >
          <Link className={itemClass} to="/mypage" role="menuitem" onClick={() => setOpen(false)}>
            프로필
          </Link>
          <Link className={itemClass} to="/profile-edit" role="menuitem" onClick={() => setOpen(false)}>
            프로필 수정
          </Link>
          <button className={`${itemClass} text-[#E11D48]`} type="button" role="menuitem" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

// 공통 헤더: 로고, 검색바, 로그인 여부에 따른 버튼 (REQ-MAIN-004, 009)
export default function Header() {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [keyword, setKeyword] = useState("");

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `${SEARCH_PATH}?keyword=${encodeURIComponent(trimmed)}` : SEARCH_PATH);
  }

  return (
    <header className="w-full bg-white border-b-2 sticky top-0 z-40 border-[#111111]" data-purpose="global-header">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to={MAIN_PATH} className="flex items-center gap-1.5 select-none" aria-label="Dev in_ 메인으로">
          <span className="text-2xl font-black text-[#111111] tracking-tight">Dev</span>
          <span className="bg-[#FFD43B] border-2 border-[#111111] px-1.5 py-0.5 rounded text-lg font-mono font-bold text-[#111111] shadow-[2px_2px_0_#111111]">
            in_
          </span>
        </Link>

        <form className="flex-1 max-w-[460px] mx-2 sm:mx-6" role="search" onSubmit={handleSearch}>
          <input
            className="w-full h-[40px] px-3.5 py-2 bg-white border-2 border-black rounded-[8px] text-sm text-[#111111] placeholder:text-[#888888] focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0_#111111] transition-all"
            placeholder="검색어를 입력하세요"
            type="search"
            aria-label="질문 검색"
            maxLength={100}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </form>

        <div className="flex items-center gap-2.5">
          <button
            className={`${buttonBase} bg-[#2563EB] text-white hover:bg-blue-700`}
            type="button"
            onClick={() => navigate(user ? "/ask" : "/login")}
          >
            질문하기
          </button>
          {/* 로그인 상태 복구(reissue) 중에는 버튼이 깜빡이지 않게 비워 둔다. */}
          {initializing ? null : user ? (
            <>
              {/* 알림 팝오버는 #70에서 연결한다. */}
              <button className={`${buttonBase} px-3 bg-white hover:bg-gray-100`} type="button">
                알림
              </button>
              <ProfileMenu nickname={user.nickname} />
            </>
          ) : (
            <>
              <Link className={`${buttonBase} py-2 bg-white hover:bg-gray-100`} to="/login">
                로그인
              </Link>
              <Link className={`${buttonBase} py-2 bg-[#FFD43B] hover:bg-yellow-400`} to="/signup">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
