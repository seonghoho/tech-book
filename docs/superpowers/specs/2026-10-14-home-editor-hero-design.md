# 홈 첫 화면 리디자인: 미니 SVG 에디터 히어로

- 작성일: 2026-10-14
- 상태: 설계 승인됨, 구현 전
- 시안: [assets/2026-10-14-home-editor-hero-mockup.html](./assets/2026-10-14-home-editor-hero-mockup.html) (브라우저로 열면 실제로 조작 가능)
- 관련 문서: [docs/adsense-approval-proposal.md](../../adsense-approval-proposal.md), [docs/seo-publishing.md](../../seo-publishing.md)

## 배경

현재 홈 첫 화면은 개인 사진 위에 "ARCHIVE" 글자를 마스크로 얹은 사진 히어로(`HeroPlayground`)다. 첫 화면에 읽을 텍스트가 거의 없어 AdSense 심사 관점에서 "포트폴리오 사이트"로 보이고, 2026-10-13에 H1을 `sr-only`로만 두는 임시 조치를 했다.

사이트의 핵심 주제(SVG 에디터, 인터랙션)를 첫 화면에서 직접 체험하게 하면서, 동시에 첫 화면부터 글이 보이는 콘텐츠 사이트 구조로 바꾼다.

## 목표와 성공 기준

1. 홈에 들어와 3초 안에 "SVG와 인터랙션을 다루는 프론트엔드 개발자의 블로그"로 읽힌다.
2. 첫 화면(데스크톱 1280×800, 모바일 375×812)에서 화면에 보이는 H1, 소개 문장, 최신 글 제목이 보인다.
3. 모바일 LCP는 현재 홈 이하, CLS는 0.02 이하. LCP 요소는 H1 텍스트다.
4. 기존 디자인 토큰(`globals.css`의 `--color-*`)과 Pretendard를 그대로 쓰고 라이트·다크 모드 모두 자연스럽다.
5. 홈 HTML의 본문 텍스트가 현재(약 1,260자)보다 늘어난다(목표 2,000자 이상, 프로젝트 섹션 포함).

## 결정 사항

| 항목 | 결정 | 이유 |
|---|---|---|
| 기존 사진 히어로 | 완전히 제거 | 첫 화면 집중, 사진 로딩 제거로 LCP 개선 |
| 히어로 내용 | 미니 SVG 에디터 | 블로그 글(선택, 좌표 변환, 리사이즈, undo/redo)을 직접 체험하는 입구. 조작이 글로 이어지는 흐름 |
| 렌더링 기술 | 인라인 SVG + Pointer Events, 의존성 추가 없음 | Three.js/GSAP 불필요. 번들과 LCP 부담 최소화 |
| H1 | 화면에 보이는 텍스트로 복원, `sr-only` H1 제거 | 숨긴 H1보다 검색·심사에 자연스러움 |
| 모바일 순서 | 텍스트(H1·소개·최신 글) → 캔버스 | 콘텐츠 우선 |
| 모션 | 첫 진입 1회: 선 그리기 + 유령 커서 시연. 사용자가 먼저 조작하면 즉시 중단 | 임팩트는 주되 콘텐츠를 가리지 않음 |
| reduced motion | 모션 없이 정지 상태로 렌더링 | 접근성 |
| 상태 저장 | 저장하지 않음. 새로고침하면 초기 배치 | 체험용 |

## 화면 구성

### 데스크톱 (≥1024px)

`grid-template-columns: 5fr 7fr`, 간격 48px, 컨테이너 `max-w-[1360px]` 안에서 히어로 최대 폭 1240px.

- **왼쪽 (텍스트)**
  - eyebrow: `Frontend · SVG · Interaction` (`.eyebrow-label`)
  - H1: "에디터를 만들며 부딪힌 문제를 **코드와 함께 기록합니다**" (뒷부분은 `--color-text-muted`), `text-wrap: balance`, `word-break: keep-all`, `clamp(30px, 3.6vw, 42px)`
  - 소개 문단 3줄: 블로그 소개 + "함께 놓인 캔버스는 글에서 다룬 선택, 좌표 변환, 리사이즈, undo/redo를 직접 만져 볼 수 있게 줄여 만든 에디터입니다."
  - 최신 글 3편: `날짜(MM.DD, 모노) | 제목` 행 목록, 각 행은 글 링크
  - "전체 글 보기 →" (`/posts`)
