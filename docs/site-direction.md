# Site Direction

## Summary

이 문서는 이 저장소의 공식 방향을 고정한다. 현재 구현은 이미 블로그, 포트폴리오, 프로젝트 상세 구조를 상당 부분 갖추고 있으며, 앞으로는 이를 `Portfolio + Writing` 허브로 일관되게 운영한다.

관련 문서:

- [content-model.md](./content-model.md)
- [seo-publishing.md](./seo-publishing.md)
- [site-ui-refactor-notes.md](./site-ui-refactor-notes.md)

## Current State

현재 저장소는 `Next.js App Router` 기반 개인 사이트다.

- 홈은 히어로, 대표 글, 대표 프로젝트를 묶은 랜딩 구조를 가지고 있다.
- 프로젝트 아카이브는 `src/lib/aboutData.ts` 의 `aboutProjects` 데이터를 기준으로 `/projects`와 상세 페이지를 구성한다.
- 글 아카이브는 `src/content/posts/**/*.md` 기반의 마크다운 콘텐츠를 읽어 `/posts`와 상세 페이지를 구성한다.
- SEO 기본 골격은 공통 metadata helper, sitemap, robots, RSS, OG route, JSON-LD 형태로 이미 들어가 있다.
- `Games`와 `play` 라우트도 존재하지만, 향후 정보 구조의 중심축으로 키우기보다는 실험성 자산으로 관리하는 편이 맞다.

## Strengths

- 프로젝트와 글이 이미 별도 아카이브로 분리되어 있다.
- `aboutProjects` 중심 구조 덕분에 프로젝트 데이터가 한곳에 모여 있다.
- posts 마크다운 구조 덕분에 기술 글을 계속 누적하기 쉽다.
- metadata, sitemap, robots, RSS가 이미 구현되어 있어 SEO 개선 여지가 크다.
- 홈과 헤더가 `Projects`, `Writing`, `About` 중심 구조에 가깝다.

## Problems To Correct By Documentation

- 저장소 소개와 일부 카피는 여전히 "기술 블로그 + 미니게임" 시절의 맥락을 남기고 있다.
- `Games`를 앞으로 어떤 위상으로 둘지 문서로 고정되어 있지 않았다.
- 새 글과 새 프로젝트를 어떤 기준으로 추가해야 하는지 운영 규칙이 문서화되어 있지 않았다.
- SEO 및 게시 운영 체크리스트가 코드에 흩어져 있고 문서로 정리되어 있지 않았다.

## Official Positioning

이 사이트의 공식 포지셔닝은 다음과 같다.

- `Portfolio + Writing` 중심의 개인 사이트
- 프론트엔드 엔지니어링 관점의 구현 기록과 문제 해결 과정을 다루는 기술 아카이브
- 실무 프로젝트, 토이 프로젝트, 서브 작업을 함께 누적하는 프로젝트 아카이브

이 포지셔닝은 "채용용 포트폴리오만 있는 사이트"도 아니고, "가벼운 개인 블로그만 있는 사이트"도 아니다. 두 축이 서로의 신뢰도를 강화하는 구조를 목표로 한다.

## Primary Audience

- 프론트엔드 엔지니어 채용 담당자 또는 협업 파트너
- 구현 깊이와 문제 해결 방식을 확인하려는 동료 개발자
- 특정 기술 이슈를 검색하다 유입되는 독자

## Priority Order

우선순위는 아래 순서를 따른다.

1. `/projects`
2. `/posts`
3. `/`
4. `/about`
5. `/games`

설명:

- `/projects`는 앞으로 계속 늘어날 실험 작업과 사이드 프로젝트를 수용하는 핵심 아카이브다.
- `/posts`는 검색 유입과 전문성 증명에 가장 직접적으로 기여한다.
- `/`는 위 두 축을 연결하는 허브다.
- `/about`는 신뢰 보강용 페이지다.
- `/games`는 유지하되 핵심 IA에서는 보조 축으로 둔다.

## Non-Goals

다음은 현재 방향에서 비목표로 둔다.

- `Games`를 독립 메인 브랜드처럼 확장하는 일
- 최상위 내비게이션에 새로운 실험 전용 축을 계속 추가하는 일
- 프로젝트 설명보다 시각 효과를 우선하는 랜딩 운영
- 일관된 기준 없이 포트폴리오/블로그/실험실 정체성을 계속 바꾸는 일

## Information Architecture Principles

- 홈은 "대표 프로젝트 + 대표 글"을 가장 먼저 보여준다.
- 프로젝트는 `/projects`에 누적하고, 실험성 작업도 가능하면 이 축 안에서 설명한다.
- 글은 `/posts`에 누적하고, 카테고리와 태그는 탐색 보조 수단으로 사용한다.
- `/about`는 경력, 강점, 협업 방식, 대표 작업을 빠르게 스캔할 수 있게 유지한다.
- `Games`는 라우트를 유지하더라도 메인 정보 구조에서 중심축처럼 설명하지 않는다.

## Decision For Future Work

- 문서 기준이 바뀌면 먼저 이 문서를 업데이트한다.
- UI 리뉴얼이 있어도 이 포지셔닝은 유지한다.
- 구조 개편이 필요할 때도 `Portfolio + Writing` 우선순위를 깨지 않는 범위에서 진행한다.
