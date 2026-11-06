---
title: "로그인 복귀 경로 검사를 비켜 가던 .. 마디: 풀어 둔 값으로 검사하기"
date: "2026-10-29"
description: "로그인 뒤 돌아갈 경로(?next=)에서 /login과 /api로 가는 값을 막고 있었는데, /x/../login이나 /x/%2e%2e/api처럼 마디를 섞으면 검사를 그대로 통과했습니다. 브라우저가 이동 전에 . 과 .. 마디를 푼다는 점을 놓친 것이 원인이었습니다. URL 생성자로 미리 풀어 둔 값으로 검사하고, 이동은 원래 값으로 하도록 고친 과정을 적었습니다."
tags: ["Next.js", "Security", "Open Redirect", "URL", "Authentication"]
---

# 로그인 복귀 경로 검사를 비켜 가던 .. 마디: 풀어 둔 값으로 검사하기

## 복귀 경로를 거르는 함수

사이드 프로젝트로 만들고 있는 커머스에는 고객용 스토어와 운영자용 어드민이 있습니다. 둘 다 로그인하지 않은 상태로 보호된 화면에 들어가면 로그인 화면으로 보내고, 원래 가려던 경로를 `?next=`에 붙입니다.

```text
/stocks  →  /login?next=%2Fstocks
```

로그인 화면의 서버 컴포넌트는 `next` 값을 `safeReturnPath`라는 함수로 거른 다음 로그인 폼에 넘깁니다. 로그인에 성공하면 폼이 `router.replace(returnPath)`로 그 경로에 갑니다.

```tsx
// app/login/page.tsx
<LoginForm returnPath={safeReturnPath(next)} />
```

처음 만든 `safeReturnPath`는 이랬습니다.

```ts
export function safeReturnPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || value.length > 512) return '/';
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  // 제어 문자는 브라우저가 지워 '//' 가 될 수 있다
  if (/[\u0000-\u001f\u007f]/.test(value)) return '/';
  const path = value.split(/[?#]/)[0]!;
  // 대소문자 · 끝 슬래시 · 경로 매개변수(;) 변형도 로그인 화면으로 본다
  const normalized = path.toLowerCase().split(';')[0]!.replace(/\/+$/, '');
  if (normalized === '/login' || normalized === '/api' || normalized.startsWith('/api/'))
    return '/';
  return value;
}
```

막으려던 것은 두 종류였습니다.

- **다른 사이트로 나가는 값**: `https://evil.test`, `//evil.test`, `/\evil.test`처럼 외부로 보내는 주소입니다. 이걸 받으면 열린 리다이렉트가 됩니다.
- **가면 안 되는 같은 사이트 경로**: 로그인 화면(`/login`)으로 돌아가면 로그인 화면이 다시 로그인 화면을 여는 꼴이 됩니다. 어드민은 BFF 라우트(`/api/...`)도 막았습니다. 화면이 없는 API 주소에 도착하면 JSON이나 오류 응답이 그대로 보입니다.

`/LOGIN`, `/login/`, `/login;x` 같은 변형까지 막아 두었기 때문에 꽤 꼼꼼하다고 생각했습니다.

## 알림 링크에는 있던 처리

어드민에 알림 센터를 붙이면서 비슷한 함수를 하나 더 만들었습니다. 백엔드가 알림마다 `/admin/jobs/{jobId}` 같은 링크 경로를 주는데, 어드민 콘솔은 자기 origin의 루트에서 돌기 때문에 맨 앞의 `/admin`을 떼어 써야 했습니다. 그 함수에서는 경로를 검사하기 전에 `URL`로 한 번 풀었습니다.

```ts
// `..` · `.` 마디를 브라우저처럼 풀어 둔 뒤 검사한다(`/admin/../api/x` 가 `/api` 검사를 비켜 가지 않게).
// `//` · 역슬래시 · 제어 문자는 풀기 전에 막는다 — URL 해석이 그것들을 다른 주소로 바꿀 수 있어서다
if (
  !path.startsWith('/') ||
  path.startsWith('//') ||
  path.includes('\\') ||
  /[\u0000-\u001f\u007f]/.test(path)
)
  return null;
