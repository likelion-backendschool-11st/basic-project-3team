# API 정의서 — Dev in

- Base URL: `/api`
- 인증: `Authorization: Bearer {accessToken}` 헤더
- Refresh Token: `HttpOnly` 쿠키 (`/api/auth` 경로에서만 전송)
- 권한 표기: 전체(비로그인 포함) / 회원 / 작성자 / 관리자

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
      { "field": "email", "reason": "이메일 형식이 아닙니다." }
    ]
  }
}
```

### 페이징 응답 (`data` 내부)
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

### 상태 코드
| 코드 | 의미 |
|---|---|
| 200 OK | 조회·수정·삭제 성공 (삭제도 공통 응답 형식으로 반환) |
| 201 Created | 생성 성공 |
| 400 Bad Request | 요청값 검증 실패 |
| 401 Unauthorized | 로그인 필요, 토큰 만료·오류 |
| 403 Forbidden | 권한 없음, 정지된 회원 |
| 404 Not Found | 대상 없음 (삭제된 글 포함) |
| 409 Conflict | 중복 (이메일·닉네임 중복, 중복 추천·신고) |

### 에러 코드
| code | 상태 | 설명 |
|---|---|---|
| INVALID_INPUT | 400 | 요청값 형식 오류 |
| UNAUTHORIZED | 401 | 토큰 없음 |
| TOKEN_EXPIRED | 401 | Access Token 만료 (프론트가 재발급 시도) |
| INVALID_TOKEN | 401 | 위조·형식 오류 토큰 |
| INVALID_REFRESH_TOKEN | 401 | Refresh Token 없음·만료·불일치 (재로그인 필요) |
| LOGIN_FAILED | 401 | 이메일 또는 비밀번호 불일치 |
| FORBIDDEN | 403 | 권한 없음 |
| MEMBER_BANNED | 403 | 정지된 회원 |
| MEMBER_WITHDRAWN | 403 | 탈퇴한 회원 |
| MEMBER_NOT_FOUND | 404 | 회원 없음 |
| QUESTION_NOT_FOUND | 404 | 질문 없음 |
| ANSWER_NOT_FOUND | 404 | 답변 없음 |
| COMMENT_NOT_FOUND | 404 | 댓글 없음 |
| REPORT_NOT_FOUND | 404 | 신고 없음 |
| DUPLICATE_EMAIL | 409 | 이메일 중복 |
| DUPLICATE_NICKNAME | 409 | 닉네임 중복 |
| ALREADY_LIKED | 409 | 이미 추천함 |
| ALREADY_REPORTED | 409 | 이미 신고함 |
| ALREADY_ACCEPTED | 409 | 이미 채택된 답변이 있음 |

## 2. 인증 (Auth)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 로그인 | POST | /api/auth/login | 전체 |
| 토큰 재발급 | POST | /api/auth/reissue | 전체 (Refresh 쿠키 필요) |
| 로그아웃 | POST | /api/auth/logout | 회원 |

로그인 요청
```json
{ "email": "dev@devin.com", "password": "password123!" }
```

로그인 응답 (`data`) — Refresh Token은 `Set-Cookie`로 발급된다.
```json
{ "accessToken": "eyJhbGciOi...", "memberId": 1, "nickname": "개발자", "role": "ROLE_USER" }
```

- 토큰 재발급: 요청 본문 없이 쿠키의 Refresh Token으로 새 Access Token을 발급하고, Refresh Token도 새로 교체한다. 응답 형식은 로그인 응답과 같다.
- 로그아웃: DB의 Refresh Token을 삭제하고 쿠키를 만료시킨다. 프론트는 메모리의 Access Token을 지운다.

## 3. 회원 (Member)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 회원가입 | POST | /api/members/signup | 전체 |
| 이메일 중복 확인 | GET | /api/members/check-email?email= | 전체 |
| 닉네임 중복 확인 | GET | /api/members/check-nickname?nickname= | 전체 |
| 내 정보 조회 | GET | /api/members/me | 회원 |
| 내 정보 수정 | PATCH | /api/members/me | 회원 |
| 회원 탈퇴 | DELETE | /api/members/me | 회원 |
| 내가 쓴 질문 목록 | GET | /api/members/me/questions?page=0 | 회원 |
| 내가 쓴 답변 목록 | GET | /api/members/me/answers?page=0 | 회원 |

회원가입 요청
```json
{ "email": "dev@devin.com", "password": "password123!", "nickname": "개발자" }
```

- 회원 탈퇴는 상태를 `WITHDRAWN`으로 바꾸고 Refresh Token을 삭제한다.

## 4. 질문 (Question)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 목록 조회 (페이징·검색·정렬) | GET | /api/questions?page=0&size=10&keyword=&sort=latest | 전체 |
| 상세 조회 | GET | /api/questions/{questionId} | 전체 |
| 작성 | POST | /api/questions | 회원 |
| 수정 | PATCH | /api/questions/{questionId} | 작성자 |
| 삭제 | DELETE | /api/questions/{questionId} | 작성자·관리자 |

- `sort`: `latest`(최신순), `likes`(추천순) (TODO: 정렬 기준 확정)
- 목록·상세 조회는 비로그인도 가능하며, 토큰이 있으면 `liked` 값을 채워 응답한다.

작성 요청
```json
{ "title": "JPA N+1 문제 해결 방법", "content": "본문 내용", "tags": ["spring", "jpa"] }
```
(TODO: 태그 기능 포함 여부 확정)

상세 조회 응답 (`data`)
```json
{
  "questionId": 12,
  "title": "JPA N+1 문제 해결 방법",
  "content": "본문 내용",
  "writer": { "memberId": 1, "nickname": "개발자" },
  "likeCount": 5,
  "liked": false,
  "answerCount": 3,
  "accepted": false,
  "createdAt": "2026-11-12T10:00:00",
  "updatedAt": "2026-11-12T10:00:00"
}
```

- 질문을 삭제하면 `deleted = true`로 숨김 처리한다. 달린 답변·댓글은 질문과 함께 조회되지 않는다.

## 5. 답변 (Answer)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 목록 조회 | GET | /api/questions/{questionId}/answers | 전체 |
| 작성 | POST | /api/questions/{questionId}/answers | 회원 |
| 수정 | PATCH | /api/answers/{answerId} | 작성자 |
| 삭제 | DELETE | /api/answers/{answerId} | 작성자·관리자 |
| 채택 | POST | /api/answers/{answerId}/accept | 질문 작성자 |

- 질문 하나에 채택은 1개만 가능하며, 본인 답변은 채택할 수 없다.
- 답변 목록 응답에는 각 답변의 `likeCount`, `liked`, `accepted` 값을 포함한다.

## 6. 댓글 (Comment)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 질문 댓글 목록 | GET | /api/questions/{questionId}/comments | 전체 |
| 질문 댓글 작성 | POST | /api/questions/{questionId}/comments | 회원 |
| 답변 댓글 목록 | GET | /api/answers/{answerId}/comments | 전체 |
| 답변 댓글 작성 | POST | /api/answers/{answerId}/comments | 회원 |
| 수정 | PATCH | /api/comments/{commentId} | 작성자 |
| 삭제 | DELETE | /api/comments/{commentId} | 작성자·관리자 |

(TODO: 질문 댓글 기능 포함 여부, 답변 목록 응답에 댓글을 함께 담을지 확정)

## 7. 추천 (Like)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 질문 추천 | POST | /api/questions/{questionId}/likes | 회원 |
| 질문 추천 취소 | DELETE | /api/questions/{questionId}/likes | 회원 |
| 답변 추천 | POST | /api/answers/{answerId}/likes | 회원 |
| 답변 추천 취소 | DELETE | /api/answers/{answerId}/likes | 회원 |

- 같은 회원이 같은 대상을 중복 추천하면 409 `ALREADY_LIKED`
- 본인 글은 추천할 수 없다.

## 8. 신고 (Report)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 게시글·댓글 신고 | POST | /api/reports | 회원 |

요청
```json
{ "targetType": "QUESTION", "targetId": 12, "reason": "광고성 게시글" }
```
- `targetType`: `QUESTION`, `ANSWER`, `COMMENT`
- 같은 회원이 같은 대상을 중복 신고하면 409 `ALREADY_REPORTED`

## 9. 관리자 (Admin)
| 기능 | Method | URL | 권한 |
|---|---|---|---|
| 신고 목록 조회 | GET | /api/admin/reports?targetType=&status=PENDING&page=0 | 관리자 |
| 신고 상세 조회 | GET | /api/admin/reports/{reportId} | 관리자 |
| 신고 처리 | PATCH | /api/admin/reports/{reportId} | 관리자 |
| 회원 목록 조회 | GET | /api/admin/members?status=&keyword=&page=0 | 관리자 |
| 회원 상태 변경 (정지·해제) | PATCH | /api/admin/members/{memberId}/status | 관리자 |

신고 상세 응답 (`data`) — 대상이 이미 삭제됐어도 내용을 보여준다.
```json
{
  "reportId": 3,
  "targetType": "QUESTION",
  "targetId": 12,
  "targetContent": "신고된 글 내용",
  "targetDeleted": false,
  "reporter": { "memberId": 7, "nickname": "신고자" },
  "targetWriter": { "memberId": 1, "nickname": "개발자" },
  "reason": "광고성 게시글",
  "status": "PENDING",
  "createdAt": "2026-11-12T11:00:00"
}
```

신고 처리 요청
```json
{ "action": "DELETE_TARGET" }
```
- `action`: `DELETE_TARGET`(대상 숨김 처리 후 처리 완료), `REJECT`(삭제 없이 반려)
- 처리 후 신고 상태: `PENDING` → `RESOLVED` 또는 `REJECTED`
- 같은 대상에 쌓인 다른 `PENDING` 신고도 함께 같은 상태로 처리한다.
- 신고와 무관하게 관리자가 글을 지울 때는 각 도메인의 DELETE API를 사용한다.

회원 상태 변경 요청
```json
{ "status": "BANNED" }
```
- `status`: `ACTIVE`, `BANNED`
- 정지 시 해당 회원의 Refresh Token을 삭제한다. 남아 있는 Access Token(최대 30분)으로 쓰기 요청을 하면 403 `MEMBER_BANNED`를 반환한다.
