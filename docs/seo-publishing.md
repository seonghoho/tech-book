# SEO And Publishing

## Summary

이 문서는 이 저장소의 SEO 및 게시 운영 기준을 정리한다. 목표는 검색 유입을 늘리는 것 자체보다, `Portfolio + Writing` 구조를 해치지 않으면서 검색 친화적인 페이지를 일관되게 발행하는 것이다.

관련 문서:

- [site-direction.md](./site-direction.md)
- [content-model.md](./content-model.md)

## Current SEO Infrastructure

현재 구현에는 아래 기반이 이미 존재한다.

- 공통 metadata 설정: `src/app/layout.tsx`
- 페이지별 metadata helper: `src/lib/seo.ts`
- sitemap: `src/app/sitemap.ts`
- robots: `src/app/robots.ts`
- RSS: `src/app/rss/route.ts`, `src/app/feed.xml/route.ts`
- OG 이미지 route: `src/app/og/[slug]/route.ts`
- 구조화 데이터: `WebSite`, `Article`, `BreadcrumbList`, `SoftwareApplication`

정책을 바꾸거나 페이지 유형을 늘릴 때는 위 지점과 함께 문서를 업데이트한다.

## Page Roles

### Home

- 역할: 브랜드 허브이자 대표 글/대표 프로젝트 진입점
- 인덱싱: 허용
- 목표: 사이트 정체성을 가장 짧은 시간에 전달

### Projects Archive

- 역할: 대표 작업과 앞으로 누적될 토이/사이드 프로젝트의 중심 아카이브
- 인덱싱: 허용
- 목표: 이름 검색, 프로젝트명 검색, 포트폴리오 탐색 유입 대응

### Project Detail

- 역할: 개별 작업의 맥락과 기여를 설명하는 랜딩 페이지
- 인덱싱: 허용
- 목표: 프로젝트명, 기술 조합, 구현 사례 검색 대응

### Posts Archive

- 역할: 글 아카이브와 탐색 허브
- 인덱싱: 허용
- 목표: 주제 기반 탐색과 검색 유입 분산 수용

### Post Detail

- 역할: 검색 유입을 받는 핵심 지식 자산
- 인덱싱: 허용
- 목표: 문제 해결 과정, 구현 맥락, 전문성 증명

### About

- 역할: 경력과 강점을 빠르게 검증하는 신뢰 보강 페이지
- 인덱싱: 허용
- 목표: 이름 검색, 프로필 확인, 이력 검증

### Search

- 역할: 내부 탐색 보조
- 인덱싱: 금지
- 현재 정책: `/search` 는 `noindex, follow`

### Games

- 역할: 유지 중인 실험/플레이 자산
- 인덱싱: 현재 구현상 허용될 수 있음
- 원칙: 검색과 내비게이션에서 `Projects`와 `Writing`보다 앞세우지 않는다

## Publishing Checklist

새 글이나 프로젝트를 게시할 때 아래 항목을 확인한다.

- 제목이 검색 의도와 페이지 성격을 분명히 드러내는가
- `description`이 목록, OG, RSS에서 그대로 노출되어도 괜찮은가
- canonical 경로가 실제 라우트와 일치하는가
- OG 이미지 또는 대표 이미지가 준비되었는가
- 구조화 데이터가 해당 페이지 유형과 맞는가
- 내부 링크가 최소 1개 이상 연결되는가
- slug가 지나치게 일반적이거나 중복되지 않는가
- 수정 이력이 있으면 `updated`를 관리하는가
- 페이지가 `Projects`, `Posts`, `About` 중 어느 축을 강화하는지 분명한가

## Post-Specific Checklist

- 파일 경로가 category 규칙과 맞는가
- `title`, `date`, `description`이 모두 채워졌는가
- `featured`는 홈에서 먼저 보여줘도 되는 글에만 사용했는가
- `image`가 있다면 실제 공개 경로와 일치하는가
- 관련 글 또는 관련 프로젝트로 내부 링크를 연결했는가

## Project-Specific Checklist

- `aboutProjects`에 필요한 필드를 빠뜨리지 않았는가
- `summary`, `overview`, `context`가 서로 다른 역할을 하고 있는가
- `cardPoints`, `keyContributions`, `technicalHighlights`, `outcomes`가 중복 없이 읽히는가
- `preview`와 `gallery`가 실제 프로젝트를 설명하는 자산인가
- 프로젝트가 실험성 작업이어도 `Projects` 아카이브 안에서 설명 가능한가

## Internal Linking Principles

- 홈은 대표 글과 대표 프로젝트로 자연스럽게 이어져야 한다.
- 글 상세에서는 관련 글, 카테고리, 태그, 프로젝트 축으로 이어지는 연결을 고려한다.
- 프로젝트 상세에서는 관련 기술 글이나 외부 결과물 링크를 고려한다.
- `Games` 링크는 보조 탐색으로는 가능하지만 핵심 흐름을 가로막지 않게 둔다.

## Known Operational Issues

2026년 3월 20일 기준으로 확인된 운영 이슈는 아래와 같다.

- `npm run build` 는 통과한다.
- `npm run lint` 는 현재 `package.json` 에서 `next lint` 를 실행하지만, 현 설정에서는 정상 동작하지 않는다.
- 같은 날 `next build` 실행 과정에서 `tsconfig.json` 의 `jsx` 설정이 `react-jsx` 로 자동 수정되었다. Next.js 16.1.0 환경의 툴링 부수효과로 보고 있으며, 이후 자동화나 스크립트 정비 시 주의가 필요하다.

이 문서는 현재 상태를 과장하지 않는다. build 통과만 확인되었고, lint는 아직 운영상 broken 상태다.
