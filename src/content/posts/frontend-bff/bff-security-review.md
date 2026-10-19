---
title: "BFF 도입을 검토하며 정리한 보안상 차이"
date: "2026-10-19"
description: "팀에서 보안 강화 방안으로 BFF(Backend For Frontend)가 나와 검토한 내용입니다. BFF가 무엇인지, 도입하면 보안에서 무엇이 달라지고 무엇은 그대로인지, 사이드 프로젝트에서 먼저 PoC를 하기로 한 이유를 정리했습니다."
tags: ["BFF", "Next.js", "Security", "Authentication"]
---

# BFF 도입을 검토하며 정리한 보안상 차이

프론트엔드 BFF 연재의 1편입니다.

## 검토하게 된 계기

팀에서 프론트엔드 보안 강화 방안으로 BFF(Backend For Frontend) 도입이 나왔습니다. 마침 사내 서비스는 Nuxt에서 Next.js로 옮기는 통합 마이그레이션을 진행하고 있었고, BFF도 그 작업에 같이 넣기로 했습니다. 마이그레이션과 함께 진행하다 보니 BFF만 따로 빠르게 적용하기는 어려웠습니다.

그래서 BFF가 실제로 무엇을 막아 주는지 먼저 정리하고, 같은 Next.js App Router를 쓰는 사이드 프로젝트에 PoC로 먼저 넣어 보기로 했습니다. 이 글은 그 검토 내용이고, 사이드 프로젝트에 넣은 구조와 그 과정에서 만난 문제는 다음 편에 이어서 적습니다.

## BFF란

BFF는 특정 프론트엔드 하나를 위해 그 앞에 두는 전용 서버입니다. 브라우저는 백엔드 API를 직접 부르지 않고 BFF를 부르고, BFF가 백엔드를 대신 호출해서 그 화면에 맞는 형태로 응답을 돌려줍니다.

이 이름은 SoundCloud에서 나왔습니다. SoundCloud는 공식 앱과 외부 연동이 하나의 공개 API를 같이 쓰던 구조에서 벗어나면서, 클라이언트마다 전용 백엔드를 두는 방식을 2013년 무렵부터 썼습니다. 당시 SoundCloud에 있던 Phil Calçado가 이 방식에 BFF라는 이름을 붙였고, Sam Newman이 2015년 글에서 패턴으로 정리하면서 널리 알려졌습니다.

처음 나온 배경은 보안보다는 클라이언트마다 다른 요구를 맞추는 쪽에 가까웠습니다. 모바일 앱과 웹이 필요한 데이터 모양이 다르니, 각자 필요한 대로 API를 묶고 가공하는 서버를 따로 두자는 것이었습니다. 보안 쪽에서 BFF가 다시 주목받는 이유는, 이 서버가 브라우저 대신 토큰을 들고 있을 수 있기 때문입니다.

## API Gateway와의 차이

처음 검토할 때 가장 많이 헷갈린 부분입니다. 사이드 프로젝트도 백엔드 앞에 이미 게이트웨이가 있었고, BFF는 그 앞에 하나 더 들어가는 구조였습니다.

| | API Gateway | BFF |
|---|---|---|
| 누구를 위한 것인가 | 모든 클라이언트 | 특정 프론트엔드 하나 |
| 누가 관리하나 | 보통 백엔드·인프라 | 그 프론트엔드를 만드는 쪽 |
| 몇 개를 두나 | 보통 하나 | 프론트엔드마다 하나 |
| 주로 하는 일 | 라우팅, 인증 검증, 속도 제한 | 토큰 보관, 응답 가공, 그 화면에 맞는 API 조합 |

Next.js로 만들면 BFF는 이미 있는 Next 서버의 Route Handler로 들어갑니다. 서버를 따로 띄우지 않습니다. 프론트엔드 저장소 안에서 프론트엔드 개발자가 관리하게 됩니다.

## 기존 구조

BFF를 넣기 전 사이드 프로젝트는 브라우저가 백엔드를 직접 불렀습니다. 로그인하면 받은 access token을 localStorage에 저장하고, 요청마다 헤더에 붙였습니다. 아래는 단순화한 코드입니다.

```ts
// 로그인 응답의 토큰을 브라우저에 저장
localStorage.setItem('accessToken', data.accessToken)

// 요청마다 토큰을 꺼내 백엔드에 직접 보낸다
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

401이 오면 재발급을 요청하는 코드도 클라이언트 인터셉터에 있었습니다.

## BFF를 넣은 구조

BFF를 넣은 뒤에는 브라우저가 같은 출처의 `/api/bff/...`만 부릅니다. 토큰은 Next 서버가 암호화한 HttpOnly 쿠키에 들고 있다가, 백엔드로 보낼 때 꺼내서 붙입니다.

```
[기존]  브라우저 (localStorage 토큰) ──Authorization──▶ 게이트웨이 ─▶ 백엔드

[BFF]   브라우저 ──쿠키(암호화, HttpOnly)──▶ Next 서버 /api/bff ──Authorization──▶ 게이트웨이 ─▶ 백엔드
                                            (토큰 복호화, 재발급)
```

```ts
// 브라우저: 토큰을 다루지 않는다
const res = await fetch('/api/bff/places?page=1')

