import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ErrorView from "./ErrorView";
import { PAGE_BACKGROUND } from "./uiStyles";

interface State {
  hasError: boolean;
}

// 화면을 그리다 예외가 나면 하얀 화면 대신 오류 화면을 보여준다 (REQ-MAIN-010).
class ErrorBoundaryInner extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("화면 오류", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    // 헤더가 오류 원인일 수도 있어 헤더 없이 보여준다. 이동은 <a>로 해서 앱을 새로 시작한다.
    return (
      <main className={`min-h-screen px-4 py-16 ${PAGE_BACKGROUND}`}>
        <div className="max-w-devin-narrow mx-auto">
          <ErrorView kind="server" useRouterLink={false} onRetry={() => window.location.reload()} />
        </div>
      </main>
    );
  }
}

// 다른 주소로 이동하면 오류 상태를 풀어 준다.
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundaryInner key={pathname}>{children}</ErrorBoundaryInner>;
}
