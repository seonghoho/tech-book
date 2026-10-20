---
title: "사이드 프로젝트에 BFF를 PoC로 넣은 구조"
date: "2026-10-19"
description: "사내 도입 전에 사이드 프로젝트 두 곳에 BFF를 먼저 넣어 본 구조입니다. 세션 쿠키, catch-all 프록시, 401 재발급, 두 번째 프로젝트에서 바꾼 부분, 그리고 이 구조로 바꾼 뒤 Network 탭으로 데이터 흐름을 보기 어려워진 문제와 개선안을 정리했습니다."
tags: ["BFF", "Next.js", "Authentication", "DevTools"]
---

# 사이드 프로젝트에 BFF를 PoC로 넣은 구조

프론트엔드 BFF 연재의 2편입니다. [1편](/posts/frontend-bff/bff-security-review)에서는 팀에서 BFF 도입을 검토하며 보안상 무엇이 달라지는지 정리했습니다. 이번 편은 그 내용을 사이드 프로젝트에 실제로 넣은 구조입니다.

## PoC 범위

사내 검토용 PoC라서 처음부터 BFF 구조로 시작했습니다. 범위는 인증으로 잡았습니다. 토큰을 어디에 두고 누가 붙이는지가 1편에서 정리한 보안상 차이의 대부분이기 때문입니다.

두 사이드 프로젝트 모두 Next.js App Router를 쓰고, 백엔드는 게이트웨이 뒤에서 JWT로 인증합니다. 첫 번째 프로젝트에서 구조를 만들고, 두 번째 프로젝트에서는 그 구조를 가져와 부족했던 부분을 고쳤습니다.

## 세션 쿠키

로그인하면 BFF가 백엔드에서 받은 access token과 refresh token을 하나의 세션으로 묶어 암호화하고, HttpOnly 쿠키에 넣습니다. 첫 번째 프로젝트는 jose의 JWE로, 두 번째 프로젝트는 AES-256-GCM으로 암호화했습니다.

```ts
// lib/auth/session.ts (단순화)
export const setSession = async (payload: SessionPayload) => {
  const token = await encryptSession(payload) // { accessToken, refreshToken, memberId }
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}
```

첫 번째 프로젝트는 인증 관련 라우트를 따로 두었습니다.

- `POST /api/auth/login`: 백엔드 로그인 후 세션 쿠키를 만든다
- `POST /api/auth/logout`: 세션 쿠키를 지운다
- `GET /api/auth/me`: 세션이 있는지와 회원 ID처럼 화면에 필요한 값만 돌려준다

브라우저의 로그인 상태는 `/api/auth/me` 응답으로만 판단합니다. 두 번째 프로젝트는 로그인도 아래의 catch-all 프록시를 거치게 하고, 응답에서 토큰을 꺼내 세션에 저장하는 방식으로 바꿨습니다.

## catch-all 프록시

로그인 외의 API 호출은 모두 `app/api/bff/[...path]/route.ts` 하나가 받습니다. 브라우저는 `/api/bff/places?page=1`처럼 부르고, BFF가 `/api/v1/places?page=1`로 바꿔 게이트웨이에 보냅니다.

```ts
// app/api/bff/[...path]/route.ts (단순화)
async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const search = new URL(req.url).search
  const body = req.method === 'GET' ? undefined : await req.arrayBuffer()
  let session = await getSession()

  let upstream = await forward(req, path.join('/'), search, session, body)

  // 401이면 서버에서 한 번 재발급하고 같은 요청을 다시 보낸다
  if (upstream.status === 401 && session) {
    const next = await refreshSessionOnce(session)
    if (!next) {
      await clearSession()
      return NextResponse.json({ message: '다시 로그인해 주세요.' }, { status: 401 })
    }
    await setSession(next)
    session = next
    upstream = await forward(req, path.join('/'), search, session, body)
  }

  return toClientResponse(upstream) // 백엔드 Set-Cookie는 브라우저로 넘기지 않는다
}

export const GET = handle
export const POST = handle
// PUT, PATCH, DELETE도 같다
```

`forward`가 헤더를 만들 때 지킨 규칙은 세 가지입니다.

- 브라우저가 보낸 Authorization 헤더는 지운다. 토큰을 붙이는 곳은 BFF 하나뿐이다.
- 세션에서 꺼낸 access token만 Bearer로 붙인다.
- refresh token은 백엔드가 실제로 읽는 경로에만 쿠키로 실어 보낸다. 나머지 요청에는 보내지 않는다.

재발급은 `refreshSessionOnce`로 감쌌습니다. 동시에 여러 요청이 401을 받아도 재발급 요청은 한 번만 나가고, 나머지는 그 결과를 같이 씁니다.