- **오른쪽 (에디터 프레임)**: `.surface-panel-strong` 계열 카드(rounded 28px)
  - 상단 바: 도구 버튼(선택, 되돌리기, 다시 실행) + 인스펙터(모노 12px: `id · x · y · w×h · 회전° · history N`)
  - 스테이지: `aspect-ratio: 4/3`, viewBox `0 0 600 450`, 20px 점 격자
  - 하단 힌트 바: 안내 문장 + 관련 글 링크

### 모바일 (<1024px)

세로 1열: eyebrow → H1 → 소개 → 최신 글 3편 → 전체 글 보기 → 에디터 프레임. 스테이지에 `touch-action: none`.

### 히어로 아래 (순서)

1. **최신 글 카드 4개**: 카테고리 · 날짜, 제목, description. 기존 `LandingFeaturedWritingSection`을 이 형태로 교체한다.
2. **주제별로 보기**: 카테고리 칩(`categoryMap` 라벨 + 글 수), 링크는 `/posts?category=<slug>`.
3. **프로젝트**: 기존 `LandingProjectsSection` 유지.

## 에디터 동작 명세

### 도형 모델

모든 도형을 같은 모델로 다룬다(블로그 글 "useLine 로직 통합하기"와 같은 발상).

```ts
type ShapeKind = "ellipse" | "triangle" | "line" | "rect";
type Shape = { id: string; kind: ShapeKind; x: number; y: number; w: number; h: number; r: number }; // r: 도(deg)
```

- 선분은 박스의 좌하단→우상단 대각선, 삼각형은 박스 상단 중앙·우하단·좌하단, 사각형은 `rx=14`.
- 초기 배치(시안과 동일):
  - ellipse (70, 70, 150×150, 0°)
  - triangle (330, 60, 170×150, 0°)
  - line (80, 290, 210×90, 0°)
  - rect (350, 270, 170×110, −6°)

### 조작

| 조작 | 동작 | 힌트 문장 | 연결 글 |
|---|---|---|---|
| 도형 클릭 | 선택. 점선 박스, 모서리 핸들 4개, 회전 핸들 표시 | 선택 여부를 도형에 저장하지 않고 렌더링할 때 계산합니다 | `/posts/svg-editor/svg-editor-state-boundary` |
| 도형 드래그 | 이동. 포인터 좌표는 `getScreenCTM().inverse()`로 SVG 좌표로 변환 | 화면 좌표를 SVG 좌표로 바꿔야 커서와 도형이 어긋나지 않습니다 | `/posts/svg-editor/svg-pointer-coordinate-transform` |
| 모서리 핸들 드래그 | 리사이즈. 회전된 도형도 로컬 좌표로 되돌려 계산하고, 반대쪽 모서리를 화면에서 고정한다. 최소 40px. ellipse와 Shift는 비율 유지 | 반대쪽 모서리를 고정한 채 최소 크기를 지키며 늘립니다 | `/posts/svg-editor/svg-resize-handle-constraint` |
| 회전 핸들 드래그 | 중심 기준 회전 (`atan2` + 90°), 정수 각도 | 회전 중에도 핸들과 박스가 도형과 함께 돌아갑니다 | `/posts/svg-editor/svg-editor-interaction-debugging` |
| 되돌리기/다시 실행 (버튼, ⌘/Ctrl+Z, ⇧⌘/Ctrl+Shift+Z) | 조작이 끝난 시점(pointerup)에 변경이 있으면 이전 스냅샷을 past에 push, future 초기화. 최대 30개 | 조작이 끝날 때마다 스냅샷을 남겨 되돌립니다 | `/posts/svg-editor/svg-history-snapshot-undo-redo` |
| 빈 곳 클릭 / Esc | 선택 해제 | (유지) | — |
| 방향키 (선택 상태, 스테이지 포커스) | 1px 이동, Shift+방향키 10px. 키 입력 묶음 단위로 히스토리 1개 | 이동과 같음 | 좌표 변환 글 |

