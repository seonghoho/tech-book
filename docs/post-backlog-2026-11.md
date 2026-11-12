# 글 주제 목록 (2026-11-13 ~ 12-03, 3주)

2026-08 이후 개인 프로젝트 레포의 fix·perf 커밋에서 뽑았다. 이미 쓴 글 34편과 주제가 겹치지 않게 골랐다.

## 쓰는 규칙

- 글마다 **직접 겪은 문제, 직접 잰 수치, 직접 내린 결정** 중 하나는 꼭 들어간다. 커밋과 diff로 초안을 만들 수는 있지만, "왜 그렇게 했는지"는 직접 채운다.
- `date`는 실제 공개일로 쓴다. 미리 써 둔 글은 `draft: true`로 두었다가 공개하는 날 바꾼다.
- 한 편에 문제 하나만 다룬다. 같은 레포 글이 연달아 나오지 않게 섞는다.
- 아래 "출처"는 소재를 찾을 위치다. 글에 레포 이름을 꼭 밝힐 필요는 없다.

## 1주차

| 날짜 | 제목(가안) | 카테고리 | 출처 | 직접 채울 것 |
|---|---|---|---|---|
| 11/13 | 관리자 입력 칸에서 한글 자모가 흩어지던 문제 | frontend-troubleshooting | receipt-photobooth-android `fix: 관리자 입력 칸에서 한글 자모가…` | 재현 화면, Compose 입력 처리에서 원인을 찾은 과정 |
| 11/14 | 세션 복구가 끝나기 전에 보낸 요청을 살리는 방법 | frontend-bff | LitMood `#58` | 토큰 갱신 중 동시 요청이 몇 개였는지, 대기열을 둔 이유 |
| 11/15 | 서버 렌더링 요청이 방문자 요청 한도를 같이 쓰던 문제 | backend-serverless | LitMood `#79` | 한도에 걸린 로그, SSR 호출을 따로 센 기준 |
| 11/16 | 정적 블로그 HTML을 60% 줄인 방법: 인라인 font-face 빼기 | web-performance | blog `perf: cut home/post HTML by ~60%` | 전후 HTML 크기, LCP 측정값 |
| 11/17 | "36만 9천 원"을 한 덩어리로 강조하는 정규식 | frontend-troubleshooting | blog `fix: highlight compound amounts…` | 깨지던 예시들, 최종 정규식과 테스트 케이스 |
| 11/18 | 백엔드에 닿지 못해도 랜딩 페이지는 뜨게 하기 | frontend-bff | LitMood `#51` | 장애 때 실제로 보이던 화면, 폴백 기준 |
| 11/19 | kind 배포 스크립트가 새 이미지를 실행하지 않던 이유 | backend-serverless | LitMood `fix: kind 배포 스크립트…`, `#47` | 이미지 태그·pull 정책을 확인한 순서 |

## 2주차

| 날짜 | 제목(가안) | 카테고리 | 출처 | 직접 채울 것 |
|---|---|---|---|---|
| 11/20 | PixiJS 청크를 나누고 전투 배경을 늦게 불러오기 | web-performance | slime-village `perf(web): split pixi chunk…` | 번들 크기와 첫 화면 로딩 시간 전후 |
| 11/21 | 다른 계정의 데이터를 push하면 403이 아니라 400을 돌려준 이유 | backend-serverless | hankan `fix(F09)` 커밋 3개 | 동기화 시나리오, 상태 코드를 고른 기준 |
| 11/22 | 저사양 기기를 위한 Three.js 드로우콜 예산 정하기 | web-performance | 3D `perf(healing): low·potato에서…` | 품질 단계별 드로우콜 수, 끈 메시와 그 이유 |
| 11/23 | 같은 요청이 동시에 들어올 때 한 번만 처리하는 single-flight | backend-serverless | dogear `fix(sync): single-flight per request key…` | 중복 호출 로그, 키를 정한 기준 |
| 11/24 | 약관·개인정보처리방침 버전과 시행일 관리하기 | frontend-bff | hankan `fix(F08)`, `fix(F15)` | 이전 버전 동의를 인정한 이유, 시행일 확정 과정 |
| 11/25 | 미리보기에서 돌아와도 게임이 멈춰 있던 이유: 정지 사유를 집합으로 관리하기 | frontend-troubleshooting | 3D `fix(healing): 미리보기 복귀 때…` 2개 | 버그 재현 순서, 전후 구조 |
| 11/26 | Playwright E2E가 요청이 끝나기 전에 화면을 옮기던 문제 | frontend-testing | LitMood `#9` 커밋들 | 실패하던 테스트, 대기 조건을 바꾼 방법 |

## 3주차

| 날짜 | 제목(가안) | 카테고리 | 출처 | 직접 채울 것 |
|---|---|---|---|---|
| 11/27 | 약한 강조 배경 위 글자 대비를 5.6:1로 맞춘 과정 | frontend-troubleshooting | receipt-photobooth-android `--accent-text(#2459C4, 5.6:1)` | 원래 대비값, 색을 고른 과정 |
| 11/28 | Android 위젯 설정 화면이 시스템 표시줄에 가려지던 문제 | frontend-troubleshooting | hankan `fix(F18)` | 기기별 스크린샷, inset 처리 방법 |
| 11/29 | FBM 노이즈로 만든 구름이 너무 많이 덮던 문제: 실측 분포로 맞추기 | frontend-troubleshooting | 3D `fix(healing): 구름 덮임을 FBM 실측 분포에 맞춤` | 노이즈 값 분포 측정 결과, 임계값 조정 전후 화면 |
| 11/30 | 광고 제거 구매에서 전면 광고만 없앤 이유 | 새 카테고리 필요(앱 운영) | slime-village `fix(ads): remove-ads purchase only removes interstitials` | 결정 배경, 스토어 정책 확인 내용 |
| 12/01 | 가로 휴대폰에서 웹 게임 화면이 무너지던 문제 | frontend-troubleshooting | space-cleanup-defense 섹터 탭, slime-village 홈 건물 배치 | 비율별 화면, 레이아웃 기준 |
| 12/02 | 브라우저에서 PGlite로 로컬 DB를 붙이며 만난 문제 | backend-serverless | dogear `fix(db)`, `perf(db)` | 디렉터리 생성 실패 재현, 시드 생략 기준 |
| 12/03 | Next.js 16.4.0 보안 패치를 올리며 확인한 것 | frontend-bff | hankan `fix(deps): Next.js 16.4.2` | 어떤 취약점이었는지, 영향 범위를 확인한 방법 |

## 예비 주제

- 공문서 날짜·비율 표기를 본문 표기와 맞춰 수치를 대조하기 (blog)
- 캐디 표정 이미지 80장을 기본 얼굴 위치에 맞춰 정렬하기 (green-putt)
- GitHub에서 "가장 최근 브랜치"를 커밋 날짜로 고르고 gh-pages·봇 브랜치 거르기 (dogear)
- Claude Code Stop 훅에서 세션 이전 커밋을 건너뛰기 (dogear)
