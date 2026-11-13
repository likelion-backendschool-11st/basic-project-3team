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
| 기타 | `dotenv`, `cors`, `nodemon`(개발용) |
| API 테스트 | Postman (컬렉션 팀 공유) |

## Frontend
| 구분 | 내용 |
|---|---|
| Library | React 19 + TypeScript |
| Build | Vite |
| Style | Tailwind CSS |
| HTTP | axios (인터셉터로 토큰 첨부·재발급 처리) |
| Routing | React Router |

## 실행
- Backend: `cd backEnd && npm install && npm run dev` (nodemon, 포트는 `.env`의 `PORT`, 기본 8080)
- Frontend: `cd frontEnd && npm install && npm run dev` (기본 포트 5173)
- DB: `backEnd/db/schema.sql`로 테이블을 만들고 `backEnd/db/seed.sql`로 팀 공통 테스트 데이터를 넣는다.
- 설정: `backEnd/.env`에 `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_REFRESH_SECRET`를 둔다.
- `.env`는 커밋하지 않고, 키 이름만 적은 `.env.example`을 커밋한다.
- 개발 환경에서는 `frontEnd/vite.config.ts`의 프록시로 `/api` 요청을 `http://localhost:8080`에 넘긴다. CORS 설정은 배포 환경용이다.

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
 ├─ db/                  # schema.sql, seed.sql
 └─ .env.example
frontEnd/src
 ├─ api/                 # axios 인스턴스, 인터셉터, 도메인별 API 함수
 ├─ components/          # 공통 컴포넌트
 ├─ pages/               # 라우트 단위 페이지
 ├─ hooks/
 └─ routes.ts
docs/
 ├─ environment.md       # 개발 환경
 ├─ auth.md              # JWT 인증 규칙
 ├─ convention.md        # 코딩 컨벤션
 ├─ claude-rules.md      # Claude 작업 규칙
 ├─ api.md               # API 명세
 └─ retro/               # 스프린트 회고 (sprint1.md ...)
```
- 백엔드 파일은 도메인 폴더로 나눈다: main, auth, member, question, answer, reply, like, report, admin, notification (예: `src/question/question.routes.js`, `question.controller.js`, `question.service.js`, `question.repository.js`)
  - 여러 사람이 동시에 작업하므로 자기 도메인 폴더 안에서 작업하고, 공통 파일(`middlewares/`, `utils/`, `config/`, `routes.js`)은 필요한 만큼만 고친다.
  - 한 도메인에서만 쓰는 상수는 그 도메인 폴더에 둔다 (`{도메인}.constants.js`).
