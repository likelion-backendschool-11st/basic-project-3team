import type { ReactNode } from "react";
import FieldError from "../FieldError";
import { CARD, INPUT, NOTICE } from "../uiStyles";

// 아이디 찾기·비밀번호 찾기 화면이 같이 쓰는 조각. 두 화면의 모양을 한 곳에서 맞춘다.
// 모양은 docs/ui-guide.md 공통 값(uiStyles, FieldError)만 쓴다 (#189).

const SMALL_ICON = "material-symbols-outlined text-[15px] leading-none";

// 화면 위쪽 제목
export function FindPageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-black text-devin-ink mb-2">{title}</h1>
      <p className="text-sm font-medium text-devin-gray">{description}</p>
    </div>
  );
}

// 왼쪽·오른쪽 카드 (큰 카드, 휴대폰 폭에서는 16px)
export function FindCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`${CARD} p-4 sm:p-6 flex flex-col ${className}`}>{children}</section>;
}

// 카드 제목줄
export function FindCardHeader({ title }: { title: string }) {
  return <h2 className="pb-4 mb-6 border-b-devin border-devin-ink text-lg font-extrabold text-devin-ink">{title}</h2>;
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label className={INPUT.label} htmlFor={htmlFor}>
      {children} <span className="text-devin-red">*</span>
    </label>
  );
}

export type HintTone = "idle" | "error" | "ok";

// 입력칸 아래 안내(idle)·확인(ok) 문구. 오류는 공통 FieldError로 보여 준다.
export function FieldHint({ tone, children }: { tone: HintTone; children: string }) {
  if (tone === "error") return <FieldError message={children} />;
  return (
    <p className={`${INPUT.hint} flex items-center gap-1 ${tone === "ok" ? "font-bold text-devin-ink" : ""}`}>
      <span className={SMALL_ICON} aria-hidden="true">
        {tone === "ok" ? "check_circle" : "info"}
      </span>
      {children}
    </p>
  );
}

const NOTICE_TONE: Record<HintTone, { className: string; icon: string }> = {
  idle: { className: NOTICE.info, icon: "info" },
  error: { className: NOTICE.error, icon: "error" },
  ok: { className: NOTICE.success, icon: "check_circle" },
};

// 버튼 위 안내 상자 (ui-guide.md 8절)
export function NoticeBox({ tone = "idle", children }: { tone?: HintTone; children: ReactNode }) {
  const { className, icon } = NOTICE_TONE[tone];
  return (
    <div aria-live="polite" className={className}>
      <span className="material-symbols-outlined text-[18px] leading-5" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

export type StatusTone = "info" | "error" | "success";

const STATUS_ICON_CLASS: Record<StatusTone, string> = {
  info: "bg-devin-paper text-devin-ink",
  error: "bg-devin-red-soft text-devin-red",
  success: "bg-devin-green-soft text-devin-ink",
};

// 오른쪽 카드 가운데 상태 안내 (조회 전·잠김·실패·완료)
export function StatusMessage({
  icon,
  title,
  children,
  tone = "info",
}: {
  icon: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: StatusTone;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
      <div
        className={`w-14 h-14 rounded-full border-devin border-devin-ink shadow-devin-sm flex items-center justify-center ${STATUS_ICON_CLASS[tone]}`}
      >
        <span className="material-symbols-outlined text-[28px] leading-none" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="text-base font-extrabold text-devin-ink">{title}</p>
      {children && <div className="text-sm font-medium text-devin-gray leading-relaxed">{children}</div>}
    </div>
  );
}

// 카드 아래 링크 줄을 감싸는 구분선
export function FindCardFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 pt-4 border-t-devin border-devin-line">{children}</div>;
}
