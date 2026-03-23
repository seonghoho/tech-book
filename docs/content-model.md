# Content Model

## Summary

이 문서는 이 저장소에서 어떤 콘텐츠를 어떤 규칙으로 관리하는지 정의한다. 현재 런타임 계약은 크게 `Posts`, `Projects`, `About`, `Games` 네 층으로 나뉘며, 실제 우선순위는 `Projects`와 `Posts`가 가장 높다.

관련 문서:

- [site-direction.md](./site-direction.md)
- [seo-publishing.md](./seo-publishing.md)

## Content Types

### Writing

- 목적: 검색 유입, 문제 해결 기록, 전문성 증명
- 소스 오브 트루스: `src/content/posts/**/*.md`
- 라우트: `/posts`, `/posts/[...slug]`
- 보조 탐색: `/categories/[category]`, `/tags/[tag]`

### Projects

- 목적: 대표 작업, 토이 프로젝트, 사이드 프로젝트를 아카이브로 누적
- 소스 오브 트루스: `src/lib/aboutData.ts`
- 핵심 계약: `AboutProject` 타입과 `aboutProjects` 배열
- 라우트: `/projects`, `/projects/[slug]`

### About

- 목적: 경력, 강점, 협업 방식, 신뢰도 보강
- 소스 오브 트루스: `src/lib/aboutData.ts`
- 관련 데이터: `aboutProfile`, `experienceTimeline`, `strengthHighlights`, `skillGroups`, `growthNotes`

### Games / Experiments

- 목적: 기존 실험성 자산과 플레이 가능한 결과물 유지
- 소스 오브 트루스: `src/content/games/**/*.md` 및 관련 게임 구현 코드
- 원칙: 별도 핵심 축이 아니라 `Projects` 하위 성격의 실험 아카이브로 해석한다

## Post Model

### Source Rule

- 파일 위치는 `src/content/posts/<category>/<slug>.md` 형식을 따른다.
- 현재 구현에서는 slug의 첫 번째 디렉터리명이 category로 해석된다.
- 즉 category는 frontmatter가 아니라 디렉터리 구조에서 파생된다.

예시:

```text
src/content/posts/svg-editor/three-js-gimbal-lock.md
```

위 예시의 category는 `svg-editor`, 최종 URL은 `/posts/svg-editor/three-js-gimbal-lock`가 된다.

### Frontmatter Contract

현재 코드가 읽는 필드는 아래와 같다.

- `title`: 필수. 글 제목
- `date`: 필수. 게시일
- `description`: 필수 권장. 목록, 메타데이터, RSS 설명에 사용
- `tags`: 선택. 문자열 배열 또는 쉼표 구분 문자열
- `updated`: 선택. 수정일
- `featured`: 선택. 홈/대표 글 후보 여부
- `image`: 선택이지만 강하게 권장. 대표 이미지 경로이며, metadata/OG용 자산으로 사용한다.

### Writing Standard

- 글은 단순 요약보다 문제, 맥락, 해결 과정, 결과가 드러나야 한다.
- 검색 유입을 고려해 제목과 설명은 문제를 식별할 수 있게 쓴다.
- 구현 디테일이 있다면 가능한 한 실제 선택 이유와 트레이드오프를 남긴다.
- 내부 링크를 통해 관련 프로젝트나 관련 글로 이어질 수 있게 한다.
- `featured`는 홈에서 먼저 노출해도 되는 글에만 사용한다.
- 대표 이미지를 둘 경우, 본문 첫 캡처가 아니라 검색/공유용 대표 자산이라는 역할로 관리한다.

## Project Model

### Source Rule

- 현재 프로젝트 데이터의 소스 오브 트루스는 `src/lib/aboutData.ts` 의 `aboutProjects` 배열이다.
- 프로젝트 상세와 아카이브 UI는 이 배열이 깨지지 않는 것을 전제로 한다.
- 향후 CMS나 파일 기반 구조로 옮기더라도, 그 전까지는 이 파일을 기준으로 운영한다.

### Required Fields

현재 `AboutProject` 타입 기준으로 아래 항목은 사실상 필수다.

- `slug`
- `title`
- `eyebrow`
- `tagline`
- `period`
- `status`
- `posterColor`
- `team`
- `role`
- `summary`
- `overview`
- `context`
- `tags`
- `narrative`
- `cardPoints`
- `keyContributions`
- `technicalHighlights`
- `techStack`
- `outcomes`
- `links`
- `preview`
- `gallery`

아래 항목은 선택이다.

- `posterTextColor`
- `posterLogoSrc`
- `posterLogoAlt`
- `duration`
- `achievement`
- `featured`

### Project Writing Standard

- `summary`: 목록과 메타 설명에서 곧바로 이해되는 한 문단 요약
- `overview`: 프로젝트가 무엇을 해결하는지 설명하는 소개
- `context`: 왜 이 프로젝트가 필요했고 어떤 문제를 다뤘는지 설명
- `narrative`: 구현 과정과 결정 이유를 서술형으로 정리
- `keyContributions`: 내가 맡은 역할과 구현 범위를 구체적으로 기술
- `technicalHighlights`: 기술 선택, 아키텍처, 인터랙션, 렌더링 등 기술적 포인트를 정리
- `outcomes`: 결과, 영향, 수치, 성과를 정리

새 토이 프로젝트나 서브 프로젝트를 추가할 때도 아래 기준을 지킨다.

- 결과물만이 아니라 문제와 목적이 설명되어야 한다.
- 링크와 이미지가 최소한의 포트폴리오 품질을 만족해야 한다.
- 실험성 작업이라도 포트폴리오 관점에서 설명 가능한 구조로 정리한다.

## Classification Rule

- `Writing`, `Projects`, `About`는 핵심 축이다.
- 실험성 작업은 가능하면 `Projects`에 편입한다.
- `Games`는 유지하되 독립 메인 축으로 분류하지 않는다.
- `/about`는 별도 콘텐츠 허브가 아니라, 프로젝트와 글의 신뢰도를 보강하는 페이지다.

## Editorial Rule Of Thumb

- 글이 검색 중심 지식 자산이면 `Posts`
- 결과물과 구현 책임을 보여주는 작업이면 `Projects`
- 경력과 강점, 협업 맥락이면 `About`
- 플레이 가능한 실험이나 옛 자산이면 `Games`, 단 설명은 가능하면 `Projects`와 연결
