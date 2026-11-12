# JWT 인증 규칙 — Dev in

## Access Token
- 유효기간 30분, `Authorization: Bearer {token}` 헤더로 전송한다.
- 프론트는 메모리(상태값)에만 저장한다. `localStorage`에 저장하지 않는다.
- Payload에는 `memberId`, `role`만 넣는다. 아이디·전화번호 등 개인정보는 넣지 않는다.

## Refresh Token
- 유효기간 14일, `HttpOnly`, `Secure`(배포 환경), `SameSite=Strict` 쿠키로 발급하고 경로는 `/api/auth`로 제한한다.
- DB의 `refresh_token` 테이블에 회원당 1개 저장하고, 재발급 시마다 새 토큰으로 교체한다(rotation).

## 재발급 흐름
- API가 401(`TOKEN_EXPIRED`)을 반환하면 axios 인터셉터가 `POST /api/auth/reissue`를 호출해 새 Access Token을 받고 원래 요청을 다시 보낸다. 재발급도 실패하면 로그인 화면으로 보낸다.
- 새로고침 시 Access Token이 사라지므로, 앱 시작 시 `reissue`를 한 번 호출해 로그인 상태를 복구한다.

## 서버 구현
- 로그인: `bcrypt.compare`로 비밀번호를 확인한 뒤 `jsonwebtoken`으로 토큰을 발급한다. 비밀키는 `.env`의 값을 쓴다.
- 인증 미들웨어(`middlewares/auth.js`): `Authorization` 헤더를 검증하고 `req.user = { memberId, role }`을 넣는다. 만료는 401 `TOKEN_EXPIRED`, 위조·형식 오류는 401 `INVALID_TOKEN`.
- 로그인이 필요한 라우트에만 인증 미들웨어를 적용한다.
- 관리자 미들웨어(`middlewares/admin.js`): `/api/admin/**` 전체에 적용하고, `ROLE_ADMIN`이 아니면 403.
- Refresh 쿠키는 `cookie-parser`로 읽는다. 세션과 CSRF 토큰은 쓰지 않는다. (Access Token은 헤더로만 전송하고, Refresh 쿠키는 `SameSite=Strict`로 보호)
- 인증 실패 401, 권한 부족 403도 공통 응답 형식(JSON)으로 반환한다.

## 권한
- `ROLE_USER`, `ROLE_ADMIN`

## 비밀번호
- `bcrypt.hash`로 암호화해 저장한다.

## 회원 상태
- `BANNED`, `WITHDRAWN` 회원은 로그인·토큰 재발급이 불가하다.
- 정지·탈퇴 시 해당 회원의 Refresh Token을 삭제한다.
- 이미 발급된 Access Token은 만료(최대 30분) 전까지 유효하므로, 글·답글 작성 등 쓰기 작업의 Service에서 회원 상태를 확인해 `BANNED`면 403을 반환한다.
