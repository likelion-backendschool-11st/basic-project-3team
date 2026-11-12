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

## 2. 개발 환경

### Backend
| 구분 | 내용 |
|---|---|
| Runtime | Node.js LTS (TODO: 팀 버전 확정 후 README에 기록) |
| Framework | Express 5 |
| Package | npm |
| DB | MySQL Community Server 26.7.0 (팀 전원 같은 버전) |
| DB 접근 | `mysql2/promise` 커넥션 풀, SQL 직접 작성 |
| 인증 | JWT (`jsonwebtoken`) + `bcrypt`, Refresh 쿠키는 `cookie-parser` |
| 실시간 | `socket.io` (알림) |
| 기타 | `dotenv`, `cors`, `nodemon`(개발용) |
| API 테스트 | Postman (컬렉션 팀 공유) |

### Frontend
| 구분 | 내용 |
|---|---|
| Library | React 19 + TypeScript |
| Build | Vite |
| Style | Tailwind CSS |
| HTTP | axios (인터셉터로 토큰 첨부·재발급 처리) |
| Routing | React Router |

### 실행
- Backend: `cd backEnd && npm install && npm run dev` (nodemon, 포트는 `.env`의 `PORT`, 기본 8080)
- Frontend: `cd frontEnd && npm install && npm run dev` (기본 포트 5173)
- DB: `backEnd/.env`를 채운 뒤 `cd backEnd && npm run db:setup` (처음 한 번, MySQL root 비밀번호를 묻는다). DB `devinDB`·계정 `devin`을 만들고 `db/schema.sql`, `db/seed.sql`을 실행한다. 데이터를 처음 상태로 되돌릴 때는 `npm run db:reset`.
- 설정: `backEnd/.env`에 `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`를 둔다.
- `.env`는 커밋하지 않고, 키 이름만 적은 `.env.example`을 커밋한다.
- 개발 환경에서는 `frontEnd/vite.config.ts`의 프록시로 `/api` 요청을 `http://localhost:8080`에 넘긴다. CORS 설정은 배포 환경용이다.

### 디렉터리 구조
```
backEnd/
 ├─ src/
 │   ├─ routes/          # URL → 미들웨어·컨트롤러 연결
 │   ├─ controllers/     # 요청/응답 변환
 │   ├─ services/        # 비즈니스 규칙, 트랜잭션
 │   ├─ repositories/    # SQL (mysql2)
 │   ├─ middlewares/     # auth(JWT), admin, errorHandler
 │   ├─ utils/           # 공통 응답, ErrorCode, AppError
 │   ├─ config/db.js     # mysql2 커넥션 풀
 │   └─ app.js
 ├─ db/                  # schema.sql, seed.sql
 └─ .env.example
frontEnd/src
 ├─ api/                 # axios 인스턴스, 인터셉터, 도메인별 API 함수
 ├─ components/          # 공통 컴포넌트
 ├─ pages/               # 라우트 단위 페이지
 ├─ hooks/
 └─ routes.ts
docs/
 ├─ api.md               # API 명세
 └─ retro/               # 스프린트 회고 (sprint1.md ...)
```
- 백엔드 파일은 도메인별로 나눈다: auth, member, question, answer, reply, like, report, admin, notification (예: `question.routes.js`, `question.controller.js`, `question.service.js`, `question.repository.js`)

## 3. JWT 인증 규칙
- Access Token
  - 유효기간 30분, `Authorization: Bearer {token}` 헤더로 전송한다.
  - 프론트는 메모리(상태값)에만 저장한다. `localStorage`에 저장하지 않는다.
  - Payload에는 `memberId`, `role`만 넣는다. 아이디·전화번호 등 개인정보는 넣지 않는다.
- Refresh Token
  - 유효기간 14일, `HttpOnly`, `Secure`(배포 환경), `SameSite=Strict` 쿠키로 발급하고 경로는 `/api/auth`로 제한한다.
  - DB의 `refresh_token` 테이블에 회원당 1개 저장하고, 재발급 시마다 새 토큰으로 교체한다(rotation).
- 재발급 흐름: API가 401(`TOKEN_EXPIRED`)을 반환하면 axios 인터셉터가 `POST /api/auth/reissue`를 호출해 새 Access Token을 받고 원래 요청을 다시 보낸다. 재발급도 실패하면 로그인 화면으로 보낸다.
- 새로고침 시 Access Token이 사라지므로, 앱 시작 시 `reissue`를 한 번 호출해 로그인 상태를 복구한다.
- 서버 구현
  - 로그인: `bcrypt.compare`로 비밀번호를 확인한 뒤 `jsonwebtoken`으로 토큰을 발급한다. 비밀키는 `.env`의 값을 쓴다.
  - 인증 미들웨어(`middlewares/auth.js`): `Authorization` 헤더를 검증하고 `req.user = { memberId, role }`을 넣는다. 만료는 401 `TOKEN_EXPIRED`, 위조·형식 오류는 401 `INVALID_TOKEN`.
  - 로그인이 필요한 라우트에만 인증 미들웨어를 적용한다.
  - 관리자 미들웨어(`middlewares/admin.js`): `/api/admin/**` 전체에 적용하고, `ROLE_ADMIN`이 아니면 403.
  - Refresh 쿠키는 `cookie-parser`로 읽는다. 세션과 CSRF 토큰은 쓰지 않는다. (Access Token은 헤더로만 전송하고, Refresh 쿠키는 `SameSite=Strict`로 보호)
  - 인증 실패 401, 권한 부족 403도 공통 응답 형식(JSON)으로 반환한다.
