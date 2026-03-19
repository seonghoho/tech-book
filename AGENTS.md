# AGENTS.md

## Purpose

이 저장소는 개인 브랜딩 사이트를 `Portfolio + Writing` 중심으로 운영하기 위한 프로젝트다. 모든 변경은 검색 친화적인 기술 글, 신뢰도 있는 포트폴리오, 누적 가능한 프로젝트 아카이브라는 세 축을 강화해야 한다.

## North Star

- 홈(`/`)은 포트폴리오와 글을 함께 소개하는 허브다.
- `/projects`와 `/posts`는 1급 자산이다. 새 콘텐츠와 개선은 이 두 축을 우선 강화한다.
- `/about`는 신뢰를 보강하는 보조 축이다.
- `Games`는 당장 라우트를 유지하되, 독립 브랜드나 주력 섹션으로 키우지 않는다.
- 토이 프로젝트, 사이드 프로젝트, 실험 작업은 계속해서 `/projects` 아카이브에 누적한다.
- SEO를 해치는 구조 변경, 메타데이터 누락, canonical 혼선은 허용하지 않는다.

## Read Order

작업 전에는 아래 문서를 우선순위대로 확인한다.

1. `docs/site-direction.md`
2. `docs/content-model.md`
3. `docs/seo-publishing.md`
4. `docs/site-ui-refactor-notes.md`

## Source Of Truth

- Posts: `src/content/posts/**/*.md`
- Projects: `src/lib/aboutData.ts` 의 `AboutProject` 타입과 `aboutProjects` 배열
- Games docs: `src/content/games/**/*.md`
- SEO 공통 정책: `src/lib/seo.ts`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

## Working Rules

- 사이트 소개 문구를 다시 "기술 블로그 + 미니게임" 중심으로 되돌리지 않는다.
- 홈 화면은 항상 "선별된 글 + 선별된 프로젝트" 조합을 우선한다.
- `/projects`와 `/posts`를 약화시키는 새로운 최상위 축을 임의로 만들지 않는다.
- `Games` 관련 작업은 가능하면 프로젝트/실험 아카이브 맥락으로 설명한다.
- 프로젝트 데이터 구조를 바꾸기 전에는 `aboutProjects`가 현재 소스 오브 트루스라는 점을 유지한다.
- 글 카테고리 체계는 `src/content/posts` 디렉터리 구조와 slug 규칙을 따른다.
- SEO 정책을 바꾸는 작업은 반드시 `docs/seo-publishing.md`와 함께 갱신한다.

## Content Addition Checklist

### New Post

- `src/content/posts/<category>/...` 아래에 추가한다.
- `title`, `date`, `description`은 반드시 채운다.
- `tags`, `updated`, `featured`, `image`는 필요 시 추가하되 의미 없이 채우지 않는다.
- 제목만 설명하는 글이 아니라 문제, 구현 맥락, 해결 과정, 결과가 드러나야 한다.
- 관련 프로젝트나 글로 이어지는 내부 링크를 최소 1개 이상 고려한다.

### New Project

- 현재 기준 소스 오브 트루스는 `src/lib/aboutData.ts` 의 `aboutProjects`다.
- 새 토이/서브 프로젝트라도 포트폴리오 관점에서 설명 가능한 수준의 `summary`, `overview`, `context`를 작성한다.
- `tags`, `cardPoints`, `keyContributions`, `technicalHighlights`, `techStack`, `outcomes`, `links`, `preview`, `gallery`를 빠뜨리지 않는다.
- `status`, `period`, `role`, `team`은 아카이브 탐색과 신뢰도에 직접 영향을 주므로 생략하지 않는다.
- 프로젝트가 실험성 작업이라도 `Games` 단독 축으로 분리하지 말고 프로젝트 아카이브 맥락에 맞춘다.

## Avoid

- 메타데이터 없이 새 상세 페이지를 추가하는 작업
- canonical 경로와 실제 라우트가 어긋나는 변경
- 홈을 개인 일기장이나 실험실 랜딩처럼 만드는 변경
- 프로젝트보다 실험성 라우트를 더 앞세우는 내비게이션 변경
- 문서 기준을 갱신하지 않은 채 사이트 포지셔닝을 바꾸는 작업

## Done Criteria

- 변경 내용이 `Portfolio + Writing` 방향과 충돌하지 않는다.
- 새 콘텐츠나 카피가 `/projects` 또는 `/posts` 강화에 기여한다.
- SEO, 메타데이터, canonical, 내부 링크에 명백한 누락이 없다.
- 문서 기준이 바뀌었다면 `AGENTS.md` 또는 `docs/`가 함께 갱신되어 있다.
