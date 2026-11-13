import type { ReactNode } from "react";

// 목록 영역 안의 로딩·에러·빈 상태 문구
export default function ListStatus({ children }: { children: ReactNode }) {
  return <div className="p-10 text-center text-sm font-semibold text-gray-600">{children}</div>;
}