- 힌트가 바뀔 때 힌트 바 배경이 `--color-accent-soft`에서 0.5초 동안 사라지는 플래시를 준다.
- 키보드 단축키는 **스테이지 또는 에디터 프레임에 포커스가 있을 때만** 동작한다. 페이지 전역 ⌘Z를 가로채지 않는다(시안과 다른 점).
- 포인터 캡처(`setPointerCapture`)로 스테이지 밖에서 놓아도 드래그가 끝나게 한다. `pointercancel`도 같은 종료 처리.
- 도형은 스테이지(0~600, 0~450) 밖으로 완전히 나가지 않도록 중심점을 viewBox 안으로 제한한다.

### 첫 진입 모션

1. 도형 4개가 `stroke-dashoffset` 애니메이션으로 120ms 간격으로 그려진다 (0.9s, `cubic-bezier(.65,0,.35,1)`).
2. 1.7초 뒤 유령 커서가 스테이지 우하단에서 삼각형으로 이동해 선택하고, 왼쪽 아래로 약 (−40, +24) 끌고 놓은 뒤 사라진다(총 1.8초). 시연이 끝나면 선택을 해제하고, 이동한 위치는 초기 배치로 되돌린다. 시연은 히스토리에 기록하지 않는다.
3. 사용자가 포인터나 키보드로 먼저 조작하면 즉시 중단한다.
4. 같은 탭 세션에서는 한 번만 재생한다(`sessionStorage`, try/catch로 실패 시 매번 재생).
5. `prefers-reduced-motion: reduce`면 1~2를 모두 건너뛴다.
6. 스테이지가 화면에 보이지 않으면(모바일에서 첫 화면 아래) `IntersectionObserver`로 처음 보일 때 시작한다.

## 컴포넌트 구조

```
src/components/landing/
  LandingPage.tsx                 (수정) 섹션 조립, sr-only H1 제거
  LandingHero.tsx                 (신규, 서버) 2열 레이아웃: 텍스트 영역 + <EditorHero />
  LandingLatestPostsSection.tsx   (신규, 서버) 최신 글 카드 4개 (LandingFeaturedWritingSection 대체)
  LandingCategoriesSection.tsx    (신규, 서버) 카테고리 칩
  editor-hero/
    EditorHero.tsx                (신규, 클라이언트 "use client") 프레임·툴바·스테이지·힌트 바, 상호작용
    useIntroMotion.ts             (신규) 첫 진입 모션 훅
    editorModel.ts                (신규, 순수 함수) 도형 기본값, 기하 계산, 히스토리 리듀서
    editorHints.ts                (신규) 조작 종류 → { 문장, 글 제목, 글 경로 }
```

- `EditorHero`는 클라이언트 컴포넌트지만 SSR로 초기 배치 SVG가 HTML에 포함된다. JS가 늦게 와도 정적 도형은 보인다.
- `editorModel.ts`는 React와 DOM에 의존하지 않는다. 함수 목록:
  - `initialShapes()`
  - `shapeCenter(s)`
  - `rotatePoint(p, c, deg)`
  - `moveShape(s, dx, dy, bounds)`
  - `resizeShape(orig, handle, pointer, opts)`: 회전 보정과 고정 모서리 처리 포함
  - `rotateShape(orig, pointer)`
  - `pushHistory`, `undo`, `redo`
- 힌트의 글 제목은 `editorHints.ts`에 하드코딩하지 않는다. 서버(`LandingHero`)에서 `getAllPosts`로 찾아 prop으로 내려 준다. 글이 없으면(삭제·비공개) 해당 힌트는 링크 없이 문장만 보여 준다.
- 스타일은 Tailwind 유틸리티와 CSS 변수로 쓴다. 도형별 색상 매핑:
  - 선: `--color-text-primary`
  - 채움: 같은 색 3.5% 투명도
  - 격자: `--color-border`
  - 핸들·선택 박스: `--color-accent`
  - 모션 keyframes는 `globals.css`에 `editor-hero-draw`, `editor-hero-flash`로 추가한다.

## 제거 대상

| 파일 | 상태 |
|---|---|
| `HeroPlayground.tsx`, `HeroPlaygroundClient.tsx`, `useArchivePosterLayout.ts`, `useHeroImageDeck.ts` | 히어로 교체로 제거 |
| `Dice.tsx` | 현재 어디서도 쓰지 않음, 제거 |
| `LandingFeaturedWritingSection.tsx`, `RecentPostsList.tsx` | 새 섹션으로 대체되면 사용처 확인 후 제거 |
| `src/lib/homeContent.ts` | `homeHeroPoster`, `homeHeroMainImages`, `homeAboutSiteCopy`, `homeTopicBlueprints` 등 홈 히어로 전용 항목 제거. 다른 사용처가 없으면 파일 삭제 |
| `public/images/` 아래 히어로 전용 사진 | 다른 페이지(About 등)에서 쓰지 않으면 제거. 쓰면 유지 |
| `Archivo_Black` 폰트 import | 히어로 제거와 함께 사라짐 |

