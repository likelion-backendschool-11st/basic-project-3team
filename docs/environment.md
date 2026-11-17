# 개발 환경 — Dev in

## Backend
| 구분 | 내용 |
|---|---|
| Runtime | Node.js v26.13.1 LTS |
| Framework | Express 5 |
| Package | npm |
| DB | MySQL Community Server 8.4.13 (팀 전원 같은 버전) |
| DB 접근 | `mysql2/promise` 커넥션 풀, SQL 직접 작성 |
| 인증 | JWT (`jsonwebtoken`) + `bcrypt`, Refresh 쿠키는 `cookie-parser` |
| 실시간 | `socket.io` (알림) |
| 기타 | `dotenv`, `nodemon`(개발용), `cors`(배포에서 다른 출처 허용, #75) |
| API 테스트 | Postman (컬렉션 팀 공유) |

## Frontend
| 구분 | 내용 |
|---|---|
| Library | React 19 + TypeScript |
| Build | Vite |
| Style | Tailwind CSS |
| HTTP | axios (인터셉터로 토큰 첨부·재발급 처리) |
| Routing | React Router |
| 실시간 | `socket.io-client` (알림) |
| Markdown | react-markdown + remark-gfm (표시, HTML 태그는 실행하지 않음), rehype-highlight + highlight.js (코드 블록 색상) |

## 실행
- Backend: `cd backEnd && npm install && npm run dev` (nodemon, 포트는 `.env`의 `PORT`, 기본 8080)
- Frontend: `cd frontEnd && npm install && npm run dev` (기본 포트 5173)
- 프론트 설정: `frontEnd/.env.example`을 복사해 `frontEnd/.env`를 만든다 (`VITE_API_URL`, `VITE_SOCKET_URL`).
- DB: `backEnd/db/setup.js` 스크립트로 만든다. `schema.sql`은 테이블, `seed.sql`은 팀 공통 테스트 데이터다.
  - `npm run db:setup`: DB·계정을 만들고 `schema.sql`, `seed.sql`을 실행한다. 처음 한 번 실행하며 MySQL `root` 비밀번호를 묻는다.
  - `npm run db:reset`: 테이블을 지우고 `schema.sql`, `seed.sql`을 다시 실행한다.
  - `npm run db:schema`: 테이블만 다시 만들고 데이터는 넣지 않는다.
- 설정: `backEnd/.env`에 `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, `CORS_ORIGIN`을 둔다. 배포 환경은 `NODE_ENV=production`(Refresh 쿠키에 `Secure` 적용).
- `.env`는 커밋하지 않고, 키 이름만 적은 `.env.example`을 커밋한다.
- 개발 환경에서는 `frontEnd/vite.config.ts`의 프록시로 `/api` 요청을 `http://localhost:8080`에 넘긴다. CORS 설정은 배포 환경용이다.

## 배포 (#75)
프론트와 백엔드를 각각 Vercel 프로젝트로 배포하고, DB는 외부 MySQL에 둔다.

| 구분 | Vercel 프로젝트 | 주소 |
|---|---|---|
| 프론트 | Root Directory `frontEnd`, Framework Vite | |
| 백엔드 | Root Directory `backEnd` (Express) | `https://basic-project-3team.vercel.app` |

| 요청 | 경로 |
|---|---|
| 화면 | 프론트 Vercel. 모든 주소를 `index.html`로 보낸다 (React Router, `frontEnd/vercel.json`) |
| `/api` | 프론트 Vercel이 백엔드 주소로 넘긴다 (`frontEnd/vercel.json`의 rewrites). 브라우저에는 같은 주소라 CORS가 필요 없고 Refresh 쿠키(`SameSite=Strict`)도 그대로 오간다 |
| 실시간 알림 | 동작하지 않는다. socket.io는 연결을 계속 유지해야 하는데 Vercel 서버리스 함수는 요청이 끝나면 멈춘다. 그래서 배포에서는 소켓을 열지 않고(`VITE_SOCKET_URL`이 비어 있을 때), 탭이 보이는 동안 10초마다 안 읽은 알림 수를 다시 불러온다. 다른 탭에 갔다 돌아오면 바로 한 번 불러온다 |

- 프론트 환경변수: `VITE_API_URL=/api`, `VITE_SOCKET_URL`은 비워 둔다. `VITE_` 값은 브라우저에 노출되므로 비밀값을 넣지 않는다. 바꾼 뒤에는 Redeploy해야 반영된다.
- 백엔드 환경변수: `.env.example`의 값(DB 접속 정보, `JWT_SECRET`, `JWT_REFRESH_SECRET`)에 더해 `NODE_ENV=production`(Refresh 쿠키에 `Secure` 적용). `/api`는 Vercel을 거쳐 오므로 `CORS_ORIGIN`은 비워 둬도 된다.
- DB: Vercel에는 MySQL이 없다. 외부 MySQL에 `schema.sql`, `seed.sql`을 실행하고 접속 정보를 백엔드 환경변수에 넣는다 (`DB_HOST=localhost`로는 연결되지 않는다).
- 백엔드 주소가 바뀌면 `frontEnd/vercel.json`의 `/api` 대상을 같이 바꾼다.
- 실시간 알림이 필요하면 백엔드를 계속 켜져 있는 서버(Render·Railway·EC2 등)로 옮기고, 프론트 `VITE_SOCKET_URL`에 그 주소, 백엔드 `CORS_ORIGIN`에 프론트 주소를 넣는다.
- 프론트에서 백엔드를 바로 부르는 방식(`VITE_API_URL=https://...`)은 쓰지 않는다. `vercel.app` 주소끼리는 서로 다른 사이트라 Refresh 쿠키(`SameSite=Strict`)가 전송되지 않아 재발급이 실패한다.

## 디렉터리 구조
```
backEnd/
 ├─ src/
 │   ├─ {도메인}/         # 도메인 하나의 파일을 한 폴더에 모은다 (아래 목록)
 │   │   ├─ {도메인}.routes.js       # URL → 미들웨어·컨트롤러 연결
 │   │   ├─ {도메인}.controller.js   # 요청/응답 변환
 │   │   ├─ {도메인}.service.js      # 비즈니스 규칙, 트랜잭션
 │   │   └─ {도메인}.repository.js   # SQL (mysql2)
 │   ├─ middlewares/     # 공통: auth(JWT), admin, errorHandler
 │   ├─ utils/           # 공통: 응답, ErrorCode, AppError, 페이징
 │   ├─ config/db.js     # mysql2 커넥션 풀
 │   ├─ routes.js        # 도메인 라우터를 /api 아래에 연결
 │   └─ app.js
 ├─ db/                  # schema.sql, seed.sql, create-user.sql(DB·계정 생성), setup.js(db:* 스크립트)
 └─ .env.example
frontEnd/src
 ├─ api/                 # axios 인스턴스, 인터셉터, 도메인별 API 함수
 ├─ components/          # 공통 컴포넌트
 ├─ pages/               # 라우트 단위 페이지
 ├─ hooks/
 └─ routes.ts
docs/
 ├─ 02-requirements.md   # 요구사항 명세
 ├─ 03-db-open-questions.md  # DB 설계 근거
 ├─ 04-db.md             # DB 명세
 ├─ erd.md               # ERD
 ├─ environment.md       # 개발 환경
 ├─ auth.md              # JWT 인증 규칙
 ├─ convention.md        # 코딩 컨벤션
 ├─ claude-rules.md      # Claude 작업 규칙
 ├─ api.md               # API 명세
 ├─ ui-guide.md          # UI 기준 (색, 버튼, 입력칸, 상태 배지 등)
 └─ retro/               # 스프린트 회고 (sprint1.md ...) — 아직 없음
```
- 백엔드 파일은 도메인 폴더로 나눈다: main, auth, member, question, board(질문 작성·수정·삭제), answer, reply, like, report, admin, notification, tag(태그·카테고리) (예: `src/question/question.routes.js`, `question.controller.js`, `question.service.js`, `question.repository.js`)
  - 여러 사람이 동시에 작업하므로 자기 도메인 폴더 안에서 작업하고, 공통 파일(`middlewares/`, `utils/`, `config/`, `routes.js`)은 필요한 만큼만 고친다.
  - 한 도메인에서만 쓰는 상수는 그 도메인 폴더에 둔다 (`{도메인}.constants.js`).
