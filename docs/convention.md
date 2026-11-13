# 코딩 컨벤션 — Dev in

## 네이밍
- 변수·함수: camelCase (`findQuestionById`)
- 상수: UPPER_SNAKE_CASE (`MAX_PAGE_SIZE`)
- 백엔드 파일: `{도메인}.{계층}.js` (`question.service.js`)
- DB 테이블·컬럼: snake_case (`created_at`)
- API 응답 JSON 키: camelCase (`docs/api.md` 예시대로). DB 컬럼명은 Repository에서 별칭(`AS`)으로 바꾼다.
- MySQL 예약어(`like`, `user`, `order` 등)는 테이블·컬럼 이름으로 쓰지 않는다. 좋아요 테이블은 `question_like`, `answer_like`로 만든다.
- React 컴포넌트·파일: PascalCase (`QuestionCard.tsx`), 훅: `use`로 시작 (`useAuth`)

## 백엔드 레이어 규칙 (Router → Controller → Service → Repository)
- Router: URL과 미들웨어, 컨트롤러 연결만 한다.
- Controller: `req`에서 값을 꺼내 Service를 호출하고 공통 응답으로 반환한다. 비즈니스 로직을 넣지 않는다. `try/catch` 후 에러는 `next(err)`로 넘긴다.
- Service: 비즈니스 규칙(작성자 확인, 채택 처리)을 담당한다.
  - 여러 테이블을 함께 바꾸는 작업(답변 채택 등)은 트랜잭션으로 묶는다: `pool.getConnection()` → `beginTransaction()` → `commit()` / 실패 시 `rollback()` → `release()`.
- Repository: SQL만 둔다.
  - 사용자 입력은 반드시 `?` 플레이스홀더로 넘긴다. 문자열을 이어 붙여 SQL을 만들지 않는다.
  - 정렬 컬럼처럼 플레이스홀더를 못 쓰는 값은 허용 목록으로만 처리한다.
- DB 행을 그대로 응답하지 않고 필요한 필드만 골라 응답한다 (비밀번호 해시 등 제외).

## 공통 처리
- 응답은 `docs/api.md`의 공통 형식(`success`, `code`, `message`, `data`)을 따른다.
- 예외는 `ErrorCode` 상수와 `AppError`로 던지고, `middlewares/errorHandler.js` 한 곳에서 응답한다.
- 요청 검증은 Controller(또는 검증 미들웨어)에서 하고, 실패 시 필드별 에러 목록을 400으로 응답한다 (`docs/api.md` 참고).
- 목록은 `LIMIT ? OFFSET ?`으로 페이징하고 `COUNT(*)` 전체 개수를 함께 응답한다.
- 생성일·수정일은 DB 기본값(`DEFAULT CURRENT_TIMESTAMP`, `ON UPDATE CURRENT_TIMESTAMP`)으로 채운다.
- 삭제는 실제 삭제하지 않는다(soft delete).
  - 회원: 상태값 `ACTIVE`, `BANNED`, `WITHDRAWN`
  - 질문·답변·답글: `deleted` 컬럼(boolean)으로 숨김 처리하고, 조회 시 제외한다.
  - 신고 내역에서는 삭제된 대상도 내용을 확인할 수 있어야 한다.

## 포맷
- 들여쓰기 2칸(JS/TS), 한 줄 최대 120자, Prettier 적용
- 사용하지 않는 import, 주석 처리된 코드는 커밋하지 않는다.

## Git
- 브랜치: 기본 브랜치는 `main` 하나다 (`develop` 없음).
  - `main`에 직접 커밋·push하지 않는다. 모든 작업은 이슈마다 작업 브랜치를 만들어 PR로 합친다.
  - Claude는 브랜치를 만들기 전에 작업자에게 먼저 확인한다.
- 작업 브랜치 이름: `feat/#이슈번호-기능명` / `fix/#이슈번호-버그명` (예: `feat/#38-question-create`, `fix/#36-login-error`)
  - 이슈가 없는 작업은 이슈번호를 생략한다 (`docs/claude-md`).
- 작업 순서
  1. `git switch main` → `git pull`로 최신 `main`을 받는다.
  2. `git switch -c {브랜치명}`으로 작업 브랜치를 만든다.
  3. 작업 후 커밋하고 `git push -u origin {브랜치명}`으로 올린다.
  4. PR은 `main`으로 올리고, 본문에 무엇을 / 어떻게 확인했는지 / 관련 이슈(`Closes #이슈번호`)를 적는다.
  5. 팀원 1명 이상이 Approve한 뒤 merge하고, merge한 브랜치는 삭제한다 (GitHub + 로컬 `git branch -d`).
  6. 다음 작업은 1번부터 다시 시작한다. 브랜치를 merge하지 않고 쌓아 두지 않는다.
- PR을 올리기 전에 `main`이 바뀌었으면 최신 `main`을 작업 브랜치에 반영하고 충돌을 먼저 해결한다.
- 커밋 메시지: `타입: 무엇을 했는지 (#이슈번호)` (예: `feat: 질문 목록 페이징 API 추가 (#48)`)
  - feat, fix, refactor, style, docs, test, chore
