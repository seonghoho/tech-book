---
title: "웹에서 앱을 열 때 뜨는 iOS 오류 알림과 유니버설 링크"
date: "2026-11-01"
draft: true
description: "웹 버튼으로 앱 실행 스킴을 호출하면, 앱이 없는 iPhone에서는 Safari와 Chrome이 '주소가 유효하지 않음' 알림을 먼저 띄우고 몇 초 뒤에야 App Store로 넘어갑니다. 이 알림을 없애려고 유니버설 링크(apple-app-site-association)를 찾아본 과정과, 도입하면 바뀌는 흐름, 웹·앱 각각의 수정 범위, PoC로 확인할 항목을 정리했습니다."
tags: ["iOS", "Universal Links", "Deep Link", "Mobile Web", "apple-app-site-association"]
---

# 웹에서 앱을 열 때 뜨는 iOS 오류 알림과 유니버설 링크

## 앱 실행 버튼에서 뜨는 알림

웹페이지에 "앱에서 열기" 버튼을 두는 경우가 많습니다. 누르면 앱이 깔려 있으면 앱을 열고, 없으면 스토어로 보내는 버튼입니다. 회사에서 개발하는 웹에도 이런 버튼이 있습니다.

테스트하다 보니 앱이 깔려 있지 않은 iPhone에서 이 버튼을 누르면 브라우저가 이런 알림을 띄웠습니다.

- Safari: "주소가 유효하지 않기 때문에 Safari가 해당 페이지를 열 수 없습니다."
- Chrome: "문제가 발생했습니다. 애플리케이션을 열 수 없습니다."

알림을 닫고 잠깐 기다리면 App Store로 넘어가긴 합니다. 의도한 동작이긴 한데, 처음 보는 사람 입장에서는 서비스가 고장 난 것처럼 보입니다. 앱을 처음 설치하려는 사람이 가장 먼저 보는 화면이 오류 알림이라는 게 마음에 걸렸습니다.

이 알림은 웹이 띄운 팝업이 아니라 iOS가 띄우는 시스템 알림이라서, 웹 코드에서 숨기거나 문구를 바꿀 수 없습니다. 그래서 알림이 뜨지 않는 방법을 찾아봤고, 유니버설 링크(Universal Links)로 바꾸면 된다는 걸 알게 됐습니다. 앱 배포가 함께 필요해서 당장 적용하지는 않고, 내용을 정리하고 PoC로 확인해 둘 생각입니다.

## 커스텀 스킴으로 앱을 여는 방식

iOS에서는 보통 앱이 등록해 둔 커스텀 스킴(`myapp://...`)을 호출합니다. 웹은 앱이 깔려 있는지 모르기 때문에 일단 스킴을 부르고, 몇 초 뒤에도 페이지가 그대로 보이면 앱이 없다고 보고 App Store로 보냅니다. 흔히 쓰는 방식을 간단히 쓰면 이렇습니다.

```ts
const STORE_URL = 'https://apps.apple.com/app/id0000000000';

function openAppOrStore(appUrl: string) {
  // 앱이 열리면 페이지가 뒤로 가면서 hidden 이 된다. 그때는 스토어로 보내지 않는다
  const timer = setTimeout(() => {
    if (!document.hidden) location.href = STORE_URL;
  }, 3000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
  }, { once: true });

  location.href = appUrl; // myapp://...
}
```

앱이 없으면 마지막 줄에서 스킴을 여는 순간 iOS가 알림을 띄웁니다. 그 뒤에 타이머가 끝나서 App Store로 갑니다. 알림이 먼저 뜨고 스토어가 나중에 열리는 순서는 이 방식으로는 바꿀 수 없습니다.

안드로이드는 같은 문제가 없었습니다. `intent://` 주소에 패키지명과 `browser_fallback_url`을 넣어 두면, 앱이 없을 때 Chrome이 오류 없이 지정한 주소(보통 Play 스토어)로 바로 보내 줍니다. 이 판단은 웹이 아니라 안드로이드가 합니다.

```text
intent://open#Intent;scheme=myapp;package=com.example.app;S.browser_fallback_url=<Play 스토어 주소>;end
```

## 앱이 있는지 먼저 확인할 수 없는 이유

처음에는 버튼을 누를 때 앱이 있는지 먼저 확인해서, 없으면 바로 스토어로 보내고 있으면 스킴을 부르면 되지 않을까 생각했습니다. 찾아보니 iOS에서는 불가능했습니다.

- Safari와 iOS Chrome에는 웹페이지가 "이 앱이 설치돼 있나"를 물어볼 수 있는 API가 없습니다. 웹이 설치된 앱 목록을 알아내지 못하도록 막아 둔 것입니다.
- 안드로이드 Chrome에는 `navigator.getInstalledRelatedApps()`가 있지만 iOS는 지원하지 않습니다.

