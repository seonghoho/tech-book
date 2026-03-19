# seonghoho / tech-book

이 저장소는 개인 사이트를 `Portfolio + Writing` 허브로 운영하기 위한 Next.js App Router 프로젝트입니다. 목표는 검색에 잘 걸리는 기술 글, 신뢰도 있는 포트폴리오, 그리고 앞으로 계속 누적될 프로젝트 아카이브를 한 구조 안에서 관리하는 것입니다.

## Core Sections

- `/`: 글과 프로젝트를 함께 소개하는 허브
- `/projects`: 대표 작업과 앞으로 쌓일 토이/서브 프로젝트 아카이브
- `/posts`: 기술 학습, 트러블슈팅, 구현 기록 아카이브
- `/about`: 프로필과 경험을 정리하는 신뢰 보강 페이지
- `/games`: 유지 중인 실험/플레이 라우트. 핵심 IA에서는 보조 축으로 취급

## Read First

- [AGENTS.md](./AGENTS.md)
- [docs/site-direction.md](./docs/site-direction.md)
- [docs/content-model.md](./docs/content-model.md)
- [docs/seo-publishing.md](./docs/seo-publishing.md)
- [docs/site-ui-refactor-notes.md](./docs/site-ui-refactor-notes.md)

## Source Of Truth

- Posts: `src/content/posts/**/*.md`
- Projects: `src/lib/aboutData.ts` 의 `AboutProject` / `aboutProjects`
- Games docs: `src/content/games/**/*.md`

## Notes

- 이 저장소의 공식 포지셔닝은 더 이상 "기술 블로그 + 미니게임"이 아니라 `Portfolio + Writing`입니다.
- 문서 기준 변경이 필요하면 코드보다 먼저 `docs/`와 `AGENTS.md`를 갱신합니다.
