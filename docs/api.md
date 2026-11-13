# API 정의서 — Dev in

- 기준 문서: `docs/02-requirements.md` (두 문서가 다르면 요구사항을 따른다)
- Base URL: `/api`
- 인증: `Authorization: Bearer {accessToken}` 헤더
- Refresh Token: `HttpOnly` 쿠키 (`/api/auth` 경로에서만 전송)
- 권한 표기: 전체(비로그인 포함) / 회원 / 작성자 / 관리자
- 시간: 한국 시간(KST), 시간대 표기 없이 `2026-11-12T10:00:00` 형식

## 1. 공통 규칙 

### 응답 형식
성공·실패 모두 같은 형식을 사용한다.

성공
```json
{ "success": true, "code": null, "message": null, "data": { } }
```

실패
```json
{ "success": false, "code": "QUESTION_NOT_FOUND", "message": "존재하지 않는 질문입니다.", "data": null }
```

검증 실패 (400)
```json
{
  "success": false,
  "code": "INVALID_INPUT",
  "message": "입력값이 올바르지 않습니다.",
  "data": {
    "errors": [
      { "field": "title", "reason": "제목은 5자 이상 입력해주세요." }
    ]
  }
}
```

### 페이징 응답 (`data` 내부)
- `page`는 0부터 시작하고, `size` 기본값은 10이다 (REQ-SEARCH-005).
```json
{
  "content": [ ],
  "page": 0,
  "size": 10,
  "totalElements": 135,
  "totalPages": 14,
  "last": false
}
```

### 작성자 정보 (`writer`)
질문·답변·답글 응답의 `writer`는 아래 형식을 쓴다 (REQ-QNA-004, REQ-ANSWER-010).
```json
{
  "memberId": 1,
  "nickname": "개발자",
  "careerYears": 3,
  "techStacks": ["Java", "React"],
  "grade": "BRONZE",
  "acceptRate": 42.5
}
```
- 경력을 등록하지 않았으면 `careerYears`는 `null`, `techStacks`는 빈 배열이다. 프론트는 이때 닉네임만 표시한다.
- `acceptRate`는 채택된 답변 수 ÷ 전체 답변 수 × 100, 소수점 첫째 자리까지. 답변이 없으면 `0.0` (REQ-MYPAGE-006).
- `grade`는 `BRONZE`, `SILVER`, `GOLD`, `PLATINUM` 중 하나다. 조건은 3장 내 등급·뱃지 조회를 따른다.
- 프로필 사진 업로드는 이번 범위에서 제외한다. 헤더의 프로필 사진 자리(REQ-MAIN-004)에는 프론트가 기본 이미지를 표시한다.

### 입력값 규칙
프론트에서 검사하고 서버에서도 같은 규칙으로 다시 검사한다. 어기면 400 `INVALID_INPUT` (REQ-QUESTION-004).

| 필드 | 규칙 | 근거 |
|---|---|---|
| `loginId` | 8~12자, 영문·숫자와 특수기호 `_` `.` `-`만 사용. 대소문자를 구분하지 않는다 (`Devin_user`와 `devin_user`는 같은 아이디) | REQ-SIGNUP-001 |
| `password` | 8~12자, 영문·숫자와 특수기호 `_` `.` `-`만 사용 | REQ-LOGIN-002, REQ-MYPAGE-003 |
| `phone` | 하이픈 없이 숫자 10~11자리, `01`로 시작 (`^01[0-9]{8,9}$`). 프론트가 하이픈을 지우고 보낸다 | REQ-SIGNUP-003 |
| `nickname` | 2~10자, 한글·영문·숫자만 사용 (공백·특수기호 불가) | REQ-SIGNUP-005 |
| `bio` | 선택, 최대 200자 | REQ-MYPAGE-002 |
| `careerYears` | 선택, 0~50 정수 (0은 신입) | REQ-MYPAGE-002 |
| `techStacks` | 선택, 최대 5개, 태그 목록에 있는 이름만 | REQ-MYPAGE-002 |
| 질문 `categoryId` | 필수, 1개 | REQ-QUESTION-001 |
| 질문 `title` | 5~100자 | REQ-QUESTION-004 |
| 질문 `content` | 10자 이상, 최대 10,000자 | REQ-QUESTION-004 |
| 질문 `tags` | 선택, 최대 8개, 태그 목록에 있는 이름만 (중복 제거) | REQ-QUESTION-004, 008 |
| 답변 `content` | 10자 이상, 최대 10,000자 | REQ-ANSWER-001 |
| 답글 `content` | 1~500자 | REQ-ANSWER-009, 011 |
| 신고 `reasonDetail` | `reason`이 `ETC`일 때 필수, 최대 200자 | REQ-QUESTION-011 |

### 상태 코드
| 코드 | 의미 |
|---|---|
| 200 OK | 조회·수정·삭제 성공 (삭제도 공통 응답 형식으로 반환) |
| 201 Created | 생성 성공 |
| 400 Bad Request | 요청값 검증 실패, 허용되지 않는 동작 (본인 답변 채택 등) |
| 401 Unauthorized | 로그인 필요, 토큰 만료·오류 |
| 403 Forbidden | 권한 없음(다른 사람의 글), 정지된 회원 |
| 404 Not Found | 대상 없음 (삭제된 글 포함) |
| 409 Conflict | 중복(아이디·전화번호·닉네임, 중복 좋아요·신고), 채택 상태와 충돌 |
| 500 Internal Server Error | 서버 오류 |