스킴을 일단 불러 보고 반응을 보는 방식을 쓰는 것도 이 때문이었습니다. 웹에서 할 수 있는 우회는 이게 전부라서, 알림을 없애려면 앱이 있는지 판단하는 일을 iOS에 넘겨야 했습니다.

## 유니버설 링크

유니버설 링크는 "이 https 주소는 우리 앱이 열겠다"고 iOS에 미리 등록해 두는 기능입니다. 버튼은 스킴 대신 평범한 https 주소를 열고, 그 주소를 앱으로 넘길지는 iOS가 정합니다.

```text
사용자가 https://link.example.com/open 을 탭
        │
        ▼
  iOS: 이 주소를 맡겠다고 등록한 앱이 기기에 있나?
        │
   ┌────┴──────────────┐
  있음                  없음
   │                    │
   ▼                    ▼
 브라우저는 요청을       평범한 링크처럼
 보내지 않고 앱을        브라우저가 그 주소의
 바로 실행하고           웹페이지를 불러온다
 주소를 앱에 넘긴다
```

앱이 있으면 앱이 열리고, 앱이 없으면 그 주소의 웹페이지가 열립니다. 어느 쪽이든 오류 알림은 뜨지 않습니다. 웹 코드에 "앱 있음/없음" 분기를 넣는 게 아니라, 앱이 없을 때만 우리 페이지가 열린다는 점을 이용하는 방식입니다. 그래서 그 페이지는 무조건 App Store로 보내기만 하면 됩니다.

검색 결과에서 쇼핑몰 상품 링크를 누르면 바로 앱이 열리는 것도 같은 기능입니다. 그런 서비스는 웹과 앱이 같은 주소 체계를 쓰기 때문에 메인 도메인의 경로 자체를 앱에 등록해 둡니다. 안드로이드에도 같은 역할을 하는 App Links가 있습니다.

## iOS가 앱과 도메인을 연결하는 과정

iOS가 "이 주소는 이 앱"이라고 알 수 있으려면 앱과 도메인 양쪽에 설정이 필요합니다.

1. **앱 쪽**: Xcode의 Associated Domains에 `applinks:link.example.com`을 추가합니다. "나는 이 도메인의 링크를 처리한다"는 선언입니다.
2. **도메인 쪽**: 그 도메인에 `apple-app-site-association` 파일을 올립니다. "이 도메인은 이 앱이 링크를 여는 걸 허락한다"는 선언입니다.
3. **iOS**: 앱을 설치하거나 업데이트할 때 도메인의 파일을 받아서 두 선언이 맞는지 확인합니다. 맞으면 그 경로를 앱에 연결해 둡니다.

양쪽이 서로를 가리켜야 연결되기 때문에, 다른 앱이 우리 도메인을 자기 링크로 등록할 수 없습니다.

iOS 14부터는 기기가 도메인에서 파일을 직접 받지 않고, 애플 CDN이 받아 둔 사본을 가져갑니다. 그래서 파일을 고쳐도 기기에 반영되기까지 시간이 걸립니다. 애플 CDN이 지금 어떤 내용을 들고 있는지는 아래 주소로 확인할 수 있습니다.

```bash
curl -i https://app-site-association.cdn-apple.com/a/v1/link.example.com
```

## apple-app-site-association 파일

파일은 `/.well-known/apple-app-site-association`에 둡니다. 확장자는 붙이지 않습니다.

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.app"],
        "components": [
          { "/": "/open*", "comment": "웹의 앱에서 열기 버튼" }
        ]
      }
    ]
  }
}
```

- `appIDs`는 `팀ID.번들ID` 형식입니다. 두 값은 앱 팀에서 받아야 합니다.
- `components`에는 앱으로 넘길 경로를 적습니다. 여기 적지 않은 경로는 앱이 있어도 웹으로 열립니다.

제공할 때는 세 가지 조건을 지켜야 합니다. 하나라도 어기면 iOS가 파일을 무시하고, 버튼은 그냥 웹페이지로 열립니다.

- HTTPS로 제공합니다.
- 리다이렉트 없이 200으로 응답합니다.
- `Content-Type: application/json`으로 응답합니다.

세 번째 조건은 정적 호스팅에서 놓치기 쉽습니다. 확장자가 없는 파일은 `application/octet-stream`으로 나가는 경우가 많아서 헤더를 따로 지정해야 합니다. Vercel이라면 이렇게 둡니다.

```json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [{ "key": "Content-Type", "value": "application/json" }]
    }
  ]
}
```

## 적용하면 바뀌는 흐름

버튼이 이동할 주소용 서브도메인(`link.example.com`)을 새로 두고, 거기에 파일 두 개만 올리는 방향으로 정리했습니다.

```text
① 사용자가 웹(www.example.com)의 페이지를 보고 있음   (지금과 같음)

