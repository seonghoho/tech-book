# /projects 개인 앱 소개 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/projects`에 개인 앱 6개를 팀 프로젝트 6개와 한 그리드로 보여주고, 필터 칩·구분 배지·바로가기 버튼과 영수증 포토부스 작업 내용 페이지를 추가한다.

**Architecture:** 개인 앱 데이터는 `src/lib/appsData.ts`에 새로 두고 `aboutProjects`는 건드리지 않는다. 서버 컴포넌트가 두 종류 카드를 모두 렌더해 클라이언트 필터 컴포넌트에 `ReactNode` 배열로 넘기고, 클라이언트는 `?filter=` 쿼리에 따라 보여줄 묶음만 고른다. 영수증 포토부스는 `src/app/projects/receipt-photobooth/` 정적 라우트로 둔다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v3 + CSS 변수, `next/image`.

**Spec:** `docs/superpowers/specs/2026-11-09-personal-apps-projects-design.md`

## Global Constraints

- 저장소에 테스트 러너가 없다. 각 태스크의 검증은 `npx tsc --noEmit`, `npm run lint`, 마지막 태스크의 `npm run build`와 브라우저 확인(`.claude/launch.json`의 `tech-book`, 포트 5174)으로 한다. 테스트 러너를 새로 들이지 않는다.
- 색은 `[color:var(--color-*)]`로만 쓴다. className에 hex를 쓰지 않는다. 기존 클래스(`surface-panel`, `tag-chip`, `button-primary`, `button-secondary`, `body-copy`, `muted-copy`, `eyebrow-label`) 우선.
- 라운드: 카드 `rounded-[28px]`, 작은 요소 `rounded-[12px]`, 칩·버튼 `rounded-full`. 트랜지션 `duration-200|300 ease-out`, 호버 lift `-translate-y-0.5|1`.
- 이미지는 `next/image` + `sizes` 필수. 썸네일 표시 비율 `aspect-[1200/630]`.
- 외부 링크는 `target="_blank" rel="noopener noreferrer"`.
- **`receipt.seonghoho.com`은 소스·빌드 결과 어디에도 나오면 안 된다**(텍스트·링크 모두).
- 문구 톤: 사용자 본인 경험 1인칭, 평이한 제목, 과장·AI 투 표현 금지.
- 커밋·푸시는 사용자가 요청할 때만. 태스크별 커밋 대신 Task 5에서 사용자 확인 후 한 번에 커밋한다.

## Review Focus

1. `?filter=foo`처럼 모르는 값이나 빈 값으로 들어오면 "전체"로 보여야 한다. → Task 3 Step 3
2. JS 없이 받은 정적 HTML(검색엔진·첫 페인트)에 12개 카드가 모두 있어야 한다. → Task 3 Step 4
3. 350px 폭에서 버튼이 줄바꿈되고 가로 스크롤이 생기지 않아야 한다. → Task 5 Step 4
4. 다크 모드에서 배지 3종(개인 앱/팀 프로젝트/개발 중) 글자가 읽혀야 한다. → Task 5 Step 4
5. 영수증 포토부스 주소가 빌드 결과에 새어 나가지 않아야 한다. → Task 5 Step 2

---

### Task 1: 개인 앱 데이터와 썸네일

**Files:**
- Create: `src/lib/appsData.ts`
- Create: `public/images/apps/{hankan,dotori,space-cleanup,view-racer,green-putt}.{png|jpg}`, `public/images/apps/receipt-photobooth.png`

**Interfaces:**
- Produces:
  ```ts
  export type AppLink = { label: string; href: string; kind: "store" | "web" };
  export type PersonalApp = {
    slug: string;
    title: string;
    summary: string;          // 카드 본문 1~2문장
    statusLabel: string;      // 예: "Google Play 출시"
    inProgress?: boolean;     // true면 "개발 중" 배지
    thumbnail: { src: string; alt: string; fit?: "cover" | "contain" };
    links: AppLink[];         // 외부 링크. 영수증 포토부스는 []
    detailHref?: string;      // 내부 상세 페이지. 영수증 포토부스만 "/projects/receipt-photobooth"
  };
  export const personalApps: PersonalApp[];          // 스펙 표의 순서 그대로 6개
  export const receiptPhotoboothDetail: {
    title: string; summary: string;
    sections: { heading: string; paragraphs: string[]; points?: string[] }[];
  };
  ```

