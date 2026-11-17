import { Link } from "react-router-dom";
import { FOCUS } from "./uiStyles";

const LINK = `rounded hover:text-devin-ink hover:underline ${FOCUS}`;

// 아이디 찾기·비밀번호 찾기 카드 하단 링크. 지금 화면의 링크 대신 다른 찾기 화면 링크를 보여준다.
export default function AccountLinks({ current }: { current: "find-id" | "find-password" }) {
  const other =
    current === "find-id" ? { to: "/find-password", label: "비밀번호 찾기" } : { to: "/find-id", label: "아이디 찾기" };
  return (
    <p className="text-xs font-semibold text-devin-gray flex items-center justify-center gap-1.5 flex-wrap">
      <Link className={LINK} to={other.to}>
        {other.label}
      </Link>
      <span className="text-devin-gray-light" aria-hidden="true">
        |
      </span>
      <Link className={LINK} to="/signup">
        회원가입
      </Link>
      <span className="text-devin-gray-light" aria-hidden="true">
        |
      </span>
      <Link className={`${LINK} inline-flex items-center gap-0.5 font-bold text-devin-ink`} to="/login">
        로그인으로 돌아가기
        <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">
          arrow_forward
        </span>
      </Link>
    </p>
  );
}
