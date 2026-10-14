# 홈 프로젝트 도면형 카드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 프로젝트 섹션의 색 포스터·glow 패널을 히어로와 같은 결의 도면형 카드(점 격자 띠 + 선 그림 + 모노 메타 + 소개·성과)로 바꾼다.

**Architecture:** 표시용 문자열·그림 종류 결정은 순수 모듈 `projectCard.ts`로 분리해 node 테스트로 검증하고, 카드·그림·섹션은 서버 컴포넌트로 만든다. 프로젝트 고유색은 데이터라 CSS 변수(`--project-color`)로 넘기고, 다크 모드 보정은 `globals.css` 컴포넌트 클래스가 맡는다.

**Tech Stack:** Next.js 16 App Router(서버 컴포넌트), Tailwind CSS v3.4 + CSS 변수, node:test + ts-node/esm.

**Spec:** [docs/superpowers/specs/2026-10-14-home-projects-drafting-cards-design.md](../specs/2026-10-14-home-projects-drafting-cards-design.md)

## Global Constraints

- 범위는 홈 `LandingProjectsSection`뿐. `ProjectArchiveCard`, `ProjectPoster`, `aboutData`는 수정하지 않는다.
- 카드는 `.surface-panel`(28px) + `hover:-translate-y-1`, 전환 `duration-200 ease-out`.
- className에 raw hex 금지. 고유색은 `style={{ "--project-color": posterColor }}`로만 넘긴다.
- 다크 모드 고유색: `color-mix(in srgb, var(--project-color) 65%, white)`.
- 메타 형식: `기간(" - " → "–") · 팀`. 성과 2개, 태그 3개.
- 테스트 대상 모듈은 import 없이 작성하고 테스트에서 상대 경로 `.ts`로 불러온다.
- Tailwind가 소스 문자열을 스캔하므로 정규식에 대괄호 문자 클래스를 쓰지 않는다.
- `tsconfig.json`, `public/posts.json` 로컬 변경은 커밋하지 않는다.

## Review Focus

1. **`aboutData`에 새 프로젝트 slug가 추가됨** — 모르는 slug는 기본 그림으로 렌더링돼야 한다. `"constructor"`·`"toString"` 같은 이름도 객체 프로토타입 값을 돌려주면 안 된다(Task 1 테스트).
2. **기간 문자열 형식이 다름**(`"2025.03"`처럼 끝이 없거나 공백 없는 하이픈) — 망가뜨리지 않고 그대로 둔다(Task 1 테스트).
3. **팀 정보가 빈 문자열** — 메타에 `" · "`가 끝에 남지 않아야 한다(Task 1 테스트).
4. **다크 모드에서 어두운 고유색(#0f766e, #2563eb)** — 점과 강조선이 배경에 묻히지 않아야 한다(Task 3 브라우저 확인).
5. **긴 성과 문장·좁은 화면(375px)** — 카드가 가로로 넘치지 않고 줄바꿈된다(Task 3 브라우저 확인).

---

### Task 1: projectCard — 메타 문자열과 그림 종류

**Files:**
- Create: `src/components/landing/projectCard.ts`
- Test: `scripts/landingProjectCard.test.ts`

**Interfaces:**
- Produces:
  - `type ProjectGlyphKind = "canvas" | "route" | "pitch" | "default"`
  - `projectGlyphKind(slug: string): ProjectGlyphKind`
  - `formatProjectMeta(period: string, team: string): string`

- [ ] **Step 1: 실패하는 테스트**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatProjectMeta, projectGlyphKind } from "../src/components/landing/projectCard.ts";

describe("formatProjectMeta", () => {
  it("joins the period and team with an en dash range", () => {
    assert.equal(
      formatProjectMeta("2024.08 - 2026.02", "4명 · FE 3 / BE 1"),
      "2024.08–2026.02 · 4명 · FE 3 / BE 1",
    );
  });

  it("leaves periods without a spaced hyphen as they are", () => {
    assert.equal(formatProjectMeta("2025.03", "1명"), "2025.03 · 1명");
  });

  it("drops the separator when the team is empty", () => {
    assert.equal(formatProjectMeta("2024.02 - 2024.04", ""), "2024.02–2024.04");
  });
});