## 두 번째 프로젝트에서 바꾼 것

같은 구조를 두 번째 사이드 프로젝트에 옮기면서, 첫 번째에서 부족했던 부분을 고쳤습니다.

**응답에서 토큰 필드를 지웠습니다.** 두 번째 프로젝트의 백엔드는 로그인과 재발급 응답 body에 `accessToken`을 담아 줬습니다. BFF가 토큰을 세션에 저장한 뒤 그 필드를 지우고 브라우저에 넘깁니다.

```ts
const STRIPPED_BODY_FIELDS = ['accessToken', 'refreshToken'] as const

function stripTokens(payload) {
  const { dataBody } = payload
  if (!dataBody?.accessToken) return { body: payload, accessToken: null }
  const cleaned = { ...dataBody }
  for (const field of STRIPPED_BODY_FIELDS) delete cleaned[field]
  return { body: { ...payload, dataBody: cleaned }, accessToken: dataBody.accessToken }
}
```

**헤더를 새로 만들었습니다.** 첫 번째 프로젝트는 브라우저 요청 헤더를 복사한 뒤 `host`, `cookie` 같은 몇 가지만 빼는 방식이었습니다. 두 번째 프로젝트는 반대로 `Accept`, `Content-Type`, `Authorization`, 필요한 쿠키만 골라서 새로 만듭니다. 브라우저의 `Origin`이 게이트웨이로 넘어가지 않으니, 프론트엔드 개발 서버 포트가 바뀌어도 백엔드 CORS 설정과 무관해졌습니다. 반대로 헤더를 그대로 넘기도록 바꾸면 게이트웨이가 허용 목록에 없는 Origin을 보고 POST만 빈 403으로 막았습니다. 이 내용은 리뷰 체크리스트에 넣었습니다.

**서버 컴포넌트는 BFF를 거치지 않습니다.** 서버 컴포넌트가 자기 서버의 `/api/bff`를 다시 HTTP로 부르면 한 번 더 돌아가는 셈이라, 서버에서는 게이트웨이를 직접 부르게 했습니다. 그래서 전송 계층이 둘이 됐습니다.

| | 브라우저 | 서버 컴포넌트·Route Handler |
|---|---|---|
| 파일 | `lib/api/client.ts` | `lib/api/server.ts` (`server-only`) |
| 호출 대상 | `/api/bff/...` | 게이트웨이 직접 |
| 토큰 | 다루지 않음 | 세션에서 꺼내 직접 붙임 |

**게이트웨이가 꺼져 있을 때 503을 줍니다.** 처음에는 게이트웨이에 연결하지 못하면 내용 없는 500이 나서, 화면에서 원인을 구분할 수 없었습니다. 연결 실패는 503과 공통 응답 형식으로 바꿔서 돌려줍니다.

**mock을 BFF 안에 두었습니다.** 백엔드가 아직 없는 API는 `MOCK_API=true`일 때 BFF가 게이트웨이를 부르지 않고 mock 응답을 돌려줍니다. 브라우저 쪽 코드는 mock인지 실제인지 모릅니다. 프로덕션에서는 항상 꺼집니다.

## 모든 호출을 BFF로 묶은 판단

두 번째 프로젝트는 인증이 필요한지와 상관없이 브라우저의 API 호출을 전부 BFF로 보냈습니다. 브라우저 쪽 호출 코드는 `client.ts` 하나이고, baseURL은 `/api/bff`로 고정입니다.

전부 묶은 이유는 이렇습니다.

- 토큰을 다루는 곳이 BFF 하나뿐이 됩니다. "이 API는 직접, 저 API는 BFF" 같은 예외가 없으니, 예외 경로로 토큰이 새는 일이 생기지 않습니다.
- 에러 형식, 재발급, mock 처리가 한 곳에 모입니다.
- 프론트엔드 개발 서버 포트가 바뀌어도 CORS를 신경 쓸 일이 없습니다.

대신 비용도 있었습니다.

- 모든 요청이 Next 서버를 한 번 더 거칩니다. 지연이 조금 늘고 서버 부하도 늘어납니다.
- 장소 목록처럼 토큰이 필요 없는 공개 데이터도 BFF를 거칩니다. 이런 데이터는 직접 부르거나 캐시하는 쪽이 더 가볍습니다.
- 파일 업로드는 BFF가 본문 전체를 메모리에 들고 있다가 넘깁니다. SSE는 연결 하나를 서버가 계속 붙잡고 있습니다. 서버리스 환경이라면 요청 크기와 실행 시간 제한에 걸릴 수 있습니다.

