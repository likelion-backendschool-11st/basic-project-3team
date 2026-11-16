import { Link } from "react-router-dom";

// 공통 헤더와, 공통 헤더를 쓰지 않는 로그인·회원가입·찾기 화면의 헤더 안쪽 틀. 로고 위치를 모든 화면에서 같게 한다 (#156)
export const HEADER_INNER_CLASS = "max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4";

// 모든 화면이 같이 쓰는 로고 (#156)
export default function Logo({ to }: { to: string }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 select-none" aria-label="Dev in_ 메인으로">
      <span className="text-2xl font-black text-[#111111] tracking-tight">Dev</span>
      <span className="bg-[#FFD43B] border-2 border-[#111111] px-1.5 py-0.5 rounded text-lg font-['JetBrains_Mono',monospace] font-bold text-[#111111] shadow-[2px_2px_0_#111111]">
        in_
      </span>
    </Link>
  );
}
