import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLoginPrompt } from "../hooks/useLoginPrompt";
import Logo, { HEADER_INNER_CLASS } from "./Logo";
import { ADMIN_REPORTS_PATH } from "./admin/adminLabels";
import { HEADER_BUTTON_COLOR, HEADER_ICON_BUTTON_CLASS, HEADER_LABEL_CLASS } from "./headerStyles";
import NotificationBell from "./notification/NotificationBell";
import SearchBar from "./search/SearchBar";

const MAIN_PATH = "/questions";

// 닉네임을 누르면 뜨는 프로필 팝오버 (REQ-MAIN-002, 003)
function ProfileMenu({ nickname }: { nickname: string }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
    // 비로그인은 질문 화면을 볼 수 없으므로 첫 화면(로그인)으로 보낸다.
    navigate("/", { replace: true });
  }

  const itemClass = "block w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-[#FFD43B]";

  return (
    <div className="relative" ref={menuRef}>
      {/* #147: lg 미만에서는 닉네임 첫 글자만 보인다. */}
      <button
        className={`${HEADER_ICON_BUTTON_CLASS} ${HEADER_BUTTON_COLOR.yellow}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lg:hidden" aria-hidden="true">
          {Array.from(nickname)[0]}
        </span>
        <span className={HEADER_LABEL_CLASS}>{nickname}</span>
        <span className="hidden lg:inline text-[11px]" aria-hidden="true">
          ▼
        </span>
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
          {/* #33: 관리자에게만 관리자 화면 메뉴를 보여 준다. */}
          {user?.role === "ROLE_ADMIN" && (
            <Link className={itemClass} to={ADMIN_REPORTS_PATH} role="menuitem" onClick={() => setOpen(false)}>
              관리자 페이지
            </Link>
          )}
          <button className={`${itemClass} text-[#E11D48]`} type="button" role="menuitem" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

// 공통 헤더: 로고, 검색바, 로그인 여부에 따른 버튼 (REQ-MAIN-004, 009)
// #147: lg 미만에서는 버튼을 아이콘으로 줄이고, 휴대폰 폭(sm 미만)에서는 검색창도 숨겨 🔍 버튼을 누르면 헤더 아래에 펼친다.
export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initializing } = useAuth();
  const openLoginPrompt = useLoginPrompt();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  // 검색하거나 다른 화면으로 가면 펼친 검색창을 닫는다.
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // 펼치면 바로 입력할 수 있게 하고, 바깥을 누르거나 Esc를 누르면 닫는다.
  useEffect(() => {
    if (!searchOpen) return;
    searchPanelRef.current?.querySelector("input")?.focus();
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!searchPanelRef.current?.contains(target) && !searchToggleRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      searchToggleRef.current?.focus();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [searchOpen]);

  return (
    <header className="w-full bg-white border-b-2 sticky top-0 z-40 border-[#111111]" data-purpose="global-header">
      <div className={HEADER_INNER_CLASS}>
        <Logo to={MAIN_PATH} />

        {/* sm 미만: 닫혀 있으면 숨기고, 펼치면 헤더 바로 아래 한 줄 (기준은 sticky인 header) */}
        <div
          id="header-search"
          ref={searchPanelRef}
          className={`${searchOpen ? "flex" : "hidden"} absolute inset-x-0 top-full px-4 py-3 bg-white border-b-2 border-[#111111] sm:static sm:flex sm:flex-1 sm:justify-center sm:p-0 sm:bg-transparent sm:border-0`}
        >
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            ref={searchToggleRef}
            className={`${HEADER_ICON_BUTTON_CLASS} ${searchOpen ? HEADER_BUTTON_COLOR.yellow : HEADER_BUTTON_COLOR.white} sm:hidden`}
            type="button"
            aria-expanded={searchOpen}
            aria-controls="header-search"
            aria-label={searchOpen ? "검색창 닫기" : "검색창 열기"}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <span aria-hidden="true">🔍</span>
          </button>
          {/* #64: 채택 랭킹은 로그인하지 않아도 본다. */}
          {/* #159: 랭킹 페이지에서는 노란 바탕으로 현재 위치를 보여 준다 (NavLink가 aria-current="page"를 붙인다). */}
          <NavLink
            className={({ isActive }) =>
              `${HEADER_ICON_BUTTON_CLASS} ${isActive ? HEADER_BUTTON_COLOR.yellow : HEADER_BUTTON_COLOR.white}`
            }
            to="/ranking"
          >
            <span aria-hidden="true">🏆</span>
            <span className={HEADER_LABEL_CLASS}>랭킹</span>
          </NavLink>
          <button
            className={`${HEADER_ICON_BUTTON_CLASS} ${HEADER_BUTTON_COLOR.blue}`}
            type="button"
            onClick={() => (user ? navigate("/ask") : openLoginPrompt("질문을 작성하려면 로그인이 필요해요."))}
          >
            <span className="lg:hidden" aria-hidden="true">
              ✏️
            </span>
            <span className={HEADER_LABEL_CLASS}>질문하기</span>
          </button>
          {/* 로그인 상태 복구(reissue) 중에는 버튼이 깜빡이지 않게 비워 둔다. */}
          {initializing ? null : user ? (
            <>
              {/* #70: 안 읽은 알림 수 + 알림 팝오버 (실시간 수신은 NotificationProvider) */}
              <NotificationBell />
              <ProfileMenu nickname={user.nickname} />
            </>
          ) : (
            <>
              <Link className={`${HEADER_ICON_BUTTON_CLASS} ${HEADER_BUTTON_COLOR.white}`} to="/login">
                <span className="lg:hidden" aria-hidden="true">
                  🔑
                </span>
                <span className={HEADER_LABEL_CLASS}>로그인</span>
              </Link>
              <Link className={`${HEADER_ICON_BUTTON_CLASS} ${HEADER_BUTTON_COLOR.yellow}`} to="/signup">
                <span className="lg:hidden" aria-hidden="true">
                  📝
                </span>
                <span className={HEADER_LABEL_CLASS}>회원가입</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
