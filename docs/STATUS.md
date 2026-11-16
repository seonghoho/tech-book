---
dogear: 1
name: "seonghoho / tech-book"
summary: "Portfolio + Writing 개인 사이트(seonghoho.com). AdSense가 11/12에 '가치가 별로 없는 콘텐츠'로 거절해, 색인을 늘리려고 개인 레포 커밋 기반 글을 매일 1편씩 예약 발행하는 중."
stage: live
platforms: [web]
updated: 2026-11-12T13:46:08+09:00
monetization: [adsense]
links:
  site: https://seonghoho.com
milestone:
  name: "sitemap 기준 색인 40개"
  done: 21 # Search Console sitemap 필터, 데이터 기준일 11/06
  total: 40
local_path: ~/Documents/projects/tech-book
---

## 지금

- 11/12 AdSense 결과: "주의 필요 · 가치가 별로 없는 콘텐츠". Search Console sitemap 필터 기준 색인 21개, 미색인 17개(이유 1개), sitemap URL 51개(글 35, projects 13, 기타 3). 도메인 속성 전체로는 색인 52, 미색인 78인데 서브도메인이 섞인 숫자다.
- 원인 판단: 색인된 글이 적고 색인 이력이 3주 정도로 짧다(10/22 무렵 시작). 서브도메인은 주원인이 아니다.
- 대응: 개인 레포 fix·perf 커밋에서 3주 치 주제 21개를 뽑아 `docs/post-backlog-2026-11.md`에 정리했고, 하루 1편씩 예약 발행한다.
- 첫 글 "관리자 입력 칸에서 한글 자모가 흩어지던 문제"(`frontend-troubleshooting/compose-hangul-jamo-split.md`, date 11/13)를 커밋·push했다(70f634c). 00:05 KST 재배포 크론이 13일에 공개한다.
- 브랜치 `master`, origin과 같음. 커밋 안 한 변경: `docs/STATUS.md`·`docs/status-log.md`, `tsconfig.json`(빌드가 바꾸는 로컬 변경, 커밋 금지). 미추적: `docs/testing-study/`, 7월 AdSense spec·plan 2개, `.claude/`.

## 다음

1. 11/13·11/14·11/16 글 URL 검사에서 색인 요청(세 편 모두 공개, 11/15는 건너뜀). 11/16 글은 `backend-serverless/ssr-calls-rate-limit-bucket.md`(1608b6a).
2. 다음 글: 정적 블로그 HTML을 60% 줄인 방법(blog perf 커밋). 백로그 날짜는 하루씩 밀렸고, 순서대로 하루 1편.
3. Search Console sitemap 필터에서 미색인 17개의 이유와 URL 확인. "크롤링됨 - 현재 색인이 생성되지 않음"이면 해당 글 보강.
4. AdSense 재신청은 sitemap 기준 색인 40개 이상 + 2~3주 뒤.
5. 11/30 글(광고 제거 구매)용 카테고리 결정 필요.
6. 후속글: iOS 스마트 앱 배너 정리, 유니버설 링크 PoC 결과 덧붙이기.

## 작업 흐름

- [x] AdSense 거절 원인 진단과 보완 제안서(10/13)
- [x] 사이트 톤 정리, AI 말투 제거(10/15)
- [x] Pretendard dynamic subset으로 모바일 LCP 개선(10/15)
- [x] 소프트 404 → 실제 404 수정(10/21)
- [x] 글 목록·상세 재설계, 홈·About 개편(10/20~10/29)
- [x] 글 30편 채우기(34편)
- [x] draft 7편 발행(11/06)
- [x] /projects에 개인 앱 6개와 앱 상세 페이지 추가(11/09)
- [x] AdSense 재심사 결과 확인(11/12, 가치가 별로 없는 콘텐츠)
- [x] 3주 치 글 주제 목록(11/12)
- [~] 매일 1편 예약 발행(11/13~12/03)
- [ ] 미색인 17개 원인 확인
- [ ] AdSense 재신청
- [ ] 스마트 앱 배너 후속글

## 문서

- [README](../README.md)
- [사이트 방향](site-direction.md)
- [콘텐츠 모델](content-model.md)
- [SEO·게시 운영](seo-publishing.md)
- [UI 리팩터링 메모](site-ui-refactor-notes.md)
- [관리자 에디터](admin-editor.md)
- [AdSense 승인 보완 제안서](adsense-approval-proposal.md)
- [AI 말투 점검(2026-10-15)](ai-tone-review-2026-10-15.md)
- [글 주제 목록(2026-11)](post-backlog-2026-11.md)
- 테스트 공부 노트: `testing-study/01-test-map-hankan-dotori.md` (로컬 전용, 아직 커밋 안 됨)
- 설계·계획: `superpowers/specs/`, `superpowers/plans/`
