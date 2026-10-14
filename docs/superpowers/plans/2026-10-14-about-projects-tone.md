# /about, /projects 톤 정리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/about`, `/projects`, `/projects/[slug]`의 레이아웃은 유지한 채 메타를 모노로, 강조색을 teal로, 카드 안 카드를 목록으로 바꾼다.

**Architecture:** 기간 표기는 순수 함수 `formatPeriod`(`src/lib/formatPeriod.ts`)로 통일하고 홈 카드도 이를 쓴다. 나머지는 기존 컴포넌트의 className·마크업 교체와 `globals.css`의 형광펜 클래스 수정이다.

**Tech Stack:** Next.js 16 서버 컴포넌트, Tailwind v3.4 + CSS 변수, node:test + ts-node/esm.

**Spec:** [docs/superpowers/specs/2026-10-14-about-projects-tone-design.md](../specs/2026-10-14-about-projects-tone-design.md)

## Global Constraints

- 레이아웃·섹션 순서·문구는 바꾸지 않는다.
- 메타: `font-mono text-xs text-[color:var(--color-text-muted)]`(상세 상단만 `text-sm`).
- 강조색은 `--color-accent`, `--color-accent-soft`만. raw hex 금지.
- 최상위 카드(`about-card`, `surface-panel(-strong)`)는 유지, 그 안의 박스만 목록으로.
- `formatPeriod.ts`는 import 없음. 이를 쓰는 테스트 대상 모듈(`projectCard.ts`)은 상대 경로 `.ts`로 import 한다.
- `tsconfig.json`, `public/posts.json` 로컬 변경은 커밋하지 않는다.

## Review Focus

1. **`"2026.03 - 재직 중"`처럼 한쪽이 글자인 기간** — `"2026.03–재직 중"`으로 붙지 않고 `"2026.03 – 재직 중"`이 된다(Task 1 테스트).
2. **기간이 하나뿐(`"2026.03"`)이거나 공백 없는 하이픈** — 그대로 둔다(Task 1 테스트).
3. **6열 그리드(lg)에서 긴 tagline** — 2줄에서 잘리고 카드 높이가 크게 어긋나지 않는다(Task 2 브라우저).
4. **다크 모드 형광펜** — teal soft 배경 위 본문 글자 대비가 유지된다(Task 2 브라우저).
5. **About 목록화 후 모바일 375px** — `dl` 라벨·값이 줄바꿈되고 가로 스크롤이 없다(Task 3 브라우저).

---

### Task 1: formatPeriod

**Files:** Create `src/lib/formatPeriod.ts`, `scripts/formatPeriod.test.ts`; Modify `src/components/landing/projectCard.ts`

**Produces:** `formatPeriod(period: string): string`

- [ ] **Step 1: 실패하는 테스트**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatPeriod } from "../src/lib/formatPeriod.ts";

describe("formatPeriod", () => {
  it("joins two dates with a tight en dash", () => {
    assert.equal(formatPeriod("2024.08 - 2026.02"), "2024.08–2026.02");
  });

  it("keeps spaces around the dash when one side is text", () => {
    assert.equal(formatPeriod("2026.03 - 재직 중"), "2026.03 – 재직 중");
  });

  it("leaves single dates and unspaced hyphens alone", () => {
    assert.equal(formatPeriod("2026.03"), "2026.03");
    assert.equal(formatPeriod("2024.08-2026.02"), "2024.08-2026.02");
  });
});
```

- [ ] **Step 2: 실패 확인** — `node --loader ts-node/esm --test scripts/formatPeriod.test.ts` → FAIL(모듈 없음)

- [ ] **Step 3: 구현**

```ts
// 기간 표기를 사이트 전체에서 같게 맞춘다. 다른 모듈을 import 하지 않는다(테스트가 바로 불러온다).
// "2024.08 - 2026.02" → "2024.08–2026.02", "2026.03 - 재직 중" → "2026.03 – 재직 중"
export function formatPeriod(period: string): string {
  const parts = period.split(" - ");
  if (parts.length !== 2) return period;
  const [start, end] = parts;
  const isDate = (value: string) => /^\d/.test(value) && /\d$/.test(value);
  return isDate(start) && isDate(end) ? `${start}–${end}` : `${start} – ${end}`;
}
```

`projectCard.ts`: 맨 위에 `import { formatPeriod } from "../../lib/formatPeriod.ts";`, `period.replace(" - ", "–")` → `formatPeriod(period)`.

- [ ] **Step 4: 통과 확인** — `node --loader ts-node/esm --test scripts/formatPeriod.test.ts scripts/landingProjectCard.test.ts` → PASS
- [ ] **Step 5: Commit** — `feat(lib): add formatPeriod and use it for home project cards`

---

### Task 2: /projects 카드, 상세 페이지, 형광펜

**Files:** Modify `src/components/projects/ProjectArchiveCard.tsx`, `src/components/about/ProjectDetailView.tsx`, `src/styles/globals.css`

- [ ] **Step 1: ProjectArchiveCard 기본 모드 메타** — `isAccentPanel`이 아닐 때 연도·상태 대신:

```tsx
<p className="font-mono text-xs text-[color:var(--color-text-muted)]">
  {formatPeriod(project.period)} · {project.status}