- 권한: `ROLE_USER`, `ROLE_ADMIN`.
- 비밀번호는 `bcrypt.hash`로 암호화해 저장한다.
- 회원 상태
  - `BANNED`, `WITHDRAWN` 회원은 로그인·토큰 재발급이 불가하다.
  - 정지·탈퇴 시 해당 회원의 Refresh Token을 삭제한다.
  - 이미 발급된 Access Token은 만료(최대 30분) 전까지 유효하므로, 글·답글 작성 등 쓰기 작업의 Service에서 회원 상태를 확인해 `BANNED`면 403을 반환한다.

## 4. 코딩 컨벤션

### 네이밍
- 변수·함수: camelCase (`findQuestionById`)
- 상수: UPPER_SNAKE_CASE (`MAX_PAGE_SIZE`)
- 백엔드 파일: `{도메인}.{계층}.js` (`question.service.js`)
- DB 테이블·컬럼: snake_case (`created_at`)
- API 응답 JSON 키: camelCase (`docs/api.md` 예시대로). DB 컬럼명은 Repository에서 별칭(`AS`)으로 바꾼다.
- MySQL 예약어(`like`, `user`, `order` 등)는 테이블·컬럼 이름으로 쓰지 않는다. 좋아요 테이블은 `question_like`, `answer_like`로 만든다.
- React 컴포넌트·파일: PascalCase (`QuestionCard.tsx`), 훅: `use`로 시작 (`useAuth`)

### 백엔드 레이어 규칙 (Router → Controller → Service → Repository)
- Router: URL과 미들웨어, 컨트롤러 연결만 한다.
- Controller: `req`에서 값을 꺼내 Service를 호출하고 공통 응답으로 반환한다. 비즈니스 로직을 넣지 않는다. `try/catch` 후 에러는 `next(err)`로 넘긴다.
- Service: 비즈니스 규칙(작성자 확인, 채택 처리)을 담당한다.
  - 여러 테이블을 함께 바꾸는 작업(답변 채택 등)은 트랜잭션으로 묶는다: `pool.getConnection()` → `beginTransaction()` → `commit()` / 실패 시 `rollback()` → `release()`.
- Repository: SQL만 둔다.
  - 사용자 입력은 반드시 `?` 플레이스홀더로 넘긴다. 문자열을 이어 붙여 SQL을 만들지 않는다.
  - 정렬 컬럼처럼 플레이스홀더를 못 쓰는 값은 허용 목록으로만 처리한다.
- DB 행을 그대로 응답하지 않고 필요한 필드만 골라 응답한다 (비밀번호 해시 등 제외).

### 공통 처리
- 응답은 `docs/api.md`의 공통 형식(`success`, `code`, `message`, `data`)을 따른다.
- 예외는 `ErrorCode` 상수와 `AppError`로 던지고, `middlewares/errorHandler.js` 한 곳에서 응답한다.
- 요청 검증은 Controller(또는 검증 미들웨어)에서 하고, 실패 시 필드별 에러 목록을 400으로 응답한다 (`docs/api.md` 참고).
- 목록은 `LIMIT ? OFFSET ?`으로 페이징하고 `COUNT(*)` 전체 개수를 함께 응답한다.
- 생성일·수정일은 DB 기본값(`DEFAULT CURRENT_TIMESTAMP`, `ON UPDATE CURRENT_TIMESTAMP`)으로 채운다.
- 삭제는 실제 삭제하지 않는다(soft delete).
  - 회원: 상태값 `ACTIVE`, `BANNED`, `WITHDRAWN`
  - 질문·답변·답글: `deleted` 컬럼(boolean)으로 숨김 처리하고, 조회 시 제외한다.
  - 신고 내역에서는 삭제된 대상도 내용을 확인할 수 있어야 한다.

### 포맷
- 들여쓰기 2칸(JS/TS), 한 줄 최대 120자, Prettier 적용
- 사용하지 않는 import, 주석 처리된 코드는 커밋하지 않는다.

### Git
- 브랜치: `main`(발표·배포) / `develop`(통합) / `feat/#이슈번호-기능명` / `fix/#이슈번호-버그명`
  - 예: `feat/#38-question-create`, `fix/#36-login-error`
  - 이슈가 없는 작업은 이슈번호를 생략한다 (`docs/claude-md`).
- 커밋 메시지: `타입: 무엇을 했는지 (#이슈번호)` (예: `feat: 질문 목록 페이징 API 추가 (#48)`)
  - feat, fix, refactor, style, docs, test, chore
- PR은 `develop`으로 올린다.
  - 본문에 무엇을 / 어떻게 확인했는지 / 관련 이슈(`Closes #이슈번호`)를 적는다.
  - 팀원 1명 이상이 Approve한 뒤 merge하고, merge한 브랜치는 삭제한다.
  - `main`·`develop`에는 직접 push하지 않는다.

## 5. Claude 작업 규칙
- 새 기능은 위 디렉터리 구조와 레이어 규칙을 따른다.
- API를 추가하거나 변경하면 `docs/api.md`도 함께 수정한다.
- 테이블을 바꾸면 `backEnd/db/schema.sql`과 DB 명세서를 함께 수정한다.
- 비밀번호, DB 접속 정보, JWT 비밀키 등 민감한 값은 코드에 넣지 않는다 (`.env`).
- API를 구현하면 Postman으로 동작을 확인하고 팀 컬렉션에 추가한다.
- `TODO`로 표시된 항목은 임의로 정하지 말고 먼저 확인을 요청한다.
