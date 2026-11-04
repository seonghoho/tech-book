---
dogear: 1
name: "seonghoho / tech-book"
summary: "Portfolio + Writing 개인 사이트(seonghoho.com). 운영 중이며 AdSense 재신청을 위해 글을 늘리고 사이트를 정리하는 중."
stage: live
platforms: [web]
updated: 2026-11-04T10:28:11+09:00
monetization: [adsense]
links:
  site: https://seonghoho.com
milestone:
  name: "AdSense 재신청 기준 글 30편"
  done: 27 # 확인 필요: draft 제외 글 파일 수 기준, 실제 색인 수와 다를 수 있음
  total: 30
deadlines:
  - date: 2026-11-04
    title: "초안 발행: web-performance/font-subset-lost-tnum"
local_path: ~/Documents/projects/tech-book
---

## 지금

- seonghoho.com 운영 중. 마지막 커밋은 2026-10-29(홈 최소 인덱스 레이아웃, About 개편, 목록 행 전체 클릭, Blog·BlogPosting·ProfilePage 작성자 연결).
- 10/26~10/28에 frontend-testing 연재(jsdom 없이 컴포넌트 테스트, 테스트 층위)와 frontend-troubleshooting 글을 발행했다.
- 글 파일 32편 중 `draft: true` 5편, 나머지 27편 발행. 재신청 목표는 30편.
- 브랜치 `master`. 커밋 안 한 변경: `src/lib/categoryMap.ts`(backend-serverless·app-link 카테고리 추가), `tsconfig.json`(빌드가 바꾸는 로컬 변경, 커밋 금지).
- 미추적: 새 초안 3편(app-link/ios-universal-link-poc, backend-serverless/r2-if-none-match-idempotency, frontend-troubleshooting/return-path-dot-segments), `docs/testing-study/`, 7월 AdSense spec·plan 문서 2개, `.claude/`.

## 다음

1. 초안 발행: 예정일에 `draft: true` 삭제 → 날짜를 그날로 → 빌드 확인 → push → Search Console 색인 요청. 오늘(11/04) 예정은 font-subset-lost-tnum.
2. 예정일이 지난 초안 확인: snowflake-id-number-precision(10/31), return-path-dot-segments(10/29), ios-universal-link-poc·r2-if-none-match-idempotency(10/30). <!-- 확인 필요: 이 초안들의 발행 일정 -->
3. 새 카테고리(categoryMap 변경)와 미추적 초안 3편 커밋 여부 결정.
4. Search Console "페이지" 보고서 확인: 색인 수 증가, "크롤링됨 - 현재 색인이 생성되지 않음"에 남은 글 보강.
5. 30편을 채운 뒤 AdSense 재신청. <!-- 확인 필요: 재신청 시점 -->

## 작업 흐름

- [x] AdSense 거절 원인 진단과 보완 제안서(10/13)
- [x] 사이트 톤 정리, AI 말투 제거(10/15)
- [x] Pretendard dynamic subset으로 모바일 LCP 개선(10/15)
- [x] 소프트 404 → 실제 404 수정(10/21)
- [x] 글 목록·상세 재설계, 홈·About 개편(10/20~10/29)
- [~] 글 30편 채우기(27/30)
- [ ] 초안 5편 발행
- [ ] AdSense 재신청
- [ ] 7월 AdSense 광고 허용 경로 계획(docs/superpowers/plans/2026-07-15-adsense-eligible-pages.md) <!-- 확인 필요: 이 계획이 아직 유효한지, 진행 여부. 이 계획 파일은 미추적이라 원격에 없음 -->

## 문서

- [README](../README.md)
- [사이트 방향](site-direction.md)
- [콘텐츠 모델](content-model.md)
- [SEO·게시 운영](seo-publishing.md)
- [UI 리팩터링 메모](site-ui-refactor-notes.md)
- [관리자 에디터](admin-editor.md)
- [AdSense 승인 보완 제안서](adsense-approval-proposal.md)
- [AI 말투 점검(2026-10-15)](ai-tone-review-2026-10-15.md)
- 테스트 공부 노트: `testing-study/01-test-map-hankan-dotori.md` (로컬 전용, 아직 커밋 안 됨)
- 설계·계획: `superpowers/specs/`, `superpowers/plans/`