- [ ] **Step 1: 썸네일 복사**

```bash
P=~/Documents/projects; D=public/images/apps; mkdir -p $D
cp $P/hankan/docs/store/graphics/play-feature-1024x500.png $D/hankan.png
cp $P/dotori/assets/branding/play-feature-graphic-1024x500.png $D/dotori.png
cp $P/space-cleanup-defense/public/og-image.png $D/space-cleanup.png
cp $P/3D/public/og-challenge.png $D/view-racer.png
cp $P/green-putt/public/og-image.jpg $D/green-putt.jpg
cp $P/receipt-photobooth-android/app/src/main/res/drawable/landing_hero.png $D/receipt-photobooth.png
```

- [ ] **Step 2: `appsData.ts` 작성**

링크·순서·상태는 스펙 "앱 목록과 연결" 표를 그대로 옮긴다(Play 링크 2개, 웹 링크 5개, 버튼 라벨 "Google Play" / "웹에서 보기" / "웹에서 플레이" / "플레이하기"). 영수증 포토부스는 `thumbnail.fit: "contain"`, `links: []`, `inProgress: true`.

`summary`와 `receiptPhotoboothDetail` 본문은 스펙의 카드 문구 초안을 출발점으로, 각 레포의 README·`docs/STATUS.md`를 읽고 1인칭 경험 톤으로 다듬어 쓴다. 상세 페이지 섹션은 스펙의 네 항목(무엇인가 / 만든 것 / 진행 상황 / 이미지)에 맞춘다. 이 문구는 Task 5에서 사용자 확인을 받는다.

- [ ] **Step 3: 검증**

Run: `npx tsc --noEmit && grep -rn "receipt.seonghoho" src/lib/appsData.ts; echo "exit=$?"`
Expected: 타입 오류 없음, grep 결과 없음(`exit=1`).

---

### Task 2: 카드 컴포넌트 두 종류

**Files:**
- Create: `src/components/projects/ProjectKindBadge.tsx`
- Create: `src/components/projects/PersonalAppCard.tsx`
- Create: `src/components/projects/TeamProjectCard.tsx`
- Modify: `src/styles/globals.css` (`--color-wip-*` 토큰)

**Interfaces:**
- Consumes: `PersonalApp`, `AboutProject`
- Produces:
  ```ts
  ProjectKindBadge({ kind }: { kind: "app" | "team" | "wip" })
  PersonalAppCard({ app, priority }: { app: PersonalApp; priority?: boolean })
  TeamProjectCard({ project, priority }: { project: AboutProject; priority?: boolean })
  ```

- [ ] **Step 1: `ProjectKindBadge`** — 라벨 "개인 앱" / "팀 프로젝트" / "개발 중". app: `bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]`, team: `bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]`, wip: amber 계열이 토큰에 없으므로 `globals.css`의 `:root`/`html.dark`에 `--color-wip-bg`, `--color-wip-text` 두 토큰을 추가해 쓴다.

- [ ] **Step 2: 공통 바깥 틀** — 두 카드 모두 `<article>` 루트에 `surface-panel flex h-full flex-col overflow-hidden`(= `rounded-[28px]`), 위쪽 썸네일 영역 `relative aspect-[1200/630]`, 아래 본문 `flex flex-1 flex-col gap-3 p-5`. 그리드가 `items-stretch`이므로 높이가 줄마다 맞는다.

