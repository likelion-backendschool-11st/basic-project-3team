// 질문 템플릿 (#59, REQ-QUESTION-002): 개발 환경 / 에러 메시지 / 시도한 방법 / 기대 결과.
// 서버는 일반 본문으로 받는다 (docs/api.md 4장). 질문하기 화면에서만 쓴다.
// 추천 태그(#61)가 내용 속 기술 이름으로 태그를 추천하므로, 안내 문구에 특정 기술 이름(Java 등)을 넣지 않는다.
export const QUESTION_TEMPLATE = `## 개발 환경
(예: 언어·프레임워크 버전, OS, 사용 도구)

## 에러 메시지
(에러 로그를 그대로 붙여 주세요)

## 시도한 방법
(어떤 방법을 시도했는지 적어 주세요)

## 기대 결과
(원하는 동작을 적어 주세요)
`;

// 템플릿을 하나도 고치지 않은 내용이면 true (템플릿 글자만으로도 10자가 넘어 따로 막는다)
export const isUnchangedTemplate = (content: string) => content.trim() === QUESTION_TEMPLATE.trim();
