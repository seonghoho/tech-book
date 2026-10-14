# 홈 에디터 히어로 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 첫 화면의 사진 히어로(`HeroPlayground`)를 "화면에 보이는 H1 + 소개 + 최신 글 3편" 텍스트 영역과 직접 조작 가능한 미니 SVG 에디터로 바꾸고, 그 아래를 최신 글 카드·카테고리 칩·프로젝트 순서로 재구성한다.

**Architecture:** 기하 계산과 히스토리는 React·DOM에 의존하지 않는 순수 모듈(`editorModel.ts`)로 분리해 node 테스트로 검증한다. 클라이언트 컴포넌트 `EditorHero`는 Pointer Events와 인라인 SVG로 상호작용만 담당하고, 첫 진입 모션은 `useIntroMotion` 훅이 "화면에 보이는 값"만 덮어써서 히스토리·상태를 오염시키지 않는다. 글 데이터(최신 글, 힌트 링크 제목, 카테고리 수)는 모두 서버 컴포넌트에서 계산해 prop으로 내린다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v3.4 + CSS 변수, node:test + ts-node/esm.

**Spec:** [docs/superpowers/specs/2026-10-14-home-editor-hero-design.md](../specs/2026-10-14-home-editor-hero-design.md) — 실행자는 명세와 이 계획을 함께 읽는다. 동작이 애매하면 명세가 기준이다. 시안: [assets/2026-10-14-home-editor-hero-mockup.html](../specs/assets/2026-10-14-home-editor-hero-mockup.html).

## Global Constraints

- 새 npm 의존성 0개. Three.js, GSAP, @use-gesture 를 에디터에 쓰지 않는다.
- 에디터 관련 클라이언트 JS는 gzip 8KB 이하.
- 색은 `globals.css`의 `--color-*` 변수만 쓴다. className에 raw hex 금지.
- 스테이지 viewBox `0 0 600 450`, `aspect-ratio: 4/3`, 20px 점 격자.
- 초기 배치: ellipse (70, 70, 150×150, 0°) / triangle (330, 60, 170×150, 0°) / line (80, 290, 210×90, 0°) / rect (350, 270, 170×110, −6°).
- 리사이즈 최소 크기 40, 히스토리 최대 30개, 회전은 정수 각도이고 12시 방향이 0°.
- 키보드 단축키(⌘/Ctrl+Z, ⇧⌘/Ctrl+Shift+Z, Esc, 방향키)는 에디터 프레임 안에 포커스가 있을 때만 동작한다. 페이지 전역 리스너 금지.
- 첫 진입 모션은 탭 세션당 1회(`sessionStorage`, try/catch), `prefers-reduced-motion: reduce`면 생략, `IntersectionObserver`로 보일 때 시작, 사용자가 조작하면 즉시 중단, 시연은 히스토리에 남기지 않고 끝나면 초기 배치로 돌아간다.
- 홈 H1은 화면에 보이는 것 1개뿐. `sr-only` H1 제거. 홈 metadata(title, description)와 `AdsenseScript`는 그대로 둔다.
- 테스트에서 소스 모듈은 상대 경로 + `.ts` 확장자로 import 한다(`../src/.../editorModel.ts`). 테스트 대상 모듈은 다른 모듈을 import 하지 않는다.
- Tailwind가 소스 문자열을 클래스로 스캔한다. 정규식에 `[-:T]` 같은 대괄호 문자 클래스를 쓰지 않는다(빌드가 깨진 적 있음).
- 로컬 `tsconfig.json` 변경은 사용자 것이므로 커밋하지 않는다. `git add`는 항상 파일을 명시한다.
- 테스트 러너: `node --loader ts-node/esm --test scripts/<name>.test.ts`. `scripts/seo.test.ts` 1개는 원래부터 실패한다(이번 작업과 무관).
- 사용자 대상 문구는 한국어, 명세의 문장을 그대로 쓴다.

## Review Focus

1. **모바일 터치로 핸들 잡기** — 375px 폭에서 스테이지 축척이 약 0.57이라 10px 핸들은 6px도 안 된다. 핸들마다 반지름 14(viewBox 단위)의 투명 히트 영역을 둬서 손가락으로 잡힌다(Task 3에 포함, Task 7에서 모바일 에뮬레이션으로 확인).
2. **리사이즈 중 포인터가 고정 모서리를 넘어감** — 박스가 뒤집히지 않고 거리만큼(최소 40) 커지며 고정 모서리는 제자리에 있어야 한다(Task 1 테스트).
3. **도형을 스테이지 밖으로 던짐** — 중심점이 viewBox 안에 남아 다시 잡을 수 있어야 한다(Task 1 테스트).
4. **힌트가 가리키는 글이 삭제·비공개됨** — 힌트 문장은 보이고 링크만 사라진다. 깨진 링크가 렌더링되면 안 된다(Task 2 테스트).
5. **시연 도중 사용자가 조작** — 삼각형이 옮겨진 위치에 남거나 히스토리에 시연이 기록되면 안 된다. 시연은 화면 값만 덮어쓰는 구조로 막는다(Task 4 구조 + Task 7 브라우저 확인).

---

## File Structure

```
src/components/landing/
  LandingPage.tsx                     (수정) 섹션 조립, sr-only H1 제거, 폭 1240
  LandingHero.tsx                     (신규, 서버) 텍스트 영역 + <EditorHero />
  LandingLatestPostsSection.tsx       (신규, 서버) 최신 글 카드 4개
  LandingCategoriesSection.tsx        (신규, 서버) 카테고리 칩
  editor-hero/
    editorModel.ts                    (신규, 순수) 도형 기본값, 기하, 히스토리
    editorHints.ts                    (신규, 순수) 조작 종류 → 문장·글 slug, 링크 해석
    useIntroMotion.ts                 (신규) 첫 진입 모션 훅
    EditorHero.tsx                    (신규, "use client") 프레임·툴바·스테이지·힌트 바
src/assets/svg/
  CursorArrow.tsx, Undo.tsx, Redo.tsx (신규) 도구 버튼 아이콘 + index.ts 재export
src/app/page.tsx                      (수정) 전체 글 목록을 LandingPage에 전달
src/styles/globals.css                (수정) editor-hero 클래스·keyframes 추가, hero-playground-shell 제거
scripts/editorHeroModel.test.ts       (신규)
scripts/editorHeroHints.test.ts       (신규)

삭제: HeroPlayground.tsx, HeroPlaygroundClient.tsx, useArchivePosterLayout.ts, useHeroImageDeck.ts,
      Dice.tsx, LandingFeaturedWritingSection.tsx, RecentPostsList.tsx, src/lib/homeContent.ts,
      public/images/hero/*
```

---

### Task 0: 변경 전 성능 기준값 측정

명세 성공 기준 3(LCP·CLS 비교)을 위해 지금 홈을 먼저 잰다. 코드를 바꾸기 전에 해야 한다.

**Files:**
- Create: `docs/superpowers/plans/2026-10-14-home-editor-hero-metrics.md`

- [ ] **Step 1: 현재 master를 프로덕션 빌드하고 띄운다**

```bash
npm run build
npx next start -p 5175
```
(`next start`는 Bash `run_in_background`로 띄운다. 5174는 다른 dev 서버가 쓸 수 있다. 브라우저 pane의 `preview_start`는 Documents 권한 문제로 실패하니 쓰지 않는다.)

- [ ] **Step 2: Lighthouse 모바일 3회 측정**

```bash
for i in 1 2 3; do npx --yes lighthouse@12.8.2 http://localhost:5175/ --only-categories=performance --form-factor=mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-before-$i.json; done
node -e 'for (const i of [1,2,3]) { const r = require(`/tmp/lh-before-${i}.json`); const a = r.audits; console.log(i, "LCP", a["largest-contentful-paint"].numericValue.toFixed(0), "CLS", a["cumulative-layout-shift"].numericValue.toFixed(3), "TBT", a["total-blocking-time"].numericValue.toFixed(0), "LCP el", a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.nodeLabel ?? "-"); }'
```
`npx lighthouse`를 쓸 수 없으면 https://pagespeed.web.dev 에서 https://seonghoho.com 을 모바일로 측정한 값을 대신 기록한다(이 경우 Task 6의 "후" 값도 배포 후 같은 방법으로 잰다).

- [ ] **Step 3: 홈 HTML 본문 길이와 H1 개수 기록**

