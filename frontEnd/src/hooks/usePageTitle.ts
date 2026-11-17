import { useEffect } from "react";

// 서비스 이름. index.html의 <title>과 같다.
const SERVICE_NAME = "Dev in_";

// 브라우저 탭 제목을 "화면 이름 · Dev in_"으로 바꾼다. 예: usePageTitle("마이페이지") → "마이페이지 · Dev in_"
// 화면을 떠나면 원래 제목으로 되돌려, 이 훅을 쓰지 않는 화면은 그대로 "Dev in_"이 보인다.
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · ${SERVICE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
