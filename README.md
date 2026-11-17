# Dev in

개발자들이 질문하고 답변하는 Q&A 게시판

- 멋쟁이사자처럼 백엔드스쿨 11기 기초 프로젝트 3팀
- 기간: 2026.11.09 ~ 2026.11.23

## 배포 주소

| 구분 | 주소 |
|---|---|
| 서비스 (프론트엔드) | https://basic-project-3team-g99l.vercel.app |
| API (백엔드) | https://basic-project-3team.vercel.app/api |

- 프론트·백엔드 모두 Vercel에 배포했다. 배포 구성은 `docs/environment.md`의 "배포" 절을 따른다.
- 백엔드가 Vercel 서버리스 함수라 실시간 알림(socket.io)은 동작하지 않고, 알림 수는 30초마다 다시 불러온다.

## 주요 기능

### 필수 기능
- 회원가입·로그인 (JWT Access Token + Refresh Token 쿠키)
- 질문 작성·조회·수정·삭제 (CRUD)
- 답변 작성·수정·삭제
- 답변 채택 (질문 작성자가 답변 하나를 채택, 트랜잭션 처리)
- 검색 (키워드·카테고리·태그·상세 검색)
- 페이징 (한 페이지 10개)

### 차별화 기능
- 태그 선택·추천, 태그 검색
- 유사 질문 추천
- 채택 랭킹
- 질문·답변 좋아요
- 답변에 답글
- 실시간 알림 (답변 등록·채택)
- 작성자 정보 표시 (경력·기술 스택·등급·채택률)

### 그 밖의 기능
- 아이디 찾기·비밀번호 재설정 (전화번호로 본인 확인)
- 마이페이지 (프로필·개인정보 수정, 관심 카테고리, 등급·뱃지, 채택 내역, 내 질문·답변, 회원 탈퇴)
- 질문·답변 신고
- 관리자 기능 (신고 처리, 게시물 삭제, 회원 정지)

자세한 요구사항은 [docs/02-requirements.md](docs/02-requirements.md)를 본다.

## 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, axios, socket.io-client, react-markdown (remark-gfm, rehype-highlight) |
| Backend | Node.js, Express 5, mysql2 (SQL 직접 작성), jsonwebtoken, bcrypt, cookie-parser, socket.io, dotenv, nodemon |
| DB | MySQL |
| 협업 도구 | GitHub (Issues, Pull Requests, Projects), Postman, Discord, KakaoTalk |

## 개발 환경 버전

| 구분 | 버전 |
|---|---|
| Node.js | v26.13.1 LTS |
| MySQL | Community Server 8.4.13 (팀 전원 같은 버전) |

## 실행 방법

### 1. 저장소 받기

```bash
git clone https://github.com/likelion-backendschool-11st/basic-project-3team.git
cd basic-project-3team
```

### 2. 환경 변수 파일 만들기

`backEnd/.env.example`, `frontEnd/.env.example`을 복사해 각각 `.env`를 만들고 값을 채운다. `.env`는 커밋하지 않는다.

```bash
cp backEnd/.env.example backEnd/.env
cp frontEnd/.env.example frontEnd/.env
```

| 키 (backEnd/.env) | 설명 |
|---|---|
| `PORT` | 백엔드 포트 (기본 8080) |
| `NODE_ENV` | `development` / 배포 환경은 `production` (Refresh 쿠키에 `Secure` 적용) |
| `DB_HOST`, `DB_PORT` | MySQL 주소 (기본 `localhost`, `3306`) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | 프로젝트 DB 이름·계정·비밀번호 |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Access·Refresh Token 비밀키 |

| 키 (frontEnd/.env) | 설명 |
|---|---|
| `VITE_API_URL` | 백엔드 API 주소. 개발 환경은 `/api` 그대로 둔다 (Vite 프록시). 배포 때 실제 주소로 바꾸고 끝에 `/`는 붙이지 않는다. 브라우저에 노출되므로 비밀값을 넣지 않는다. |

### 3. DB 만들기

```bash
cd backEnd
npm install
npm run db:setup
```

| 스크립트 | 하는 일 |
|---|---|
| `npm run db:setup` | DB와 계정을 만든 뒤 `schema.sql`, `seed.sql`을 실행한다. 처음 한 번 실행하며, MySQL `root` 비밀번호를 묻는다. |
| `npm run db:reset` | 테이블을 지우고 `schema.sql`, `seed.sql`을 다시 실행한다. |
| `npm run db:schema` | 테이블만 다시 만들고 데이터는 넣지 않는다. |

### 4. 백엔드 실행

```bash
cd backEnd
npm run dev
```

`http://localhost:8080`에서 실행된다 (nodemon).

### 5. 프론트엔드 실행

```bash
cd frontEnd
npm install
npm run dev
```

`http://localhost:5173`에서 실행된다. 개발 중에는 Vite 프록시가 `/api` 요청을 `http://localhost:8080`으로 넘긴다.

### 테스트 계정 (seed)

