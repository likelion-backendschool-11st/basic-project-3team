# UI 기준 — Dev in

프론트 화면에서 두 화면 이상 반복되는 요소의 모양 기준이다.
새 화면을 만들거나 기존 화면을 고칠 때 이 값을 쓰고, 한 화면에만 나오는 요소는 화면 담당자가 정한다.

## 1. 색

비슷한 색은 아래 값으로 합친다 (오른쪽 열의 색은 쓰지 않는다).

| 이름 | 값 | 쓰는 곳 | 합칠 색 |
|---|---|---|---|
| 배경 | `#FFFDF5` | 화면 바탕 | `#FAFAFA`, `#F8F9FA` |
| 흰색 | `#FFFFFF` | 카드, 입력칸 | |
| 검정 | `#111111` | 테두리, 글자, 그림자, 채택·처리 대기 배지 | `#121212`, `#000`, `#1E1E1E`, `#111827` |
| 회색 글자 | `#4B5563` | 보조 문구, 조용한 상태 배지 | `gray-500`, `stone-*`, `slate-*` |
| 흐린 회색 | `#9CA3AF` | placeholder, 흐린 테두리 | |
| 노랑 | `#FFD43B` | 강조 버튼, 카테고리, 마우스 올림 | `#FACC15`, `#FFDE59`, `#FDE047` |
| 파랑 | `#2563EB` | 주요 버튼 | `blue-600`, `#3B82F6` |
| 빨강 | `#E11D48` | 위험 버튼, 정지 배지, 오류 | `#EF4444`, `red-500`, `red-600` |
| 연초록 | `#DCFCE7` | 성공 안내 상자 | |
| 연빨강 | `#FFF1F3` | 오류 입력칸·안내 상자 바탕 | |
| 태그 바탕 | `#F1F0EB` | 태그 | |
| 연한 바탕 위 글자 | `#3F3D37` · `#9F1239` · `#8C897F` | 태그 · 오류 안내 상자 · 비활성 입력칸 글자 (`devin-tag-ink`, `devin-red-ink`, `devin-disabled-ink`) | |

- 노랑은 강조에만 쓴다. 상태 표시에는 쓰지 않는다.
- 빨강은 위험·오류에만 쓴다.
- 노랑 바탕에는 검정 글자, 파랑·빨강 바탕에는 흰 글자를 쓴다.

## 2. 둥글기·테두리·그림자

| 항목 | 버튼·입력칸 | 카드·모달 | 상태 배지 | 태그 |
|---|---|---|---|---|
| 둥글기 | 8px (`rounded-lg`) | 12px (`rounded-xl`) | 알약형 (`rounded-full`) | 4px (`rounded`) |
| 테두리 | 2px `#111111` | 2px `#111111` | 1.5px | 없음 |
| 그림자 | `2px 2px 0 #111111` | `4px 4px 0 #111111` | 없음 | 없음 |

- 구분선도 테두리와 같은 2px를 쓴다.
- 테두리는 정수 px로 쓴다. 2.5px처럼 소수로 쓰면 브라우저가 화면 픽셀 단위로 내려서, 배율 100%·150% 화면에서는 2px, 200% 화면에서는 2.5px로 화면마다 굵기가 달라진다.

### 안쪽 여백

| 크기 | 값 | 쓰는 곳 |
|---|---|---|
| 크게 | 24px (`p-6`) | 큰 카드, 모달 |
| 작게 | 16px (`p-4`) | 작은 카드, 목록 한 줄, 메뉴·팝오버 |

- 이 두 값 밖의 여백(`p-3`, `p-5`, `p-8` 등)은 쓰지 않는다. 휴대폰 폭에서 큰 카드는 16px로 줄여도 된다.

## 3. 글꼴

- 본문: Noto Sans KR
- 고정폭(코드, 아이디, 전화번호): JetBrains Mono. 한글은 Noto Sans KR로 대체된다.
- 값은 `frontEnd/tailwind.preset.cjs` 한 곳에서 정하고, 모든 Tailwind 설정이 이 파일을 `presets`로 불러온다.