### 에러 코드
| code | 상태 | 설명 |
|---|---|---|
| INVALID_INPUT | 400 | 요청값 형식 오류 |
| PASSWORD_MISMATCH | 400 | 개인정보 수정 시 현재 비밀번호 불일치 |
| CANNOT_ACCEPT_OWN_ANSWER | 400 | 본인 답변은 채택할 수 없음 |
| CANNOT_LIKE_OWN_POST | 400 | 본인 질문·답변에는 좋아요를 누를 수 없음 |
| CANNOT_REPORT_OWN_POST | 400 | 본인 질문·답변은 신고할 수 없음 |
| UNAUTHORIZED | 401 | 토큰 없음 |
| TOKEN_EXPIRED | 401 | Access Token 만료 (프론트가 재발급 시도) |
| INVALID_TOKEN | 401 | 위조·형식 오류 토큰 |
| INVALID_REFRESH_TOKEN | 401 | Refresh Token 없음·만료·불일치 (재로그인 필요) |
| LOGIN_FAILED | 401 | 아이디 또는 비밀번호가 일치하지 않습니다. |
| FORBIDDEN | 403 | 권한 없음 |
| MEMBER_BANNED | 403 | 정지된 회원 |
| MEMBER_WITHDRAWN | 403 | 탈퇴한 회원 |
| API_NOT_FOUND | 404 | 존재하지 않는 URL |
| MEMBER_NOT_FOUND | 404 | 회원 없음 |
| ACCOUNT_NOT_MATCHED | 404 | 아이디·비밀번호 찾기에서 입력한 정보와 일치하는 회원 없음 |
| QUESTION_NOT_FOUND | 404 | 질문 없음 |
| ANSWER_NOT_FOUND | 404 | 답변 없음 |
| REPLY_NOT_FOUND | 404 | 답글 없음 |
| LIKE_NOT_FOUND | 404 | 좋아요하지 않은 대상의 좋아요 취소 |
| REPORT_NOT_FOUND | 404 | 신고 없음 |
| CATEGORY_NOT_FOUND | 404 | 카테고리 없음 |
| NOTIFICATION_NOT_FOUND | 404 | 알림 없음 |
| DUPLICATE_LOGIN_ID | 409 | 아이디 중복 |
| DUPLICATE_PHONE | 409 | 전화번호 중복 |
| DUPLICATE_NICKNAME | 409 | 닉네임 중복 |
| ALREADY_LIKED | 409 | 이미 좋아요함 |
| ALREADY_REPORTED | 409 | 이미 신고함 |
| REPORT_ALREADY_PROCESSED | 409 | 이미 처리된(`RESOLVED`·`REJECTED`) 신고를 다시 처리 |
| ALREADY_ACCEPTED | 409 | 이미 채택된 답변이 있음 |
| QUESTION_HAS_ACCEPTED_ANSWER | 409 | 채택된 답변이 있는 질문은 삭제할 수 없음 |
| ACCEPTED_ANSWER_LOCKED | 409 | 채택된 답변은 수정·삭제할 수 없음 |
| INTERNAL_SERVER_ERROR | 500 | 처리하지 못한 서버 오류 |

## 2. 인증 (Auth)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 로그인 | POST | /api/auth/login | 전체 |
| 토큰 재발급 | POST | /api/auth/reissue | 전체 (Refresh 쿠키 필요) |
| 로그아웃 | POST | /api/auth/logout | 회원 |
| 아이디 찾기 | POST | /api/auth/find-login-id | 전체 |
| 비밀번호 재설정 본인 확인 | POST | /api/auth/password-reset/verify | 전체 |
| 비밀번호 재설정 | POST | /api/auth/password-reset | 전체 |

로그인 요청 (REQ-LOGIN-001)
```json
{ "loginId": "devin_user", "password": "devin_1234" }
```

로그인 응답 (`data`) — Refresh Token은 `Set-Cookie`로 발급된다.
```json
{ "accessToken": "eyJhbGciOi...", "memberId": 1, "nickname": "개발자", "role": "ROLE_USER" }
```

- 아이디가 없거나 비밀번호가 틀리면 둘 다 401 `LOGIN_FAILED`로 응답한다. 어느 쪽이 틀렸는지 구분하지 않는다 (REQ-LOGIN-005, 006).
- 아이디·비밀번호가 비어 있으면 400 `INVALID_INPUT`. 형식 규칙(8~12자 등)은 로그인에서 검사하지 않고 `LOGIN_FAILED`로 처리한다.
- 정지 회원은 403 `MEMBER_BANNED`, 탈퇴 회원은 403 `MEMBER_WITHDRAWN` (비밀번호가 맞을 때만 알려준다).
- 토큰 재발급: 요청 본문 없이 쿠키의 Refresh Token으로 새 Access Token을 발급하고, Refresh Token도 새로 교체한다. 응답 형식은 로그인 응답과 같다.
  - 쿠키가 없거나, 만료·위조됐거나, 이미 교체된 이전 토큰이면 401 `INVALID_REFRESH_TOKEN` (쿠키도 지운다). 프론트는 로그인 화면으로 보낸다.
  - 정지·탈퇴 회원이면 403 `MEMBER_BANNED` / `MEMBER_WITHDRAWN`, 저장된 Refresh Token을 삭제한다.
- 로그아웃: `Authorization` 헤더 필요. DB의 Refresh Token을 삭제하고 쿠키를 만료시킨다. 응답 `data`는 `null`. 프론트는 메모리의 Access Token을 지운다.
- 쿠키: 이름 `refreshToken`, `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`, 14일. `NODE_ENV=production`이면 `Secure`.

