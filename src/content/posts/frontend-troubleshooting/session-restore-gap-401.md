---
title: "새로고침 직후 보낸 요청이 401을 받던 이유: 메모리 토큰과 세션 복구 공백"
date: "2026-11-14"
description: "access 토큰을 메모리에만 두는 Next.js 앱에서, 주소를 직접 열고 곧바로 폼을 보내면 로그인한 상태인데도 401을 받았습니다. refresh 쿠키로 토큰을 되찾아 오기 전의 짧은 공백에 나간 요청이었고, 기존 재시도 코드는 토큰이 있을 때만 refresh를 불러 이 경우를 놓쳤습니다. E2E를 쓰다 발견한 과정, 복구 약속을 하나로 묶어 공백의 요청을 다시 보내게 한 방법, 비로그인 사용자의 401에는 refresh를 붙이지 않은 기준을 적었습니다."
tags: ["Authentication", "Access Token", "Refresh Token", "Next.js", "Playwright"]
---

# 새로고침 직후 보낸 요청이 401을 받던 이유

## 증상

읽고 본 것을 기분과 함께 기록하는 사이드 프로젝트에서, 로그인한 상태로 목록 만들기 화면(`/collections/new`)을 주소창에 직접 열고 곧바로 "만들기"를 누르면 폼에 "로그인이 필요합니다"가 떴습니다. 서버 응답은 401이었습니다.

새로고침, 북마크, 공유 링크처럼 주소를 직접 여는 경우에만 생겼습니다. 화면 안의 링크로 이동했을 때나 화면을 연 뒤 조금 기다렸다가 누를 때는 문제가 없었습니다. 헤더에는 이미 로그인한 모습이 보이고 있어서, 사용자 입장에서는 이유를 알 수 없는 실패였습니다.

## 토큰을 보관하는 방식

이 앱은 access 토큰을 메모리(zustand store)에만 둡니다. localStorage에 두면 XSS로 토큰을 읽어 갈 수 있어서 이렇게 정했습니다. 대신 새로고침하면 토큰이 사라지므로, 앱이 뜰 때 `AuthProvider`가 HttpOnly refresh 쿠키로 토큰을 다시 받아 옵니다.

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const markReady = useAuthStore((state) => state.markReady)

  useEffect(() => {
    tryRefresh().finally(markReady)
  }, [markReady])

  return <>{children}</>
}
```

`tryRefresh`는 refresh 요청이 성공하면 `signIn`으로 토큰과 사용자를 저장하고, 실패하면 `signOut`으로 로그아웃 상태를 만듭니다.

## 원인

주소를 직접 열면 refresh 응답이 돌아오기 전까지 메모리에 토큰이 없습니다. 이 사이에 보낸 요청은 `Authorization` 헤더 없이 나가고 401을 받습니다.

API 클라이언트에는 401을 받으면 refresh를 한 번 시도하고 다시 보내는 코드가 있었습니다. 그런데 조건에 `token`이 들어 있었습니다.

```ts
if (response.status === 401 && retryOnUnauthorized && token) {
  // Access 토큰이 만료됐을 뿐일 수 있다. refresh 쿠키로 한 번만 재발급을 시도한다.
  const refreshed = await tryRefresh()
  if (refreshed) {
    return request<T>(path, init, false)
  }
}
```

토큰 만료만 생각하고 만든 재시도라서, 토큰을 붙여 보냈다가 401을 받은 경우에만 동작했습니다. 토큰이 아직 없는 복구 공백에서 받은 401은 그대로 화면에 전달됐습니다.

## 발견한 과정

사람 손으로는 잘 닿지 않는 문제라서 E2E 테스트를 쓰다가 알게 됐습니다. Playwright는 페이지를 열자마자 사람이 낼 수 없는 속도로 폼을 채우고 버튼을 누르기 때문에 매번 이 공백에 들어갔습니다.

처음에는 테스트 쪽에서 세션 복구를 기다리는 `waitForSession` 헬퍼를 만들어 비켜 갔고, 앱 코드는 따로 이슈로 남겼습니다. 인증 흐름의 동작을 바꾸는 일이라 테스트 작업과 섞지 않으려고 했습니다.

느린 네트워크에서는 refresh 응답이 늦어져 공백이 길어지므로, 실제 사용자도 충분히 겪을 수 있다고 봤습니다.

## 고친 방법

### 1. 토큰 없이 받은 401도 복구를 기다린 뒤 다시 보낸다

```ts
if (response.status === 401 && retryOnUnauthorized) {
  // 토큰을 붙여 보냈다면 만료됐을 뿐일 수 있다.
  // 토큰 없이 나갔다면 세션 복구 공백에 걸린 것이다.
  const recovered = token ? await tryRefresh() : await recoverFromSessionGap()
  if (recovered) {
    return request<T>(path, init, false)
  }
}
```

토큰을 붙여 보냈으면 기존처럼 재발급을 시도하고, 토큰 없이 보냈으면 `recoverFromSessionGap`으로 넘깁니다.

### 2. 복구가 이미 끝났다면 refresh를 다시 부르지 않는다

```ts
async function recoverFromSessionGap(): Promise<boolean> {
  const { accessToken, ready } = useAuthStore.getState()
  // 응답을 기다리는 동안 복구가 끝났다면 토큰만 붙여 다시 보내면 된다.
  if (accessToken) return true
  if (ready) return false
  await restoreSession()
  return useAuthStore.getState().accessToken !== null
}
```

토큰 없이 받은 401을 모두 refresh로 이으면, 로그인하지 않은 사용자가 보호된 API를 부를 때마다 refresh 요청이 하나씩 더 붙습니다. 그래서 복구가 끝났는지(`ready`)를 먼저 봅니다. 복구가 끝났는데 토큰이 없다면 정말 로그인하지 않은 사용자이므로 401을 그대로 돌려줍니다.

`ready`는 `signIn`과 `signOut`이 세워 줍니다. 복구가 성공하든 실패하든 둘 중 하나는 불리므로 판단 근거를 따로 만들 필요가 없었습니다.

### 3. 복구 요청을 하나로 묶는다

공백에 걸린 요청이 여러 개일 수 있고, `AuthProvider`도 같은 시점에 복구를 기다립니다. 각자 `tryRefresh`를 부르면 refresh 요청이 여러 번 나갑니다. 진행 중인 복구를 모듈 변수에 담아 같은 Promise를 나눠 쓰게 했습니다.

```ts
let restoring: Promise<boolean> | null = null