describe("projectGlyphKind", () => {
  it("maps known projects to their drawings", () => {
    assert.equal(projectGlyphKind("mathcanvas"), "canvas");
    assert.equal(projectGlyphKind("nowdoboss"), "route");
    assert.equal(projectGlyphKind("mancity"), "pitch");
  });

  it("falls back to the default drawing for unknown slugs", () => {
    assert.equal(projectGlyphKind("pawsitive"), "default");
    assert.equal(projectGlyphKind("constructor"), "default");
    assert.equal(projectGlyphKind("toString"), "default");
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `node --loader ts-node/esm --test scripts/landingProjectCard.test.ts`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 구현**

```ts
// 홈 프로젝트 카드의 표시용 순수 함수. 다른 모듈을 import 하지 않는다(테스트가 바로 불러온다).

export type ProjectGlyphKind = "canvas" | "route" | "pitch" | "default";

// Map을 써서 "constructor" 같은 slug가 객체 프로토타입 값을 돌려주지 않게 한다.
const GLYPH_BY_SLUG = new Map<string, ProjectGlyphKind>([
  ["mathcanvas", "canvas"],
  ["nowdoboss", "route"],
  ["mancity", "pitch"],
]);

export function projectGlyphKind(slug: string): ProjectGlyphKind {
  return GLYPH_BY_SLUG.get(slug) ?? "default";
}

// "2024.08 - 2026.02", "4명 · FE 3 / BE 1" → "2024.08–2026.02 · 4명 · FE 3 / BE 1"
export function formatProjectMeta(period: string, team: string): string {
  return [period.replace(" - ", "–"), team].filter(Boolean).join(" · ");
}
```

- [ ] **Step 4: 통과 확인**

Run: `node --loader ts-node/esm --test scripts/landingProjectCard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/projectCard.ts scripts/landingProjectCard.test.ts
git commit -m "feat(home): add project card meta and glyph helpers"
```

---

### Task 2: 도면형 카드와 섹션

**Files:**
- Create: `src/components/landing/ProjectGlyph.tsx`, `src/components/landing/LandingProjectCard.tsx`
- Modify: `src/components/landing/LandingProjectsSection.tsx` (전체 교체), `src/components/landing/LandingPage.tsx`, `src/styles/globals.css`

**Interfaces:**
- Consumes: Task 1의 `projectGlyphKind`, `formatProjectMeta`; `AboutProject`(`slug, title, tagline, period, team, posterColor, cardPoints, tags`)
- Produces: `LandingProjectsSection({ projects }: { projects: AboutProject[] })`

- [ ] **Step 1: globals.css 클래스** — `@layer components` 끝(닫는 `}` 앞)에 추가

```css
  /* 홈 프로젝트 도면형 카드 */
  .project-glyph-grid {
    background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
    background-size: 12px 12px;
  }

  .project-glyph-line,
  .project-accent-stroke {
    fill: none;
    vector-effect: non-scaling-stroke;
  }

  .project-glyph-line {
    stroke: var(--color-text-primary);
    stroke-width: 1;
  }

  .project-accent-stroke {
    stroke: var(--project-color, var(--color-accent));
    stroke-width: 1.5;
  }

  .project-accent-dot {
    background-color: var(--project-color, var(--color-accent));
  }

  /* 어두운 고유색이 다크 배경에 묻히지 않도록 밝힌다. */
  html.dark .project-accent-stroke {
    stroke: color-mix(in srgb, var(--project-color, var(--color-accent)) 65%, white);
  }

  html.dark .project-accent-dot {
    background-color: color-mix(in srgb, var(--project-color, var(--color-accent)) 65%, white);
  }
```

- [ ] **Step 2: ProjectGlyph**

```tsx
import { projectGlyphKind } from "@/components/landing/projectCard";

type Props = {
  slug: string;
};

// 프로젝트 성격을 나타내는 작은 선 그림. 기본 선은 글자색, 강조선 하나만 프로젝트 고유색이다.
export default function ProjectGlyph({ slug }: Props) {
  const kind = projectGlyphKind(slug);

  return (
    <svg viewBox="0 0 200 64" aria-hidden="true" className="h-16 w-full max-w-[220px]">
      {kind === "canvas" ? (
        <>
          <rect className="project-glyph-line" x="64" y="12" width="72" height="40" rx="6" />
          <circle className="project-accent-stroke" cx="100" cy="32" r="11" />
        </>
      ) : null}
      {kind === "route" ? (
        <>
          <path className="project-glyph-line" d="M60 48 L84 26 L108 38 L140 16" />
          <circle className="project-accent-stroke" cx="108" cy="38" r="5" />
        </>
      ) : null}
      {kind === "pitch" ? (
        <>
          <rect className="project-glyph-line" x="60" y="10" width="80" height="44" />
          <line className="project-glyph-line" x1="100" y1="10" x2="100" y2="54" />
          <circle className="project-accent-stroke" cx="100" cy="32" r="9" />
        </>
      ) : null}
      {kind === "default" ? (
        <>
          <rect className="project-glyph-line" x="70" y="12" width="60" height="40" rx="4" />
          <line className="project-accent-stroke" x1="70" y1="52" x2="130" y2="12" />
        </>
      ) : null}
    </svg>
  );
}
```

- [ ] **Step 3: LandingProjectCard**

```tsx
import type { CSSProperties } from "react";
import Link from "next/link";
import ProjectGlyph from "@/components/landing/ProjectGlyph";
import { formatProjectMeta } from "@/components/landing/projectCard";
import type { AboutProject } from "@/lib/aboutData";

type Props = {
  project: AboutProject;
};

export default function LandingProjectCard({ project }: Props) {
  // 고유색은 데이터라 className 대신 CSS 변수로 넘긴다. 실제 색 적용은 globals.css의 project-accent-* 가 맡는다.
  const accentStyle = { "--project-color": project.posterColor } as CSSProperties;

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={accentStyle}
      className="surface-panel group flex min-w-0 flex-col overflow-hidden transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
    >
      <div className="project-glyph-grid flex h-[72px] items-center justify-center border-b border-[color:var(--color-border)]">
        <ProjectGlyph slug={project.slug} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs text-[color:var(--color-text-muted)]">
          {formatProjectMeta(project.period, project.team)}
        </p>
        <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out group-hover:text-[color:var(--color-accent)]">
          <span aria-hidden="true" className="project-accent-dot h-2 w-2 shrink-0 rounded-full" />
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm leading-7 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {project.tagline}
        </p>
        <ul className="mt-3 space-y-1 text-sm leading-6 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {project.cardPoints.slice(0, 2).map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true" className="text-[color:var(--color-text-muted)]">
                —
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {project.tags.length ? (
          <p className="mt-auto pt-4 font-mono text-xs text-[color:var(--color-text-muted)]">
            {project.tags.slice(0, 3).join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: LandingProjectsSection 교체**

```tsx
import Link from "next/link";
import LandingProjectCard from "@/components/landing/LandingProjectCard";
import type { AboutProject } from "@/lib/aboutData";

type Props = {
  projects: AboutProject[];
};

export default function LandingProjectsSection({ projects }: Props) {
  if (!projects.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-label">Projects</p>
          <h2 className="section-title mt-2">프로젝트</h2>
        </div>
        <Link href="/projects" className="accent-link text-sm font-semibold">
          전체 프로젝트 →
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <LandingProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: LandingPage 호출부 수정** — `sizes` prop 제거

```tsx
        <LandingProjectsSection projects={selectedProjects} />
```

- [ ] **Step 6: 타입·린트**

Run: `npx tsc --noEmit -p . && npx eslint src/components/landing`
Expected: 에러 0

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/ProjectGlyph.tsx src/components/landing/LandingProjectCard.tsx src/components/landing/LandingProjectsSection.tsx src/components/landing/LandingPage.tsx src/styles/globals.css
git commit -m "feat(home): replace project posters with drafting-style cards"
```

---

### Task 3: 검증, merge, 배포

- [ ] **Step 1: 전체 검증** — `node --loader ts-node/esm --test scripts/*.test.ts`(seo.test.ts만 기존 실패), `npx eslint .`, `npm run build`
- [ ] **Step 2: 브라우저** — `next start -p 5175`, 데스크톱·모바일(375×812), 라이트·다크(`html.dark` 토글)에서 카드 3개, hover, 링크, 가로 스크롤 없음(`scrollWidth === innerWidth`), 다크에서 점·강조선이 보이는지
- [ ] **Step 3: 측정** — 홈 HTML 본문 글자 수(목표 2,000+), `<h1>` 1개, `adsbygoogle.js` 존재, 홈 HTML에 `/images/projects` 없음. 결과를 `docs/superpowers/plans/2026-10-14-home-editor-hero-metrics.md` 메모에 추가하고 커밋
- [ ] **Step 4: 최종 리뷰** — 새 리뷰어 에이전트로 브랜치 전체 검토, Critical·Important 수정
- [ ] **Step 5: merge·push** — `git fetch` → master fast-forward merge → 테스트 → `git push origin master` → 브랜치 삭제
