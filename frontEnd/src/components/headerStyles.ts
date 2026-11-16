// 헤더 버튼 공통 모양. 공통 Header, 알림 버튼, 로그인 관련 화면의 AuthHeader가 같이 쓴다.
// inline-flex라야 <a>(Link)에도 h-10이 적용돼 <button>과 높이가 같다.
export const HEADER_BUTTON_CLASS =
  "h-10 px-4 inline-flex items-center gap-1.5 border-2 border-[#111111] rounded-lg text-sm font-bold shadow-[2px_2px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap";

export const HEADER_BUTTON_COLOR = {
  white: "bg-white hover:bg-gray-100",
  yellow: "bg-[#FFD43B] hover:bg-yellow-400",
  blue: "bg-[#2563EB] text-white hover:bg-blue-700",
};
