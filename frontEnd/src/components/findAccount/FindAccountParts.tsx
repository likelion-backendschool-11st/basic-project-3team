import type { ReactNode } from "react";

// 아이디 찾기·비밀번호 찾기 화면이 같이 쓰는 조각. 두 화면의 모양을 한 곳에서 맞춘다.

// 화면 위쪽 제목
export function FindPageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center mb-9">
      <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-white border-[2px] border-black rounded-full text-xs font-mono font-bold shadow-[2.5px_2.5px_0_#111111]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFD43B] border border-black"></span>
        {"Security & Account Recovery"}
      </span>
      <h1 className="text-[28px] md:text-[40px] leading-tight font-black tracking-tight text-black mb-2.5">{title}</h1>
      <p className="text-sm text-gray-600 font-medium">{description}</p>
    </div>
  );
}

// 왼쪽·오른쪽 카드
export function FindCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`bg-white border-[2.5px] border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0_#111111] flex flex-col ${className}`}
    >
      {children}
    </section>
  );
}

export type BadgeTone = "gray" | "yellow" | "green" | "red" | "white";

const DOT_CLASS: Record<BadgeTone, string> = {
  gray: "bg-gray-300",
  yellow: "bg-[#FFD43B]",
  green: "bg-emerald-500",
  red: "bg-rose-500",
  white: "bg-white",
};

const BADGE_CLASS: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-700",
  yellow: "bg-[#FFD43B] text-black",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-rose-100 text-rose-700",
  white: "bg-[#FFFDF5] text-black",
};

// 카드 제목줄: 동그라미 표시 + 제목 + 오른쪽 배지
export function FindCardHeader({ title, badge, tone }: { title: string; badge: string; tone: BadgeTone }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b-[2.5px] border-black">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full border-2 border-black shrink-0 ${DOT_CLASS[tone]}`}></span>
        <h2 className="text-lg font-black text-black">{title}</h2>
      </div>
      <span
        className={`px-2.5 py-0.5 border-[2px] border-black rounded-full text-[11px] font-mono font-bold whitespace-nowrap ${BADGE_CLASS[tone]}`}
      >
        {badge}
      </span>
    </div>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-black mb-1.5" htmlFor={htmlFor}>
      {children} <span className="text-rose-500">*</span>
    </label>
  );
}

export type HintTone = "idle" | "error" | "ok";

const HINT_CLASS: Record<HintTone, string> = {
  idle: "text-gray-500",
  error: "text-rose-600",
  ok: "text-emerald-700",
};

const HINT_MARK: Record<HintTone, string> = { idle: "ⓘ", error: "⚠", ok: "✓" };

// 입력칸 아래 안내 문구
export function FieldHint({ tone, children }: { tone: HintTone; children: ReactNode }) {
  return (
    <p className={`mt-1.5 text-[11px] font-semibold ${HINT_CLASS[tone]}`}>
      {HINT_MARK[tone]} {children}
    </p>
  );
}

const NOTICE_CLASS: Record<HintTone, string> = {
  idle: "bg-[#F9F7F1] text-gray-700 font-medium",
  error: "bg-rose-50 text-rose-700 font-bold",
  ok: "bg-emerald-50 text-emerald-800 font-bold",
};

// 버튼 위 안내 박스
export function NoticeBox({ tone = "idle", children }: { tone?: HintTone; children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      className={`px-4 py-3 border-[2px] border-black rounded-xl text-[13px] leading-relaxed ${NOTICE_CLASS[tone]}`}
    >
      {children}
    </div>
  );
}

// 오른쪽 카드 가운데 상태 안내 (조회 전·잠김·실패·완료)
export function StatusMessage({
  icon,
  title,
  children,
  iconClass = "bg-white",
}: {
  icon: string;
  title: ReactNode;
  children?: ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
      <div
        className={`w-14 h-14 rounded-full border-[2.5px] border-black shadow-[2.5px_2.5px_0_#111111] flex items-center justify-center text-2xl ${iconClass}`}
      >
        {icon}
      </div>
      <p className="text-base font-black text-black">{title}</p>
      {children && <div className="text-[13px] text-gray-600 font-medium leading-relaxed">{children}</div>}
    </div>
  );
}

// 카드 아래 링크 줄을 감싸는 구분선
export function FindCardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-8 pt-5 border-t-[2px] border-black/10">{children}</div>;
}
