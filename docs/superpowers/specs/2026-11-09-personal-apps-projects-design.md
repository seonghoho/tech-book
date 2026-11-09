# /projects에 개인 앱 소개 추가 — 설계

날짜: 2026-11-09

## 의도

`/projects`는 지금 팀·교육과정 프로젝트 6개(MathCanvas, NowDoBoss, Mancity, pawsitive, TripMarble, Cherry Wish)만 포스터 그리드로 보여준다. 여기에 직접 만든 개인 앱을 함께 소개한다.

방문자가 이 화면에서 하길 바라는 것은 두 가지다(사용자 의도).

1. **바로 행동** — Play 스토어에서 받거나 웹에서 바로 플레이한다.
2. **기억** — "이 사람은 이런 것까지 도전해서 끝까지 만드는구나"를 남긴다.

## 목표

- 완성도 높은 개인 앱 6개를 소개한다. 기준은 "지금 누구나 쓰거나 플레이할 수 있는 것", 예외로 영수증 포토부스는 진행 상황만 보여준다.
- 개인 앱을 우선으로 보여주되, 팀 프로젝트와 한 화면에서 모든 카드를 보고 카드마다 개인/팀을 구분할 수 있게 한다.
- 개인 앱 카드에서 바로 Play/웹으로 이동할 수 있게 한다.

## 하지 않는 것

- 팀 프로젝트 데이터·상세 페이지 내용 변경(배지 추가 외).
- 퍼팅게임 외 미완성 앱(LitMood, 슬라임 마을, 마음정원 등) 소개.
- 앱 스토어 배지 이미지 공식 에셋 도입(텍스트 버튼으로 충분, 아래 참고).

## 실패로 보는 것

- 영수증 포토부스 카드에서 receipt.seonghoho.com(소개·관리자 사이트)으로 들어갈 수 있는 링크가 생기는 것. **어떤 형태로도 외부 링크를 노출하지 않는다.**
- 카드 높이가 줄마다 들쭉날쭉해 보이는 것(모양이 다른 카드가 한 그리드에 섞이므로).
- 팀 프로젝트가 스크롤 아래로 밀려 사실상 안 보이는 구조(B안을 기각한 이유).

## 확정된 내용 (사용자 결정)

### 레이아웃: 한 그리드 + 필터 칩 (A안)

- 페이지 상단 제목 아래 필터 칩: **전체 / 개인 앱 6 / 팀 프로젝트 6**. 기본값은 "전체".
- 그리드 순서: 개인 앱 6개 → 팀 프로젝트 6개.
- 모든 카드에 구분 배지: "개인 앱"(accent-soft 배경, accent 글자) / "팀 프로젝트"(surface-muted 배경, secondary 글자). 영수증 포토부스는 "개인 앱" 배지와 "개발 중" 배지를 **함께** 단다(내 판단 — 모든 카드가 개인/팀으로 구분돼야 하고, 필터 숫자 6에 포함되므로).
- 개인 앱 카드와 팀 프로젝트 카드는 디자인이 다르다. 단, **바깥 틀(폭·모서리·썸네일 영역 비율)은 같게** 맞춘다.

### 앱 목록과 연결

| 순서 | 앱 | 슬러그(제안) | 주 버튼 | 보조 버튼 | 썸네일 원본 |
|---|---|---|---|---|---|
| 1 | 한칸 | hankan | Google Play → `https://play.google.com/store/apps/details?id=com.seonghoho.hankan` | 웹에서 보기 → `https://hankan.seonghoho.com` | `~/Documents/projects/hankan/docs/store/graphics/play-feature-1024x500.png` |
| 2 | 다람쥐 퍼즐 | dotori | Google Play → `https://play.google.com/store/apps/details?id=com.seonghoho.dotori` | 웹에서 플레이 → `https://dotori.seonghoho.com` | `~/Documents/projects/dotori/assets/branding/play-feature-graphic-1024x500.png` |
| 3 | 궤도 청소대 | space-cleanup | 플레이하기 → `https://space-defence.seonghoho.com` | — | `~/Documents/projects/space-cleanup-defense/public/og-image.png` |
| 4 | View Racer | view-racer | 플레이하기 → `https://view-racer.seonghoho.com` | — | `~/Documents/projects/3D/public/og-challenge.png` |
| 5 | 그린 퍼팅 | green-putt | 플레이하기 → `https://putt.seonghoho.com` | — | `~/Documents/projects/green-putt/public/og-image.jpg` |
| 6 | 영수증 포토부스 | receipt-photobooth | 작업 내용 보기 → 블로그 내부 페이지 | — | `~/Documents/projects/receipt-photobooth-android/app/src/main/res/drawable/landing_hero.png` (세로형, `object-contain` + 여백 배경) |

- 외부 링크는 새 탭(`target="_blank" rel="noopener noreferrer"`).
- 썸네일은 `public/images/apps/<slug>.<ext>`로 복사해 `next/image`로 쓴다. 표시 비율은 약 1.9:1(1200×630 기준)로 `object-cover`.

### 카드 문구 초안 (사용자가 최종 확인)

