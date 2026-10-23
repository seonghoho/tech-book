---
title: "Upscayl 사용법: 작은 사진을 깨지지 않게 키우는 무료 프로그램 (윈도·맥·리눅스 설치부터)"
date: "2026-10-23"
description: "저해상도 사진을 AI로 4배까지 키우는 무료 오픈소스 프로그램 Upscayl. OS별 설치 순서, 4단계 사용법, 모델 고르는 법, 회사 업무에 쓸 때 주의할 상업용 제한까지 정리했어요."
image: "/images/posts/work-editor/upscayl/cover-og.png"
tags: ["Upscayl","이미지 업스케일","무료 프로그램","오픈소스","업무 자동화"]
---

# Upscayl 사용법: 작은 사진을 깨지지 않게 키우는 무료 프로그램 (윈도·맥·리눅스 설치부터)


쇼핑몰 상세 이미지, 보고서에 넣을 제품 사진, 오래된 행사 사진. 받은 파일이 너무 작아서 크게 늘리면 픽셀이 깨지는 경우가 많죠. 포토샵이 없거나 유료 웹 서비스에 파일을 올리기 꺼려질 때 쓸 수 있는 게 **Upscayl**이에요.

Upscayl은 저해상도 이미지를 AI로 키워 주는 무료 오픈소스 프로그램이에요. 내 컴퓨터에 설치해서 돌리기 때문에 사진을 외부 서버에 올리지 않아도 돼요. 이 글에서는 설치부터 실제로 키우는 순서, 모델 고르는 법, 쓰기 전에 알아야 할 한계까지 정리했어요.

![Upscayl 깃허브 저장소 소개 문구. Free and Open Source AI Image Upscaler라고 적혀 있다](/images/posts/work-editor/upscayl/img-20261023142018-ifeq.webp)

## Upscayl이 뭐예요?

- **무엇:** 저해상도·픽셀이 보이는 이미지를 AI 모델로 크게 키우는 데스크톱 프로그램
- **가격:** 설치형 프로그램은 무료. 라이선스는 AGPL-3.0
- **지원 OS:** 윈도 10 이상, macOS 12 이상, 리눅스
- **원리:** Real-ESRGAN 계열 모델과 Vulkan으로 이미지의 빠진 디테일을 추정해 채워요

웹에서 쓰는 Upscayl Cloud는 별도 서비스예요. 공식 사이트에 요금이 따로 표시돼 있지 않아서, 쓰려면 가입 전에 조건을 직접 확인하세요. 이 글은 무료 설치형 기준이에요.

## 설치 전에 확인할 것: 그래픽카드

