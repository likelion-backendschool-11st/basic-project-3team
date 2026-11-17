import type { ReactNode } from "react";
import Logo, { HEADER_INNER_CLASS } from "./Logo";

// 로그인·회원가입·아이디/비밀번호 찾기 화면 헤더: 로고와 오른쪽 버튼만 둔다.
// 버튼은 headerStyles의 HEADER_BUTTON_CLASS를 써서 공통 Header와 모양을 맞춘다.
export default function AuthHeader({ children }: { children: ReactNode }) {
  return (
    <header className="w-full bg-devin-paper border-b-2 border-devin-ink sticky top-0 z-40">
      <div className={HEADER_INNER_CLASS}>
        <Logo to="/" />
        <div className="flex items-center gap-2.5">{children}</div>
      </div>
    </header>
  );
}