try {
  const url = new URL(path, 'http://console.invalid');
  if (url.origin !== 'http://console.invalid') return null;
  path = url.pathname + url.search + url.hash;
} catch {
  return null;
}
const safe = safeReturnPath(path);
```

알림 링크는 백엔드가 만든 문자열이라 `/admin/../api/x` 같은 값이 섞여 들어올 수 있다고 보고 넣은 처리였습니다. 그런데 이 처리가 알림 링크에만 있고, 정작 그 뒤에 부르는 `safeReturnPath`에는 없었습니다. 로그인 화면은 `?next=` 값을 받아 `safeReturnPath`에 바로 넘기니, 주소창에 직접 넣은 값은 마디가 풀리지 않은 채로 검사됩니다.

## 검사를 통과하던 값

`safeReturnPath`는 문자열 그대로 앞부분을 비교합니다. 그래서 아래 값들은 모두 통과했습니다.

| `next` 값 | 문자열 검사 | 브라우저가 도착하는 경로 |
|---|---|---|
| `/stocks/../login` | 통과 | `/login` |
| `/./login` | 통과 | `/login` |
| `/x/%2e%2e/api/v1/admin/jobs` | 통과 | `/api/v1/admin/jobs` |
| `/x/%2E%2E/LOGIN` | 통과 | `/LOGIN` |
| `/stocks/../../api` | 통과 | `/api` |

브라우저는 URL을 해석할 때 경로의 `.`과 `..` 마디를 먼저 풉니다. 퍼센트 인코딩된 `%2e%2e`도 WHATWG URL 표준에서 `..`으로 취급합니다. Node에서 바로 확인할 수 있습니다.

```js
for (const v of ['/x/%2e%2e/login', '/shop/../login', '/stocks/../../api', '/./login'])
  console.log(v, '->', new URL(v, 'http://site.invalid').pathname);
// /x/%2e%2e/login -> /login
// /shop/../login -> /login
// /stocks/../../api -> /api
// /./login -> /login
```

`..`이 루트보다 위로 올라가도 루트에서 멈추기 때문에, 이 값들로 다른 사이트에 나갈 수는 없습니다. 외부 주소 방어는 원래대로 지켜지고 있었습니다. 뚫린 것은 같은 사이트 안에서 "여기로는 보내지 않는다"고 정해 둔 경로 쪽이었습니다. 이런 링크를 받아 로그인하면 다시 로그인 화면이 열리거나, 어드민에서는 API 주소로 이동합니다. 금지 목록에 경로를 더 넣어도 같은 방식으로 모두 비켜 갈 수 있었습니다.

## 수정: 푼 값으로 검사하고 원래 값으로 이동하기

알림 링크에만 있던 처리를 `resolveSitePath`라는 함수로 빼서 `safeReturnPath`가 먼저 부르게 했습니다.

```ts
/** 브라우저가 풀어 이동할 경로를 미리 구할 때 쓰는 가짜 origin */
const SITE_ORIGIN = 'http://site.invalid';

export function resolveSitePath(value: string): string | null {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  // 제어 문자는 브라우저가 지워 '//' 가 될 수 있다
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const url = new URL(value, SITE_ORIGIN);
    return url.origin === SITE_ORIGIN ? url.pathname + url.search + url.hash : null;
  } catch {
    return null;
  }
}