### 아이디·비밀번호 찾기 (REQ-FIND-001~005)
- 본인 확인 방식: 가입할 때 등록한 전화번호. 입력값 형식은 회원가입과 같은 규칙이고, 틀리면 400 `INVALID_INPUT`(필드별 에러).
- 정보가 일치하는 회원이 없거나 탈퇴 회원이면 404 `ACCOUNT_NOT_MATCHED`.
- 틀린 시도 횟수는 제한하지 않는다 (#37에서 결정).
- 요청 본문에 전화번호가 들어가므로 GET 쿼리가 아니라 POST 본문으로 보낸다.

아이디 찾기 요청 / 응답 (`data`) — 아이디는 앞 3자만 보이고 나머지는 같은 길이의 `*`로 가린다.
```json
{ "nickname": "자바왕", "phone": "01011112222" }
```
```json
{ "nickname": "자바왕", "maskedLoginId": "dev********", "createdAt": "2026-11-01T10:00:00" }
```

비밀번호 재설정은 화면에서 두 단계로 진행한다.
1. 본인 확인 `POST /api/auth/password-reset/verify` — 요청 `{ "loginId": "devin_user1", "phone": "01011112222" }`, 응답 `data` `{ "verified": true }`
2. 재설정 `POST /api/auth/password-reset` — 요청 `{ "loginId": "devin_user1", "phone": "01011112222", "newPassword": "devin_5678" }`, 응답 `data` `null`
- 서버는 1단계 결과를 저장하지 않으므로 2단계에서 아이디·전화번호를 다시 확인한다. 비밀번호 확인 값 비교는 프론트에서 한다.
- 정지 회원은 403 `MEMBER_BANNED` (1·2단계 모두).
- 재설정하면 그 회원의 Refresh Token을 삭제하고 Refresh 쿠키를 만료시킨다. 다른 기기는 Access Token이 만료되면(최대 30분) 다시 로그인해야 한다.

## 3. 회원 (Member)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 회원가입 | POST | /api/members/signup | 전체 |
| 아이디 중복 확인 | GET | /api/members/check-login-id?loginId= | 전체 |
| 전화번호 중복 확인 | GET | /api/members/check-phone?phone= | 전체 |
| 닉네임 중복 확인 | GET | /api/members/check-nickname?nickname= | 전체 |
| 프로필 조회 (다른 회원 포함) | GET | /api/members/{memberId} | 전체 |
| 내 정보 조회 | GET | /api/members/me | 회원 |
| 프로필 수정 | PATCH | /api/members/me/profile | 회원 |
| 개인정보 수정 | PATCH | /api/members/me/private | 회원 |
| 관심 카테고리·알림 설정 조회 | GET | /api/members/me/categories | 회원 |
| 관심 카테고리·알림 설정 변경 | PUT | /api/members/me/categories | 회원 |
| 내 등급·뱃지 조회 | GET | /api/members/me/grade | 회원 |
| 채택 내역 | GET | /api/members/me/accepted-answers?page=0 | 회원 |
| 내가 쓴 질문 목록 | GET | /api/members/me/questions?page=0 | 회원 |
| 내가 쓴 답변 목록 | GET | /api/members/me/answers?page=0 | 회원 |

- 마이페이지 수정 API(PATCH `/me/profile`, `/me/private`, PUT `/me/categories`)는 성공하면 `data: null`을 돌려준다. 프론트는 저장 후 필요한 값을 다시 조회한다.
- 정지(`BANNED`) 회원은 조회 API는 쓸 수 있고, 수정 API는 403 `MEMBER_BANNED`. 탈퇴(`WITHDRAWN`) 회원은 `/me/**` 전체가 403 `MEMBER_WITHDRAWN`.

### 회원가입 (REQ-SIGNUP-001~005)
요청
```json
{ "loginId": "devin_user", "password": "devin_1234", "nickname": "개발자", "phone": "01012345678" }
```
- 비밀번호 확인 값 비교(REQ-SIGNUP-002)는 프론트에서 하고 서버로 보내지 않는다.
- 중복 확인을 거친 값이어도 가입 시 서버가 다시 확인한다. 중복이면 409 `DUPLICATE_LOGIN_ID` / `DUPLICATE_PHONE` / `DUPLICATE_NICKNAME`.

응답 (`data`) — 201 Created. 가입 후 자동 로그인하지 않으므로 토큰은 발급하지 않는다.
```json
{ "memberId": 1 }
```

- 중복 확인 API의 쿼리 값도 입력값 규칙으로 검사하고, 어기면 400 `INVALID_INPUT`.

중복 확인 응답 (`data`)
```json
{ "available": true }
```

### 프로필 조회 (REQ-MYPAGE-001)
응답 (`data`) — 로그인하지 않아도 조회할 수 있고, 개인정보(아이디·전화번호)는 넣지 않는다.
```json
{
  "memberId": 1,
  "nickname": "개발자",
  "bio": "백엔드 3년 차입니다.",
  "careerYears": 3,
  "techStacks": ["java", "spring"],
  "grade": "BRONZE",
  "acceptRate": 42.5
}
```
- 탈퇴한 회원의 프로필은 404 `MEMBER_NOT_FOUND`로 응답한다.

### 내 정보 조회
응답 (`data`) — 프로필 조회 응답에 아래 값을 더한다.
```json
{ "loginId": "devin_user", "phone": "01012345678", "role": "ROLE_USER", "createdAt": "2026-11-01T10:00:00" }
```
- `createdAt`은 가입일이다 (개인정보 수정 화면에 표시, REQ-MYPAGE-003).

### 프로필 수정 (REQ-MYPAGE-002)
요청 — 보낸 필드만 바꾼다.
```json
{ "nickname": "새닉네임", "bio": "소개글", "careerYears": 3, "techStacks": ["java", "spring"] }
```
- 닉네임을 바꾸면 중복을 다시 확인하고, 중복이면 409 `DUPLICATE_NICKNAME`. 본인의 현재 닉네임은 중복으로 보지 않는다.
- `techStacks`는 태그 목록(`GET /api/tags`)에서 최대 5개까지 고른 값만 받는다. 목록에 없는 이름이 있으면 400 `INVALID_INPUT`.
- `techStacks`는 소문자로 바꾸고 중복을 지운 뒤 저장한다.
- `careerYears`는 연차를 정수로 받는다 (0은 신입). `null`을 보내면 경력을 지운다.
- `bio`에 빈 문자열이나 `null`을 보내면 소개글을 지운다.

### 개인정보 수정 (REQ-MYPAGE-003)
요청 — `currentPassword`는 필수, `newPassword`와 `phone` 중 바꿀 값만 보낸다.
```json
{ "currentPassword": "devin_1234", "newPassword": "devin_5678", "phone": "01098765432" }
```
- 아이디는 바꿀 수 없다.
- 현재 비밀번호가 틀리면 400 `PASSWORD_MISMATCH`.
- 새 비밀번호 확인 값 비교는 프론트에서 한다.
- 전화번호를 바꾸면 중복을 다시 확인하고, 중복이면 409 `DUPLICATE_PHONE`.
- `newPassword`를 바꾸면 Refresh Token을 새로 발급해 교체하고 `Set-Cookie`로 내려준다. 지금 기기는 로그인이 유지되고, 다른 기기는 Access Token이 만료된 뒤(최대 30분) 로그아웃된다 (REQ-FIND-005와 같은 취지).

### 관심 카테고리·알림 설정 (REQ-MYPAGE-004)
조회 응답 (`data`) / 변경 요청 본문
```json
{ "categoryIds": [1, 3], "notificationEnabled": true }
```
- 변경은 목록 전체를 교체한다. 없는 카테고리가 있으면 404 `CATEGORY_NOT_FOUND`.
- `notificationEnabled`가 `true`이면 관심 카테고리에 새 질문이 올라올 때 알림을 받는다.

### 내 등급·뱃지 조회 (REQ-MYPAGE-005)
응답 (`data`)
```json
{
  "grade": "BRONZE",
  "nextGrade": "SILVER",
  "nextGradeCondition": "채택된 답변 5개 (현재 4개)",
  "badges": [
    { "code": "FIRST_ANSWER", "name": "첫 답변", "condition": "답변 1개 작성", "acquired": true },
    { "code": "SOLVER", "name": "해결사", "condition": "채택된 답변 10개", "acquired": false }
  ]
}
```
- 미획득 뱃지도 함께 내려준다. 프론트는 `acquired`가 `false`이면 흐리게 표시하고, 클릭하면 `condition`을 보여준다.
- 최고 등급이면 `nextGrade`, `nextGradeCondition`은 `null`이다.
- 등급과 뱃지는 따로 저장하지 않고, 조회할 때 회원의 활동 수로 계산한다. 그래서 획득 일시는 없다.

등급 — 채택된 답변 수 기준 (삭제된 답변 제외)
| grade | 조건 |
|---|---|
| `BRONZE` | 0~4개 |
| `SILVER` | 5~19개 |
| `GOLD` | 20~49개 |
| `PLATINUM` | 50개 이상 |

뱃지 — 삭제된 글은 세지 않는다.
| code | 이름 | 조건 |
|---|---|---|
| `FIRST_QUESTION` | 첫 질문 | 질문 1개 작성 |
| `FIRST_ANSWER` | 첫 답변 | 답변 1개 작성 |
| `FIRST_ACCEPTED` | 첫 채택 | 채택된 답변 1개 |
| `CURIOUS` | 질문왕 | 질문 10개 작성 |
| `SOLVER` | 해결사 | 채택된 답변 10개 |
| `POPULAR_ANSWER` | 인기 답변 | 좋아요 10개 이상 받은 답변 1개 |

### 채택 내역 (REQ-MYPAGE-007)
응답 `content` 항목 — 채택일 최신순.
```json
{ "answerId": 31, "questionId": 12, "questionTitle": "JPA N+1 문제 해결 방법", "acceptedAt": "2026-11-12T12:00:00" }
```

### 내가 쓴 질문·답변 목록 (REQ-MYPAGE-008)
최신순. 응답 `content` 항목
```json
{ "questionId": 12, "title": "JPA N+1 문제 해결 방법", "createdAt": "2026-11-12T10:00:00", "accepted": false, "likeCount": 5 }
```
- 답변 목록의 항목은 `answerId`를 더하고, `title`은 답변이 달린 질문의 제목, `accepted`는 그 답변의 채택 여부, `likeCount`는 그 답변의 좋아요 수다.

## 4. 질문 (Question)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 목록 조회 (메인 화면, 페이징·정렬) | GET | /api/questions | 전체 |
| 검색 (검색 결과 화면, 페이징·검색·정렬) | GET | /api/questions/search | 전체 |
| 상세 조회 | GET | /api/questions/{questionId} | 전체 |
| 유사 질문 | GET | /api/questions/{questionId}/similar | 전체 |
| 작성 | POST | /api/questions | 회원 |
| 수정 | PATCH | /api/questions/{questionId} | 작성자 |
| 삭제 | DELETE | /api/questions/{questionId} | 작성자·관리자 |

### 목록 조회 — 메인 화면 (REQ-MAIN-006, 007, REQ-SEARCH-005)
쿼리 파라미터 — 모두 선택이며 함께 쓸 수 있다.

| 파라미터 | 설명 |
|---|---|
| `page`, `size` | 페이징 (기본 0, 10). `page`는 0 이상, `size`는 1~50 정수 |
| `sort` | `latest`(최신순, 기본), `views`(조회수 많은 순), `answers`(답변 많은 순), `likes`(좋아요순). `latest` 외에는 값이 같으면 최신순 |

- 메인 화면의 인기순(REQ-MAIN-007)은 `sort=likes`를 쓴다.
- `sort`는 위 4개 값만 받는다. 그 외 값이거나 `page`, `size`가 범위를 벗어나면 400 `INVALID_INPUT` (`errors`에 해당 필드).
- `answers`의 답변 수는 삭제된 답변을 세지 않는다 (응답의 `answerCount`와 같은 값).
- 검색 조건은 받지 않는다. 검색은 아래 검색 API를 쓴다.
- 목록·상세 조회는 비로그인도 가능하며, 토큰이 있으면 `liked` 값을 채워 응답한다.

### 검색 — 검색 결과 화면 (REQ-SEARCH-001~005)
메인 화면 검색창 → 검색 드롭다운 → 검색 결과 화면에서 쓴다. 쿼리 파라미터는 모두 선택이며 함께 쓸 수 있다 (조건을 모두 만족하는 질문).

| 파라미터 | 설명 |
|---|---|
| `page`, `size`, `sort` | 목록 조회와 같다 |
| `keyword` | 검색어, 최대 100자. 앞뒤 공백은 지우고, 공백만 있으면 검색어 조건을 쓰지 않는다. 대소문자를 구분하지 않는다 |
| `scope` | 검색어를 찾을 범위: `all`(제목·내용·태그 이름, 기본), `title`(제목), `content`(내용), `tag`(태그 이름). `keyword`가 없으면 무시한다 |
| `categoryId` | 카테고리 ID (1 이상 정수). 없으면 전체 |
| `tags` | 태그 이름, 여러 개는 쉼표로 구분 (`tags=spring,jpa`), 최대 8개. 선택한 태그가 **모두** 달린 질문 (태그를 고를수록 결과가 좁아진다) |
| `startDate`, `endDate` | 작성일 기간 (`2026-11-01`, 양 끝 날짜 포함). 하나만 보내도 된다 |
| `accepted` | `true`(채택됨), `false`(미채택). 없으면 전체 |

- 검색어는 부분 일치로 찾는다 (`LIKE`). `%`, `_`는 일반 문자로 취급한다.
- `tags`는 소문자로 바꾸고 중복을 지운다. 태그 목록에 없는 이름이 있으면 결과가 비어 있다.
- 없는 `categoryId`면 결과가 비어 있다.
- 형식이 틀리면 400 `INVALID_INPUT` (`errors`에 해당 필드): `scope`·`accepted`가 허용 값이 아님, `categoryId`가 1 이상 정수가 아님, 태그가 8개 초과, 날짜가 `YYYY-MM-DD`가 아니거나 없는 날짜, `startDate`가 `endDate`보다 늦음, `keyword`가 100자 초과
- 응답 형식은 목록 조회와 같다. 결과가 없으면 `content`가 빈 배열이고, 프론트가 "검색 결과가 없습니다"를 표시한다.

목록·검색 응답 `content` 항목
```json
{
  "questionId": 12,
  "title": "JPA N+1 문제 해결 방법",
  "writer": { "memberId": 1, "nickname": "개발자" },
  "category": { "categoryId": 1, "name": "백엔드" },
  "tags": ["spring", "jpa"],
  "accepted": false,
  "likeCount": 5,
  "viewCount": 120,
  "answerCount": 3,
  "createdAt": "2026-11-12T10:00:00"
}
```
- 목록의 `writer`는 `memberId`, `nickname`만 담는다.

### 작성·수정 (REQ-QUESTION-001, 004, 006, 008)
요청 — 수정은 보낸 필드만 바꾸고, `tags`를 보내면 전체를 교체한다.
```json
{ "title": "JPA N+1 문제 해결 방법", "content": "본문 내용 (마크다운)", "categoryId": 1, "tags": ["spring", "jpa"] }
```
- `categoryId`는 작성 시 필수이고 질문당 1개다. 없는 카테고리면 404 `CATEGORY_NOT_FOUND`.
- `tags`는 태그 목록에 있는 이름만 받는다. 목록에 없는 이름이 있으면 400 `INVALID_INPUT`.
- `content`는 마크다운 원문으로 저장한다. 렌더링할 때 프론트에서 HTML 태그를 걸러 낸다 (REQ-QNA-003).
- 질문 템플릿(REQ-QUESTION-002)은 프론트에서 본문에 채워 넣고, 서버는 일반 본문으로 받는다.
- 질문을 작성하면, 이 카테고리를 관심 카테고리로 두고 알림을 켠 회원에게 알림을 보낸다 (9장).

작성 응답 (`data`) — 201
```json
{ "questionId": 12 }
```

수정 (REQ-QUESTION-006, REQ-QNA-001)
- 작성자만 수정할 수 있다. 다른 회원(관리자 포함)이면 403 `FORBIDDEN`, 정지·탈퇴 회원은 403 `MEMBER_BANNED`·`MEMBER_WITHDRAWN`.
- 보낸 필드만 작성과 같은 규칙으로 검사한다. 필드를 하나도 보내지 않거나 값이 `null`이면 400 `INVALID_INPUT`.
- `tags: []`를 보내면 태그를 모두 지운다.
- 어떤 필드를 바꾸든(태그만 바꿔도) `updatedAt`이 수정 시각으로 바뀐다.
- 없거나 삭제된 질문은 404 `QUESTION_NOT_FOUND`.

수정 응답 (`data`) — 200
```json
{ "questionId": 12 }
```

### 상세 조회 (REQ-QUESTION-005)
응답 (`data`)
```json
{
  "questionId": 12,
  "title": "JPA N+1 문제 해결 방법",
  "content": "본문 내용",
  "category": { "categoryId": 1, "name": "백엔드" },
  "tags": ["spring", "jpa"],
  "writer": { "memberId": 1, "nickname": "개발자", "careerYears": 3, "techStacks": ["Java"], "grade": "BRONZE", "acceptRate": 42.5 },
  "viewCount": 121,
  "likeCount": 5,
  "liked": false,
  "answerCount": 3,
  "accepted": false,
  "createdAt": "2026-11-12T10:00:00",
  "updatedAt": "2026-11-12T10:00:00"
}
```
- 조회할 때마다 조회수를 1 올린다. 작성자 본인이 조회할 때는 올리지 않는다.
- 같은 사람의 반복 조회(새로고침)는 따로 막지 않는다. 막으려면 조회 기록 테이블이 필요해 이번 범위에서 제외한다.
- 삭제된 질문은 404 `QUESTION_NOT_FOUND`.

### 유사 질문 (REQ-QUESTION-009)
응답 (`data`) — 최대 3개, 현재 질문 제외, 해결된 질문 우선. 항목 형식은 목록 조회 `content` 항목과 같다.
- 후보: 현재 질문과 태그가 1개 이상 겹치는 질문, 또는 현재 질문 제목의 단어(공백 기준 2자 이상, 앞에서부터 최대 3개)가 제목에 들어간 질문
- 정렬: 해결된 질문 → 겹치는 태그 수가 많은 순 → 좋아요 많은 순
- 후보가 없으면 빈 배열을 응답한다. 프론트는 이때 유사 질문 영역을 숨긴다.

### 삭제 (REQ-QUESTION-007)
- 작성자: 채택된 답변이 있으면 409 `QUESTION_HAS_ACCEPTED_ANSWER`.
- 관리자: 신고 처리(`/api/admin/reports/{reportId}`)나 이 API로 삭제한다. 채택된 답변이 있어도 삭제할 수 있다.
- 삭제하면 `deleted = true`로 숨김 처리한다. 달린 답변·답글은 질문과 함께 조회되지 않는다.
- 다른 회원은 403 `FORBIDDEN`, 정지·탈퇴 회원은 403, 없거나 이미 삭제된 질문은 404 `QUESTION_NOT_FOUND`.
- 달린 답변·답글도 같은 트랜잭션에서 `deleted = true`로 바꾼다. 이미 삭제된 답변·답글의 삭제 시각은 바꾸지 않는다.

삭제 응답 — 200, `data`는 `null`

## 5. 답변 (Answer)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 목록 조회 | GET | /api/questions/{questionId}/answers | 전체 |
| 작성 | POST | /api/questions/{questionId}/answers | 회원 |
| 수정 | PATCH | /api/answers/{answerId} | 작성자 |
| 삭제 | DELETE | /api/answers/{answerId} | 작성자·관리자 |
| 채택 | POST | /api/answers/{answerId}/accept | 질문 작성자 |

작성·수정 요청 (REQ-ANSWER-001, 003)
```json
{ "content": "답변 내용 (마크다운)" }
```
- `content`는 10자 이상(공백 제외), 최대 10,000자. 어기면 400 `INVALID_INPUT`.
- 없거나 삭제된 질문이면 404 `QUESTION_NOT_FOUND`, 정지·탈퇴 회원은 403.

작성 응답 (`data`) — 201
```json
{ "answerId": 31 }
```

수정 (REQ-ANSWER-003)
- 작성자만 수정할 수 있다. 다른 회원(관리자 포함)이면 403 `FORBIDDEN`, 정지·탈퇴 회원은 403.
- 없거나 삭제된 답변은 404 `ANSWER_NOT_FOUND`, 채택된 답변은 409 `ACCEPTED_ANSWER_LOCKED`.
- `content` 규칙은 작성과 같다.

수정 응답 (`data`) — 200
```json
{ "answerId": 31 }
```

목록 응답 (`data`) — 페이징하지 않는다 (REQ-ANSWER-002).
```json
{
  "answerCount": 3,
  "answers": [
    {
      "answerId": 31,
      "content": "답변 내용",
      "writer": { "memberId": 2, "nickname": "답변자", "careerYears": null, "techStacks": [], "grade": "BRONZE", "acceptRate": 0.0 },
      "likeCount": 4,
      "liked": false,
      "accepted": true,
      "acceptedAt": "2026-11-12T12:00:00",
      "replyCount": 2,
      "createdAt": "2026-11-12T11:00:00",
      "updatedAt": "2026-11-12T11:00:00"
    }
  ]
}
```
- 정렬: 채택된 답변을 맨 위에 두고, 나머지는 좋아요 많은 순 → 같으면 최신순.
- 답글은 따로 조회한다 (6장). 프론트는 `replyCount`로 '답글 n' / '답글 달기'를 표시한다.

규칙
- 채택된 답변은 작성자가 수정·삭제할 수 없다: 409 `ACCEPTED_ANSWER_LOCKED` (REQ-ANSWER-003, 004).
- 관리자는 채택된 답변도 삭제할 수 있다. 이때 질문의 해결 표시는 그대로 두고, 다른 답변을 다시 채택할 수 없다.
- 채택 (REQ-ANSWER-005, 006)
  - 질문당 1개만 채택하고, 취소할 수 없다. 이미 채택된 답변이 있으면 409 `ALREADY_ACCEPTED`.
  - 본인 답변은 채택할 수 없다: 400 `CANNOT_ACCEPT_OWN_ANSWER`.
  - 답변의 채택 여부, 질문의 해결 여부, 채택률 등 연관 데이터를 한 트랜잭션으로 반영한다.
  - 채택되면 답변 작성자에게 알림을 보낸다 (9장).
- 답변이 등록되면 질문 작성자에게 알림을 보낸다 (9장).

## 6. 답글 (Reply)
답변 아래에만 달 수 있고, 답글에는 다시 답글을 달 수 없다 (REQ-ANSWER-009). 채택된 답변에도 달 수 있다.

| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 목록 조회 | GET | /api/answers/{answerId}/replies | 전체 |
| 작성 | POST | /api/answers/{answerId}/replies | 회원 |
| 수정 | PATCH | /api/replies/{replyId} | 작성자 |
| 삭제 | DELETE | /api/replies/{replyId} | 작성자·관리자 |

작성·수정 요청
```json
{ "content": "답글 내용" }
```

목록 응답 (`data`) — 오래된 순, 페이징하지 않는다 (REQ-ANSWER-010).
```json
[
  {
    "replyId": 5,
    "content": "답글 내용",
    "writer": { "memberId": 3, "nickname": "답글러", "careerYears": null, "techStacks": [], "grade": "BRONZE", "acceptRate": 0.0 },
    "createdAt": "2026-11-12T13:00:00",
    "updatedAt": "2026-11-12T13:00:00"
  }
]
```
- 관리자는 답글을 삭제만 할 수 있고 수정할 수 없다 (REQ-ANSWER-011).

## 7. 좋아요 (Like)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 질문 좋아요 | POST | /api/questions/{questionId}/likes | 회원 |
| 질문 좋아요 취소 | DELETE | /api/questions/{questionId}/likes | 회원 |
| 답변 좋아요 | POST | /api/answers/{answerId}/likes | 회원 |
| 답변 좋아요 취소 | DELETE | /api/answers/{answerId}/likes | 회원 |

응답 (`data`)
```json
{ "liked": true, "likeCount": 6 }
```
- 1인 1회. 이미 좋아요한 대상이면 409 `ALREADY_LIKED`, 좋아요하지 않은 대상을 취소하면 404 `LIKE_NOT_FOUND`.
- 본인 질문·답변에는 좋아요를 누를 수 없다: 400 `CANNOT_LIKE_OWN_POST` (REQ-QUESTION-010, REQ-ANSWER-007).
- 버튼을 다시 누르면 취소하는 동작은 프론트가 `liked` 값을 보고 POST / DELETE 중 하나를 호출해 만든다.

## 8. 신고 (Report)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 질문·답변 신고 | POST | /api/reports | 회원 |

요청 (REQ-QUESTION-011, REQ-ANSWER-008)
```json
{ "targetType": "QUESTION", "targetId": 12, "reason": "ETC", "reasonDetail": "직접 입력한 사유" }
```
- `targetType`: `QUESTION`, `ANSWER`
- `reason`

| 값 | 사유 |
|---|---|
| `SPAM` | 스팸·광고 |
| `ABUSE` | 욕설·비방 |
| `OBSCENE` | 음란·불쾌한 내용 |
| `PRIVACY` | 개인정보 노출 |
| `OFF_TOPIC` | 질문과 무관한 내용·도배 |
| `COPYRIGHT` | 저작권 침해 |
| `ETC` | 기타 (`reasonDetail` 필수) |

- 같은 회원이 같은 대상을 중복 신고하면 409 `ALREADY_REPORTED`.
- 본인 질문·답변은 신고할 수 없다: 400 `CANNOT_REPORT_OWN_POST`.
- `reasonDetail`은 `reason`이 `ETC`일 때만 받는다 (앞뒤 공백 제외 1~200자). 다른 사유와 함께 보내면 저장하지 않는다.
- 대상이 없거나 삭제됐으면 404 `QUESTION_NOT_FOUND` / `ANSWER_NOT_FOUND`. 질문이 삭제된 답변도 404다.
- 정지된 회원은 403 `MEMBER_BANNED`, 탈퇴한 회원은 403 `MEMBER_WITHDRAWN`.
- 형식이 틀리면 400 `INVALID_INPUT` (`errors`에 해당 필드): `targetType`·`reason`이 허용 값이 아님, `targetId`가 1 이상 정수가 아님, `ETC`인데 `reasonDetail`이 비었거나 200자 초과
- 답글(Reply) 신고는 이번 범위에서 제외한다 (`report.target_type`이 `QUESTION`, `ANSWER`만 허용).

응답 (`data`) — 201
```json
{ "reportId": 3 }
```

## 9. 알림 (Notification)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 알림 목록 | GET | /api/notifications?page=0 | 회원 |
| 안 읽은 알림 수 | GET | /api/notifications/unread-count | 회원 |
| 알림 읽음 처리 | PATCH | /api/notifications/{notificationId}/read | 회원 |
| 전체 읽음 처리 | PATCH | /api/notifications/read-all | 회원 |

알림 종류 (`type`)
| 값 | 받는 사람 | 근거 |
|---|---|---|
| `ANSWER_CREATED` | 질문 작성자 | REQ-NOTI-001 |
| `ANSWER_ACCEPTED` | 채택된 답변의 작성자 | REQ-NOTI-002 |
| `CATEGORY_QUESTION` | 그 카테고리를 관심 카테고리로 둔 회원 (`notificationEnabled = true`) | REQ-MYPAGE-004 |

목록 응답 `content` 항목 — 최신순.
```json
{
  "notificationId": 8,
  "type": "ANSWER_CREATED",
  "message": "'JPA N+1 문제 해결 방법'에 새 답변이 달렸습니다.",
  "questionId": 12,
  "read": false,
  "createdAt": "2026-11-12T11:00:00"
}
```
- 다른 회원의 알림을 읽음 처리하면 403 `FORBIDDEN`.
- 자기 질문에 자기가 답변하거나 자기 질문을 올린 경우에는 알림을 보내지 않는다.

### 실시간 전송 (socket.io)
- 연결: 클라이언트가 `auth: { token: accessToken }`으로 접속하면 서버가 토큰을 검증하고 `member:{memberId}` 방에 넣는다. 토큰이 잘못되면 연결을 거부한다.
- 이벤트: 서버 → 클라이언트 `notification`, 데이터는 알림 목록 항목과 같다.
- Access Token을 재발급하면 새 토큰으로 다시 연결한다.

## 10. 태그·카테고리 (Tag, Category)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 태그 목록 | GET | /api/tags?keyword= | 전체 |
| 인기 태그 | GET | /api/tags/popular?limit= | 전체 |
| 추천 태그 | POST | /api/tags/recommend | 회원 |
| 카테고리 목록 | GET | /api/categories | 전체 |

태그 목록 응답 (`data`)
```json
[ { "tagId": 1, "name": "spring" }, { "tagId": 2, "name": "jpa" } ]
```
- `keyword`(선택, 최대 30자)가 있으면 이름에 그 글자가 들어간 태그만, 없으면 전체를 이름순으로 준다. `%`, `_`는 일반 문자로 취급한다.

인기 태그 응답 (`data`) — 검색 드롭다운·검색 결과 없음 화면에서 쓴다.
```json
[ { "tagId": 2, "name": "spring", "questionCount": 12 }, { "tagId": 7, "name": "react", "questionCount": 9 } ]
```
- 삭제되지 않은 질문에 많이 달린 순(같으면 이름순)이다. 달린 질문이 없는 태그는 빠진다.
- `limit`: 1~20 정수, 기본 10. 범위를 벗어나면 400 `INVALID_INPUT`.

추천 태그 요청 / 응답 (`data`) (REQ-QUESTION-008)
```json
{ "title": "JPA N+1 문제 해결 방법", "content": "본문 내용" }
```
```json
{ "tags": ["spring", "jpa"] }
```
- 제목·내용에 태그 이름(대소문자 무시)이 들어 있으면 추천한다.
  - 단어로 들어 있을 때만 추천한다. 앞뒤가 영문자·숫자면 다른 단어의 일부로 본다 (`javascript`에서 `java`, `mysql`에서 `sql`을 추천하지 않는다). 한글 조사가 붙은 `react를`은 추천한다.
  - 제목·내용에 먼저 나온 순서로 최대 8개.
- `title`(최대 100자), `content`(최대 10,000자)는 작성 중인 값이라 비어 있거나 빠져도 된다 (빈 배열 응답). 문자열이 아니거나 너무 길면 400 `INVALID_INPUT`.
- 태그는 `seed.sql`로 미리 넣은 목록에서만 고른다. 사용자가 새 태그를 만들 수 없다 (오타·중복 태그 방지). 태그를 추가할 때는 `seed.sql`을 고친다.
- 태그 이름은 소문자로 저장한다 (`spring`, `react`, `mysql` 등).

카테고리 목록 응답 (`data`)
```json
[ { "categoryId": 1, "name": "백엔드" }, { "categoryId": 2, "name": "프론트엔드" } ]
```
- 카테고리는 `seed.sql`로 고정해 넣는다: 백엔드, 프론트엔드, 모바일, 데이터베이스, DevOps·인프라, AI·데이터, 기타
- 질문 하나는 카테고리 하나에만 속한다. 태그는 언어·기술(세부), 카테고리는 분야(큰 분류)다.

## 11. 관리자 (Admin)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 신고 목록 조회 | GET | /api/admin/reports?targetType=&status=PENDING&sort=latest&page=0 | 관리자 |
| 신고 상세 조회 | GET | /api/admin/reports/{reportId} | 관리자 |
| 신고 처리 | PATCH | /api/admin/reports/{reportId} | 관리자 |
| 회원 목록 조회 | GET | /api/admin/members?status=&keyword=&page=0 | 관리자 |
| 회원 상태 변경 (정지·해제) | PATCH | /api/admin/members/{memberId}/status | 관리자 |

신고 목록 조회 (REQ-ADMIN-001) — 쿼리 파라미터는 모두 선택이다.

| 파라미터 | 설명 |
|---|---|
| `page`, `size` | 페이징 (기본 0, 10) |
| `targetType` | `QUESTION`, `ANSWER`. 없으면 전체 |
| `status` | `PENDING`, `RESOLVED`, `REJECTED`. 없으면 전체 |
| `sort` | `latest`(최신순, 기본), `oldest`(오래된순), `reports`(같은 대상 신고 많은 순, 같으면 최신순) |

- 신고 1건이 한 행이다. 같은 대상에 신고가 여러 건이면 행도 여러 개다.
- 허용 값이 아니면 400 `INVALID_INPUT` (`errors`에 해당 필드).

응답 `content` 항목 — 상세 응답에서 `targetContent`를 빼고 `reportCount`를 더한다.
```json
{
  "reportId": 3,
  "targetType": "ANSWER",
  "targetId": 31,
  "questionId": 12,
  "targetTitle": "JPA N+1 문제 해결 방법",
  "targetDeleted": false,
  "reporter": { "memberId": 7, "nickname": "신고자" },
  "targetWriter": { "memberId": 1, "nickname": "개발자" },
  "reason": "SPAM",
  "reasonDetail": null,
  "status": "PENDING",
  "reportCount": 2,
  "createdAt": "2026-11-12T11:00:00"
}
```
- `questionId`, `targetTitle`: 대상이 질문이면 그 질문, 답변이면 답변이 달린 질문의 ID·제목
- `reportCount`: 같은 대상에 쌓인 전체 신고 수 (상태 무관)

신고 상세 응답 (`data`) — 대상이 이미 삭제됐어도 내용을 보여준다 (REQ-ADMIN-001).
```json
{
  "reportId": 3,
  "targetType": "QUESTION",
  "targetId": 12,
  "questionId": 12,
  "targetTitle": "JPA N+1 문제 해결 방법",
  "targetContent": "신고된 글 내용",
  "targetDeleted": false,
  "reporter": { "memberId": 7, "nickname": "신고자" },
  "targetWriter": { "memberId": 1, "nickname": "개발자" },
  "reason": "SPAM",
  "reasonDetail": null,
  "status": "PENDING",
  "createdAt": "2026-11-12T11:00:00"
}
```

신고 처리 요청 (REQ-ADMIN-002)
```json
{ "action": "DELETE_TARGET" }
```
- `action`: `DELETE_TARGET`(대상 숨김 처리 후 처리 완료), `REJECT`(삭제 없이 반려)
- 처리 후 신고 상태: `PENDING` → `RESOLVED` 또는 `REJECTED`
- 같은 대상에 쌓인 다른 `PENDING` 신고도 함께 같은 상태로 처리한다.
- `DELETE_TARGET`
  - 질문: 딸린 답변·답글도 함께 숨긴다 (질문 삭제 API와 같은 처리). 채택된 답변이 있어도 숨긴다.
  - 답변: 딸린 답글도 함께 숨긴다. 채택된 답변이어도 질문의 해결 표시는 그대로 두고, 다른 답변을 다시 채택할 수 없다.
  - 대상이 이미 삭제됐으면 신고 상태만 `RESOLVED`로 바꾼다.
- 대상 숨김과 신고 상태 변경은 한 트랜잭션으로 처리한다.
- 없는 신고면 404 `REPORT_NOT_FOUND`, 이미 처리된 신고면 409 `REPORT_ALREADY_PROCESSED`, `action`이 허용 값이 아니면 400 `INVALID_INPUT`.
- 신고와 무관하게 관리자가 글을 지울 때는 각 도메인의 DELETE API를 사용한다.

신고 처리 응답 (`data`)
```json
{ "reportId": 3, "status": "RESOLVED", "processedCount": 2 }
```
- `processedCount`: 이번에 함께 처리된 신고 수 (요청한 신고 포함)

회원 목록 조회 (REQ-MANAGE-001) — 쿼리 파라미터는 모두 선택이다.

| 파라미터 | 설명 |
|---|---|
| `page`, `size` | 페이징 (기본 0, 10) |
| `status` | `ACTIVE`, `BANNED`, `WITHDRAWN`. 없으면 전체 |
| `keyword` | 아이디·닉네임 부분 일치, 최대 20자. 앞뒤 공백은 지우고, `%`, `_`는 일반 문자로 취급한다 |

- 최근 가입순으로 정렬한다.
- 허용 값이 아니면 400 `INVALID_INPUT` (`errors`에 해당 필드).
- `content` 항목
```json
{ "memberId": 1, "loginId": "devin_user", "nickname": "개발자", "role": "ROLE_USER", "status": "ACTIVE", "reportedCount": 2, "createdAt": "2026-11-01T09:00:00" }
```
- `reportedCount`는 그 회원의 글(질문·답변)이 신고된 횟수(`RESOLVED` 기준)로, 정지 판단에 참고한다.
- `role`은 화면에서 관리자 계정의 정지 버튼을 숨기는 데 쓴다.
- 신고가 쌓여도 자동으로 정지하지 않는다. 정지는 관리자가 직접 한다.

회원 상태 변경 요청 (REQ-ADMIN-003)
```json
{ "status": "BANNED" }
```
- `status`: `ACTIVE`(해제), `BANNED`(정지). `WITHDRAWN`은 회원 탈퇴로만 바뀐다.
- 정지 시 해당 회원의 Refresh Token을 삭제한다. 남아 있는 Access Token(최대 30분)으로 쓰기 요청을 하면 403 `MEMBER_BANNED`를 반환한다.
- 이미 같은 상태면 그대로 200을 응답한다.
- 400 `INVALID_INPUT`: `status`가 허용 값이 아니거나 `memberId`가 1 이상 정수가 아님
- 403 `FORBIDDEN`: 대상이 관리자 계정(자기 자신 포함)
- 403 `MEMBER_WITHDRAWN`: 대상이 탈퇴한 회원
- 404 `MEMBER_NOT_FOUND`: 없는 회원

회원 상태 변경 응답 (`data`)
```json
{ "memberId": 4, "status": "BANNED" }
```