export function restoreSession(): Promise<boolean> {
  restoring ??= tryRefresh().finally(() => {
    restoring = null
  })
  return restoring
}
```

복구가 끝나면 변수를 비웁니다. 그래야 테스트 사이에 이전 Promise가 남지 않습니다. `AuthProvider`도 `tryRefresh` 대신 `restoreSession`을 부르게 바꿨습니다.

## 테스트

API 클라이언트 단위 테스트에 아래 경우를 넣었습니다.

- 복구가 끝나기 전에 보냈어도 성공한다
- 여러 요청이 겹쳐도 복구는 한 번만 돈다
- 복구에 실패하면 401을 그대로 알리고 로그아웃 상태가 된다
- 비로그인 사용자의 401은 refresh를 다시 부르지 않는다
- 만료된 토큰은 한 번 재발급하고 다시 보낸다

E2E에서는 `waitForSession` 우회를 지우고 공백을 재현하는 테스트를 따로 만들었습니다. 로컬에서는 localhost 왕복이 너무 빨라서 그냥 열고 누르는 것만으로는 재현되지 않았습니다. 그래서 refresh 응답을 1.5초 늦춰 공백을 넓혔습니다.

```ts
const SLOW_REFRESH_MS = 1500

test('복구가 늦어도 곧바로 보낸 요청이 성공한다', async ({ page }) => {
  const account = newAccount()
  await signUp(page, account)

  await page.route('**/api/v1/auth/refresh', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, SLOW_REFRESH_MS))
    await route.continue()
  })

  // 주소를 직접 열어 메모리의 토큰을 비운다
  await page.goto('/collections/new')
  await page.getByLabel('제목').fill('복구를 기다리지 않은 목록')
  await page.getByRole('button', { name: '만들기' }).click()

  await page.waitForURL(/\/collections\/[^/]+\/edit/)
})
```

이 테스트는 고치기 전 코드에서 실패하는 것을 먼저 확인한 뒤 수정을 넣었습니다.
