import { INPUT } from "./uiStyles";

// 입력칸 아래 빨간 오류 문구 (질문하기·질문 수정, docs/ui-guide.md 5절)
export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={`${INPUT.errorText} flex items-center gap-1`} role="alert">
      <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">
        error
      </span>
      {message}
    </p>
  );
}
