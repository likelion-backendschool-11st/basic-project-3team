import { Link } from "react-router-dom";

export type ErrorKind = "notFound" | "server";

interface Props {
  kind: ErrorKind;
  title?: string;
  description?: string;
  // 있으면 "다시 시도" 버튼을 보여준다.
  onRetry?: () => void;
  // false면 react-router Link 대신 <a>로 이동한다 (ErrorBoundary처럼 앱 상태를 새로 시작해야 할 때).
  useRouterLink?: boolean;
}

const MAIN_PATH = "/questions";

const DEFAULTS: Record<ErrorKind, { title: string; description: string }> = {
  notFound: {
    title: "페이지를 찾을 수 없습니다",
    description: "주소가 올바르지 않거나, 삭제되어 더 이상 볼 수 없는 페이지입니다.",
  },
  server: {
    title: "일시적인 오류가 발생했습니다",
    description: "서버와 연결이 원활하지 않거나 화면을 그리는 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
  },
};

const buttonClass =
  "inline-flex items-center gap-2 border-[2.5px] border-[#111111] px-5 py-2.5 rounded-xl font-bold text-sm shadow-[3px_3px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all";

// 오류 안내 카드 (REQ-MAIN-010). Stitch "시스템 상태 및 예외 화면 (29번)"의 404·에러 카드.
// 페이지 전체(NotFound, ErrorBoundary)에서도, 화면 일부(삭제된 질문 등)에서도 쓸 수 있다.
export default function ErrorView({ kind, title, description, onRetry, useRouterLink = true }: Props) {
  const text = DEFAULTS[kind];
  const homeLabel = "메인으로 돌아가기";

  return (
    <section
      className="bg-white border-[2.5px] border-black rounded-[12px] shadow-[5px_5px_0_#111111] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[320px] text-center"
      role="alert"
      data-purpose={kind === "notFound" ? "state-card-404" : "state-card-error"}
    >
      {kind === "notFound" ? (
        <span className="mb-3 font-mono font-black text-6xl tracking-tight text-black select-none drop-shadow-[4px_4px_0px_#FDE047]">
          404
        </span>
      ) : (
        <div className="mb-4 w-14 h-14 bg-red-100 border-[2.5px] border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0_#111111]">
          <span aria-hidden="true" className="text-2xl">
            ⚠️
          </span>
        </div>
      )}
      <h1 className="text-xl font-black text-neutral-900 tracking-tight mb-2">{title ?? text.title}</h1>
      <p className="text-sm text-neutral-500 mb-7 max-w-sm leading-relaxed">{description ?? text.description}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            className={`${buttonClass} bg-[#2563EB] text-white hover:bg-blue-600`}
            type="button"
            onClick={onRetry}
          >
            다시 시도
          </button>
        )}
        {useRouterLink ? (
          <Link className={`${buttonClass} bg-white hover:bg-neutral-50`} to={MAIN_PATH}>
            ← {homeLabel}
          </Link>
        ) : (
          <a className={`${buttonClass} bg-white hover:bg-neutral-50`} href={MAIN_PATH}>
            ← {homeLabel}
          </a>
        )}
      </div>
    </section>
  );
}