- [ ] **Step 3: `PersonalAppCard`** — 썸네일(`fill`, `sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"`, `fit`에 따라 `object-cover|object-contain` + contain일 때 `bg-[color:var(--color-surface-muted)]`), 배지 줄(`app`, `inProgress`면 `wip` 함께), 제목, `statusLabel`(`muted-copy`), `summary`(`body-copy`), 맨 아래 `mt-auto flex flex-wrap gap-2` 버튼 줄. `links[0]`은 `button-primary`, 나머지는 `button-secondary`, 모두 새 탭. `detailHref`가 있으면 `next/link`의 `button-secondary`로 "작업 내용 보기". 카드 전체를 링크로 감싸지 않는다(버튼이 여러 개이므로).

- [ ] **Step 4: `TeamProjectCard`** — 카드 전체가 `/projects/${slug}` `Link`. 썸네일 영역 안에 기존 `ProjectPoster`를 `className="absolute inset-0 !rounded-none !border-0 !grayscale-0"`로 넣는다. 본문은 `team` 배지, 제목, `formatPeriod(period)` · `formatProjectStatus(status)`(`muted-copy`), `tagline`(`line-clamp-3 body-copy`). 호버 시 `-translate-y-1`.

- [ ] **Step 5: 검증**

Run: `npx tsc --noEmit && npm run lint`
Expected: 오류 없음.

---

### Task 3: 필터 칩과 페이지 조립

**Files:**
- Create: `src/components/projects/ProjectsFilterClient.tsx`
- Create: `src/lib/projectFilter.ts`
- Modify: `src/components/projects/ProjectsPage.tsx`
- Modify: `src/app/projects/page.tsx` (메타 설명)
- Delete: `src/components/projects/ProjectArchiveGrid.tsx`, `src/components/projects/ProjectArchiveCard.tsx` (사용처가 `ProjectsPage.tsx` 하나뿐이고 이 태스크에서 대체된다)

**Interfaces:**
- Consumes: `PersonalAppCard`, `TeamProjectCard`, `personalApps`, `aboutProjects`
- Produces:
  ```ts
  // src/lib/projectFilter.ts
  export type ProjectFilter = "all" | "apps" | "team";
  export function parseProjectFilter(value: string | null | undefined): ProjectFilter;
  // ProjectsFilterClient.tsx ("use client")
  ProjectsFilterClient({ apps, team }: { apps: React.ReactNode[]; team: React.ReactNode[] })
  ```

- [ ] **Step 1: `parseProjectFilter`** — `"apps"`·`"team"`만 그대로, 그 외(빈 값·대소문자 다른 값 포함)는 `"all"`.

- [ ] **Step 2: `ProjectsFilterClient`** — `useSearchParams()`로 읽고 `parseProjectFilter`로 해석. 칩 3개 `tag-chip`(선택 칩은 `bg-[color:var(--color-text-primary)] text-[color:var(--color-surface)]`), 라벨 `전체` / `개인 앱 ${apps.length}` / `팀 프로젝트 ${team.length}`, `role="tablist"` 대신 `aria-pressed` 버튼. 클릭 시 `router.replace(filter === "all" ? pathname : \`${pathname}?filter=${filter}\`, { scroll: false })`. 그리드 `grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3`, 순서는 apps → team.

- [ ] **Step 3: 모르는 쿼리 확인 (Review Focus 1)** — Task 5 브라우저 확인에서 `/projects?filter=foo`, `/projects?filter=`가 "전체" 칩 선택 + 12개 카드인지 본다.

- [ ] **Step 4: `ProjectsPage` 조립 (Review Focus 2)** — 제목 "Projects", 설명 "직접 만든 앱과 팀으로 진행한 프로젝트예요." `useSearchParams`를 쓰므로 `<Suspense fallback={<ProjectsFilterFallback ... />}>`로 감싼다. fallback은 같은 그리드에 12개 카드를 모두 렌더하는 서버 마크업(칩은 "전체" 선택 상태)이어서, 정적 HTML에 카드가 모두 들어간다. 첫 2개 카드만 `priority`.

- [ ] **Step 5: 메타 설명** — `src/app/projects/page.tsx`의 description을 "프론트엔드 엔지니어 최성호가 직접 만든 앱과 팀 프로젝트 목록입니다."로.

- [ ] **Step 6: 검증**