② "앱에서 열기" 탭
   → myapp://... 대신 https://link.example.com/open?path=... 로 이동   (바뀌는 부분)
        │
        ├ 앱 있음 → iOS가 바로 앱 실행 → 앱이 path 를 읽어 해당 화면을 연다
        │          (link.example.com 페이지는 열리지 않음)
        │
        └ 앱 없음 → link.example.com/open 페이지가 열림
                   → 바로 App Store로 이동
```

메인 도메인(`www.example.com`)을 쓰지 않고 서브도메인을 따로 둔 이유는 두 가지입니다.

- **웹으로 봐야 하는 페이지까지 앱으로 열리면 안 됩니다.** 메인 도메인의 경로를 등록하면, 앱이 깔린 사람은 그 주소로 들어오는 순간 앱이 열립니다. 웹에서만 제공하는 화면이 있다면 그 화면에 들어갈 수 없게 됩니다. 앱으로 넘길 주소만 따로 두는 쪽이 범위를 정하기 쉬웠습니다.
- **같은 도메인 안의 이동에서는 앱이 열리지 않습니다.** iOS는 사용자가 지금 보고 있는 사이트와 같은 도메인의 링크를 누르면, 그 사이트를 계속 둘러보는 중이라고 보고 앱으로 넘기지 않습니다. 사용자는 `www.example.com`에 있으니 버튼은 다른 도메인으로 가야 합니다.

## 수정 범위

**새로 만드는 것 (`link.example.com`)**

```text
link.example.com/
├── .well-known/
│   └── apple-app-site-association   ← 앱 ID와 /open* 경로
└── open/
    └── index.html                   ← 앱이 없을 때만 열리는 페이지
```

`open/index.html`은 열리자마자 App Store로 보내는 페이지입니다. 이동이 막혔을 때를 대비해 링크도 하나 둡니다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>앱 설치</title>
  <script>location.replace('https://apps.apple.com/app/id0000000000')</script>
</head>
<body>
  <p>앱을 설치하면 이어서 볼 수 있습니다.</p>
  <a href="https://apps.apple.com/app/id0000000000">App Store에서 설치하기</a>
</body>
</html>
```

정적 파일 두 개라서 기존 웹 앱에 넣지 않고 별도 정적 호스팅에 두는 쪽이 낫다고 봤습니다.

**기존 웹 코드 (버튼이 있는 곳)**

- iOS 버튼을 `<a href="https://link.example.com/open?path=...">`로 바꿉니다. 스크립트로 이동시키지 않고, 사용자가 누른 링크의 기본 이동을 그대로 둡니다.
- iOS에서는 스킴을 부르고 몇 초 기다리는 타이머가 필요 없어집니다.
- 안드로이드는 intent 방식이 같은 동작을 하고 있어서 그대로 둡니다. 나중에 같은 주소로 통일하고 싶으면 `assetlinks.json`을 추가하고 App Links를 붙이면 됩니다.

**앱**

- Associated Domains에 `applinks:link.example.com`을 추가합니다.
- 유니버설 링크로 실행됐을 때 넘겨받은 주소를 읽어서, 지금 스킴으로 들어왔을 때와 같은 화면을 엽니다.
- 앱 빌드가 바뀌는 변경이라 App Store 심사를 다시 받아야 합니다.

**작업 순서**

1. `link.example.com`과 파일 두 개 배포
2. 앱 팀이 TestFlight 빌드로 실기기 확인
3. 앱 심사 통과 후 출시
4. 웹 버튼 교체

순서를 바꿔서 웹 버튼부터 바꾸면, 앱이 깔린 사람도 아직 연결이 안 된 상태라 `link.example.com/open` 페이지가 열리고 App Store로 가 버립니다. 버튼 교체는 앱 출시 뒤에 해야 합니다.

## 주의할 점

- **사용자가 직접 누른 링크여야 합니다.** `<a>`를 탭한 이동은 앱으로 넘어가지만, 스크립트로 `location.href`를 바꾸는 이동은 iOS가 가로채지 않을 수 있습니다. 그래서 버튼을 `<a>`로 바꾸는 쪽으로 정리했습니다.
- **사용자의 선택이 기억됩니다.** 링크를 길게 눌러 "Safari에서 열기"를 고르면, 그 도메인은 이후에도 계속 Safari로 열립니다. 스토어 이동 페이지에 "앱 열기" 버튼을 하나 두면 대비할 수 있습니다.
- **인앱 브라우저는 동작이 다릅니다.** 카카오톡이나 인스타그램의 인앱 브라우저는 유니버설 링크를 무시하기도 합니다. PoC에서 따로 확인해 볼 생각입니다.
- **앱을 업데이트하지 않은 사람에게는 동작하지 않습니다.** 예전 버전 앱에는 Associated Domains가 없으니, 앱이 있어도 스토어 이동 페이지가 열립니다. 스토어에서 업데이트하면 그다음부터는 앱으로 열립니다.
- **파일 변경은 늦게 반영됩니다.** 애플 CDN을 거치기 때문에, 경로를 추가해도 기기에 바로 반영되지 않습니다.

