import { useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ErrorView from "../ErrorView";
import Footer from "../Footer";
import Header from "../Header";
import { BUTTON, PAGE_BACKGROUND } from "../uiStyles";
import { ADMIN_MEMBERS_PATH, ADMIN_REPORTS_PATH } from "./adminLabels";

const MENU = [
  { to: ADMIN_REPORTS_PATH, label: "신고 관리" },
  { to: ADMIN_MEMBERS_PATH, label: "회원 관리" },
];

// 관리자 화면 공통 틀: 헤더 + 왼쪽 메뉴. 관리자만 볼 수 있다 (REQ-ADMIN, docs/auth.md 권한).
// 로그인하지 않았으면 로그인 화면으로, 일반 회원이면 권한 없음 안내를 보여 준다. 서버도 403으로 한 번 더 막는다.
export default function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (!initializing && !user) navigate("/login", { replace: true });
  }, [initializing, user, navigate]);

  return (
    <div className={`text-devin-ink antialiased min-h-screen flex flex-col ${PAGE_BACKGROUND}`}>
      <Header />
      {initializing || !user ? (
        <main className="flex-1" aria-busy="true" />
      ) : !isAdmin ? (
        <main className="flex-1 w-full max-w-devin-narrow mx-auto px-4 py-16">
          <ErrorView
            kind="server"
            title="관리자만 볼 수 있는 페이지예요"
            description="관리자 계정으로 로그인한 뒤 다시 시도해 주세요."
          />
        </main>
      ) : (
        <div className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-56 shrink-0" data-purpose="admin-sidebar">
            <h2 className="mb-2 px-1 text-xs font-extrabold text-devin-gray">관리자 메뉴</h2>
            {/* 고른 메뉴는 검정 (탭과 같은 규칙, ui-guide.md 12절). 휴대폰 폭에서는 가로로 놓는다. */}
            <nav className="flex flex-row lg:flex-col gap-2" aria-label="관리자 메뉴">
              {MENU.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${BUTTON.base} ${BUTTON.size.md} lg:justify-start ${isActive ? "bg-devin-ink text-white" : BUTTON.variant.secondary}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 flex flex-col min-w-0">
            <h1 className="mb-4 text-2xl font-black">{title}</h1>
            {children}
          </main>
        </div>
      )}
      <Footer />
    </div>
  );
}
