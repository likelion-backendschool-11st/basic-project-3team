// 아이디 찾기·비밀번호 찾기 화면 공통 모양. 로그인 화면(Login.tsx)의 입력칸·버튼 모양을 그대로 따른다.
// 페이지마다 Tailwind 설정이 달라서 테마 토큰 대신 값을 직접 적는다.

export const INPUT_CLASS =
  "w-full px-4 py-3 bg-[#FFFDF5] text-black text-sm font-medium border-[2.5px] border-black rounded-xl placeholder:text-gray-400 placeholder:font-normal transition duration-150 focus:outline-none focus:bg-white focus:shadow-[3px_3px_0_#111111] disabled:bg-gray-100 disabled:text-gray-500";

const BUTTON_BASE =
  "w-full py-3.5 text-base font-black border-[2.5px] rounded-xl tracking-wide flex items-center justify-center gap-2 transition-all";

// 주 버튼 (로그인 버튼과 같은 노란색)
export const PRIMARY_BUTTON = `${BUTTON_BASE} bg-[#FFD43B] text-black border-black shadow-[4px_4px_0_#111111] cursor-pointer hover:-translate-x-[1.5px] hover:-translate-y-[1.5px] hover:shadow-[5.5px_5.5px_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#111111]`;

export const PRIMARY_BUTTON_DISABLED = `${BUTTON_BASE} bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed`;

// 보조 버튼 (흰색)
export const SECONDARY_BUTTON =
  "w-full py-3 text-sm font-bold bg-white text-black border-[2.5px] border-black rounded-xl shadow-[2.5px_2.5px_0_#111111] flex items-center justify-center gap-1.5 transition-all hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
