import { Link } from "react-router-dom";
import { buttonClass, CARD } from "./uiStyles";

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
    title: "페이지를 찾을 수 없어요",
    description:
      "주소가 올바르지 않거나, 삭제되어 더 이상 볼 수 없는 페이지예요. 주소를 확인하거나 메인으로 돌아가 주세요.",
  },
  server: {
    title: "일시적인 오류가 생겼어요",
    description: "서버와 연결이 원활하지 않거나 화면을 그리는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
  },
};

// 오류 안내 카드 (REQ-MAIN-010). Stitch "시스템 상태 및 예외 화면 (29번)"의 404·에러 카드.
// 페이지 전체(NotFound, ErrorBoundary)에서도, 화면 일부(삭제된 질문 등)에서도 쓸 수 있다.
export default function ErrorView({ kind, title, description, onRetry, useRouterLink = true }: Props) {
  const text = DEFAULTS[kind];
  const home = (
    <>
      <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
        arrow_back
      </span>
      메인으로 돌아가기
    </>
  );
  // 다시 시도가 있으면 그게 주요 버튼이고, 메인 이동은 보조 버튼 (한 화면에 주요 버튼 하나, ui-guide.md 4절)
  const homeClass = buttonClass(onRetry ? "secondary" : "primary");

  return (
    <section
      className={`${CARD} p-6 flex flex-col items-center justify-center min-h-[320px] text-center`}
      role="alert"
      data-purpose={kind === "notFound" ? "state-card-404" : "state-card-error"}
    >
      <span
        className={`material-symbols-outlined mb-4 text-[48px] leading-none ${
          kind === "notFound" ? "text-devin-ink" : "text-devin-red"
        }`}
        aria-hidden="true"
      >
        {kind === "notFound" ? "search_off" : "error"}
      </span>
      {kind === "notFound" && <p className="mb-1 font-mono text-xs font-bold text-devin-gray">404</p>}
      <h1 className="text-2xl font-black text-devin-ink mb-2">{title ?? text.title}</h1>
      <p className="text-sm text-devin-gray mb-6 max-w-sm leading-relaxed">{description ?? text.description}</p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button className={buttonClass("primary")} type="button" onClick={onRetry}>
            다시 시도
          </button>
        )}
        {useRouterLink ? (
          <Link className={homeClass} to={MAIN_PATH}>
            {home}
          </Link>
        ) : (
          <a className={homeClass} href={MAIN_PATH}>
            {home}
          </a>
        )}
      </div>
    </section>
  );
}