Run: `npx tsc --noEmit && npm run lint`
Expected: 오류 없음.

---

### Task 4: 영수증 포토부스 작업 내용 페이지

**Files:**
- Create: `src/app/projects/receipt-photobooth/page.tsx`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `receiptPhotoboothDetail`, `personalApps`(썸네일 재사용), `buildPageMetadata`, `buildBreadcrumbJsonLd`(기존 `[slug]/page.tsx`의 사용법을 따른다)

- [ ] **Step 1: 페이지** — `export const dynamic = "force-static"`. 상단에 "← Projects"(`/projects`, `nav-link`), `eyebrow-label` "개인 앱 · 개발 중", 제목, 요약, 이미지(`aspect-[452/656]` 세로, `max-w-[320px]`, `sizes="320px"`), 섹션마다 `section-title` + `body-copy` + 점 목록. 본문 폭 `max-w-[72ch]`. 외부 링크 없음.

- [ ] **Step 2: 메타·사이트맵** — `buildPageMetadata({ title: "영수증 포토부스 작업 기록", description: receiptPhotoboothDetail.summary, path: "/projects/receipt-photobooth" })`. `sitemap.ts`의 `projectPages` 뒤에 이 경로 한 줄 추가(`changeFrequency: "monthly"`, `priority: 0.6`).

- [ ] **Step 3: 검증**

Run: `npx tsc --noEmit && npm run lint`
Expected: 오류 없음.

---

### Task 5: 전체 확인, 문구 확인, 커밋

**Files:** 없음(필요 시 앞 태스크 파일 수정)

- [ ] **Step 1: 빌드**

Run: `npm run build`
Expected: 성공. 출력 라우트 목록에 `/projects`, `/projects/receipt-photobooth`(정적) 포함, 기존 `/projects/[slug]` 6개 유지.

- [ ] **Step 2: 주소 누출 검사 (Review Focus 5)**

Run: `grep -rl "receipt.seonghoho" .next/server src public 2>/dev/null; echo "exit=$?"`
Expected: 결과 없음(`exit=1`).

- [ ] **Step 3: 브라우저 — 기능** — `preview_start {name: "tech-book"}` 후 `/projects`에서: 카드 12개, 개인 앱 6개가 먼저; 칩 클릭 시 주소가 `?filter=apps|team`으로 바뀌고 카드 수가 6/6; 주소로 직접 들어와도 같은 상태; `?filter=foo`·`?filter=`는 전체; 한칸·다람쥐의 Google Play/웹 버튼과 나머지 플레이 버튼 href가 스펙 표와 일치하고 새 탭; 영수증 포토부스 "작업 내용 보기"가 `/projects/receipt-photobooth`로 이동; 팀 카드 클릭 시 기존 상세 페이지로 이동; 콘솔 오류 없음.

- [ ] **Step 4: 브라우저 — 반응형·다크 (Review Focus 3, 4)** — 350px·768px·1280px 폭에서 `document.documentElement.scrollWidth <= innerWidth`, 줄마다 카드 높이 일치를 확인. `html.dark`에서 배지 3종 대비 확인. 데스크톱 라이트·다크와 모바일 스크린샷을 남긴다.

- [ ] **Step 5: 사용자 문구 확인** — 카드 문구 6개와 상세 페이지 본문을 사용자에게 한 번에 보여 주고, 받은 수정 사항을 `appsData.ts`에 반영한다.

- [ ] **Step 6: 커밋 (사용자 요청 시에만)**

```bash
git add .gitignore public/images/apps src/lib/appsData.ts src/lib/projectFilter.ts src/components/projects src/app/projects src/app/sitemap.ts src/styles/globals.css docs/superpowers/specs/2026-11-09-personal-apps-projects-design.md docs/superpowers/plans/2026-11-09-personal-apps-projects.md
git commit -m "feat(projects): showcase personal apps alongside team projects"
```

- [ ] **Step 7: 상태 문서** — `dogear-status` 스킬로 `docs/STATUS.md`·`docs/status-log.md` 갱신.