</p>
<p className="line-clamp-2 text-sm leading-6 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
  {project.tagline}
</p>
```

(`isAccentPanel`일 때는 기존 배지 마크업 유지)

- [ ] **Step 2: ProjectDetailView 상단 메타** — 감싸는 div className을 `mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm leading-7 text-[color:var(--color-text-muted)]`, 기간은 `formatPeriod(project.period)`, `•` → `·`. 태그는 `text-[color:var(--color-accent)]` 유지.
- [ ] **Step 3: Project facts 값** — 각 `dd`에 `font-mono text-[13px]` 추가.
- [ ] **Step 4: 형광펜** — `globals.css`

```css
  .project-highlight-mark {
    margin-inline: 0.02em;
    border-radius: 0.18em;
    background: linear-gradient(to top, var(--color-accent-soft) 42%, transparent 42%);
    color: var(--color-text-primary);
    font-weight: 650;
  }
```

`html.dark .project-highlight-mark` 블록은 삭제(토큰이 다크에서 바뀜).

- [ ] **Step 5: tsc·eslint** — 에러 0
- [ ] **Step 6: Commit** — `feat(projects): mono meta, taglines and teal highlights`

---

### Task 3: /about 평탄화

**Files:** Modify `src/components/about/AboutPage.tsx`

- [ ] **Step 1: Overview facts** — `dl`을

```tsx
<dl className="divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
  {overviewFacts.map((fact) => (
    <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
      <dt className="font-mono text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
        {fact.label}
      </dt>
      <dd className="text-right text-sm font-medium leading-6 text-[color:var(--color-text-primary)] [word-break:keep-all]">
        {fact.value}
      </dd>
    </div>
  ))}
</dl>
```

- [ ] **Step 2: What I Focus On** — 항목 div의 테두리·배경·hover lift 클래스를 지우고 `flex items-start gap-3`만 남긴다. 그리드 간격은 `gap-4`.
- [ ] **Step 3: Focus 카드 항목** — `surface-subtle` div 목록을

```tsx
<ul className="mt-5 space-y-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
  {overviewStrengths.map((item) => (
    <li key={item.title} className="flex gap-2">
      <span aria-hidden="true" className="text-[color:var(--color-text-muted)]">—</span>
      <span>{item.title}</span>
    </li>
  ))}
</ul>
```

- [ ] **Step 4: Experience** — 기간 pill을 `<p className="font-mono text-xs text-[color:var(--color-text-muted)]">{formatPeriod(item.period)}</p>`로, 하이라이트 `li`의 `surface-subtle px-4 py-3`를 `flex gap-2`로 바꾸고 앞에 `—` span.
- [ ] **Step 5: Projects 섹션** — 프로젝트 목록 `grid gap-3`을 `divide-y divide-[color:var(--color-border)]`로, 각 링크 className을 `group block px-1 py-4 transition-colors duration-200 ease-out hover:bg-[color:var(--color-surface-tint)] sm:px-2`, 기간 `p`를 `font-mono text-xs text-[color:var(--color-text-muted)]` + `formatPeriod`, 제목에 `group-hover:text-[color:var(--color-accent)] transition-colors`, `View` → `View →`.
- [ ] **Step 6: tsc·eslint** — 에러 0
- [ ] **Step 7: Commit** — `feat(about): flatten nested boxes and use mono meta`

---

### Task 4: 검증과 merge

- [ ] 전체 테스트(seo.test.ts 기존 실패 제외), `npx eslint .`, `npm run build`
- [ ] 프로덕션 브라우저: 세 페이지 × 데스크톱·모바일 × 라이트·다크, 가로 스크롤 없음
- [ ] 새 리뷰어 에이전트로 브랜치 리뷰, Critical·Important 수정
- [ ] master fast-forward merge, 브랜치 삭제. push는 사용자 확인 후
