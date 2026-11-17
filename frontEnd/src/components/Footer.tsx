import { Link } from "react-router-dom";
import { FOCUS } from "./uiStyles";

const LINK = `rounded hover:text-devin-ink hover:underline ${FOCUS}`;

// 공통 푸터 (Stitch "전체 질문 목록" 화면의 푸터)
export default function Footer() {
  return (
    <footer className="w-full bg-devin-paper border-t-devin border-devin-ink mt-12 py-6" data-purpose="global-footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-devin-gray gap-4">
        <div>
          <span className="font-bold text-devin-ink">Dev in_</span>
          {" © 2026. All rights reserved."}
        </div>

        <div className="flex items-center gap-4 font-medium">
          {/* #158: 이용약관·개인정보처리방침 페이지 연결 */}
          <Link className={LINK} to="/terms">
            이용약관
          </Link>
          <span aria-hidden="true">·</span>
          <Link className={LINK} to="/privacy">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