## API 응답을 기다린 뒤 이동하는 버튼

모든 버튼이 누르자마자 이동하지는 않습니다. 버튼을 누르면 권한 확인 API를 먼저 부르고, 응답을 기다렸다가(`await`) 스크립트로 앱 주소로 보내는 경우도 있습니다.

```ts
button.addEventListener('click', async () => {
  const { allowed } = await checkPermission();
  if (allowed) location.href = 'https://link.example.com/open?path=...';
});
```

이렇게 응답을 기다린 뒤의 이동은 iOS가 사용자 동작으로 보지 않아서 앱으로 넘기지 않을 수 있습니다. 실기기에서 먼저 확인해 보고, 안 되면 확인이 끝난 뒤 "앱에서 열기" 버튼을 한 번 더 보여 줘서 사용자가 누르게 바꿔야 합니다. 누르자마자 이동하는 버튼에 먼저 적용해 보고 넓힐 계획입니다.

## 앱 유무에 따라 화면을 바꿀 수 있는지

유니버설 링크를 등록하면 앱이 있는 사람에게만 다른 버튼이나 스타일을 보여 줄 수 있을지도 찾아봤는데, 그건 안 됩니다. 판단은 링크를 누르는 순간 iOS 안에서만 일어나고, 원래 페이지에는 결과가 전달되지 않습니다. 페이지를 그리는 시점에 앱 설치 여부를 알 수 있는 값은 여전히 없습니다.

대신 쓸 수 있는 방법을 비교해 봤습니다.

| 방법 | 앱 유무 반영 | 한계 |
|---|---|---|
| 스마트 앱 배너 (`<meta name="apple-itunes-app">`) | iOS가 배너 버튼을 앱이 있으면 "열기", 없으면 "받기"로 바꿔 줌 | Safari에서만 보임. 디자인 변경 불가. 웹 코드는 결과를 모름 |
| 앱 WebView 안인지 판별 | 앱이 user agent나 쿠키에 표시를 넣어 주면 알 수 있음 | 앱 안에서 연 경우만 알 수 있음 |
| `getInstalledRelatedApps` | Chrome에서 설치 여부를 직접 확인 | 안드로이드 Chrome만 지원 |
| 로그인 계정의 앱 사용 이력 | 앱을 쓴 적 있는 사람까지만 앎 | 지금 이 기기에 있는지는 모름. 비로그인 사용자에게는 못 씀 |

버튼은 하나로 두고, "앱에서 열기"처럼 앱이 있든 없든 맞는 문구를 쓰는 걸로 정했습니다. 유니버설 링크를 붙이면 그 버튼이 알아서 갈라지니 화면을 두 벌 만들 필요가 없습니다. Safari 한정이지만 앱이 있는 사람에게 "열기"를 보여 줄 수 있는 스마트 앱 배너는 다음 글에서 따로 정리하려고 합니다.

## PoC로 확인할 것

아직 적용 전이라, 테스트용 서브도메인과 TestFlight 빌드로 아래 항목을 먼저 확인해 볼 생각입니다. 결과는 확인한 뒤 이 글에 덧붙이겠습니다.

- **파일 제공**: `curl -I`로 `200`, `Content-Type: application/json`, 리다이렉트 없음이 맞는지
- **애플 CDN 반영**: `app-site-association.cdn-apple.com`에서 같은 내용이 내려오는지, 바꾼 뒤 반영되기까지 얼마나 걸리는지
- **개발 중 확인**: 개발 빌드에서는 `applinks:link.example.com?mode=developer`로 등록하고 기기의 개발자 설정에서 Associated Domains Development를 켜면 CDN을 거치지 않고 도메인에서 바로 받는지
- **설치/미설치**: 앱이 있을 때 알림 없이 앱이 열리는지, 없을 때 알림 없이 App Store로 가는지
- **브라우저별**: Safari, iOS Chrome, 카카오톡 인앱 브라우저에서 각각 어떻게 동작하는지
- **파라미터 전달**: 앱이 넘겨받은 주소의 `path`를 읽어 원하는 화면을 여는지
- **응답 대기 후 이동**: `await` 뒤에 스크립트로 이동해도 앱이 열리는지
- **구버전 앱**: Associated Domains가 없는 버전이 깔린 기기에서 스토어 이동 페이지가 열리는지