export function safeReturnPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || value.length > 512) return '/';
  const resolved = resolveSitePath(value);
  if (resolved === null) return '/';
  const path = resolved.split(/[?#]/)[0]!;
  const normalized = path.toLowerCase().split(';')[0]!.replace(/\/+$/, '');
  if (normalized === '/login' || normalized === '/api' || normalized.startsWith('/api/'))
    return '/';
  return value;
}
```

정한 규칙은 세 가지입니다.

- **`//`, 역슬래시, 제어 문자는 풀기 전에 막습니다.** `new URL('//evil.test', base)`는 다른 호스트로 해석되고, 브라우저는 역슬래시를 슬래시로 바꾸며 탭이나 줄바꿈 같은 문자는 지웁니다. 이런 값을 `URL`에 먼저 넣으면 해석 결과가 이미 다른 주소가 되어 버립니다. 그래서 문자열 단계에서 먼저 돌려보냅니다.
- **풀고 나서도 origin이 가짜 origin과 같을 때만 받습니다.** 앞의 검사를 빠져나간 값이 다른 호스트로 해석되는 경우를 한 번 더 거릅니다. 가짜 origin에는 실제로 쓰일 일이 없는 `.invalid` 도메인을 썼습니다.
- **검사는 푼 값으로 하고, 돌려주는 값은 원래 값입니다.** `/jobs/../stocks?q=한복`을 넣으면 검사는 `/stocks`로 하고 반환은 `/jobs/../stocks?q=한복` 그대로입니다. 이동할 때 브라우저가 같은 규칙으로 다시 풀기 때문에 도착하는 경로는 검사한 경로와 같습니다.

푼 값을 돌려줄지도 생각했는데, 이동 결과가 같으니 반환값은 바꾸지 않았습니다. 기존 테스트에서 "같은 사이트 경로는 쿼리까지 그대로 둔다"고 확인하던 동작도 그대로 유지됩니다.

알림 링크 함수도 직접 풀던 코드를 지우고 `resolveSitePath`를 부르게 바꿨습니다. 같은 규칙이 두 군데에 따로 있으면 다음에 또 한쪽만 고치게 될 것 같았습니다.

스토어 쪽 `safeReturnPath`도 같은 방식으로 고쳤습니다. 스토어는 `/login`과 `/signup`을 막습니다. 스토어와 어드민은 앱이 나뉘어 있어서 함수도 각자 갖고 있는데, 주석에 "어드민 `resolveSitePath`와 같은 규칙"이라고 적어 두었습니다.

## 테스트

`safeReturnPath`에는 원래 막아야 할 값을 나열한 `it.each` 테스트가 있었습니다. 여기에 마디를 섞은 값을 더했습니다.

```ts
it.each([
  undefined,
  '',
  'https://evil.test',
  '//evil.test',
  '/LOGIN',
  '/login;x',
  '/api/v1/auth/logout',
  '/stocks/../login',
  '/./login',
  '/x/%2e%2e/api/v1/admin/jobs',
  '/x/%2E%2E/LOGIN',
  '/stocks/../../api',
  `/${'a'.repeat(600)}`,
])('%s 는 콘솔 홈으로 바꾼다', (value) => {
  expect(safeReturnPath(value)).toBe('/');
});
```

막는 쪽만 확인하면 "아무거나 다 홈으로 보내는" 구현도 통과합니다. 그래서 풀어 보면 안전한 값은 원래 모양 그대로 돌려준다는 테스트도 넣었습니다.

```ts
it('마디를 푼 결과가 안전하면 원래 값을 그대로 돌려준다', () => {
  expect(safeReturnPath('/jobs/../stocks?q=한복')).toBe('/jobs/../stocks?q=한복');
});
```

스토어 쪽에는 `/shop/../login`, `/./signup`, `/x/%2e%2e/login`, `/a/b/../../signup?x=1`이 메인으로 바뀌는지와 `/shop/../products/1`이 그대로 남는지를 확인하는 테스트를 넣었습니다.

## 남긴 메모

- 허용 목록이나 금지 목록으로 경로를 검사할 때는, 검사하는 값과 실제로 도착하는 값이 같은지부터 확인해야 했습니다. 문자열을 비교하는 동안 브라우저는 그 문자열을 해석한 결과로 이동합니다.
- 직접 정규화 코드를 쓰지 않고 `URL` 생성자를 썼습니다. 브라우저와 같은 WHATWG URL 규칙을 따르기 때문에 `%2e%2e`나 대소문자가 섞인 `%2E%2E`도 따로 챙길 필요가 없었습니다.
- 다만 `URL`이 다른 주소로 바꿔 버리는 입력(`//`, 역슬래시, 제어 문자)은 `URL`에 넣기 전에 막아야 합니다. 순서를 바꾸면 해석 결과만 보고는 원래 입력이 무엇이었는지 알 수 없습니다.
- 로그인 복귀 흐름에서 겪은 다른 문제는 [로그인한 뒤 원래 화면으로 돌아가지 않던 이유: Next.js 라우터 캐시](/posts/frontend-troubleshooting/login-return-to-router-cache)에 적었습니다.