// app/api/bff/[...path]/route.ts (단순화)
export async function GET(req: NextRequest, { params }) {
  const session = await readSession() // 암호화된 HttpOnly 쿠키에서 토큰을 꺼낸다
  const upstream = await fetch(`${GATEWAY_URL}/api/v1/${params.path.join('/')}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  // 401이면 서버에서 한 번 재발급하고 다시 보낸다
  return toClientResponse(upstream) // 응답 body의 토큰 필드는 지우고 넘긴다
}
```

## 보안에서 달라지는 것

검토하면서 정리한 항목입니다. 각 항목은 사이드 프로젝트 PoC에서 실제로 구현해 확인했습니다.

- **토큰이 브라우저 JavaScript에 없습니다.** access token과 refresh token을 서버가 암호화한 HttpOnly 쿠키에 담습니다. HttpOnly 쿠키는 `document.cookie`로 읽을 수 없어서, XSS가 생겨도 스크립트가 토큰 값을 꺼내 외부로 보낼 수 없습니다. 기존 구조에서는 localStorage에 있어서 스크립트 한 줄로 읽을 수 있었습니다.
- **응답에서 토큰을 지웁니다.** 사이드 프로젝트의 백엔드는 로그인과 재발급 응답 body에 토큰을 담아 줬습니다. BFF가 그 필드를 지우고 브라우저에 넘기기 때문에, 네트워크 응답에서도 토큰이 보이지 않습니다.
- **refresh token을 브라우저가 들고 있지 않습니다.** 재발급은 BFF가 서버에서 처리하고, 401이 오면 한 번 재발급한 뒤 다시 보냅니다. 클라이언트 곳곳에 있던 재발급 코드가 서버 한 곳으로 모였습니다.
- **브라우저가 인증 헤더를 직접 넣을 수 없습니다.** BFF는 브라우저가 보낸 Authorization 헤더를 버리고, 세션에서 꺼낸 토큰만 붙입니다. 백엔드로 넘기는 헤더도 필요한 것만 골라 다시 구성합니다.
- **백엔드 주소와 외부 API 키가 브라우저에 드러나지 않습니다.** 브라우저에는 같은 출처의 `/api/bff`만 보이고, 외부 서비스 키는 서버 환경 변수에서 넣습니다.
- **로그인 후 이동 경로를 서버에서 검증합니다.** 로그인 뒤 돌아갈 주소를 받는 부분에서, 백슬래시를 섞어 외부 사이트로 보내는 open-redirect 우회를 막았습니다.

브라우저 앱의 OAuth 구현 방식을 다루는 IETF 문서(OAuth 2.0 for Browser-Based Applications, 작업 중인 초안)도 여러 아키텍처 중 BFF 패턴을 첫 번째로 다룹니다.

## 그대로인 것

BFF를 넣는다고 프론트엔드 보안이 끝나지는 않습니다. 팀에 공유할 때 이 부분을 같이 적었습니다.

- **XSS 방어는 여전히 필요합니다.** 토큰을 빼 갈 수는 없지만, 사용자가 페이지에 있는 동안 악성 스크립트가 그 페이지에서 `/api/bff`로 요청을 보내면 쿠키가 같이 전송됩니다. 토큰을 훔치는 공격은 막아도, 세션을 이용한 요청까지 막지는 못합니다.
- **CSRF를 따로 고려해야 합니다.** 인증 수단이 헤더에서 쿠키로 바뀌면, 다른 사이트에서 보낸 요청에도 쿠키가 붙을 수 있습니다. 사이드 프로젝트에서는 세션 쿠키를 `SameSite=Lax`로 두고 브라우저 호출을 같은 출처로만 보냈습니다. 별도 CSRF 토큰은 두지 않았습니다. 사내 서비스에 적용할 때는 이 부분을 다시 검토할 항목으로 남겼습니다.
- **쿠키를 암호화하는 키를 관리해야 합니다.** 이 키가 새면 세션 쿠키를 만들어 낼 수 있습니다. 서버 환경 변수로 두고, 시작할 때 값이 있는지 검증하게 했습니다.
- **BFF 자체가 새로운 공격 지점이 됩니다.** 위의 open-redirect처럼, 서버 코드가 생긴 만큼 서버에서 막아야 할 것도 생깁니다.

## 다음 편

2편에서는 사이드 프로젝트에 PoC로 넣은 BFF의 구조를 적습니다. 세션 쿠키, catch-all 프록시, 재발급 처리, 그리고 두 번째 사이드 프로젝트로 넓히면서 바꾼 부분입니다.

## 참고

- [Phil Calçado, The Back-end for Front-end Pattern (BFF)](https://philcalcado.com/2015/09/18/the_back_end_for_front_end_pattern_bff.html)
- [SoundCloud, Service Architecture at SoundCloud — Part 1: Backends for Frontends](https://developers.soundcloud.com/blog/service-architecture-1)
- [InfoQ, The Backend for Frontend Pattern](https://www.infoq.com/news/2015/12/bff-backend-frontend-pattern)
- [Microsoft, Backends for Frontends pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [IETF, OAuth 2.0 for Browser-Based Applications (draft)](https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/)
