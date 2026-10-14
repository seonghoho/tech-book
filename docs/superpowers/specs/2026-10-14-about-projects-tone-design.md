# /about, /projects 톤 정리: 모노 메타 · teal 강조 · 카드 평탄화

- 작성일: 2026-10-14
- 상태: 방향 승인됨(대화), 구현 전
- 관련: [2026-10-14-home-editor-hero-design.md](./2026-10-14-home-editor-hero-design.md), [2026-10-14-home-projects-drafting-cards-design.md](./2026-10-14-home-projects-drafting-cards-design.md)

## 배경

홈은 에디터 히어로와 도면형 카드로 "가는 선 · 모노 메타 · teal 하나" 결을 갖게 됐다. `/about`, `/projects`, `/projects/[slug]`는 사용자가 좋아하는 레이아웃이라 구조는 유지하고, 세부 표현만 홈과 같은 언어로 맞춘다.

## 원칙

1. 레이아웃(About의 고정 프로필 + 스크롤 목차, Projects 포스터 그리드, 상세 페이지 구성)은 바꾸지 않는다.
2. 날짜·기간·라벨 같은 메타는 모노(`font-mono text-xs`, muted)로 쓴다.
3. 강조색은 teal(`--color-accent`, `--color-accent-soft`) 하나만 쓴다.
4. 카드 안에 또 카드(테두리+배경 박스)를 두지 않는다. 안쪽 박스는 구분선 목록이나 `—` 목록으로 바꾼다. 최상위 카드는 그대로 둔다.

## 변경 목록

### 공통

- `src/lib/formatPeriod.ts`(신규, import 없음): `formatPeriod(period)`.
  - 양쪽이 숫자인 `" - "`는 `"–"`: `"2024.08 - 2026.02"` → `"2024.08–2026.02"`
  - 한쪽이 숫자가 아니면 공백을 둔 en dash: `"2026.03 - 재직 중"` → `"2026.03 – 재직 중"`
  - 그 외 형식(`"2026.03"`)은 그대로
- 홈 `projectCard.ts`의 `formatProjectMeta`도 `formatPeriod`를 쓴다(동작 동일).

### `/projects` (ProjectArchiveCard, 그리드에서 쓰는 기본 모드)

- 포스터·제목은 그대로.
- 제목 아래의 연도 + 상태(`2024 Active`)를 모노 메타 `2024.08–2026.02 · Active`로 바꾼다.
- 그 아래 `tagline`을 한 줄 소개로 추가한다(`text-sm leading-6`, secondary, `line-clamp-2`, `word-break: keep-all`).
- `accentColor`를 주는 모드(현재 사용처 없음)의 배지 스타일은 건드리지 않는다.

### `/projects/[slug]` (ProjectDetailView)

- `.project-highlight-mark`(노란 형광펜) → teal: `linear-gradient(to top, var(--color-accent-soft) 42%, transparent 42%)`, 다크도 같은 토큰. 굵기는 유지.
- 상단 메타(기간 · 상태)를 모노로, 기간은 `formatPeriod`.
- Project Facts의 값(`dd`)을 모노(`font-mono text-[13px]`)로. 라벨은 그대로.

### `/about` (AboutPage)

- 프로필 카드 안 `Current / Stack / Core` 박스 3개(`surface-subtle`) → 구분선 목록(`dl`, `divide-y`, 위아래 border): 라벨은 모노 uppercase muted 왼쪽, 값은 오른쪽.
- 프로필 카드 안 `What I Focus On` 항목(테두리 박스) → 박스 없이 점 + 제목 + 설명 목록.
- Overview 옆 `Focus` 카드 안 항목 박스 → `—` 목록.
- Experience: 기간 칩(teal 배경 pill) → 모노 메타 텍스트(`formatPeriod`). 각 경력의 하이라이트 박스 그리드 → `—` 목록(2열 유지).
- Projects 섹션: `surface-panel-strong` 안의 프로젝트 카드 4개(`about-card-interactive`) → 같은 패널 안의 구분선 행(`divide-y`). 각 행은 링크, hover 시 배경 tint와 제목 teal. 기간은 모노 메타(`formatPeriod`), 오른쪽 `View →`.
- Metrics 카드, Strengths·Stack·Collaboration 섹션은 최상위 카드라 그대로.

## 테스트

- 단위: `scripts/formatPeriod.test.ts` — 숫자-숫자, 숫자-한글, 단일 값, 공백 없는 하이픈은 그대로. 기존 `scripts/landingProjectCard.test.ts` 통과 유지.
- 빌드: `npx tsc --noEmit`, `npx eslint`, `npm run build`
- 브라우저(프로덕션): `/about`, `/projects`, `/projects/mathcanvas`를 데스크톱·모바일, 라이트·다크로 확인. 가로 스크롤 없음, 다크에서 teal 형광펜 대비, 링크 동작.

## 범위 밖

- 레이아웃·섹션 순서·문구 변경
- `ProjectPoster` 디자인
- About에서 Focus 항목이 프로필 카드와 Focus 카드에 두 번 나오는 중복(구조 변경이라 별도 논의)