| 아이디 | 닉네임 | 권한 | 상태 | 비밀번호 |
|---|---|---|---|---|
| `admin` | 운영자 | 관리자 | 정상 | `admin` |
| `admin_devin` | 관리자 | 관리자 | 정상 | 팀 내부 공유 |
| `devin_user1` | 자바왕 | 일반 | 정상 | 팀 내부 공유 |
| `devin_user2` | 리액트러 | 일반 | 정상 | 팀 내부 공유 |
| `devin_user3` | 신입개발자 | 일반 | 정상 | 팀 내부 공유 |
| `banned_user` | 정지회원 | 일반 | 정지 | 팀 내부 공유 |

`admin` 계정은 로컬 테스트용으로 비밀번호를 공개한 계정이다. 배포(운영) DB에는 seed를 넣지 않는다.

## 폴더 구조

```
basic-project-3team/
├─ backEnd/
│  ├─ src/
│  │  ├─ {도메인}/       # 도메인마다 routes · controller · service · repository 파일
│  │  │                  # main, auth, member, question, board, answer, reply, like,
│  │  │                  # report, admin, notification, tag
│  │  ├─ middlewares/    # 공통: auth(JWT), admin, errorHandler
│  │  ├─ utils/          # 공통: 응답, ErrorCode, AppError, 페이징
│  │  ├─ config/db.js    # mysql2 커넥션 풀
│  │  ├─ routes.js       # 도메인 라우터를 /api 아래에 연결
│  │  └─ app.js
│  ├─ db/                # schema.sql, seed.sql, DB 설정 스크립트
│  └─ .env.example
├─ frontEnd/
│  ├─ src/
│  │  ├─ api/            # axios 인스턴스, 인터셉터, 도메인별 API 함수
│  │  ├─ components/     # 공통 컴포넌트
│  │  ├─ pages/          # 라우트 단위 페이지
│  │  ├─ hooks/
│  │  └─ routes.ts
│  └─ .env.example
└─ docs/                 # 요구사항, API·DB 명세, 컨벤션
```

백엔드 요청은 Router → Controller → Service → Repository 순서로 처리한다.

## 문서

| 문서 | 내용 |
|---|---|
| [docs/02-requirements.md](docs/02-requirements.md) | 요구사항 명세 |
| [docs/api.md](docs/api.md) | API 명세 |
| [docs/04-db.md](docs/04-db.md) | DB 명세 |
| [docs/erd.md](docs/erd.md) | ERD |
| [docs/03-db-open-questions.md](docs/03-db-open-questions.md) | DB 설계 근거 |
| [docs/environment.md](docs/environment.md) | 개발 환경 |
| [docs/auth.md](docs/auth.md) | JWT 인증 규칙 |
| [docs/convention.md](docs/convention.md) | 코딩 컨벤션·Git 규칙 |
| [docs/claude-rules.md](docs/claude-rules.md) | Claude 작업 규칙 |
| [docs/retro/](docs/retro/) | 스프린트 회고 (아직 없음) |

## 팀원과 역할

| 이름 | GitHub | 역할 |
|---|---|---|
| 박인호(팀장) | [@innoo47](https://github.com/innoo47) | 메인, 검색 페이지 |
| 김수현 | [@kimbeaver127](https://github.com/kimbeaver127) | 마이페이지 |
| 박정호 | [@4ksnnvbk5y-max](https://github.com/4ksnnvbk5y-max) | 질문 + 답변CRUD |
| 정일오 | [@io1014](https://github.com/io1014) | 회원가입, 로그인 |

## 팀 그라운드 룰

| 항목 | 내용 |
|---|---|
| 코어 타임 | 평일 09:00 ~ 19:00 |
| 연락 채널 | Discord, KakaoTalk |
| 답장 기한 | 코어 타임 중 1시간 안 |
| 지각·결석 공유 | 수업 시작 전까지 팀 채널에 공유 |

- 막히는 문제는 하루 안에 팀장에게, 이틀 넘게 막히면 강사님께 알린다.
- 매일 10분 데일리 스크럼을 한다.

## 협업 규칙

자세한 내용은 [docs/convention.md](docs/convention.md)를 본다.

- 브랜치: 기본 브랜치는 `main` 하나다. `main`에 직접 커밋·push하지 않는다.
- 작업 브랜치: 이슈마다 `feat/#이슈번호-기능명`, `fix/#이슈번호-버그명` (예: `feat/#38-question-create`)
- 커밋 메시지: `타입: 무엇을 했는지 (#이슈번호)` (예: `feat: 질문 목록 페이징 API 추가 (#48)`)
  - 타입: feat, fix, refactor, style, docs, test, chore
- PR: `main`으로 올리고, 본문에 무엇을 / 어떻게 확인했는지 / 관련 이슈(`Closes #이슈번호`)를 적는다.
- 팀원 1명 이상이 Approve한 뒤 merge하고, merge한 브랜치는 삭제한다.
- 작업 현황은 GitHub Projects 칸반 보드로 관리한다.
