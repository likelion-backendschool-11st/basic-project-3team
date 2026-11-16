import { Link } from "react-router-dom";

// 아이디 찾기·비밀번호 찾기 카드 하단 링크. 지금 화면의 링크 대신 다른 찾기 화면 링크를 보여준다.
export default function AccountLinks({
  current,
}: {
  current: "find-id" | "find-password";
}) {
  const other =
    current === "find-id"
      ? { to: "/find-password", label: "비밀번호 찾기" }
      : { to: "/find-id", label: "아이디 찾기" };
  return (
    <p className="text-[11px] font-semibold text-neutral-600 flex items-center justify-center gap-1.5 flex-wrap">
      <Link className="hover:text-black hover:underline" to={other.to}>
        {other.label}
      </Link>
      <span className="text-neutral-400">|</span>
      <Link className="hover:text-black hover:underline" to="/signup">
        회원가입
      </Link>
      <span className="text-neutral-400">|</span>
      <Link className="font-bold text-black hover:underline" to="/login">
        로그인으로 돌아가기 →
      </Link>
    </p>
  );
}