```bash
curl -s http://localhost:5175/ > /tmp/home-before.html
node -e 'const h=require("fs").readFileSync("/tmp/home-before.html","utf8"); const body=h.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); console.log("h1", (h.match(/<h1/g)||[]).length, "text chars", body.length, "adsbygoogle", h.includes("adsbygoogle.js"));'
```

- [ ] **Step 4: 결과를 metrics 파일에 적고 서버를 끈다**

```markdown
# 홈 에디터 히어로 성능 비교

| 측정 | LCP(ms) | CLS | TBT(ms) | LCP 요소 | H1 | 본문 글자 수 |
|---|---|---|---|---|---|---|
| 변경 전 (중앙값) | … | … | … | … | … | … |
| 변경 후 (중앙값) | | | | | | |
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-10-14-home-editor-hero-metrics.md
git commit -m "docs(plan): record home performance baseline before editor hero"
```

---

### Task 1: editorModel — 도형 기하와 히스토리

**Files:**
- Create: `src/components/landing/editor-hero/editorModel.ts`
- Test: `scripts/editorHeroModel.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces (이후 Task가 그대로 쓴다):
  - `type ShapeKind = "ellipse" | "triangle" | "line" | "rect"`
  - `type Shape = { id: string; kind: ShapeKind; x: number; y: number; w: number; h: number; r: number }`
  - `type Point = { x: number; y: number }`, `type Handle = "nw" | "ne" | "se" | "sw"`, `type Bounds = { width: number; height: number }`
  - `type History = { past: Shape[][]; present: Shape[]; future: Shape[][] }`
  - `const STAGE: Bounds` (600×450), `MIN_SIZE = 40`, `HISTORY_LIMIT = 30`
  - `initialShapes(): Shape[]`, `shapeCenter(s: Shape): Point`, `rotatePoint(p: Point, c: Point, deg: number): Point`
  - `moveShape(s: Shape, dx: number, dy: number, bounds?: Bounds): Shape`
  - `resizeShape(orig: Shape, handle: Handle, pointer: Point, opts?: { keepRatio?: boolean }): Shape`
  - `rotateShape(orig: Shape, pointer: Point): Shape`
  - `replaceShape(shapes: Shape[], next: Shape): Shape[]`, `shapesEqual(a: Shape[], b: Shape[]): boolean`
  - `createHistory(shapes?: Shape[]): History`, `pushHistory(h: History, before: Shape[]): History`, `undo(h: History): History`, `redo(h: History): History`

- [ ] **Step 1: 실패하는 테스트 작성**

`scripts/editorHeroModel.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HISTORY_LIMIT,
  MIN_SIZE,
  createHistory,
  initialShapes,
  moveShape,
  pushHistory,
  redo,
  replaceShape,
  resizeShape,
  rotatePoint,
  rotateShape,
  shapeCenter,
  undo,
  type Handle,
  type Point,
  type Shape,
} from "../src/components/landing/editor-hero/editorModel.ts";

const box = (over: Partial<Shape> = {}): Shape => ({
  id: "box",
  kind: "rect",
  x: 100,
  y: 100,
  w: 120,
  h: 80,
  r: 0,
  ...over,
});

// 핸들 반대쪽(고정) 모서리의 화면 좌표.
const OPPOSITE: Record<Handle, (s: Shape) => Point> = {
  nw: (s) => ({ x: s.x + s.w, y: s.y + s.h }),
  ne: (s) => ({ x: s.x, y: s.y + s.h }),
  se: (s) => ({ x: s.x, y: s.y }),
  sw: (s) => ({ x: s.x + s.w, y: s.y }),
};
const fixedWorld = (s: Shape, handle: Handle) => rotatePoint(OPPOSITE[handle](s), shapeCenter(s), s.r);

const assertClose = (actual: Point, expected: Point) => {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-6, `x ${actual.x} ≠ ${expected.x}`);
  assert.ok(Math.abs(actual.y - expected.y) < 1e-6, `y ${actual.y} ≠ ${expected.y}`);
};

describe("initialShapes", () => {
  it("matches the approved mockup layout", () => {
    assert.deepEqual(
      initialShapes().map(({ kind, x, y, w, h, r }) => [kind, x, y, w, h, r]),
      [
        ["ellipse", 70, 70, 150, 150, 0],
        ["triangle", 330, 60, 170, 150, 0],
        ["line", 80, 290, 210, 90, 0],
        ["rect", 350, 270, 170, 110, -6],
      ],
    );
  });

  it("returns a fresh array each call", () => {
    const a = initialShapes();
    a[0].x = 999;
    assert.equal(initialShapes()[0].x, 70);
  });
});

describe("moveShape", () => {
  it("moves by the pointer delta inside the stage", () => {
    const moved = moveShape(box(), 30, -20);
    assert.equal(moved.x, 130);
    assert.equal(moved.y, 80);
  });

  it("keeps the center inside the stage so the shape can be grabbed again", () => {
    const moved = moveShape(box(), 5000, -5000);
    assert.deepEqual(shapeCenter(moved), { x: 600, y: 0 });
    const back = moveShape(box(), -5000, 5000);
    assert.deepEqual(shapeCenter(back), { x: 0, y: 450 });
  });
});

describe("resizeShape", () => {
  for (const r of [0, 90, -6]) {
    for (const handle of ["nw", "ne", "se", "sw"] as Handle[]) {
      it(`keeps the opposite corner fixed on screen (r=${r}, ${handle})`, () => {
        const orig = box({ r });
        const next = resizeShape(orig, handle, { x: 420, y: 390 });
        assertClose(fixedWorld(next, handle), fixedWorld(orig, handle));
      });
    }
  }

  it("grows to the pointer distance in local coordinates", () => {
    const next = resizeShape(box(), "se", { x: 300, y: 260 });
    assert.equal(next.x, 100);
    assert.equal(next.y, 100);
    assert.equal(next.w, 200);
    assert.equal(next.h, 160);
  });

  it("never shrinks below the minimum size", () => {
    const next = resizeShape(box(), "se", { x: 101, y: 101 });
    assert.equal(next.w, MIN_SIZE);
    assert.equal(next.h, MIN_SIZE);
  });

  it("does not flip when the pointer crosses the fixed corner", () => {
    const orig = box();
    const next = resizeShape(orig, "se", { x: 40, y: 60 });
    assert.equal(next.w, MIN_SIZE + 20);
    assert.equal(next.h, MIN_SIZE);
    assertClose(fixedWorld(next, "se"), fixedWorld(orig, "se"));
  });

  it("keeps the aspect ratio for ellipses", () => {
    const orig = box({ kind: "ellipse", w: 150, h: 100 });
    const next = resizeShape(orig, "se", { x: 400, y: 210 });
    assert.ok(Math.abs(next.w / next.h - 1.5) < 1e-9);
  });

  it("keeps the aspect ratio when keepRatio is set (Shift)", () => {
    const next = resizeShape(box(), "se", { x: 400, y: 200 }, { keepRatio: true });
    assert.ok(Math.abs(next.w / next.h - 1.5) < 1e-9);
  });
});

describe("rotateShape", () => {
  // box() 중심은 (160, 140)
  it("treats 12 o'clock as 0°", () => {
    assert.equal(rotateShape(box(), { x: 160, y: 0 }).r, 0);
  });

  it("returns 90° at 3 o'clock and -90° at 9 o'clock", () => {
    assert.equal(rotateShape(box(), { x: 400, y: 140 }).r, 90);
    assert.equal(rotateShape(box(), { x: 0, y: 140 }).r, -90);
  });

  it("rounds to whole degrees", () => {
    assert.ok(Number.isInteger(rotateShape(box(), { x: 233, y: 17 }).r));
  });
});