Upscayl은 **Vulkan을 지원하는 그래픽카드**(GPU)가 있어야 돌아가요. 공식 문서에는 "내장 그래픽(iGPU)이나 CPU만으로는 대부분 안 된다"고 적혀 있어요. 사무용 노트북처럼 내장 그래픽만 있는 PC라면 설치는 되더라도 실행이 안 될 수 있으니, 먼저 공식 위키의 [호환 목록](https://github.com/upscayl/upscayl/wiki/Compatibility-List)에서 내 그래픽카드를 찾아보세요.

![Upscayl 깃허브 FAQ 중 그래픽카드가 필요하냐는 질문과 답변 부분](/images/posts/work-editor/upscayl/img-20261023142051-ana3.webp)

## OS별 설치 순서

설치 파일은 [공식 사이트](https://upscayl.org/)나 [깃허브 릴리스 페이지](https://github.com/upscayl/upscayl/releases/latest)에서 받아요.

![Upscayl 깃허브 README의 설치 안내 부분. macOS 12 이상이라고 적혀 있다](/images/posts/work-editor/upscayl/body-install.png)

### 윈도 (윈도 10 이상)

1. `upscayl-x.x.x-win.exe` 파일을 받아요.
2. 받은 exe 파일을 더블클릭해 실행.
3. "Windows의 PC 보호"(SmartScreen) 경고가 뜨면 **추가 정보 → 실행**을 눌러요. "게시자를 확인할 수 없음" 창이 뜨면 **예**.
4. 설치 안내에 따라 진행하면 끝.

### 맥 (macOS 12 이상)

가장 쉬운 방법은 [맥 앱스토어](https://apps.apple.com/us/app/upscayl/id6468265473?mt=12)에서 설치하는 거예요. 직접 받으려면:

1. `upscayl-x.x.x-mac.dmg` 파일을 받아요.
2. dmg를 더블클릭하고, Upscayl 아이콘을 응용 프로그램(Applications) 폴더로 끌어다 놓아요.
3. Finder 왼쪽의 **응용 프로그램**에서 Upscayl을 찾아 오른쪽 클릭 → **열기**.
4. 확인 창이 뜨면 한 번 더 **열기**.

Homebrew를 쓴다면 터미널에서 한 줄로 설치돼요.

```bash
brew install --cask upscayl
```

앱스토어 버전은 보안 제한 때문에 실행할 때마다 저장 폴더를 다시 골라야 해요. 설정(Settings) 탭에서 기본 저장 폴더를 지정해 두면 이 과정을 건너뛸 수 있어요.

### 리눅스

배포판의 소프트웨어 센터(Flathub·Snap 등)에서 "Upscayl"을 검색하면 대부분 나와요. 설치 없이 쓰려면:

1. `upscayl-x.x.x-linux.AppImage` 파일을 받아요.
2. 파일을 오른쪽 클릭 → 속성 → 권한 탭에서 **실행 허용**을 체크.
3. 파일을 더블클릭해 실행.

RPM(Fedora), DEB(Debian·Ubuntu), ZIP 형식도 릴리스 페이지에 있어요.

## 사진 키우는 순서 (4단계)

프로그램 화면은 영어예요(한국어 메뉴 없음). 왼쪽 메뉴가 Step 1부터 Step 4까지 순서대로 나와 있어서 위에서부터 하나씩 채우면 돼요.

1. **Step 1 — Select Image:** 키울 사진을 골라요. 폴더 하나를 통째로 처리하려면 **Batch Upscayl**을 켜고 **Select Folder**를 눌러요.
2. **Step 2 — Select AI Model:** 모델을 골라요. 처음이면 **Upscayl Standard**로 시작하면 돼요(아래 표 참고).
3. **Step 3 — Set Output Folder:** 결과를 저장할 폴더를 정해요. 따로 안 고르면 원본 사진이 있는 폴더에 저장돼요.
4. **Step 4 — Upscayl:** 배율을 확인하고 **Upscayl** 버튼을 눌러요. 끝나면 화면에서 Before/After를 비교하고 확대(Zoom)해 볼 수 있어요.

![Upscayl 공식 사이트의 기능 소개. 무료 오픈소스, 최대 16배 고화질 저장, 여러 모델, 사용자 설정, Batch Upscayl, Double Upscayl 여섯 항목](/images/posts/work-editor/upscayl/body-features.png)

## 어떤 모델을 고를까?

기본으로 들어 있는 모델은 7개이고, 모두 4배 키우기용이에요. 프로그램 안 설명을 옮기면 이래요.

| 모델 | 프로그램 설명 | 회사 업무(상업용) |
|---|---|---|
| Upscayl Standard | 대부분의 이미지에 적합 | 가능 |
| Upscayl Lite | 대부분의 이미지, 품질 손실을 줄이면서 빠르게 | 가능 |
| High Fidelity | 사실적인 디테일과 부드러운 질감 | 가능 |
| Digital Art | 디지털 아트·일러스트 | 가능 |
| Remacri | 자연 사진, 선명함과 디테일 추가 | **불가** (Non-Commercial) |
| Ultramix | 자연 사진, 선명함과 디테일의 균형 | **불가** (Non-Commercial) |
| Ultrasharp | 자연 사진, 선명함 위주 | **불가** (Non-Commercial) |

**회사 업무에 쓸 때 가장 중요한 부분이에요.** Remacri·Ultramix·Ultrasharp는 프로그램 안에 "Non-Commercial"이라고 표시돼 있어요. 쇼핑몰 상세 이미지, 광고 소재처럼 돈을 버는 데 쓰는 이미지라면 Standard·Lite·High Fidelity·Digital Art 중에서 고르세요.

## 알아 두면 좋은 설정

- **배율(Image Scale):** 4배를 넘기면(16배 Double Upscayl 제외) AI가 아니라 단순히 크기만 늘려요. 품질이 목적이면 4배까지만 쓰는 게 좋아요.
- **Double Upscayl:** 한 번 키운 이미지를 한 번 더 키워요. 처리 시간이 크게 늘어요.
- **저장 형식(Save Image As):** PNG, JPG, WEBP 중 선택. PNG는 무손실이라 압축해도 용량이 많이 줄지 않아요.
- **메타데이터 복사:** 원본 사진의 촬영 정보(EXIF)를 결과물에 남길 수 있어요. 다른 기기와 호환을 생각하면 JPG를 권해요.

## 이런 사진은 안 돼요

- **초점이 나갔거나 흔들린 사진:** 공식 FAQ에 "흐림 제거나 초점 보정은 못 한다"고 나와 있어요. 작게 찍힌 사진을 깨지지 않게 키우는 용도예요.
- **색이 바랜 것처럼 나올 때:** Upscayl은 sRGB 색 프로필만 지원해요. 다른 프로필의 이미지를 넣으면 결과가 흐릿한 색으로 나올 수 있으니, 원본을 sRGB로 바꾼 뒤 넣으세요.
- **실행이 안 될 때:** 그래픽 드라이버를 최신으로 업데이트하고, 윈도에서는 Upscayl을 고성능 모드로 설정해 보세요. 그래도 안 되면 공식 [문제 해결 문서](https://github.com/upscayl/upscayl/wiki/Troubleshooting)를 확인하세요.

![Upscayl 깃허브 FAQ 중 결과가 크게 달라지지 않는 이유를 설명하는 부분](/images/posts/work-editor/upscayl/body-faq-blur.png)

## 한눈에 정리

- 저해상도 사진을 4배까지 키우는 무료 오픈소스 프로그램
- 윈도 10·macOS 12·리눅스, **Vulkan 그래픽카드** 필요
- 사진 고르기 → 모델 고르기 → 저장 폴더 → Upscayl, 4단계
- 회사 업무에는 Standard·Lite·High Fidelity·Digital Art 모델만
- 흐리거나 흔들린 사진은 복원 못 함

## 관련 글

- [Claude Code 스킬로 반복 작업 정리하기: handoff, sync, cleanup](/posts/ai-workflow/claude-code-custom-skills) — 매번 같은 요청을 반복하던 업무를 AI 툴로 묶은 기록

---

출처: [github.com/upscayl/upscayl](https://github.com/upscayl/upscayl) README·위키·소스 코드, [upscayl.org](https://upscayl.org/) (2026-10-23 확인). 모델 설명과 메뉴 이름은 저장소 main 브랜치 기준이라 설치한 버전에 따라 조금 다를 수 있어요.