레포 문서에서 뽑은 초안. 문체는 블로그의 기존 톤(평이한 서술, 과장 없음)을 따른다.

- **한칸** — 하루에 한 칸씩, 손으로 그린 동그라미를 칠해 나가는 습관 체크. 웹과 Android 앱이 동기화돼요. / 상태: Google Play 출시
- **다람쥐 퍼즐** — 다람쥐가 숲에 도토리를 숨기는 손그림 논리 퍼즐(스타 배틀 규칙). 퍼즐 생성기·풀이기를 직접 만들었어요. / 상태: Google Play 출시
- **궤도 청소대** — 우주 쓰레기를 쪼개고 붙잡아 치우는 경로형 타워 디펜스. 화면 없이 수십 판을 돌리는 시뮬레이터로 밸런스를 맞췄어요. / 상태: 웹 운영 중 · Android 준비 중
- **View Racer** — Three.js 타임어택 레이싱. 하나의 3D 월드를 체이스·시네마틱·탑다운·1인칭 네 시점으로 전환하고, 고스트·순위·챌린지 공유를 붙였어요. / 상태: 웹 운영 중
- **그린 퍼팅** — 새총처럼 당겨 치는 2.5D 퍼팅 게임. 전속 캐디와 함께 단계를 하나씩 넘어가요. / 상태: 웹 체험 가능
- **영수증 포토부스** — 10인치 태블릿에서 사진을 찍어 ESC/POS 영수증 프린터로 출력하는 렌탈형 키오스크. 앱·운영자 웹·사진 QR 다운로드까지 만들었어요. / 상태: 개발 중 · 실기기 검증 단계

### 영수증 포토부스 상세

"작업 내용 보기"는 블로그 내부 페이지 `/projects/receipt-photobooth`로 간다(내 판단 — 카드 펼치기보다 내용이 길고, 링크로 공유할 수 있어서). 담을 내용:

- 무엇인가: 태블릿 촬영 → USB OTG ESC/POS 프린터(58·80mm) 출력, 렌탈형 키오스크.
- 만든 것: Android 앱, Cloudflare Worker 서버, 운영자 웹(기기 등록·통계·사진 삭제), 영수증 QR → 사진 내려받기(보관 기간 만료·고객 직접 삭제).
- 진행 상황: 구현 완료, 실기기 검증 남음, 스토어 없이 APK 자체 배포 구조.
- 이미지: landing_hero.png. receipt.seonghoho.com 및 하위 주소는 **텍스트로도 링크로도 넣지 않는다**.
- 이 페이지는 `aboutProjects`에 넣지 않는다(About 화면·이전/다음 이동이 바뀌므로). `src/app/projects/receipt-photobooth/` 정적 폴더로 두고, 사이트맵에는 따로 추가한다(내 판단).

### 문구 작성과 확인 시점

- 카드 문구와 상세 페이지 본문은 모두 데이터 파일 한 곳에 모은다.
- 문구 확인 방식(사용자 결정): 카드 문구와 상세 페이지 본문 모두 빌더가 초안을 쓰고, **커밋 전에 사용자에게 한 번에 확인**받는다.
  - 초안 근거는 각 앱 레포의 README·`docs/STATUS.md`·스펙 문서.
  - 톤은 블로그 규칙을 따른다: 사용자 본인의 경험을 1인칭으로 쓰고, 평이한 제목, AI가 쓴 듯한 표현이나 과장 없이.

## 빌더에게 맡기는 것

- 데이터 위치·타입: 개인 앱용 타입을 `AboutProject`와 분리해 새로 둘지(예: `src/lib/appsData.ts`), 어떻게 합칠지. 단, 팀 프로젝트 6개는 About 페이지 등 다른 곳에서도 쓰이니 기존 `aboutProjects`는 그대로 둔다.
- 팀 프로젝트 카드를 같은 바깥 틀에 맞추는 방법(기존 `ProjectPoster`를 가로 틀 안에 배치 등).
- 필터 칩을 `?filter=apps|team` 쿼리로 동기화(링크 공유용). 페이지가 `force-static`이므로 클라이언트 컴포넌트(`*Client.tsx`)로 칩 상태를 처리하고, 쿼리 없이 들어오면 "전체"를 서버 렌더한다.
- 반응형 열 수(모바일 1~2열, 데스크톱 3열 권장 — 버튼이 들어가므로 기존 6열은 좁다).
- `/projects` 메타 설명 문구 갱신("직접 만든 앱과 팀 프로젝트" 정도).
- 홈·About 등 다른 곳에서 `ProjectArchiveGrid`를 쓰는 곳은 영향 없게 유지.

## 제약

- CLAUDE.md 규칙: 색은 CSS 변수(`[color:var(--color-*)]`), 기존 컴포넌트 클래스(`surface-panel`, `tag-chip`, `button-primary`, `button-secondary`) 우선, 라운드·트랜지션 규칙 준수, 다크 모드 대응.
- 이미지는 `next/image` + `sizes` 지정.
- 커밋·푸시는 사용자 요청 시에만.
