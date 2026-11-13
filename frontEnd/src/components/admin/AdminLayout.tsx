import { useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ErrorView from "../ErrorView";
import Footer from "../Footer";
import Header from "../Header";
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
    <div
      className="text-[#121212] antialiased min-h-screen flex flex-col"
      style={{
        backgroundColor: "rgb(255, 253, 245)",
        backgroundImage: "radial-gradient(rgb(217, 212, 195) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
    >
      <Header />
      {initializing || !user ? (
        <main className="flex-1" aria-busy="true" />
      ) : !isAdmin ? (
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16">
          <ErrorView
            kind="server"
            title="관리자만 볼 수 있는 페이지입니다"
            description="관리자 계정으로 로그인한 뒤 다시 시도해주세요."
          />
        </main>
      ) : (
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-56 shrink-0" data-purpose="admin-sidebar">
            <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-neutral-600">관리자 메뉴</h2>
            <nav className="flex flex-col gap-2" aria-label="관리자 메뉴">
              {MENU.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2.5 border-2 border-[#121212] text-sm tracking-tight transition-all ${
                      isActive
                        ? "bg-[#FFD43B] font-black shadow-[3px_3px_0_#121212]"
                        : "bg-white font-bold shadow-[2px_2px_0_#121212] hover:bg-neutral-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 flex flex-col min-w-0">
            <h1 className="mb-4 text-2xl font-black tracking-tight">{title}</h1>
            {children}
          </main>
        </div>
      )}
      <Footer />
    </div>
  );
}