### 글자 크기

| 단계 | 크기 | 클래스 | 굵기 | 쓰는 곳 |
|---|---|---|---|---|
| 페이지 제목 | 24px | `text-2xl` | 900 (`font-black`) | 화면마다 하나 있는 `<h1>` |
| 섹션 제목 | 18px | `text-lg` | 800 (`font-extrabold`) | `<h2>` (답변 3, 내 질문 등) |
| 카드 제목 | 16px | `text-base` | 800 | 질문 제목, 모달 제목 |
| 본문 | 14px | `text-sm` | 400~500 | 글 내용, 버튼, 입력칸 |
| 보조 | 12px | `text-xs` | 400~700 | 작성자·날짜, 라벨, 도움말, 배지 |
| 작은 글씨 | 11px | `text-[11px]` | 400~700 | 좋아요·답변·조회 수 |

- 이 6단계 밖의 크기(`text-xl`, `text-[22px]`, `text-[13px]` 등)는 쓰지 않는다.

## 4. 버튼

| 종류 | 색 | 예 |
|---|---|---|
| 주요 | 파랑 바탕, 흰 글자 | 질문하기, 등록, 저장 |
| 보조 | 흰 바탕, 검정 글자 | 취소, 로그인 |
| 강조 | 노랑 바탕, 검정 글자 | 회원가입, 채택하기 |
| 위험 | 빨강 바탕, 흰 글자 | 삭제, 정지 |
| 글자 버튼 | 테두리·그림자 없음, 밑줄 | 더보기, 닫기 |

- 크기: 보통 높이 40px, 작게 높이 32px.
- 한 화면에 주요 버튼은 하나만 둔다.
- 상태는 모든 버튼에 넣는다.

| 상태 | 모양 |
|---|---|
| 마우스 올림 | 바탕을 조금 진하게 |
| 누름 | 그림자만큼 아래·오른쪽으로 이동하고 그림자를 없앤다 |
| 비활성 | 흐리게(투명도 45%), 그림자 없음, 커서 금지 |
| 처리 중 | 문구를 "저장 중..."처럼 바꾸고 비활성 |

- 헤더 버튼은 `components/headerStyles.ts`의 `HEADER_BUTTON_CLASS`, `HEADER_BUTTON_COLOR`를 쓴다.

## 5. 입력칸

- 높이 40px, 흰 바탕, 2·3절의 테두리·둥글기.
- 라벨은 위, 도움말·오류 문구는 아래에 작은 글씨로 둔다.
- 라디오·체크박스·선택상자도 같은 테두리·색을 쓴다.

| 상태 | 모양 |
|---|---|
| 기본 | 흰 바탕, 검정 테두리 |
| 입력 중 | 작은 그림자(2px) |
| 오류 | 빨간 테두리, 연빨강 바탕, 아래에 빨간 문구 |
| 비활성 | 회색 바탕(`#ECEAE3`), 흐린 글자 |

## 6. 카드·모달

