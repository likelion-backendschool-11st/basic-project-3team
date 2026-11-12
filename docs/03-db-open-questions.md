# DB 설계 결정 사항 — Dev in

`docs/02-requirements.md`와 `docs/api.md`를 맞추면서 정한 내용과, DB 설계 규칙을 정리한다.
`backEnd/db/schema.sql`과 DB 명세서는 이 문서를 기준으로 만든다.

## 1. 요구사항 ↔ API 명세 불일치

2026-11-12에 `docs/api.md`를 `docs/02-requirements.md` 기준으로 고쳤다. 정한 내용은 아래와 같다.
- 로그인은 아이디(`loginId`)로 하고, 회원가입은 아이디·비밀번호·닉네임·전화번호를 받는다.
- 질문 댓글은 없애고 답변 아래 1단계 **답글**(`/replies`)만 둔다. 신고 대상은 질문·답변뿐이다.
- 용어는 "좋아요"로 통일한다. 본인 질문·답변 모두 좋아요할 수 없다 (요구사항 QUESTION-010에도 추가).
- 메인 인기순은 좋아요순(`sort=likes`)이다 (요구사항 MAIN-007도 수정).
- 회원 탈퇴 API는 요구사항에 없어 뺐다. `WITHDRAWN` 상태값과 `MEMBER_WITHDRAWN` 코드는 남겨 두었다.
- 신고 사유 7종 enum, 입력값 규칙, 누락된 에러 코드, 조회수·태그·작성자 정보 응답 필드를 추가했다.
- 요구사항에만 있던 기능의 API 초안을 추가했다: 공개 프로필, 프로필·개인정보 수정, 관심 카테고리·알림 설정, 등급·뱃지, 채택 내역, 상세 검색, 유사 질문, 태그·카테고리 목록, 추천 태그, 알림(socket.io 포함).

### API 명세의 TODO 결정 내용
api.md에 TODO로 남겼던 항목을 아래처럼 정했다. 팀 리뷰에서 바꾸면 api.md와 이 표를 함께 고친다.

| 항목 | 결정 | api.md 위치 |
|---|---|---|
| 전화번호 형식 | 하이픈 없이 숫자 10~11자리, `01`로 시작 | 1장 입력값 규칙 |
| 닉네임·소개글 길이 | 닉네임 2~10자(한글·영문·숫자), 소개글 최대 200자 | 1장 입력값 규칙 |
| 프로필 사진 | 업로드 기능 제외, 프론트가 기본 이미지 표시 | 1장 작성자 정보 |
| 등급 | 채택된 답변 수 기준 4단계: BRONZE 0~4, SILVER 5~19, GOLD 20~49, PLATINUM 50+ | 3장 내 등급·뱃지 |
| 뱃지 | 6종 (첫 질문, 첫 답변, 첫 채택, 질문왕, 해결사, 인기 답변). 저장하지 않고 조회할 때 계산 | 3장 내 등급·뱃지 |
| 경력 | 연차는 0~50 정수, 기술 스택은 태그 목록에서 최대 5개 | 3장 프로필 수정 |
| 태그 여러 개 검색 | 모두 포함 (AND) | 4장 목록 조회 |
| 카테고리 | 질문 작성 시 1개 필수 선택 (요구사항 QUESTION-001, 004에 추가). 목록 7개 고정 | 4장 작성, 10장 |
| 조회수 | 작성자 본인 조회만 제외, 반복 조회는 막지 않음 | 4장 상세 조회 |
| 유사 질문 | 태그가 겹치거나 제목 단어가 들어간 질문 중 해결됨 → 겹치는 태그 수 → 좋아요순 | 4장 유사 질문 |
| 관리자 삭제 | 채택 답변 제한을 적용하지 않음. 채택 답변을 지워도 질문의 해결 표시는 유지 | 4장 삭제, 5장 규칙 |
| 태그 목록 | `seed.sql`로 미리 넣은 목록에서만 고름, 소문자 저장 | 10장 |
| 자동 정지 | 없음. 관리자가 직접 정지 | 11장 회원 목록 |

### 요구사항 명세서 자체 표기 오류
- `REQ_LOGIN-005`, `REQ_SIGNUP-005`는 `-` 대신 `_`를 씀 → `REQ-LOGIN-005`, `REQ-SIGNUP-005`
- SIGNUP-001 제목의 입력 항목(전화번호, 비밀번호, 닉네임)에 아이디가 빠져 있음. api.md는 아이디를 포함했다.

## 2. DB 설계 결정
2026-11-12에 아래처럼 정했다. 팀 리뷰에서 바꾸면 이 문서, `docs/api.md`, `backEnd/db/schema.sql`을 함께 고친다.

