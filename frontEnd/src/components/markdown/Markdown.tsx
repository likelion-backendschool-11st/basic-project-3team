// 마크다운 표시 (#62). 마크다운·코드 하이라이팅 라이브러리가 커서(압축 약 100KB) 이 컴포넌트를 쓰는 화면에서만 따로 불러온다.
// 불러오는 짧은 동안에는 원문을 그대로 보여 준다 (React가 HTML을 이스케이프).
import { Suspense, lazy } from "react";

const MarkdownView = lazy(() => import("./MarkdownView"));

export default function Markdown({ content }: { content: string }) {
  return (
    <Suspense fallback={<div className="whitespace-pre-wrap break-words text-gray-900">{content}</div>}>
      <MarkdownView content={content} />
    </Suspense>
  );
}
