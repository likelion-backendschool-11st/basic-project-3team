-- Dev in 테이블 생성 스크립트
-- 설계 근거: docs/03-db-open-questions.md, 컬럼 명세: docs/04-db.md
-- 사용법: mysql -u {DB_USER} -p {DB_NAME} < backEnd/db/schema.sql
-- 기존 테이블을 모두 지우고 다시 만든다. 운영 DB에는 실행하지 않는다.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS answer_like;
DROP TABLE IF EXISTS question_like;
DROP TABLE IF EXISTS reply;
DROP TABLE IF EXISTS answer;
DROP TABLE IF EXISTS question_tag;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS member_tech_stack;
DROP TABLE IF EXISTS member_category;
DROP TABLE IF EXISTS refresh_token;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS member;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE member (
  member_id            BIGINT           NOT NULL AUTO_INCREMENT,
  login_id             VARCHAR(12)      NOT NULL,
  password_hash        CHAR(60)         NOT NULL,
  phone                VARCHAR(11)      NOT NULL,
  nickname             VARCHAR(10)      NOT NULL,
  bio                  VARCHAR(200)     NULL,
  career_years         TINYINT UNSIGNED NULL,
  role                 VARCHAR(20)      NOT NULL DEFAULT 'ROLE_USER',
  status               VARCHAR(20)      NOT NULL DEFAULT 'ACTIVE',
  notification_enabled BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id),
  UNIQUE KEY uk_member_login_id (login_id),
  UNIQUE KEY uk_member_phone (phone),
  UNIQUE KEY uk_member_nickname (nickname),
  CONSTRAINT ck_member_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),
  CONSTRAINT ck_member_status CHECK (status IN ('ACTIVE', 'BANNED', 'WITHDRAWN')),
  CONSTRAINT ck_member_career_years CHECK (career_years IS NULL OR career_years <= 50)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 회원당 1개. 토큰 원문 대신 SHA-256 해시(hex 64자)를 저장한다.
