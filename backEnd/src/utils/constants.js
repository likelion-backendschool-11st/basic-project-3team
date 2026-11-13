const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

// docs/auth.md 권한, docs/convention.md 회원 상태값
const ROLE = Object.freeze({ USER: 'ROLE_USER', ADMIN: 'ROLE_ADMIN' });
const MEMBER_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', BANNED: 'BANNED', WITHDRAWN: 'WITHDRAWN' });

module.exports = { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, ROLE, MEMBER_STATUS };
