# 홈 프로젝트 섹션: 도면형 카드

- 작성일: 2026-10-14
- 상태: 설계 승인됨(대화에서 A안 + 시안 승인), 구현 전
- 관련 문서: [2026-10-14-home-editor-hero-design.md](./2026-10-14-home-editor-hero-design.md)

## 배경

홈 첫 화면을 미니 SVG 에디터 히어로로 바꾼 뒤, 홈 하단의 프로젝트 섹션만 결이 다르다. 프로젝트별 고유색으로 꽉 채운 포스터, 섹션 뒤 색 번짐(blur glow), 그라데이션 패널이 가는 선·점 격자·모노 메타로 된 히어로와 부딪힌다.

## 목표와 성공 기준

1. 홈 프로젝트 섹션이 히어로와 같은 시각 언어(가는 선, 점 격자, 모노 메타, 절제된 색)를 쓴다.
2. 사이트 공통 규칙(카드 `rounded-[28px]` `.surface-panel`, 토큰 색, hover lift)은 유지해 다른 페이지와 이어진다.
3. 홈 본문 텍스트가 늘어난다. 직전 측정 1,658자 → 목표 2,000자 이상(히어로 명세 성공 기준 5).
4. 라이트·다크 모두 자연스럽고, 모바일 375px에서 가로 스크롤이 없다.
5. 홈에서 프로젝트 포스터 이미지 요청이 없어진다.

## 범위

- 바꾸는 것: 홈의 `LandingProjectsSection`(홈에서만 쓰임).
- 바꾸지 않는 것: `/projects`, `/about`이 쓰는 `ProjectArchiveCard`, `ProjectPoster`, `aboutData`의 데이터, 다른 페이지의 톤.
- 홈의 최근 글 카드·카테고리 칩은 이미 히어로 결에 맞아 그대로 둔다.

## 섹션 구성

- 섹션 머리: 최근 글·주제별 보기 섹션과 같은 형식. `border-t` 구분선 + `pt-10`, eyebrow `Projects`, h2 `프로젝트`. 오른쪽(모바일에서는 제목 아래)에 `전체 프로젝트 →` 링크(`/projects`, `.accent-link`).
- 기존의 `surface-panel-strong` 큰 패널, 색 번짐 div, 그라데이션 오버레이, 섹션 소개 문단은 제거한다.
- 카드 그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. 프로젝트는 지금처럼 `aboutProjects.slice(0, 3)`.

## 카드

카드 전체가 `/projects/<slug>` 링크다. `.surface-panel overflow-hidden` + `transition duration-200 ease-out hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]`.

1. **선 그림 띠**(높이 72px, 아래 `border-b`): 배경에 12px 점 격자(`--color-border`), 가운데 프로젝트 성격을 나타내는 작은 선 그림(viewBox `0 0 200 64`, `aria-hidden`).
   - 기본 선: `--color-text-primary`, 1px, `vector-effect: non-scaling-stroke`.
   - 강조선 하나: 프로젝트 고유색(`posterColor`), 1.5px.
   - 그림 종류(slug 기준, 없으면 `default`):
     - `mathcanvas` → `canvas`: 둥근 사각형 + 가운데 원(강조)
     - `nowdoboss` → `route`: 꺾은선 경로 + 경유 지점 원(강조)
     - `mancity` → `pitch`: 경기장 사각형 + 중앙선 + 센터 서클(강조)
     - 그 외 → `default`: 사각형 + 대각선(강조)
2. **본문**(`p-5`):
   - 모노 메타(`font-mono text-xs`, muted): `기간 · 팀`. 기간은 `"2024.08 - 2026.02"` → `"2024.08–2026.02"`(공백 하이픈을 en dash로). 예: `2024.08–2026.02 · 4명 · FE 3 / BE 1`.
   - 이름(`text-lg font-semibold`) 앞에 고유색 점(8px 원).
   - 한 줄 소개: `tagline`(`text-sm leading-7`, secondary).
   - 핵심 성과: `cardPoints` 앞 2개, `—` 접두 목록(`text-sm`, secondary).
   - 태그: `tags` 앞 3개를 ` · `로 이어 모노 muted로.

## 색과 다크 모드

- 고유색은 데이터(`posterColor`)라 className이 아니라 CSS 변수로 넘긴다: `style={{ "--project-color": posterColor }}`.
- 라이트: 그대로 사용. 다크: 어두운 고유색(예: `#0f766e`)이 배경에 묻히지 않도록 `color-mix(in srgb, var(--project-color) 65%, white)`로 밝힌다. `globals.css`에 `.project-accent-stroke`, `.project-accent-dot` 컴포넌트 클래스로 정의하고 `html.dark` 변형을 둔다.

## 파일

```
src/components/landing/
  LandingProjectsSection.tsx     (수정, 서버) 섹션 머리 + 그리드, 포스터·glow 제거
  LandingProjectCard.tsx         (신규, 서버) 카드 하나
  ProjectGlyph.tsx               (신규, 서버) 선 그림 SVG
  projectCard.ts                 (신규, 순수) formatProjectMeta, projectGlyphKind
scripts/landingProjectCard.test.ts (신규)
src/styles/globals.css           (수정) .project-accent-stroke, .project-accent-dot
```

- `LandingProjectsSection`의 props는 `{ projects: AboutProject[] }`로 줄인다(`sizes`는 이미지가 없어 불필요). `LandingPage`도 맞춰 수정한다.
- `projectCard.ts`는 다른 모듈을 import 하지 않는다(테스트에서 상대 경로 `.ts`로 불러옴).

## 테스트

- 단위(`scripts/landingProjectCard.test.ts`):
  - `formatProjectMeta("2024.08 - 2026.02", "4명 · FE 3 / BE 1")` → `"2024.08–2026.02 · 4명 · FE 3 / BE 1"`
  - 기간에 공백 하이픈이 없으면 그대로 둔다
  - `projectGlyphKind`: 세 slug는 각자의 종류, 모르는 slug는 `"default"`
- 빌드: `npx tsc --noEmit`, `npx eslint`, `npm run build`
- 브라우저(프로덕션 빌드): 데스크톱·모바일, 라이트·다크에서 카드 모양, hover, 링크 이동, 가로 스크롤 없음
- 측정: 홈 HTML 본문 글자 수(성공 기준 3), 홈에서 `/images/projects` 요청이 없는지(성공 기준 5)

## 범위 밖

- `/projects`, `/about` 카드 디자인 변경
- 사이트 공통 토큰(radius, shadow, chip) 변경
- 프로젝트 데이터 수정