CREATE TABLE refresh_token (
  refresh_token_id BIGINT   NOT NULL AUTO_INCREMENT,
  member_id        BIGINT   NOT NULL,
  token_hash       CHAR(64) NOT NULL,
  expires_at       DATETIME NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (refresh_token_id),
  UNIQUE KEY uk_refresh_token_member (member_id),
  CONSTRAINT fk_refresh_token_member FOREIGN KEY (member_id) REFERENCES member (member_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE category (
  category_id BIGINT      NOT NULL AUTO_INCREMENT,
  name        VARCHAR(30) NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (category_id),
  UNIQUE KEY uk_category_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 질문 태그와 회원 기술 스택이 함께 쓴다. seed.sql로만 추가한다.
CREATE TABLE tag (
  tag_id BIGINT      NOT NULL AUTO_INCREMENT,
  name   VARCHAR(30) NOT NULL,
  PRIMARY KEY (tag_id),
  UNIQUE KEY uk_tag_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 관심 카테고리
CREATE TABLE member_category (
  member_id   BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  PRIMARY KEY (member_id, category_id),
  KEY idx_member_category_category (category_id),
  CONSTRAINT fk_member_category_member FOREIGN KEY (member_id) REFERENCES member (member_id) ON DELETE CASCADE,
  CONSTRAINT fk_member_category_category FOREIGN KEY (category_id) REFERENCES category (category_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE member_tech_stack (
  member_id BIGINT NOT NULL,
  tag_id    BIGINT NOT NULL,
  PRIMARY KEY (member_id, tag_id),
  KEY idx_member_tech_stack_tag (tag_id),
  CONSTRAINT fk_member_tech_stack_member FOREIGN KEY (member_id) REFERENCES member (member_id) ON DELETE CASCADE,
  CONSTRAINT fk_member_tech_stack_tag FOREIGN KEY (tag_id) REFERENCES tag (tag_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- accepted_answer_id의 FK는 answer 테이블을 만든 뒤 아래에서 추가한다.
CREATE TABLE question (
  question_id        BIGINT       NOT NULL AUTO_INCREMENT,
  member_id          BIGINT       NOT NULL,
  category_id        BIGINT       NOT NULL,
  title              VARCHAR(100) NOT NULL,
  content            TEXT         NOT NULL,
  view_count         INT UNSIGNED NOT NULL DEFAULT 0,
  like_count         INT UNSIGNED NOT NULL DEFAULT 0,
  accepted_answer_id BIGINT       NULL,
  accepted_at        DATETIME     NULL,
  deleted            BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at         DATETIME     NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id),
  UNIQUE KEY uk_question_accepted_answer (accepted_answer_id),
  KEY idx_question_latest (deleted, created_at),
  KEY idx_question_likes (deleted, like_count, created_at),
  KEY idx_question_category (category_id),
  KEY idx_question_member (member_id),
  CONSTRAINT fk_question_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT fk_question_category FOREIGN KEY (category_id) REFERENCES category (category_id),
  CONSTRAINT ck_question_accepted CHECK ((accepted_answer_id IS NULL) = (accepted_at IS NULL))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE question_tag (
  question_id BIGINT NOT NULL,
  tag_id      BIGINT NOT NULL,
  PRIMARY KEY (question_id, tag_id),
  KEY idx_question_tag_tag (tag_id),
  CONSTRAINT fk_question_tag_question FOREIGN KEY (question_id) REFERENCES question (question_id) ON DELETE CASCADE,
  CONSTRAINT fk_question_tag_tag FOREIGN KEY (tag_id) REFERENCES tag (tag_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE answer (
  answer_id   BIGINT       NOT NULL AUTO_INCREMENT,
  question_id BIGINT       NOT NULL,
  member_id   BIGINT       NOT NULL,
  content     TEXT         NOT NULL,
  like_count  INT UNSIGNED NOT NULL DEFAULT 0,
  deleted     BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at  DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (answer_id),
  KEY idx_answer_question (question_id, deleted),
  KEY idx_answer_member (member_id, deleted),
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES question (question_id),
  CONSTRAINT fk_answer_member FOREIGN KEY (member_id) REFERENCES member (member_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

ALTER TABLE question
  ADD CONSTRAINT fk_question_accepted_answer FOREIGN KEY (accepted_answer_id) REFERENCES answer (answer_id);

CREATE TABLE reply (
  reply_id   BIGINT       NOT NULL AUTO_INCREMENT,
  answer_id  BIGINT       NOT NULL,
  member_id  BIGINT       NOT NULL,
  content    VARCHAR(500) NOT NULL,
  deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
  deleted_at DATETIME     NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reply_id),
  KEY idx_reply_answer (answer_id, deleted, created_at),
  KEY idx_reply_member (member_id),
  CONSTRAINT fk_reply_answer FOREIGN KEY (answer_id) REFERENCES answer (answer_id),
  CONSTRAINT fk_reply_member FOREIGN KEY (member_id) REFERENCES member (member_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 좋아요 취소는 행을 실제로 지운다.
CREATE TABLE question_like (
  question_like_id BIGINT   NOT NULL AUTO_INCREMENT,
  member_id        BIGINT   NOT NULL,
  question_id      BIGINT   NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (question_like_id),
  UNIQUE KEY uk_question_like (member_id, question_id),
  KEY idx_question_like_question (question_id),
  CONSTRAINT fk_question_like_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT fk_question_like_question FOREIGN KEY (question_id) REFERENCES question (question_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE answer_like (
  answer_like_id BIGINT   NOT NULL AUTO_INCREMENT,
  member_id      BIGINT   NOT NULL,
  answer_id      BIGINT   NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (answer_like_id),
  UNIQUE KEY uk_answer_like (member_id, answer_id),
  KEY idx_answer_like_answer (answer_id),
  CONSTRAINT fk_answer_like_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT fk_answer_like_answer FOREIGN KEY (answer_id) REFERENCES answer (answer_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- 신고 대상은 target_type + target_id로 가리키고 FK를 두지 않는다. 대상 확인은 Service에서 한다.
CREATE TABLE report (
  report_id     BIGINT       NOT NULL AUTO_INCREMENT,
  reporter_id   BIGINT       NOT NULL,
  target_type   VARCHAR(20)  NOT NULL,
  target_id     BIGINT       NOT NULL,
  reason        VARCHAR(20)  NOT NULL,
  reason_detail VARCHAR(200) NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  processed_by  BIGINT       NULL,
  processed_at  DATETIME     NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id),
  UNIQUE KEY uk_report (reporter_id, target_type, target_id),
  KEY idx_report_target (target_type, target_id, status),
  KEY idx_report_status (status, created_at),
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES member (member_id),
  CONSTRAINT fk_report_processed_by FOREIGN KEY (processed_by) REFERENCES member (member_id),
  CONSTRAINT ck_report_target_type CHECK (target_type IN ('QUESTION', 'ANSWER')),
  CONSTRAINT ck_report_reason CHECK (
    reason IN ('SPAM', 'ABUSE', 'OBSCENE', 'PRIVACY', 'OFF_TOPIC', 'COPYRIGHT', 'ETC')
  ),
  CONSTRAINT ck_report_reason_detail CHECK (reason <> 'ETC' OR reason_detail IS NOT NULL),
  CONSTRAINT ck_report_status CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE notification (
  notification_id BIGINT       NOT NULL AUTO_INCREMENT,
  member_id       BIGINT       NOT NULL,
  type            VARCHAR(30)  NOT NULL,
  message         VARCHAR(255) NOT NULL,
  question_id     BIGINT       NOT NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notification_member (member_id, is_read, created_at),
  CONSTRAINT fk_notification_member FOREIGN KEY (member_id) REFERENCES member (member_id),
  CONSTRAINT fk_notification_question FOREIGN KEY (question_id) REFERENCES question (question_id),
  CONSTRAINT ck_notification_type CHECK (type IN ('ANSWER_CREATED', 'ANSWER_ACCEPTED', 'CATEGORY_QUESTION'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