### 공통
| 항목 | 결정 |
|---|---|
| PK | 모든 테이블 `BIGINT AUTO_INCREMENT`, 이름은 `{테이블}_id` (`question_id`) |
| 문자셋 | `utf8mb4`, collation `utf8mb4_0900_ai_ci` (MySQL 기본값). 대소문자를 구분하지 않으므로 `Devin`과 `devin`은 같은 값으로 UNIQUE에 걸린다 |
| 시간 | `DATETIME`, 한국 시간(KST)으로 저장한다. 커넥션 풀에 `timezone: '+09:00'`을 준다. API는 시간대 표기 없이 `2026-11-12T10:00:00` 형식으로 응답한다 |
| 생성·수정일 | `created_at DEFAULT CURRENT_TIMESTAMP`, `updated_at DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |
| soft delete | `deleted BOOLEAN NOT NULL DEFAULT FALSE` + `deleted_at DATETIME NULL` |
| 검색 | 제목·내용 `LIKE CONCAT('%', ?, '%')`. 키워드의 `%`, `_`, `\`는 이스케이프한다. FULLTEXT는 데이터가 적어 쓰지 않는다 |
| 관리자 계정 | `seed.sql`로 `ROLE_ADMIN` 계정을 넣는다. 로컬 개발용 비밀번호의 bcrypt 해시만 넣고, 평문 비밀번호는 팀 내부에서 따로 공유한다 |

### 필드 길이·형식
| 테이블.컬럼 | 타입 | 규칙 |
|---|---|---|
| member.login_id | `VARCHAR(12)` UNIQUE | 8~12자, 영문·숫자와 `_.-`. 대소문자 구분 없음 |
| member.password_hash | `CHAR(60)` | bcrypt 해시. 비밀번호에 영문·숫자 조합을 강제하지 않는다 (요구사항에 없음) |
| member.phone | `VARCHAR(11)` UNIQUE | 하이픈 없이 숫자 10~11자리 |
| member.nickname | `VARCHAR(10)` UNIQUE | 2~10자, 한글·영문·숫자 |
| member.bio | `VARCHAR(200)` NULL | 최대 200자 |
| member.career_years | `TINYINT UNSIGNED` NULL | 0~50 |
| member.role | `VARCHAR(20)` | `ROLE_USER`, `ROLE_ADMIN` |
| member.status | `VARCHAR(20)` | `ACTIVE`, `BANNED`, `WITHDRAWN` |
| member.notification_enabled | `BOOLEAN` DEFAULT TRUE | 관심 카테고리 알림만 켜고 끈다. 답변·채택 알림은 항상 받는다 |
| question.title | `VARCHAR(100)` | 5~100자 |
| question.content / answer.content | `TEXT` | 10자 이상, 최대 10,000자 |
| reply.content | `VARCHAR(500)` | 1~500자 |
| tag.name | `VARCHAR(30)` UNIQUE | 소문자, `seed.sql`로만 추가 |
| category.name | `VARCHAR(30)` UNIQUE | `seed.sql`로 7개 고정 |
| report.reason | `VARCHAR(20)` | 7종 값은 서버에서 검사한다 (ENUM은 값을 바꿀 때 ALTER가 필요해 쓰지 않는다) |
| report.reason_detail | `VARCHAR(200)` NULL | `reason = 'ETC'`일 때 필수 |
| notification.type | `VARCHAR(30)` | `ANSWER_CREATED`, `ANSWER_ACCEPTED`, `CATEGORY_QUESTION` |
| notification.message | `VARCHAR(255)` | 알림을 만들 때 문장을 저장한다. 나중에 질문 제목이 바뀌어도 알림 문장은 그대로 둔다 |

### 채택
- `question.accepted_answer_id BIGINT NULL` (FK → answer)와 `question.accepted_at DATETIME NULL`로 관리한다. `answer`에는 채택 컬럼을 두지 않는다.
- 질문당 하나라는 규칙이 컬럼 구조로 보장된다. 채택은 `UPDATE question SET accepted_answer_id = ?, accepted_at = NOW() WHERE question_id = ? AND accepted_answer_id IS NULL`로 하고, 바뀐 행이 0개면 409 `ALREADY_ACCEPTED`. 동시에 두 번 채택해도 하나만 성공한다.
- API의 답변 `accepted`는 `question.accepted_answer_id = answer.answer_id`로 계산한다.
- 채택 내역(MYPAGE-007)은 `question.accepted_answer_id`로 답변을 조인해 `accepted_at` 최신순으로 조회한다.

### 중복 불가 (UNIQUE·PK)
| 테이블 | 키 |
|---|---|
| question_like | UNIQUE (`member_id`, `question_id`) |
| answer_like | UNIQUE (`member_id`, `answer_id`) |
| report | UNIQUE (`reporter_id`, `target_type`, `target_id`). 반려된 뒤에도 다시 신고할 수 없다 |
| question_tag | PK (`question_id`, `tag_id`) |
| member_category (관심 카테고리) | PK (`member_id`, `category_id`) |
| member_tech_stack | PK (`member_id`, `tag_id`) |

- 좋아요 취소는 행을 실제로 지운다. 좋아요는 글이 아니어서 soft delete 대상이 아니다.
- 회원 탈퇴 API가 없으므로 탈퇴 회원의 아이디·전화번호·닉네임을 다시 쓰는 경우는 생기지 않는다. 정지 회원의 값은 계속 사용 중으로 본다.

### 집계 값
| 값 | 방식 |
|---|---|
| 좋아요 수 | `question.like_count`, `answer.like_count` 컬럼에 저장한다. 좋아요·취소 때 같은 트랜잭션에서 `+1` / `-1` 한다. 좋아요순 정렬과 페이징에 쓴다 |
| 조회수 | `question.view_count` 컬럼. 상세 조회 때 `+1` (작성자 본인 제외) |
| 답변 수, 답글 수 | 저장하지 않고 `COUNT(*)`로 계산한다 (`deleted = FALSE`만) |
| 채택률·등급·뱃지 | 저장하지 않고 조회할 때 계산한다. 작성자 정보가 여러 개 필요한 목록은 작성자 ID를 모아 `GROUP BY` 쿼리 한 번으로 구한다 |

- 인덱스: `question (deleted, created_at)`, `question (deleted, like_count, created_at)`, `question (category_id)`, `answer (question_id)`, `reply (answer_id)`, `notification (member_id, is_read, created_at)`

### 삭제 정책
| 대상 | 결정 |
|---|---|
| 질문 | 작성자(채택 답변이 없을 때)와 관리자가 삭제한다. 같은 트랜잭션에서 딸린 답변·답글도 `deleted = TRUE`로 바꾼다 |
| 답변 | 작성자(채택 안 된 답변만)와 관리자가 삭제한다. 딸린 답글도 함께 숨긴다. 관리자가 채택된 답변을 지워도 `question.accepted_answer_id`는 그대로 둔다 (해결 표시 유지, 다시 채택 불가) |
| 답글 | 작성자와 관리자가 삭제한다. 목록에서 숨기고 "삭제된 답글입니다"는 표시하지 않는다 |
| 회원 정지 | 기간 없이 정지하고, 관리자가 `ACTIVE`로 바꿔야 풀린다. 정지 사유는 저장하지 않는다. 정지 회원의 글은 그대로 보인다 |
| 회원 탈퇴 | API가 없다. `WITHDRAWN` 상태값만 남겨 둔다 |
| 좋아요 | 대상 글이 삭제돼도 좋아요 행과 `like_count`는 그대로 둔다 (글이 보이지 않으므로 영향 없음) |
| 채택률·등급·뱃지 | 삭제된 답변·질문은 분자와 분모 모두에서 뺀다 |
| 신고 | 작성자가 먼저 지운 글의 `PENDING` 신고는 그대로 두고 관리자가 처리한다 (`targetDeleted: true`로 보임). 이미 삭제된 대상에 `DELETE_TARGET`을 하면 상태만 `RESOLVED`로 바꾼다 |
| 알림 | 지우지 않는다. 대상 질문이 삭제된 알림을 누르면 질문 상세의 404 안내(REQ-QUESTION-005)를 따른다 |

### 신고·알림 테이블
- 신고 대상은 `target_type` + `target_id`로 가리키고 FK를 두지 않는다. 대상이 있는지는 Service에서 확인한다.
- `report.status`(`PENDING`, `RESOLVED`, `REJECTED`), `processed_at DATETIME NULL`, `processed_by BIGINT NULL`(처리한 관리자, FK → member)
- `notification`: `member_id`(받는 사람), `type`, `message`, `question_id`, `is_read BOOLEAN DEFAULT FALSE`, `created_at`. 읽은 시각은 쓰지 않으므로 `read_at`은 두지 않는다.

### 기술 스택
- 질문 태그와 같은 `tag` 테이블을 쓰고, `member_tech_stack`으로 연결한다.

## 3. 다음 작업
- `backEnd/db/schema.sql`: 위 결정대로 테이블을 만든다.
- `backEnd/db/seed.sql`: 카테고리 7개, 태그 목록, 관리자 계정, 팀 공통 테스트 데이터
- DB 명세서: `docs/04-db.md`에 테이블별 컬럼 표로 작성한다.
