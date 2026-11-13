// 다른 회원 프로필 (REQ-MYPAGE-001 "다른 사용자도 내 프로필 조회 가능", #30)
// 로그인한 회원만 볼 수 있고, 개인정보·활동 내역은 보여주지 않는다. 마이페이지 스타일(#page-mypage)을 함께 쓴다.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorCode, getErrorMessage } from "../api/client";
import { getProfile, type Profile } from "../api/mypage";
import Header from "../components/Header";
import ProfileDetails from "../components/ProfileDetails";
import { useAuth } from "../hooks/useAuth";
import "./Mypage.css";

const css =
  ".neo-border { border: 2.5px solid #111111; }\n.neo-border-thin { border: 1.5px solid #111111; }\n.neo-box-shadow { box-shadow: 5px 5px 0px #111111; }\n.neo-box-shadow-sm { box-shadow: 3px 3px 0px #111111; }";

export default function MemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 로그인이 필요한 화면이다. 새로고침 직후에는 reissue로 로그인 상태를 복구할 때까지 기다린다.
  useEffect(() => {
    if (!initializing && !user) {
      navigate("/login", { replace: true });
    }
  }, [initializing, user, navigate]);

  const loggedIn = user !== null;
  useEffect(() => {
    if (!loggedIn) return;
    const id = Number(memberId);
    if (!Number.isInteger(id) || id < 1) {
      setError("존재하지 않는 회원입니다.");
      return;
    }
    let cancelled = false;
    setProfile(null);
    setError(null);
    getProfile(id)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorCode(err) === "MEMBER_NOT_FOUND" ? "존재하지 않는 회원입니다." : getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [memberId, loggedIn]);

  const isMe = profile !== null && user?.memberId === profile.memberId;

  return (
    <div id="page-mypage">
      <style>{css}</style>
      <div
        className="text-neutral-900 min-h-screen flex flex-col antialiased"
        style={{
          backgroundColor: "rgb(255, 253, 245)",
          backgroundImage: "radial-gradient(rgb(217, 212, 195) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <Header />
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <section className="bg-white neo-border neo-box-shadow p-5 sm:p-6" data-purpose="member-profile-card">
            <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-neutral-200 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-indigo-500 inline-block neo-border-thin"></span>
                <h1 className="text-xl font-extrabold tracking-tight">
                  {profile ? `${profile.nickname}님의 프로필` : "프로필"}
                </h1>
              </div>
              {isMe && (
                <Link
                  className="neo-border text-xs font-bold px-2.5 py-1.5 bg-white hover:bg-neutral-100 neo-box-shadow-sm"
                  to="/mypage"
                >
                  내 마이페이지
                </Link>
              )}
            </div>
            {error && (
              <p className="py-6 text-center text-sm font-bold text-rose-600" role="alert">
                {error}
              </p>
            )}
            {!profile && !error && <p className="text-sm font-semibold text-neutral-500">불러오는 중이에요…</p>}
            {profile && <ProfileDetails profile={profile} showGrade />}
          </section>
        </main>
      </div>
    </div>
  );
}
