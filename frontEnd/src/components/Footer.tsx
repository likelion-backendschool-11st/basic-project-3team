// 공통 푸터 (Stitch "전체 질문 목록" 화면의 푸터)
export default function Footer() {
  return (
    <footer className="w-full bg-white border-t-[2.5px] border-[#111111] mt-12 py-6" data-purpose="global-footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div>
          <span className="font-bold text-gray-900">Dev in_</span>
          {" © 2026. All rights reserved."}
        </div>

        <div className="flex items-center gap-4 font-medium">
          <span>이용약관</span>
          <span>·</span>
          <span>개인정보처리방침</span>
          <span>·</span>
          <span>문의하기</span>
        </div>
      </div>
    </footer>
  );
}