PoC에서는 일관성을 우선해서 전부 묶었습니다. 사내에 적용할 때는 공개·캐시 가능한 데이터, 큰 파일 업로드, 스트리밍을 예외로 둘지 검토할 항목으로 남겼습니다.

## 이 구조로 바꾸고 생긴 불편

구조를 바꾸고 나서 가장 불편했던 건, Chrome 개발자 도구의 Network 탭으로 데이터가 제대로 들어오는지 확인하기 어려워진 점입니다. 전에는 브라우저가 백엔드를 직접 불렀으니 Network 탭만 보면 됐는데, 이제는 요청이 Next 서버에서 한 번 더 일어납니다.

- **서버 컴포넌트 요청이 보이지 않습니다.** 서버 컴포넌트는 서버에서 게이트웨이를 부르니 Network 탭에 요청 자체가 없습니다. 첫 화면 데이터가 비어 있어도 브라우저에서는 단서가 없었습니다.
- **실제 백엔드 주소를 알 수 없습니다.** Network 탭에는 `/api/bff/...`만 보입니다. BFF가 어떤 경로로 바꿔 보냈는지는 보이지 않습니다.
- **백엔드의 원래 응답을 볼 수 없습니다.** BFF가 토큰 필드를 지우고 오류를 공통 형식으로 바꾸기 때문에, 브라우저에 보이는 응답은 백엔드가 보낸 원본이 아닙니다. 게이트웨이 연결 실패도 브라우저에서는 503으로만 보입니다.
- **재발급과 재시도가 보이지 않습니다.** 401 → 재발급 → 재시도가 모두 서버 안에서 일어나서, 브라우저에는 성공한 요청 하나만 남습니다. 요청이 왜 느렸는지 알 수 없었습니다.

mock 응답과 실제 응답도 브라우저에서는 똑같이 보여서, 지금 화면이 어느 쪽 데이터인지 헷갈린 적도 있었습니다.

## 개선안

PoC에서는 넣지 못했고, 사내에 적용할 때 넣으려고 검토 중인 방법입니다. 방향은 BFF 안에서 일어난 일을 브라우저와 터미널에 다시 보이게 하는 것입니다.

| 불편 | 개선안 |
|---|---|
| 서버 컴포넌트 요청이 안 보임 | `next.config`의 `logging.fetches`로 서버 fetch를 개발 서버 터미널에 출력 |
| 실제 백엔드 주소를 모름 | 응답 헤더에 `x-upstream-path` 추가 |
| 원래 상태 코드가 가려짐 | 응답 헤더에 `x-upstream-status` 추가 |
| 재발급·재시도가 안 보임 | `x-bff-retried` 헤더와 `Server-Timing`으로 구간별 시간 표시 |
| mock인지 실제인지 모름 | `x-bff-source: mock` 헤더 추가 |

```ts
// BFF route handler — 개발 환경에서만
if (process.env.NODE_ENV !== 'production') {
  res.headers.set('x-upstream-path', upstreamPath)
  res.headers.set('x-upstream-status', String(upstream.status))
  if (retried) res.headers.set('x-bff-retried', '1')
  res.headers.set(
    'Server-Timing',
    `reissue;dur=${reissueMs};desc="token reissue", upstream;dur=${upstreamMs};desc="gateway"`,
  )
}
```

```js
// next.config.mjs
export default {
  logging: { fetches: { fullUrl: true } },
}
```

`Server-Timing` 헤더를 넣으면 Chrome Network 탭에서 요청을 열었을 때 Timing 탭에 구간별 시간이 함께 나옵니다. 재발급에 몇 ms, 게이트웨이에 몇 ms가 걸렸는지 브라우저에서 바로 볼 수 있습니다.

여기에 요청 ID를 더하면 서버 쪽 로그와도 이어집니다. BFF에서 `x-request-id`를 만들어 게이트웨이로 넘기고 응답 헤더에도 붙이면, 브라우저에서 본 요청 하나를 Next 서버 로그와 백엔드 로그에서 같은 ID로 찾을 수 있습니다.

이 헤더들은 반드시 개발 환경에서만 켜야 합니다. 백엔드 경로와 상태 코드를 브라우저에 보여 주는 건, 1편에서 BFF로 숨기려던 정보를 다시 꺼내는 일이기 때문입니다.

## 다음 편

[3편](/posts/frontend-bff/bff-poc-problems)에서는 PoC를 운영하며 만난 문제들을 적습니다. 만료 토큰에 백엔드가 500을 준 일, 로그인 실패를 재시도해서 계정 잠금이 빨리 걸린 일, multipart 업로드와 SSE가 BFF를 통과하지 못한 일입니다.
