// 입력칸 아래 빨간 에러 문구 (질문하기·질문 수정). 쓰는 화면의 *.tailwind.cjs content에 이 파일을 넣어야 스타일이 생긴다.
export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1" role="alert">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          clipRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          fillRule="evenodd"
        ></path>
      </svg>
      {message}
    </p>
  );
}