## AdSense·SEO 체크

- 홈 초기 HTML `<head>`에 `adsbygoogle.js`가 그대로 있다(`AdsenseScript`는 `src/app/page.tsx`에서 유지).
- H1은 페이지당 1개다(새 히어로의 화면에 보이는 H1).
- 최신 글과 카드 링크는 모두 실제 `<a href>`로, 크롤러가 따라갈 수 있다.
- 캔버스 SVG는 장식이므로 `aria-hidden`이다. 에디터 프레임에는 `aria-label="직접 만져 볼 수 있는 미니 SVG 에디터"`를 둔다. 의미 있는 텍스트는 힌트 바와 소개 문단에 있다.
- 홈 metadata(title, description)는 바꾸지 않는다.

## 접근성

- 도구 버튼은 `aria-label`과 `disabled` 상태를 가진다. 선택 도구는 `aria-pressed`를 가진다.
- 스테이지는 `tabIndex=0`이고 포커스 링을 표시한다. 포커스 상태에서 방향키·Esc·undo/redo가 동작한다. Tab으로 도형을 순회하는 기능은 범위 밖이다.
- 힌트 바는 `aria-live="polite"`로 바뀐 안내를 읽어 준다.
- 색 대비: 인스펙터와 힌트 텍스트는 `--color-text-muted` 이상으로 WCAG AA를 맞춘다.

## 성능 예산

- 에디터 관련 클라이언트 JS는 gzip 기준 8KB 이하이고, 새 의존성은 0개다.
- 첫 화면에 이미지가 없다. LCP는 H1이다.
- 스테이지는 `aspect-ratio`로 크기를 예약해 CLS가 없다. 폰트는 기존 Pretendard `font-display: swap`을 쓴다.
- 포인터 이동 중에는 상태 갱신만 하고 렌더링은 React에 맡긴다. 도형 4개라 rAF 스로틀링은 필요 없다(측정 후 문제가 있을 때만 추가).

## 테스트

- **단위 테스트** (`scripts/editorHeroModel.test.ts`, 기존 `node --loader ts-node/esm --test` 방식, 상대 경로 `.ts` import)
  - 이동 시 viewBox 경계 제한
  - 회전 0°/90°/−6° 도형 리사이즈에서 고정 모서리가 화면 좌표상 제자리에 남는지
  - 최소 크기 40 보장, ellipse 비율 유지
  - 회전 각도 계산 (12시 방향 = 0°)
  - 히스토리: 변경 없는 조작은 기록하지 않음, 30개 제한, undo 후 새 조작 시 future 초기화
- **힌트 링크 검증 테스트**: `editorHints.ts`의 모든 글 경로가 `src/content/posts`에 실제로 있는지
- **빌드**: `npx tsc --noEmit`, `npx eslint`, `npm run build`
- **브라우저 확인** (프로덕션 빌드 `next start`)
  - 데스크톱 1280×800 / 모바일 375×812, 라이트·다크
  - 선택, 이동, 리사이즈, 회전, undo/redo, Esc, 방향키, 터치 드래그(모바일 에뮬레이션)
  - reduced motion 에뮬레이션에서 모션이 없는지
  - 페이지 다른 곳에서 ⌘Z를 눌러도 에디터가 반응하지 않는지
- **성능**: Lighthouse 모바일로 변경 전후 홈의 LCP, CLS, TBT를 비교해 기록한다(성공 기준 3).
- **AdSense 체크**: 홈 HTML에서 `adsbygoogle.js` 존재, `<h1>` 1개, 본문 텍스트 길이(성공 기준 5).

## 범위 밖

- 도형 추가·삭제, 새 도형 그리기 도구, 다중 선택, 저장
- Three.js 3D 교구 미니 데모
- About 페이지로 사진 히어로 이전
- 헤더·푸터 디자인 변경