- 카드와 모달은 같은 모양이다 (흰 바탕, 12px, 2px 테두리, 4px 그림자).
- 질문 목록(메인, 검색 결과)은 질문마다 카드 하나로 나누고 사이를 12px(`gap-3`) 띄운다. 불러오는 중·실패·빈 목록은 카드 하나 안에 보여 준다.
- 모달 버튼은 오른쪽 아래에 `[취소] [확인]` 순서로 둔다. 되돌릴 수 없는 동작은 확인 버튼을 위험(빨강)으로 한다.
  - 예외: 아이콘·글자를 가운데 정렬한 안내 팝업(로그인 안내 `LoginPromptProvider`)은 버튼도 가운데에 둔다 (#213).
- 확인 모달은 `components/ConfirmModal.tsx` 하나를 쓴다.

## 7. 상태·카테고리·태그·등급

상태·카테고리·태그 세 가지는 모양 종류로 구분한다. 질문 목록에서는 상태를 제목 앞에, 카테고리·태그를 제목 아래 줄에 둔다.

| 구분 | 모양 | 예 |
|---|---|---|
| 상태 | 알약형 배지 + 아이콘 | ✓ 채택, ⏱ 답변 대기 |
| 카테고리 | 노랑 작은 사각형 + 굵은 글자 (칩으로 감싸지 않음) | ■ 백엔드 |
| 태그 | 연한 회색 바탕, 테두리 없음, 4px, `#` 없음. 마우스를 올리면 노랑, 누르면 검색 | mysql |

### 상태 배지

- 모든 상태에 아이콘을 붙인다 (흑백으로 봐도 구분되게).
- 색으로 채우는 건 그 화면에서 눈여겨봐야 할 상태 하나뿐이다. 나머지는 흰 바탕으로 둔다.

| 화면 | 채움 | 흰 바탕 |
|---|---|---|
| 질문 목록·상세 | `check` **채택** (검정) | `schedule` 답변 대기 (검정 테두리), `forum` 미채택 (회색) |
| 답변 | `check` **채택됨** (검정) | |
| 신고 관리 | `hourglass_top` **처리 대기** (검정) | `task_alt` 처리 완료, `close` 반려 (회색) |
| 회원 관리 | `block` **정지** (빨강) | `person` 정상 (회색), `logout` 탈퇴 (회색 점선) |

- 문구: 질문은 "채택 / 미채택 / 답변 대기", 답변은 "채택됨". 미채택은 답변은 있지만 채택 전, 답변 대기는 답변이 0개인 질문이다.
- 카테고리 색은 노랑 하나만 쓴다.

### 칩 (누르거나 지울 수 있는 것)

보여 주기만 하는 태그와 달리, 누르거나 지울 수 있는 칩은 아래처럼 쓴다.

| 종류 | 모양 | 쓰는 곳 |
|---|---|---|
| 지울 수 있는 칩 | 태그 모양 + 오른쪽 `close` 버튼 (마우스를 올리면 빨강) | 질문 작성·수정의 태그 입력, 검색 결과의 선택한 태그 |
| 고를 수 있는 칩 | 고르기 전: 흰 바탕, 1.5px 검정 테두리, 알약형 / 고른 뒤: 검정 바탕, 흰 글자 | 검색 결과의 카테고리 필터, 인기·추천 태그, 프로필 수정의 관심 카테고리 |

- 고를 수 있는 칩은 `aria-pressed`로 선택 상태를 알린다.
- 고른 칩에 노랑을 쓰지 않는다 (노랑은 강조에만, 1절).

### 등급·획득 뱃지

- 등급은 메달 아이콘 `workspace_premium`(채움) 하나에 등급 색을 입힌다. ★ 별, 이모지(🥉🥈🥇💎), Font Awesome 메달은 쓰지 않는다.
- 등급 색은 아래 한 세트만 쓴다 (`components/gradeBadge.ts`의 `GRADES`). 금속 색은 등급과 랭킹 메달에만 쓰는 예외다.

| 등급 | 색 |
|---|---|
| 브론즈 | `#CD7F32` |
| 실버 | `#9CA3AF` |
| 골드 | `#EAB308` |
| 플래티넘 | `#06B6D4` |

| 위치 | 모양 |
|---|---|
| 닉네임 옆 (답변, 답글, 작성자 팝오버) | 아이콘만. 등급 이름은 `title`로 (마우스를 올리면 보임) |
| 마이페이지, 프로필, 등급·뱃지 화면 | 아이콘 + 이름 ("골드") |
| 랭킹 1·2·3위 메달 | 골드 · 실버 · 브론즈 색 원 + 순위 숫자 |

- 등급 이름·색·기준은 `gradeBadge.ts`의 `GRADES` 한 곳에만 둔다. 메달은 `GradeIcon.tsx`로 그린다.

획득 뱃지 6가지는 원 안에 아이콘을 넣는다.

| 뱃지 | 아이콘 |
|---|---|
| 첫 질문 | `help` |
| 첫 답변 | `chat_bubble` |
| 첫 채택 | `check_circle` |
| 질문왕 | `lightbulb` |
| 해결사 | `emoji_events` |
| 인기 답변 | `favorite` |

- 획득: 노랑 원, 2px 검정 테두리, 작은 그림자(2px), 검정 아이콘
- 아직: 흰 원, 2px 회색 점선 테두리, 회색 아이콘과 글자
- 아이콘 이름은 `gradeBadge.ts`의 `BADGE_ICON`(Material 아이콘 이름)에 있고, 원 모양은 `BadgeIcon.tsx`로 그린다.

## 8. 안내 문구·화면 상태

| 종류 | 모양 |
|---|---|
| 성공 | 연초록 바탕, 검정 테두리, `check_circle` 아이콘 |
| 오류 | 연빨강 바탕, 빨간 테두리, `error` 아이콘 |
| 정보 | 흰 바탕, 검정 테두리, `info` 아이콘 |

- 빈 목록·불러오는 중·불러오기 실패는 공통 `components/ListStatus.tsx`로 보여 준다. 문구를 화면에 직접 넣지 않는다.
- 빈 화면은 점선 테두리 상자에 아이콘, 한 줄 설명, 다음 행동(예: "첫 질문을 남겨 보세요.")을 둔다.

## 9. 아이콘

- Material Symbols(Outlined) 하나만 쓴다. 이모지, 직접 그린 SVG, Font Awesome은 쓰지 않는다.
- 자주 쓰는 아이콘: `search` 검색, `notifications` 알림, `favorite` 좋아요, `chat_bubble` 답변, `visibility` 조회, `flag` 신고, `emoji_events` 랭킹, `more_horiz` 더보기, `close` 닫기, `arrow_forward` 이동, 상태 아이콘은 7절.
- `frontEnd/index.html`의 Font Awesome 링크는 지웠다 (#191). Font Awesome 클래스(`fa-*`)를 쓰면 아이콘이 보이지 않는다.

## 10. 문구 말투·날짜 형식

- 화면 문구는 "~해요"로 쓴다 (예: "검색 결과가 없어요.", "답변을 채택했어요.", "로그인이 필요해요.").
- 이용약관·개인정보처리방침만 "~합니다"로 쓴다.
- 오류 문구는 무엇이 잘못됐고 어떻게 하면 되는지 쓴다 (예: "전화번호 11자리를 입력해 주세요.").

### 날짜·숫자 형식

| 쓰는 곳 | 형식 | 예 |
|---|---|---|
| 목록 (질문, 내 활동, 관리자) | 날짜만 | `2026.11.12` |
| 상세 (질문, 답변, 답글) | 날짜 + 시간 | `2026.11.12 10:00` |
| 알림 | 지난 시간, 하루가 지나면 날짜 | `방금 전`, `5분 전`, `3시간 전`, `2026.11.12` |
| 숫자 | 천 단위 쉼표, 비율은 소수 첫째 자리 | `1,024`, `33.3%` |

- 날짜·숫자는 `components/writer.ts`의 함수(`formatDate`, `formatDateTime`, `formatRelative`, `formatNumber`, `formatPercent`)로만 만든다. `toLocaleString()`, `slice(0, 10)`, `replaceAll("-", ".")`를 화면에서 직접 쓰지 않는다.
- 줄을 맞춰야 하는 숫자(표, 수치)는 `tabular-nums`를 쓴다.

## 11. 본문 폭·화면 배경

| 폭 | 값 | 쓰는 곳 |
|---|---|---|
| 넓게 | 1152px (`max-w-6xl`) | 헤더, 질문 목록, 질문 상세, 마이페이지, 관리자 |
| 보통 | 768px (`max-w-3xl`) | 질문 작성·수정 |
| 좁게 | 460px (`max-w-devin-narrow`) | 모달, 로그인·회원가입 카드 |

- 화면 배경은 `#FFFDF5`에 점무늬(`#D9D4C3`, 1.2px 점, 18px 간격)를 쓴다.

## 12. 탭·메뉴·표

### 탭

- 고른 탭은 검정 바탕에 흰 글자, 나머지는 흰 바탕에 1.5px 검정 테두리, 8px 둥글기, 높이 32px (7절의 고를 수 있는 칩과 같은 규칙).
- 개수가 있으면 탭 이름 옆에 작은 숫자 상자를 둔다 (예: "내 답변 3").
- 정렬(최신순·조회순 등)과 마이페이지 탭은 공통 `components/SortTabs.tsx` 하나를 쓴다 (`role="tablist"`, `role="tab"`, `aria-selected`, 좌우 화살표 키로 이동).

### 드롭다운·더보기 메뉴

- 닉네임 메뉴, 더보기(⋮), 알림, 작성자 팝오버는 같은 모양이다: 흰 바탕, 2px 테두리, 12px 둥글기, 작은 그림자(2px), 안쪽 여백 6px.
- 항목은 아이콘 + 글자. 마우스를 올리면 노랑 바탕.
- 위험 항목(로그아웃, 삭제)은 빨간 글자로 맨 아래에 두고, 위에 연한 구분선을 둔다.
- 바깥을 누르거나 Esc를 누르면 닫는다. `aria-haspopup`, `role="menu"`, `role="menuitem"`을 쓴다.

### 표

- 바깥 2px 테두리, 12px 둥글기.
- 머리줄은 크림 바탕 + 굵은 글자(12px), 아래에 2px 선.
- 줄 사이는 연한 1px 선(`#E7E4DA`), 마우스를 올린 줄은 크림 바탕.
- 숫자 칸은 오른쪽 정렬 + `tabular-nums`. 상태 칸에는 7절의 상태 배지를 쓴다.
- 휴대폰 폭에서는 표를 가로로 스크롤되는 상자(`overflow-x-auto`) 안에 둔다.

## 13. 키보드 포커스·휴대폰 폭

### 키보드 포커스

- 버튼, 입력칸, 링크, 탭, 칩, 메뉴 항목은 Tab 키로 이동했을 때 파란 3px 외곽선을 보인다: `focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-devin-blue focus-visible:outline-offset-2`.
- 마우스로 누를 때는 보이지 않는다 (`focus-visible`이라 자동으로 그렇다).
- `focus:outline-none`, `focus:ring-0`만 쓰고 다른 표시를 넣지 않는 것은 금지한다. 입력칸은 5절의 입력 중 그림자에 더해 외곽선도 보인다.

### 휴대폰 폭

- 폭 400px에서 가로 스크롤이 생기지 않아야 한다.
- 화면 크기 구분은 `sm`(640px), `lg`(1024px) 두 가지만 쓴다. `md`, `xl`은 쓰지 않는다.
- 헤더는 휴대폰 폭에서 글자 버튼을 아이콘 버튼(36px)으로 줄이고, 검색창은 검색 아이콘을 누르면 펼친다 (#147).
- 목록 한 줄의 수치(좋아요·답변·조회)는 휴대폰 폭에서 제목 아래 한 줄로 내린다.

## 코드에서 쓰는 법

| 파일 | 내용 |
|---|---|
| `frontEnd/tailwind.preset.cjs` | 글꼴, 색(`devin-*`, 표·메뉴 구분선 `devin-line`), 테두리 `border-devin`(2px), 그림자 `shadow-devin-sm`(2px)·`shadow-devin`(4px), 폭 `max-w-devin-narrow`(460px), 배경 `bg-devin-dots` |
| `frontEnd/src/components/uiStyles.ts` | 버튼 `buttonClass(종류, 크기)`, 입력칸 `INPUT`, 카드 `CARD`, 카테고리 `CATEGORY`, 태그 `TAG`, 칩 `CHIP`·`chipClass(고름)`, 탭 `tabClass(고름)`·`tabCountClass(고름)`, 메뉴 `MENU`, 표 `TABLE`, 키보드 포커스 `FOCUS`, 안내 상자 `NOTICE`, 화면 배경 `PAGE_BACKGROUND`. 버튼·입력칸에는 `FOCUS`가 이미 들어 있다 |
| `frontEnd/src/components/StatusBadge.tsx` | 상태 배지 `<StatusBadge kind="accepted" />` (7절 표의 상태를 모두 가짐) |
| `frontEnd/src/components/SortTabs.tsx` | 탭 `<SortTabs tabs={...} value={...} onChange={...} label="정렬" />`. 정렬 탭과 마이페이지 탭이 같이 쓴다. 탭마다 `count`를 넣으면 개수 상자가 붙는다 |
| `frontEnd/src/components/ConfirmModal.tsx` | 확인 모달 `<ConfirmModal title message confirmLabel tone onConfirm onCancel />`. `tone`은 `primary`·`accent`(채택)·`danger`(삭제·정지). 대상 정보 등은 `children`으로, `confirmLabel`이 없으면 닫기 버튼만 |
| `frontEnd/src/components/gradeBadge.ts` | 등급 `GRADES`(이름·색·기준 채택 수), `GRADE_ORDER`, `gradeLevel`, 뱃지 아이콘 `BADGE_ICON`(Material 이름) |
| `frontEnd/src/components/GradeIcon.tsx` | 등급 메달 `<GradeIcon grade={...} />`(닉네임 옆, 아이콘만) / `withLabel`(아이콘 + 이름) |
| `frontEnd/src/components/BadgeIcon.tsx` | 획득 뱃지 `<BadgeIcon code={...} acquired={...} size="sm" />` |
| `frontEnd/src/components/writer.ts` | 날짜·숫자 `formatDate`(목록), `formatDateTime`(상세), `formatRelative`(알림), `formatNumber`, `formatPercent` |
| `frontEnd/src/components/headerStyles.ts` | 헤더 버튼. `uiStyles`의 보통 크기 버튼과 같다 |

- 화면별 Tailwind 설정(`pages/*.tailwind.cjs`)의 `content`에는 `./src/components/**/*.{ts,tsx}`를 넣는다. `.tsx`만 넣으면 `uiStyles.ts`·`headerStyles.ts`에 있는 클래스가 그 화면 CSS에 만들어지지 않는다.

```tsx
<button className={buttonClass("primary")}>질문 등록</button>
<button className={buttonClass("secondary", "sm")}>취소</button>
<input className={`${INPUT.base} ${hasError ? INPUT.error : ""}`} />
<div className={`${CARD} p-6`}>...</div>
<StatusBadge kind={question.accepted ? "accepted" : question.answerCount === 0 ? "waiting" : "unaccepted"} />
<button className={chipClass(active)} aria-pressed={active}>백엔드</button>
<SortTabs tabs={[{ value: "questions", label: "내 질문", count: 3 }]} value={tab} onChange={setTab} label="내 활동" />
<ConfirmModal tone="danger" title="질문을 삭제할까요?" message="삭제한 질문은 되돌릴 수 없어요." confirmLabel="삭제" onConfirm={remove} onCancel={close} />
<GradeIcon grade={writer.grade} />
```

- 화면별 Tailwind 설정에 있는 `brutal`, `cream`, `neoBlack` 같은 이름은 화면을 공통 값으로 바꾸면서 지운다.

## 적용 방법

1. 기준 값 반영 (한 명): `tailwind.preset.cjs`, `uiStyles.ts`, `StatusBadge.tsx`를 만든다. (#182에서 반영)
   - 칩·탭·메뉴·표·키보드 포커스 클래스, 공통 탭·확인 모달, 등급·뱃지 아이콘, 날짜 함수를 추가했다 (#186).
2. 화면 적용 (화면 담당자): 자기 화면의 요소를 위 공통 값으로 바꾼다 (#187~#190, 마무리 #191).
   - 아직 기준 적용 전인 곳 (2026-11-17 기준)
     - 로그인·회원가입·아이디·비밀번호 찾기·이용약관·개인정보처리방침 화면과 `Footer`, `LikeButton`: #189를 되돌려(#204) 예전 모양이다.
   - 앱에서 쓰지 않는 Stitch 시안 화면은 모두 지웠다 (#201, #205).
3. 새 공통 요소가 생기면 이 문서에 먼저 추가한다.
