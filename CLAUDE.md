# CLAUDE.md — Dev in (개발 Q&A 게시판)

Claude가 이 저장소에서 작업할 때 따르는 프로젝트 규칙이다.
세부 규칙은 아래 문서를 따른다.

- 개발 환경: @docs/environment.md
- 인증 규칙: @docs/auth.md
- 코딩 컨벤션: @docs/convention.md
- Claude 작업 규칙: @docs/claude-rules.md
- API 명세: `docs/api.md` (API를 구현하거나 수정할 때 읽는다)

## 프로젝트 개요
- 서비스명: Dev in
- 설명: 개발자들이 질문하고 답변하는 Q&A 게시판
- 구조: 백엔드(Node.js + Express REST API)와 프론트엔드(React) 분리, 한 저장소(모노레포)
- 주요 기능: 회원가입/로그인, 질문 CRUD, 답변·답글, 답변 채택, 좋아요, 검색, 신고, 마이페이지, 알림, 관리자 기능(신고 처리, 회원 정지)