describe("history", () => {
  const moved = (h: ReturnType<typeof createHistory>) =>
    replaceShape(h.present, moveShape(h.present[0], 10, 0));

  it("does not record an interaction that changed nothing", () => {
    const h = createHistory();
    assert.equal(pushHistory(h, h.present), h);
  });

  it("records the snapshot before the change and clears redo", () => {
    let h = createHistory();
    const before = h.present;
    h = { ...h, present: moved(h), future: [initialShapes()] };
    h = pushHistory(h, before);
    assert.equal(h.past.length, 1);
    assert.equal(h.past[0], before);
    assert.equal(h.future.length, 0);
  });

  it("keeps at most HISTORY_LIMIT snapshots", () => {
    let h = createHistory();
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) {
      const before = h.present;
      h = pushHistory({ ...h, present: moved(h) }, before);
    }
    assert.equal(h.past.length, HISTORY_LIMIT);
  });

  it("undoes and redoes, and a new change after undo clears the future", () => {
    let h = createHistory();
    const start = h.present;
    h = pushHistory({ ...h, present: moved(h) }, start);
    const afterMove = h.present;

    h = undo(h);
    assert.equal(h.present, start);
    assert.equal(h.future.length, 1);

    h = redo(h);
    assert.equal(h.present, afterMove);

    h = undo(h);
    const before = h.present;
    h = pushHistory({ ...h, present: moved(h) }, before);
    assert.equal(h.future.length, 0);
  });

  it("undo and redo on empty stacks return the same history", () => {
    const h = createHistory();
    assert.equal(undo(h), h);
    assert.equal(redo(h), h);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node --loader ts-node/esm --test scripts/editorHeroModel.test.ts`
Expected: FAIL — `Cannot find module .../editorModel.ts`

- [ ] **Step 3: 구현**

`src/components/landing/editor-hero/editorModel.ts`:

```ts
// 홈 히어로 미니 에디터의 순수 모델. React와 DOM에 의존하지 않는다.
// 모든 도형을 박스(x, y, w, h) + 회전(r, 도) 하나의 모델로 다룬다. 선분도 박스의 대각선이다.

export type ShapeKind = "ellipse" | "triangle" | "line" | "rect";

export type Shape = {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

export type Point = { x: number; y: number };
export type Handle = "nw" | "ne" | "se" | "sw";
export type Bounds = { width: number; height: number };
export type History = { past: Shape[][]; present: Shape[]; future: Shape[][] };

export const STAGE: Bounds = { width: 600, height: 450 };
export const MIN_SIZE = 40;
export const HISTORY_LIMIT = 30;

export function initialShapes(): Shape[] {
  return [
    { id: "circle", kind: "ellipse", x: 70, y: 70, w: 150, h: 150, r: 0 },
    { id: "triangle", kind: "triangle", x: 330, y: 60, w: 170, h: 150, r: 0 },
    { id: "line", kind: "line", x: 80, y: 290, w: 210, h: 90, r: 0 },
    { id: "rect", kind: "rect", x: 350, y: 270, w: 170, h: 110, r: -6 },
  ];
}

export function shapeCenter(s: Shape): Point {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

export function rotatePoint(p: Point, c: Point, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin,
    y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos,
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function moveShape(s: Shape, dx: number, dy: number, bounds: Bounds = STAGE): Shape {
  // 중심점을 스테이지 안으로 제한해 도형이 완전히 밖으로 나가 다시 잡을 수 없게 되는 일을 막는다.
  const cx = clamp(s.x + s.w / 2 + dx, 0, bounds.width);
  const cy = clamp(s.y + s.h / 2 + dy, 0, bounds.height);
  return { ...s, x: cx - s.w / 2, y: cy - s.h / 2 };
}

const OPPOSITE_CORNER: Record<Handle, (s: Shape) => Point> = {
  nw: (s) => ({ x: s.x + s.w, y: s.y + s.h }),
  ne: (s) => ({ x: s.x, y: s.y + s.h }),
  se: (s) => ({ x: s.x, y: s.y }),
  sw: (s) => ({ x: s.x + s.w, y: s.y }),
};

export function resizeShape(
  orig: Shape,
  handle: Handle,
  pointer: Point,
  opts: { keepRatio?: boolean } = {},
): Shape {
  const center = shapeCenter(orig);
  // 회전된 도형도 포인터를 로컬 좌표로 되돌려 계산한다.
  const local = rotatePoint(pointer, center, -orig.r);
  const fixed = OPPOSITE_CORNER[handle](orig);

  let w = Math.max(MIN_SIZE, Math.abs(local.x - fixed.x));
  let h = Math.max(MIN_SIZE, Math.abs(local.y - fixed.y));
  if (opts.keepRatio || orig.kind === "ellipse") {
    const k = Math.max(w / orig.w, h / orig.h);
    w = orig.w * k;
    h = orig.h * k;
  }

  let x = handle.includes("w") ? fixed.x - w : fixed.x;
  let y = handle.includes("n") ? fixed.y - h : fixed.y;

  // 박스가 바뀌면 회전 중심도 바뀐다. 고정 모서리가 화면에서 제자리에 남도록 박스를 평행 이동한다.
  const before = rotatePoint(fixed, center, orig.r);
  const after = rotatePoint(fixed, { x: x + w / 2, y: y + h / 2 }, orig.r);
  x += before.x - after.x;
  y += before.y - after.y;

  return { ...orig, x, y, w, h };
}

const normalizeAngle = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export function rotateShape(orig: Shape, pointer: Point): Shape {
  const c = shapeCenter(orig);
  // atan2는 3시 방향이 0°라서 90°를 더해 12시 방향을 0°로 맞춘다.
  const deg = Math.round((Math.atan2(pointer.y - c.y, pointer.x - c.x) * 180) / Math.PI + 90);
  return { ...orig, r: normalizeAngle(deg) };
}

export function replaceShape(shapes: Shape[], next: Shape): Shape[] {
  return shapes.map((s) => (s.id === next.id ? next : s));
}

export function shapesEqual(a: Shape[], b: Shape[]): boolean {
  return (
    a.length === b.length &&
    a.every((s, i) => {
      const o = b[i];
      return s.id === o.id && s.x === o.x && s.y === o.y && s.w === o.w && s.h === o.h && s.r === o.r;
    })
  );
}

export function createHistory(shapes: Shape[] = initialShapes()): History {
  return { past: [], present: shapes, future: [] };
}

// 조작이 끝난 시점에 호출한다. 조작 전 스냅샷(before)과 지금이 같으면 기록하지 않는다.
export function pushHistory(h: History, before: Shape[]): History {
  if (shapesEqual(before, h.present)) return h;
  return { past: [...h.past, before].slice(-HISTORY_LIMIT), present: h.present, future: [] };
}

export function undo(h: History): History {
  if (!h.past.length) return h;
  return {
    past: h.past.slice(0, -1),
    present: h.past[h.past.length - 1],
    future: [...h.future, h.present],
  };
}

export function redo(h: History): History {
  if (!h.future.length) return h;
  return {
    past: [...h.past, h.present].slice(-HISTORY_LIMIT),
    present: h.future[h.future.length - 1],
    future: h.future.slice(0, -1),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --loader ts-node/esm --test scripts/editorHeroModel.test.ts`
Expected: PASS (전부 ok, fail 0)

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/editor-hero/editorModel.ts scripts/editorHeroModel.test.ts
git commit -m "feat(home): add pure geometry and history model for editor hero"
```

---

### Task 2: editorHints — 조작별 안내 문장과 글 링크

**Files:**
- Create: `src/components/landing/editor-hero/editorHints.ts`
- Test: `scripts/editorHeroHints.test.ts`

**Interfaces:**
- Consumes: 없음 (다른 모듈 import 금지 — 테스트가 상대 경로로 바로 불러온다)
- Produces:
  - `type HintKind = "idle" | "select" | "move" | "resize" | "rotate" | "undo"`
  - `type EditorHint = { message: string; postSlug?: string }`
  - `const editorHints: Record<HintKind, EditorHint>`
  - `type HintPostLink = { title: string; href: string }`, `type HintPostLinks = Partial<Record<HintKind, HintPostLink>>`
  - `resolveHintPosts(posts: Array<{ slug: string; title: string }>): HintPostLinks`

- [ ] **Step 1: 실패하는 테스트 작성**

`scripts/editorHeroHints.test.ts`:

```ts
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { editorHints, resolveHintPosts } from "../src/components/landing/editor-hero/editorHints.ts";

const postsDir = path.join(process.cwd(), "src", "content", "posts");

describe("editor hero hints", () => {
  it("points every hint at a post that exists in src/content/posts", () => {
    for (const [kind, hint] of Object.entries(editorHints)) {
      if (!hint.postSlug) continue;
      assert.ok(
        fs.existsSync(path.join(postsDir, `${hint.postSlug}.md`)),
        `${kind} → ${hint.postSlug}.md 가 없습니다`,
      );
    }
  });

  it("resolves titles and hrefs from the given post list", () => {
    const links = resolveHintPosts([
      { slug: "svg-editor/svg-history-snapshot-undo-redo", title: "스냅샷 글" },
    ]);
    assert.deepEqual(links.undo, {
      title: "스냅샷 글",
      href: "/posts/svg-editor/svg-history-snapshot-undo-redo",
    });
  });

  it("drops the link when the post is missing (deleted or unpublished)", () => {
    const links = resolveHintPosts([]);
    assert.equal(links.select, undefined);
    assert.equal(links.idle, undefined);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node --loader ts-node/esm --test scripts/editorHeroHints.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 구현**

`src/components/landing/editor-hero/editorHints.ts`:

```ts
// 에디터 조작 종류 → 힌트 바 문장과 관련 글 slug.
// 글 제목은 여기 하드코딩하지 않고 서버에서 실제 글 목록으로 찾는다(resolveHintPosts).

export type HintKind = "idle" | "select" | "move" | "resize" | "rotate" | "undo";

export type EditorHint = { message: string; postSlug?: string };

export const editorHints: Record<HintKind, EditorHint> = {
  idle: { message: "도형을 클릭하고 끌어 보세요. 핸들로 크기와 회전도 바꿀 수 있습니다." },
  select: {
    message: "선택 여부를 도형에 저장하지 않고 렌더링할 때 계산합니다",
    postSlug: "svg-editor/svg-editor-state-boundary",
  },
  move: {
    message: "화면 좌표를 SVG 좌표로 바꿔야 커서와 도형이 어긋나지 않습니다",
    postSlug: "svg-editor/svg-pointer-coordinate-transform",
  },
  resize: {
    message: "반대쪽 모서리를 고정한 채 최소 크기를 지키며 늘립니다",
    postSlug: "svg-editor/svg-resize-handle-constraint",
  },
  rotate: {
    message: "회전 중에도 핸들과 박스가 도형과 함께 돌아갑니다",
    postSlug: "svg-editor/svg-editor-interaction-debugging",
  },
  undo: {
    message: "조작이 끝날 때마다 스냅샷을 남겨 되돌립니다",
    postSlug: "svg-editor/svg-history-snapshot-undo-redo",
  },
};

export type HintPostLink = { title: string; href: string };
export type HintPostLinks = Partial<Record<HintKind, HintPostLink>>;

// 글이 목록에 없으면(삭제·비공개) 그 힌트는 링크 없이 문장만 보이게 한다.
export function resolveHintPosts(posts: Array<{ slug: string; title: string }>): HintPostLinks {
  const titleBySlug = new Map(posts.map((post) => [post.slug, post.title]));
  const links: HintPostLinks = {};
  for (const [kind, hint] of Object.entries(editorHints) as Array<[HintKind, EditorHint]>) {
    const title = hint.postSlug ? titleBySlug.get(hint.postSlug) : undefined;
    if (hint.postSlug && title) links[kind] = { title, href: `/posts/${hint.postSlug}` };
  }
  return links;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --loader ts-node/esm --test scripts/editorHeroHints.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/editor-hero/editorHints.ts scripts/editorHeroHints.test.ts
git commit -m "feat(home): map editor hero interactions to related posts"
```

---

### Task 3: EditorHero — 프레임, 스테이지, 상호작용

모션 없이 완전히 동작하는 에디터를 만든다. 모션 관련 코드는 넣지 않고 Task 4에서 추가한다.

**Files:**
- Create: `src/components/landing/editor-hero/EditorHero.tsx`
- Create: `src/assets/svg/CursorArrow.tsx`, `src/assets/svg/Undo.tsx`, `src/assets/svg/Redo.tsx`
- Modify: `src/assets/svg/index.ts` (재export 3줄 추가)
- Modify: `src/styles/globals.css` (`@layer components` 끝에 editor-hero 클래스, 파일 끝 애니메이션 영역에 keyframes)

**Interfaces:**
- Consumes: Task 1의 `createHistory, moveShape, pushHistory, redo, replaceShape, resizeShape, rotateShape, shapeCenter, undo, STAGE, Handle, Point, Shape`; Task 2의 `editorHints, HintKind, HintPostLinks`
- Produces: `export default function EditorHero(props: { hintPosts: HintPostLinks }): JSX.Element` (`"use client"`), CSS 클래스 `editor-hero-shape`, `editor-hero-shape-line`, `editor-hero-dot`, `editor-hero-selection`, `editor-hero-stem`, `editor-hero-handle`, `editor-hero-hit`, `editor-hero-ghost`, `editor-hero-drawing`, `editor-hero-flash`

- [ ] **Step 1: 아이콘 3개 추가**

`src/assets/svg/CursorArrow.tsx`:

```tsx
import { SVGProps } from "react";

export const CursorArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 2l9 5-4 1.2L6.5 13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
```

`src/assets/svg/Undo.tsx`:

```tsx
import { SVGProps } from "react";

export const Undo = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M5 4L2 7l3 3M2.5 7H10a3.5 3.5 0 010 7H7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

`src/assets/svg/Redo.tsx`:

```tsx
import { SVGProps } from "react";

export const Redo = (props: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M11 4l3 3-3 3M13.5 7H6a3.5 3.5 0 000 7h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
```

`src/assets/svg/index.ts` 끝에 추가:

```ts
export { CursorArrow as CursorArrowIcon } from "@/assets/svg/CursorArrow";
export { Undo as UndoIcon } from "@/assets/svg/Undo";
export { Redo as RedoIcon } from "@/assets/svg/Redo";
```

- [ ] **Step 2: globals.css에 에디터 스타일 추가**

`@layer components { … }` 블록의 닫는 `}` 바로 앞에 추가:

```css
  /* 홈 미니 SVG 에디터 */
  .editor-hero-shape {
    fill: color-mix(in srgb, var(--color-text-primary) 3.5%, transparent);
    stroke: var(--color-text-primary);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
    cursor: move;
    transition: stroke 150ms ease-out;
  }

  .editor-hero-shape:hover {
    stroke: var(--color-accent);
  }

  .editor-hero-shape-line {
    stroke-width: 2;
    stroke-linecap: round;
  }

  .editor-hero-dot {
    fill: var(--color-border);
  }

  .editor-hero-selection,
  .editor-hero-stem {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
  }

  .editor-hero-selection {
    stroke-dasharray: 4 4;
  }

  .editor-hero-handle {
    fill: var(--color-surface);
    stroke: var(--color-accent);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
  }

  /* 핸들은 작게 보이되, 손가락으로도 잡히도록 투명한 히트 영역을 따로 둔다. */
  .editor-hero-hit {
    fill: transparent;
  }

  .editor-hero-ghost {
    fill: var(--color-text-primary);
    stroke: var(--color-surface);
    stroke-width: 1.2;
    stroke-linejoin: round;
  }

  .editor-hero-drawing .editor-hero-shape {
    stroke-dasharray: var(--len);
    stroke-dashoffset: var(--len);
    fill-opacity: 0;
    animation: editor-hero-draw 0.9s cubic-bezier(0.65, 0, 0.35, 1) var(--d, 0ms) forwards;
  }

  .editor-hero-flash {
    animation: editor-hero-flash 0.5s ease-out;
  }
```

파일 끝의 `/* 애니메이션 */` 영역에 추가:

```css
@keyframes editor-hero-draw {
  to {
    stroke-dashoffset: 0;
    fill-opacity: 1;
  }
}

@keyframes editor-hero-flash {
  from {
    background-color: var(--color-accent-soft);
  }
  to {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-hero-drawing .editor-hero-shape,
  .editor-hero-flash {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    fill-opacity: 1;
  }
}
```

- [ ] **Step 3: EditorHero 구현**

`src/components/landing/editor-hero/EditorHero.tsx`:

```tsx
"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { CursorArrowIcon, RedoIcon, UndoIcon } from "@/assets/svg";
import {
  STAGE,
  createHistory,
  moveShape,
  pushHistory,
  redo,
  replaceShape,
  resizeShape,
  rotateShape,
  shapeCenter,
  undo,
  type Handle,
  type Point,
  type Shape,
} from "./editorModel";
import { editorHints, type HintKind, type HintPostLinks } from "./editorHints";

type Props = {
  hintPosts: HintPostLinks;
};

type Drag = {
  mode: "move" | "resize" | "rotate";
  handle?: Handle;
  start: Point;
  orig: Shape;
  before: Shape[];
  announced: boolean;
};

const ARROW_STEP: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};
// 방향키를 이 시간 안에 이어 누르면 히스토리 1개로 묶는다.
const KEY_BURST_MS = 400;
const HANDLE_GAP = 6;
const HIT_RADIUS = 14;

function ShapeNode({ shape }: { shape: Shape }) {
  const c = shapeCenter(shape);
  const common = {
    "data-shape-id": shape.id,
    className: shape.kind === "line" ? "editor-hero-shape editor-hero-shape-line" : "editor-hero-shape",
    transform: `rotate(${shape.r} ${c.x} ${c.y})`,
  };

  if (shape.kind === "ellipse") {
    return <ellipse {...common} cx={c.x} cy={c.y} rx={shape.w / 2} ry={shape.h / 2} />;
  }
  if (shape.kind === "rect") {
    return <rect {...common} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={14} />;
  }
  if (shape.kind === "triangle") {
    const points = `${shape.x + shape.w / 2},${shape.y} ${shape.x + shape.w},${shape.y + shape.h} ${shape.x},${shape.y + shape.h}`;
    return <polygon {...common} points={points} />;
  }
  return <line {...common} x1={shape.x} y1={shape.y + shape.h} x2={shape.x + shape.w} y2={shape.y} />;
}

function SelectionOverlay({ shape }: { shape: Shape }) {
  const c = shapeCenter(shape);
  const g = HANDLE_GAP;
  const corners: Array<[Handle, number, number]> = [
    ["nw", shape.x - g, shape.y - g],
    ["ne", shape.x + shape.w + g, shape.y - g],
    ["se", shape.x + shape.w + g, shape.y + shape.h + g],
    ["sw", shape.x - g, shape.y + shape.h + g],
  ];

  // 선택 박스와 핸들을 도형과 같은 회전으로 감싸서 함께 돌게 한다.
  return (
    <g transform={`rotate(${shape.r} ${c.x} ${c.y})`}>
      <rect
        className="editor-hero-selection"
        x={shape.x - g}
        y={shape.y - g}
        width={shape.w + g * 2}
        height={shape.h + g * 2}
      />
      <line className="editor-hero-stem" x1={c.x} y1={shape.y - g} x2={c.x} y2={shape.y - 32} />
      <circle className="editor-hero-hit cursor-grab" data-handle="rotate" cx={c.x} cy={shape.y - 38} r={HIT_RADIUS} />
      <circle className="editor-hero-handle" cx={c.x} cy={shape.y - 38} r={6} />
      {corners.map(([handle, x, y]) => (
        <g key={handle}>
          <circle
            className={`editor-hero-hit ${handle === "nw" || handle === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
            data-handle={handle}
            cx={x}
            cy={y}
            r={HIT_RADIUS}
          />
          <rect className="editor-hero-handle" x={x - 5} y={y - 5} width={10} height={10} rx={2} />
        </g>
      ))}
    </g>
  );
}

function ToolButton({
  label,
  title,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  title: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-[10px] border border-transparent text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out enabled:hover:border-[color:var(--color-border)] disabled:cursor-default disabled:opacity-40 aria-pressed:bg-[color:var(--color-accent-soft)] aria-pressed:text-[color:var(--color-accent)]"
    >
      {children}
    </button>
  );
}

export default function EditorHero({ hintPosts }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const burstBeforeRef = useRef<Shape[] | null>(null);
  const burstTimerRef = useRef(0);

  const [history, setHistory] = useState(createHistory);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState<{ kind: HintKind; nonce: number }>({ kind: "idle", nonce: 0 });

  const announce = useCallback((kind: HintKind) => {
    setHint((current) => ({ kind, nonce: current.nonce + 1 }));
  }, []);

  const flushKeyBurst = useCallback(() => {
    window.clearTimeout(burstTimerRef.current);
    const before = burstBeforeRef.current;
    if (!before) return;
    burstBeforeRef.current = null;
    setHistory((h) => pushHistory(h, before));
  }, []);

  useEffect(() => () => window.clearTimeout(burstTimerRef.current), []);

  const shapes = history.present;
  const selected = shapes.find((s) => s.id === selectedId) ?? null;

  function toSvgPoint(e: PointerEvent<SVGSVGElement>): Point | null {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    // 화면 좌표를 viewBox 좌표로 바꿔야 스테이지 크기가 달라도 커서와 도형이 어긋나지 않는다.
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
  }

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    flushKeyBurst();
    stageRef.current?.focus({ preventScroll: true });
    const p = toSvgPoint(e);
    if (!p) return;

    const target = e.target as Element;
    const handle = target.getAttribute("data-handle");
    const id = target.getAttribute("data-shape-id");

    if (handle && selected) {
      dragRef.current =
        handle === "rotate"
          ? { mode: "rotate", start: p, orig: selected, before: shapes, announced: false }
          : { mode: "resize", handle: handle as Handle, start: p, orig: selected, before: shapes, announced: false };
    } else if (id) {
      const shape = shapes.find((s) => s.id === id);
      if (!shape) return;
      if (id !== selectedId) announce("select");
      setSelectedId(id);
      dragRef.current = { mode: "move", start: p, orig: shape, before: shapes, announced: false };
    } else {
      setSelectedId(null);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toSvgPoint(e);
    if (!p) return;

    let next: Shape;
    if (drag.mode === "move") next = moveShape(drag.orig, p.x - drag.start.x, p.y - drag.start.y);
    else if (drag.mode === "rotate") next = rotateShape(drag.orig, p);
    else next = resizeShape(drag.orig, drag.handle as Handle, p, { keepRatio: e.shiftKey });

    if (!drag.announced) {
      drag.announced = true;
      announce(drag.mode);
    }
    setHistory((h) => ({ ...h, present: replaceShape(h.present, next) }));
  }

  // pointerup과 pointercancel 모두 여기서 끝낸다. 변경이 있을 때만 히스토리에 남는다.
  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setHistory((h) => pushHistory(h, drag.before));
  }

  function handleUndo() {
    if (!history.past.length && !burstBeforeRef.current) return;
    flushKeyBurst();
    setHistory((h) => undo(h));
    announce("undo");
  }

  function handleRedo() {
    if (!history.future.length || burstBeforeRef.current) return;
    setHistory((h) => redo(h));
    announce("undo");
  }

  // 프레임 안에 포커스가 있을 때만 받는다. 페이지 전역 ⌘Z는 가로채지 않는다.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
      return;
    }
    if (e.key === "Escape") {
      setSelectedId(null);
      return;
    }

    const step = ARROW_STEP[e.key];
    if (!step || !selectedId) return;
    e.preventDefault();
    const scale = e.shiftKey ? 10 : 1;
    if (!burstBeforeRef.current) {
      burstBeforeRef.current = history.present;
      announce("move");
    }
    setHistory((h) => {
      const shape = h.present.find((s) => s.id === selectedId);
      return shape
        ? { ...h, present: replaceShape(h.present, moveShape(shape, step.x * scale, step.y * scale)) }
        : h;
    });
    window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(flushKeyBurst, KEY_BURST_MS);
  }

  const hintCopy = editorHints[hint.kind];
  const hintPost = hintPosts[hint.kind];
  const strong = "font-medium text-[color:var(--color-text-primary)]";

  return (
    <div
      role="group"
      aria-label="직접 만져 볼 수 있는 미니 SVG 에디터"
      onKeyDown={handleKeyDown}
      className="surface-panel flex min-w-0 flex-col overflow-hidden shadow-[var(--shadow-medium)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3.5 py-2.5">
        <div className="flex shrink-0 gap-1">
          <ToolButton label="선택 도구" title="선택" pressed>
            <CursorArrowIcon />
          </ToolButton>
          <ToolButton label="되돌리기" title="되돌리기 (⌘Z)" disabled={!history.past.length} onClick={handleUndo}>
            <UndoIcon />
          </ToolButton>
          <ToolButton label="다시 실행" title="다시 실행 (⇧⌘Z)" disabled={!history.future.length} onClick={handleRedo}>
            <RedoIcon />
          </ToolButton>
        </div>
        <p className="min-w-0 truncate font-mono text-xs text-[color:var(--color-text-muted)]">
          {selected ? (
            <>
              {selected.id} · x <b className={strong}>{Math.round(selected.x)}</b> y{" "}
              <b className={strong}>{Math.round(selected.y)}</b> · {Math.round(selected.w)}×
              {Math.round(selected.h)} · {Math.round(selected.r)}° · history{" "}
              <b className={strong}>{history.past.length}</b>
            </>
          ) : (
            <>
              선택 없음 · history <b className={strong}>{history.past.length}</b>
            </>
          )}
        </p>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        aria-label="에디터 캔버스. 도형을 선택한 뒤 방향키로 옮길 수 있습니다."
        className="relative aspect-[4/3] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--color-accent)]"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <pattern id="editor-hero-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle className="editor-hero-dot" cx="1" cy="1" r="1" />
            </pattern>
          </defs>
          <rect width={STAGE.width} height={STAGE.height} fill="url(#editor-hero-dots)" />
          <g>
            {shapes.map((shape) => (
              <ShapeNode key={shape.id} shape={shape} />
            ))}
          </g>
          {selected ? <SelectionOverlay shape={selected} /> : null}
        </svg>
      </div>

      <div aria-live="polite" className="border-t border-[color:var(--color-border)]">
        {/* key가 바뀌면 다시 마운트되어 플래시 애니메이션이 매번 처음부터 재생된다. */}
        <div
          key={hint.nonce}
          className={`flex min-h-[48px] flex-col items-start gap-1 px-4 py-3 text-[13px] text-[color:var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${hint.nonce ? "editor-hero-flash" : ""}`}
        >
          <span className="min-w-0 [word-break:keep-all] sm:truncate">{hintCopy.message}</span>
          {hintPost ? (
            <Link href={hintPost.href} className="accent-link max-w-full truncate font-semibold sm:max-w-[50%]">
              {hintPost.title} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 타입·린트 확인**

Run: `npx tsc --noEmit -p . && npx eslint src/components/landing/editor-hero src/assets/svg`
Expected: 에러 0 (tsc는 기존 에러가 있다면 이번 파일 관련 에러가 없는지만 본다)

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/editor-hero/EditorHero.tsx src/assets/svg/CursorArrow.tsx src/assets/svg/Undo.tsx src/assets/svg/Redo.tsx src/assets/svg/index.ts src/styles/globals.css
git commit -m "feat(home): add interactive mini SVG editor for the home hero"
```

(아직 홈에 연결되지 않았다. 화면 확인은 Task 5 이후.)

---

### Task 4: useIntroMotion — 첫 진입 모션

**Files:**
- Create: `src/components/landing/editor-hero/useIntroMotion.ts`
- Modify: `src/components/landing/editor-hero/EditorHero.tsx`

**Interfaces:**
- Consumes: Task 1의 `initialShapes, Point`
- Produces:
  - `type IntroState = { drawing: boolean; ghost: Point | null; demoSelected: boolean; demoOffset: Point }`
  - `useIntroMotion(stageRef: RefObject<HTMLElement | null>, svgRef: RefObject<SVGSVGElement | null>): { intro: IntroState; stopIntro: () => void }`
  - 훅은 도형 노드를 `[data-shape-id]`로 찾는다(Task 3의 `ShapeNode`가 붙인 속성).

설계 메모: 시연은 `history`를 건드리지 않는다. 훅은 "삼각형을 얼마나 옮겨 보일지(demoOffset)"와 "선택된 것처럼 보일지(demoSelected)"만 내보내고, `EditorHero`가 렌더링할 때만 덮어쓴다. 그래서 시연이 끝나거나 중단되면 자동으로 초기 배치로 돌아오고 히스토리에 남지 않는다.

- [ ] **Step 1: 훅 구현**

`src/components/landing/editor-hero/useIntroMotion.ts`:

```ts
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { initialShapes, type Point } from "./editorModel";

export type IntroState = {
  drawing: boolean;
  ghost: Point | null;
  demoSelected: boolean;
  demoOffset: Point;
};

const STORAGE_KEY = "editor-hero-intro-played";
const DRAW_MS = 1500;
const DEMO_DELAY_MS = 1700;
const DEMO_MS = 1800;
const DRAW_STAGGER_MS = 120;
const GHOST_START: Point = { x: 560, y: 420 };
const DRAG_BY: Point = { x: -40, y: 24 };
const IDLE: IntroState = { drawing: false, ghost: null, demoSelected: false, demoOffset: { x: 0, y: 0 } };

function hasPlayed() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 저장이 막힌 환경이면 매번 재생한다.
  }
}

const easeOut = (k: number) => 1 - (1 - k) ** 3;
const lerp = (a: Point, b: Point, k: number): Point => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

export function useIntroMotion(
  stageRef: RefObject<HTMLElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) {
  const [intro, setIntro] = useState<IntroState>(IDLE);
  const stoppedRef = useRef(false);
  const cleanupRef = useRef<() => void>(() => {});

  // 사용자가 포인터나 키보드로 먼저 조작하면 즉시 멈추고 정지 상태로 돌린다.
  const stopIntro = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    cleanupRef.current();
    setIntro(IDLE);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (
      !stage ||
      stoppedRef.current ||
      hasPlayed() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      stoppedRef.current = true;
      return;
    }

    const timers: number[] = [];
    let raf = 0;

    const start = () => {
      markPlayed();
      svgRef.current?.querySelectorAll<SVGGeometryElement>("[data-shape-id]").forEach((node, i) => {
        node.style.setProperty("--len", String(Math.ceil(node.getTotalLength())));
        node.style.setProperty("--d", `${i * DRAW_STAGGER_MS}ms`);
      });
      setIntro({ ...IDLE, drawing: true });
      timers.push(window.setTimeout(() => setIntro((s) => ({ ...s, drawing: false })), DRAW_MS));

      timers.push(
        window.setTimeout(() => {
          const triangle = initialShapes().find((s) => s.kind === "triangle");
          if (!triangle) return;
          const grab = { x: triangle.x + triangle.w / 2, y: triangle.y + triangle.h * 0.6 };
          const t0 = performance.now();

          const step = (now: number) => {
            const k = (now - t0) / DEMO_MS;
            if (k >= 0.9) {
              stoppedRef.current = true;
              setIntro(IDLE);
              return;
            }
            if (k < 0.45) {
              setIntro({ ...IDLE, ghost: lerp(GHOST_START, grab, easeOut(k / 0.45)) });
            } else if (k < 0.5) {
              setIntro({ ...IDLE, ghost: grab, demoSelected: true });
            } else {
              const q = easeOut((k - 0.5) / 0.4);
              const offset = { x: DRAG_BY.x * q, y: DRAG_BY.y * q };
              setIntro({
                ...IDLE,
                ghost: { x: grab.x + offset.x, y: grab.y + offset.y },
                demoSelected: true,
                demoOffset: offset,
              });
            }
            raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }, DEMO_DELAY_MS),
      );
    };

    // 모바일에서는 스테이지가 첫 화면 아래에 있으니 처음 보일 때 시작한다.
    const observer = new IntersectionObserver(
      (entries) => {
        if (stoppedRef.current || !entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.4 },
    );
    observer.observe(stage);

    cleanupRef.current = () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
    };
    return () => cleanupRef.current();
  }, [stageRef, svgRef]);

  return { intro, stopIntro };
}
```

- [ ] **Step 2: EditorHero에 연결**

`EditorHero.tsx`에서:

1. import 추가:

```tsx
import { useIntroMotion } from "./useIntroMotion";
```

2. `const [hint, setHint] = …` 아래에 추가:

```tsx
  const { intro, stopIntro } = useIntroMotion(stageRef, svgRef);
```

3. `const shapes = history.present;` 와 `const selected = …` 두 줄을 다음으로 교체:

```tsx
  // 시연은 상태를 건드리지 않고 화면에 보이는 값만 덮어쓴다. 그래서 히스토리에 남지 않고 끝나면 제자리로 돌아온다.
  const demoMoving = intro.demoOffset.x !== 0 || intro.demoOffset.y !== 0;
  const shapes = demoMoving
    ? history.present.map((s) =>
        s.id === "triangle" ? { ...s, x: s.x + intro.demoOffset.x, y: s.y + intro.demoOffset.y } : s,
      )
    : history.present;
  const selected = shapes.find((s) => s.id === (intro.demoSelected ? "triangle" : selectedId)) ?? null;
```

4. `handlePointerDown` 첫 줄에 `stopIntro();` 추가. 그리고 같은 함수 안에서 드래그 기준을 화면값이 아닌 실제 상태로 잡도록, `shapes`를 쓰던 세 군데(`before: shapes`, `shapes.find((s) => s.id === id)`)와 `selected`를 다음처럼 바꾼다. 함수 시작부에 지역 변수 두 개를 둔다:

```tsx
  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    stopIntro();
    flushKeyBurst();
    stageRef.current?.focus({ preventScroll: true });
    const p = toSvgPoint(e);
    if (!p) return;

    const current = history.present;
    const currentSelected = current.find((s) => s.id === selectedId) ?? null;
    const target = e.target as Element;
    const handle = target.getAttribute("data-handle");
    const id = target.getAttribute("data-shape-id");

    if (handle && currentSelected) {
      dragRef.current =
        handle === "rotate"
          ? { mode: "rotate", start: p, orig: currentSelected, before: current, announced: false }
          : { mode: "resize", handle: handle as Handle, start: p, orig: currentSelected, before: current, announced: false };
    } else if (id) {
      const shape = current.find((s) => s.id === id);
      if (!shape) return;
      if (id !== selectedId) announce("select");
      setSelectedId(id);
      dragRef.current = { mode: "move", start: p, orig: shape, before: current, announced: false };
    } else {
      setSelectedId(null);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }
```

5. `handleKeyDown` 맨 앞에 추가(처리하는 키일 때만 멈춘다):

```tsx
    const handled =
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") || e.key === "Escape" || e.key in ARROW_STEP;
    if (handled) stopIntro();
```

6. 스테이지 `<svg>`의 className을 그리기 상태에 맞게 바꾼다:

```tsx
          className={`absolute inset-0 block h-full w-full ${intro.drawing ? "editor-hero-drawing" : ""}`}
```

7. 스테이지 `</svg>` 바로 뒤(스테이지 div 안)에 유령 커서를 추가한다. 위치는 viewBox 비율로 계산해 화면 크기와 무관하게 맞춘다:

```tsx
        {intro.ghost ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 18 18"
            className="pointer-events-none absolute z-[2] h-[18px] w-[18px]"
            style={{
              left: `${(intro.ghost.x / STAGE.width) * 100}%`,
              top: `${(intro.ghost.y / STAGE.height) * 100}%`,
            }}
          >
            <path className="editor-hero-ghost" d="M2 1l13 7-6 1.6L6.4 16z" />
          </svg>
        ) : null}
```

- [ ] **Step 3: 타입·린트 확인**

Run: `npx tsc --noEmit -p . && npx eslint src/components/landing/editor-hero`
Expected: 에러 0

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/editor-hero/useIntroMotion.ts src/components/landing/editor-hero/EditorHero.tsx
git commit -m "feat(home): play editor hero draw-in and ghost cursor once per session"
```

---

### Task 5: 홈 조립 — 히어로, 최신 글 카드, 카테고리 칩

**Files:**
- Create: `src/components/landing/LandingHero.tsx`
- Create: `src/components/landing/LandingLatestPostsSection.tsx`
- Create: `src/components/landing/LandingCategoriesSection.tsx`
- Modify: `src/components/landing/LandingPage.tsx` (전체 교체)
- Modify: `src/app/page.tsx:19-30`

**Interfaces:**
- Consumes: Task 2의 `resolveHintPosts`, Task 3의 `EditorHero`, 기존 `categoryMap`, `formatDate`, `PostMeta`, `aboutProjects`, `LandingProjectsSection`
- Produces: `LandingPage({ posts }: { posts: PostMeta[] })` — `posts`는 색인 대상 글 전체, 최신순 정렬

- [ ] **Step 1: LandingHero**

`src/components/landing/LandingHero.tsx`:

```tsx
import Link from "next/link";
import EditorHero from "@/components/landing/editor-hero/EditorHero";
import { resolveHintPosts } from "@/components/landing/editor-hero/editorHints";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

// "2026-10-13" → "10.13"
function toMonthDay(date: string) {
  const [, month, day] = date.split("-");
  return month && day ? `${month}.${day.slice(0, 2)}` : date;
}

export default function LandingHero({ posts }: Props) {
  const latestPosts = posts.slice(0, 3);
  const hintPosts = resolveHintPosts(posts);

  return (
    <section className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pt-4">
      <div className="min-w-0">
        <p className="eyebrow-label">Frontend · SVG · Interaction</p>
        <h1 className="mt-3.5 text-[clamp(30px,3.6vw,42px)] font-bold leading-[1.22] tracking-[-0.045em] text-[color:var(--color-text-primary)] [text-wrap:balance] [word-break:keep-all]">
          에디터를 만들며 부딪힌 문제를{" "}
          <span className="font-semibold text-[color:var(--color-text-muted)]">코드와 함께 기록합니다</span>
        </h1>
        <p className="mt-4 max-w-[34em] text-base leading-8 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          SVG 에디터와 Three.js 3D 교구, 인터랙션 UI를 개발하면서 겪은 문제와 해결 과정을 정리하는
          Seonghoho의 기술 블로그입니다. 함께 놓인 캔버스는 글에서 다룬 선택, 좌표 변환, 리사이즈,
          undo/redo를 직접 만져 볼 수 있게 줄여 만든 에디터입니다.
        </p>

        {latestPosts.length ? (
          <nav aria-label="최근 글" className="mt-7 border-t border-[color:var(--color-border)]">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 border-b border-[color:var(--color-border)] py-3 text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
              >
                <time dateTime={post.date} className="pt-0.5 font-mono text-xs text-[color:var(--color-text-muted)]">
                  {toMonthDay(post.date)}
                </time>
                <span className="text-[15px] font-semibold leading-6 tracking-[-0.01em] [word-break:keep-all]">
                  {post.title}
                </span>
              </Link>
            ))}
          </nav>
        ) : null}

        <Link href="/posts" className="accent-link mt-4 inline-flex gap-1.5 text-sm font-semibold">
          전체 글 보기 →
        </Link>
      </div>

      <EditorHero hintPosts={hintPosts} />
    </section>
  );
}
```

- [ ] **Step 2: LandingLatestPostsSection**

`src/components/landing/LandingLatestPostsSection.tsx`:

```tsx
import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

export default function LandingLatestPostsSection({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <p className="eyebrow-label">Latest Writing</p>
      <h2 className="section-title mt-2">최근 글</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="surface-panel block p-5 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] sm:p-6"
          >
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {(post.category && categoryMap[post.category]) ?? post.category ?? "Writing"} · {formatDate(post.date)}
            </p>
            <h3 className="mt-2 text-[17px] font-semibold leading-[1.45] tracking-[-0.02em] text-[color:var(--color-text-primary)] [word-break:keep-all]">
              {post.title}
            </h3>
            {post.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
                {post.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: LandingCategoriesSection**

`src/components/landing/LandingCategoriesSection.tsx`:

```tsx
import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

export default function LandingCategoriesSection({ posts }: Props) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  const categories = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  if (!categories.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <p className="eyebrow-label">Categories</p>
      <h2 className="section-title mt-2">주제별로 보기</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map(([slug, count]) => (
          <Link
            key={slug}
            href={`/posts?category=${encodeURIComponent(slug)}`}
            className="tag-chip gap-1.5 px-3.5 py-2 text-sm transition-colors duration-200 ease-out hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            {categoryMap[slug] ?? slug}
            <span className="text-[color:var(--color-text-muted)]">{count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: LandingPage 교체**

`src/components/landing/LandingPage.tsx` 전체:

```tsx
import { aboutProjects } from "@/lib/aboutData";
import LandingCategoriesSection from "@/components/landing/LandingCategoriesSection";
import LandingHero from "@/components/landing/LandingHero";
import LandingLatestPostsSection from "@/components/landing/LandingLatestPostsSection";
import LandingProjectsSection from "@/components/landing/LandingProjectsSection";
import type { PostMeta } from "@/types/post";

type Props = {
  // 색인 대상 글 전체, 최신순. 히어로 힌트 링크와 카테고리 수를 계산하려고 전체를 받는다.
  posts: PostMeta[];
};

export default function LandingPage({ posts }: Props) {
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-12 pb-6 sm:gap-14 lg:gap-16">
        <LandingHero posts={posts} />
        <LandingLatestPostsSection posts={posts.slice(0, 4)} />
        <LandingCategoriesSection posts={posts} />
        <LandingProjectsSection
          projects={selectedProjects}
          sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, (min-width: 640px) 44vw, 88vw"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: page.tsx가 전체 글을 넘기도록 수정**

`src/app/page.tsx`의 `Home` 함수:

```tsx
export default function Home() {
  const posts = filterIndexablePosts(getAllPosts("posts")).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <AdsenseScript />
      <LandingPage posts={posts} />
    </>
  );
}
```

- [ ] **Step 6: 타입·린트·dev 서버로 홈 확인**

Run: `npx tsc --noEmit -p . && npx eslint src/components/landing src/app/page.tsx`
Expected: 에러 0. (이 시점에는 `HeroPlayground`, `LandingFeaturedWritingSection` 등이 아직 남아 있지만 import되지 않을 뿐 빌드는 된다.)

`npx next dev --turbopack -p 5175`를 백그라운드로 띄우고 브라우저 pane에서 `http://localhost:5175/`로 navigate. 확인:
- H1이 화면에 보이고 1개뿐(`document.querySelectorAll("h1").length === 1`)
- 최신 글 3편, 전체 글 보기, 에디터 프레임, 아래로 최근 글 카드 4개 → 주제별로 보기 → 프로젝트 순서
- 도형 클릭·드래그·핸들 리사이즈·회전·되돌리기가 동작하고 힌트 바 문장과 링크가 바뀐다
- 프로젝트 섹션이 1240 폭에서 깨지지 않는다(깨지면 `LandingProjectsSection`만 `mx-auto max-w-[980px] w-full` 래퍼로 감싼다)

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/LandingHero.tsx src/components/landing/LandingLatestPostsSection.tsx src/components/landing/LandingCategoriesSection.tsx src/components/landing/LandingPage.tsx src/app/page.tsx
git commit -m "feat(home): replace photo hero with editor hero and content-first sections"
```

---

### Task 6: 히어로 관련 파일 제거

**Files:**
- Delete: `src/components/landing/HeroPlayground.tsx`, `HeroPlaygroundClient.tsx`, `useArchivePosterLayout.ts`, `useHeroImageDeck.ts`, `Dice.tsx`, `LandingFeaturedWritingSection.tsx`, `RecentPostsList.tsx`
- Delete: `src/lib/homeContent.ts`
- Delete: `public/images/hero/` (6개 webp)
- Modify: `src/styles/globals.css` — `.hero-playground-shell` 규칙 2곳(`@layer components` 안 1곳, 파일 하단 `@supports (height: 100svh)` 블록 1곳) 제거

- [ ] **Step 1: 다른 사용처가 없는지 확인**

```bash
grep -rnE "HeroPlayground|useArchivePosterLayout|useHeroImageDeck|Dice|LandingFeaturedWritingSection|RecentPostsList|homeContent|images/hero|hero-playground-shell|Archivo" src public --include='*.ts' --include='*.tsx' --include='*.css' --include='*.md' | grep -vE "src/components/landing/(HeroPlayground|HeroPlaygroundClient|useArchivePosterLayout|useHeroImageDeck|Dice|LandingFeaturedWritingSection|RecentPostsList)\.tsx?:|src/lib/homeContent\.ts:"
```
Expected: `globals.css`의 `.hero-playground-shell` 두 줄만 나온다. 다른 결과가 나오면 그 파일은 지우지 말고 사용자에게 알린다.

- [ ] **Step 2: 파일 삭제와 CSS 정리**

```bash
git rm src/components/landing/HeroPlayground.tsx src/components/landing/HeroPlaygroundClient.tsx src/components/landing/useArchivePosterLayout.ts src/components/landing/useHeroImageDeck.ts src/components/landing/Dice.tsx src/components/landing/LandingFeaturedWritingSection.tsx src/components/landing/RecentPostsList.tsx src/lib/homeContent.ts
git rm -r public/images/hero
```

`globals.css`에서 다음 두 블록을 지운다(`@supports` 블록은 안에 다른 규칙이 없으면 블록째 삭제):

```css
  .hero-playground-shell {
    height: calc(100vh - var(--header-height) - var(--page-shell-padding-y-double));
  }
```

```css
@supports (height: 100svh) {
  .hero-playground-shell {
    height: calc(100svh - var(--header-height) - var(--page-shell-padding-y-double));
  }
}
```

- [ ] **Step 3: 전체 검증**

```bash
npx tsc --noEmit -p .
npx eslint .
node --loader ts-node/esm --test scripts/*.test.ts
npm run build
```
Expected: tsc·eslint 에러 0, 테스트는 `scripts/seo.test.ts` 1개(기존 실패)만 fail, 빌드 성공.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "chore(home): remove photo hero components, images and styles"
```

---

### Task 7: 프로덕션 빌드 검증, 성능 비교, 배포

**Files:**
- Modify: `docs/superpowers/plans/2026-10-14-home-editor-hero-metrics.md`

- [ ] **Step 1: 프로덕션 서버 띄우기**

`npm run build` 후 `npx next start -p 5175`를 백그라운드로 띄우고 브라우저 pane으로 `http://localhost:5175/` 접속.

- [ ] **Step 2: 브라우저 확인 체크리스트**

`resize_window`로 데스크톱(1280×800)·모바일(375×812), `colorScheme` light/dark를 바꿔 가며 확인한다. 확인 후 `preset: "desktop"`으로 되돌린다.

- [ ] 첫 화면에 H1·소개·최신 글 제목이 보인다(데스크톱·모바일 모두)
- [ ] 라이트·다크에서 선·격자·핸들·힌트 바 색이 자연스럽다
- [ ] 첫 진입: 선이 그려지고 유령 커서가 삼각형을 끌었다가 놓고, 끝나면 삼각형이 제자리, history 0
- [ ] 시연 도중 도형을 클릭하면 즉시 멈추고 삼각형이 초기 위치, history 0
- [ ] 새로고침 시 같은 탭에서는 모션이 다시 나오지 않는다(`sessionStorage.removeItem("editor-hero-intro-played")` 후엔 다시 나온다)
- [ ] 모바일: 스테이지가 화면에 들어올 때 모션 시작, 손가락 드래그(에뮬레이션)로 이동·핸들 리사이즈·회전 가능, 드래그 중 페이지가 스크롤되지 않는다
- [ ] 선택, 이동, 리사이즈(Shift 비율 유지), 회전, undo/redo 버튼, 스테이지 포커스 상태에서 ⌘Z/⇧⌘Z, Esc, 방향키(1px)·Shift+방향키(10px), 방향키 연타가 history 1개로 묶임
- [ ] 도형을 스테이지 밖으로 끌어도 중심이 안에 남는다
- [ ] 헤더 검색창 등 에디터 밖에 포커스를 두고 ⌘Z → 에디터 history 변화 없음
- [ ] 힌트 링크를 누르면 해당 글로 이동
- [ ] reduced motion 확인: `javascript_tool`로는 미디어쿼리를 바꿀 수 없으니, Chrome DevTools 렌더링 에뮬레이션이 안 되면 `useIntroMotion`의 `matchMedia` 분기를 코드 리뷰로 확인하고 결과를 metrics 파일에 "코드 확인"으로 적는다
- [ ] 콘솔 에러 0 (`read_console_messages` onlyErrors)

문제가 있으면 해당 Task 파일을 고치고 그 Task 형식으로 커밋한 뒤 이 체크리스트를 다시 돈다.

- [ ] **Step 3: Lighthouse 후 측정과 AdSense 체크**

Task 0 Step 2·3과 같은 명령을 `lh-after-$i.json`, `/tmp/home-after.html`로 실행해 metrics 표의 "변경 후" 행을 채운다.
Expected: LCP ≤ 변경 전, CLS ≤ 0.02, LCP 요소가 H1, `h1 1`, `adsbygoogle true`, 본문 글자 수 2,000 이상.
에디터 번들 크기: `.next/static/chunks`에서 `editor-hero` 관련 청크를 `gzip -c <file> | wc -c`로 재서 8KB(8192) 이하인지 기록한다(청크 이름을 모르면 `grep -l "editor-hero-intro-played" .next/static/chunks/*.js`로 찾는다).

- [ ] **Step 4: metrics 커밋**

```bash
git add docs/superpowers/plans/2026-10-14-home-editor-hero-metrics.md
git commit -m "docs(plan): record home performance after editor hero"
```

- [ ] **Step 5: 원격 최신화 후 push (사용자 확인 후)**

`/admin` 발행으로 원격 master에 새 커밋이 있을 수 있다. push는 배포로 이어지므로 사용자에게 먼저 확인받는다.

```bash
git fetch origin
git rebase origin/master
git push origin master
```
(`tsconfig.json`의 로컬 변경이 rebase를 막으면 `git stash push tsconfig.json` → rebase → `git stash pop`.)

- [ ] **Step 6: 배포 후 실제 사이트 확인**

Vercel 배포가 끝나면 https://seonghoho.com 에서 Step 2의 핵심 항목(H1, 에디터 조작, 다크 모드, 모바일)을 다시 본다.
```
