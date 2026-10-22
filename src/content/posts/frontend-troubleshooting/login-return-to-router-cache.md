---
title: "로그인한 뒤 원래 화면으로 돌아가지 않던 이유: Next.js 라우터 캐시"
date: "2026-11-07"
description: "로그인이 필요한 화면에서 로그인 화면으로 넘어간 뒤 로그인하면, returnTo 주소로 가지 않고 \"이미 로그인되어 있어요\" 안내가 떴습니다. Next.js 클라이언트 라우터가 비로그인 때 받은 응답을 캐시에 남겨 두고 router.replace가 그 캐시를 다시 쓰고 있었습니다. 재현 조건, router.refresh로 고쳐지지 않은 이유, location.replace로 바꾼 과정을 적었습니다."
tags: ["Next.js", "App Router", "Router Cache", "Authentication", "Playwright"]
draft: true
---

# 로그인한 뒤 원래 화면으로 돌아가지 않던 이유: Next.js 라우터 캐시

## 증상

사이드 프로젝트에는 로그인해야 쓸 수 있는 화면이 있습니다. 비로그인 상태로 그런 화면에 들어가면 proxy(Next.js 16에서 middleware가 바뀐 이름)가 로그인 화면으로 보냅니다. 이때 원래 가려던 주소를 `returnTo`에 붙입니다.

```text
/pets/new  →  /login?returnTo=%2Fpets%2Fnew
```

로그인에 성공하면 `returnTo` 주소로 옮겨 주는 흐름입니다. 그런데 소개 화면의 "반려견 등록하기" 버튼을 눌러 로그인 화면에 온 뒤 이메일로 로그인하면, 반려견 등록 화면이 열리지 않았습니다. 주소는 바뀌지 않고 로그인 화면 자리에 "이미 로그인되어 있어요" 안내가 떴습니다. 로그인 화면은 세션이 있으면 폼 대신 이 안내를 보여 주게 되어 있습니다.

목 서버로 같은 순서를 10번 반복했고 10번 모두 재현됐습니다.

반대로 아래 경우는 문제가 없었습니다(5번 중 0번).

- 주소창에 `/pets/new`를 직접 입력해서 로그인 화면으로 넘어간 경우
- 마이페이지처럼 다른 화면에서 같은 흐름을 탄 경우

화면 안의 링크를 눌러 이동했을 때만 생긴다는 점이 단서였습니다.

## 로그인 뒤처리 코드

로그인에 성공하면 아래 함수를 불렀습니다. 이메일 로그인과 소셜 로그인이 함께 쓰는 함수입니다.

```ts
export function enterSession({ queryClient, router }: SessionEntryDeps, href: string) {
  queryClient.clear()
  router.replace(href)
  router.refresh()
}
```

- `queryClient.clear()`: 이전 사용자의 React Query 캐시를 지웁니다.
- `router.replace(href)`: `push`를 쓰면 뒤로가기로 로그인 화면에 돌아오기 때문에 `replace`를 썼습니다. 소셜 로그인은 이미 쓴 `?code=&state=`가 히스토리에 남는 것도 막아야 했습니다.
- `router.refresh()`: 예전에 로그인 직후 헤더가 비로그인 모양으로 남아 있다는 제보를 받고 붙인 줄입니다. 헤더의 로그인 여부는 `(main)` 레이아웃(서버 컴포넌트)이 쿠키를 읽어 정하는데, 같은 레이아웃 안에서 이동하면 레이아웃을 다시 그리지 않습니다. 그때는 재현 조건을 잡지 못해서, 원인과 상관없이 현재 경로를 새 쿠키로 다시 받게 하려고 넣었습니다.

처음에는 이 `refresh`가 문제를 만든다고 생각했습니다. "이미 로그인되어 있어요"는 로그인 화면을 새 쿠키로 다시 그렸을 때만 나오는 문구이기 때문입니다.

## refresh를 빼도 로그인 폼에 머문다

`refresh`를 지우고 같은 순서를 3번 반복했습니다. 안내 문구는 사라졌지만 3번 모두 로그인 폼에 그대로 머물렀습니다. `router.replace('/pets/new')`가 불렸는데도 화면이 바뀌지 않은 것입니다.

`replace` 뒤에 `/pets/new`로 가는 요청은 한 건도 나가지 않았습니다. 서버에 묻지 않고 클라이언트가 가진 무언가로 화면을 그리고 있었습니다.

## 원인: route cache에 남은 로그인 화면

Next.js App Router의 클라이언트 라우터는 받은 응답을 캐시에 남깁니다. 그중 route cache는 "이 URL을 열면 어떤 라우트 트리가 나오는지"를 기억합니다.

비로그인 상태에서 화면 안의 링크로 `/pets/new`에 이동하면 이런 일이 생깁니다.

1. 클라이언트 라우터가 `/pets/new`의 RSC 응답을 요청합니다.
2. proxy가 그 요청을 `/login?returnTo=%2Fpets%2Fnew`로 리디렉션합니다.
3. 라우터는 로그인 화면을 그리고, 캐시에는 `/pets/new`의 트리로 로그인 화면이 남습니다.

로그인한 뒤 `router.replace('/pets/new')`를 부르면 라우터는 캐시에서 `/pets/new`를 찾습니다. 이미 트리가 있으니 요청을 보내지 않고 그 트리, 즉 로그인 화면을 그립니다. `node_modules/next/dist/client/components/segment-cache/navigation.js`의 `navigateUsingPrefetchedRouteTree`가 이 경로를 탑니다.

여기에 `router.refresh()`가 붙어 있었기 때문에 그 로그인 화면이 새 쿠키로 다시 그려졌고, 세션이 있으니 "이미 로그인되어 있어요"가 나왔습니다.

주소창으로 들어간 경우가 정상이었던 이유도 같습니다. 주소창 입력은 문서 전체를 새로 받기 때문에 클라이언트 라우터 캐시가 비어 있는 상태에서 시작합니다.

## refresh 순서를 바꿔도 안 되는 이유

`refresh`를 `replace` 앞으로 옮겨 보기도 했습니다. 3번 모두 로그인 폼에 머물렀습니다.

`router.refresh()`는 현재 경로의 segment cache를 비우고 서버에서 다시 받지만 route cache는 비우지 않습니다. `router-reducer/reducers/refresh-reducer.js`의 주석에도 이 동작이 적혀 있습니다. 그래서 `refresh`를 몇 번 부르든 `/pets/new`의 트리가 로그인 화면이라는 기록은 그대로 남습니다.

비로그인 때 받은 응답은 세션이 생기는 순간 전부 낡은 값이 됩니다. 그런데 클라이언트 라우터 캐시를 통째로 비우는 공개 API가 없었습니다.

## 수정: location.replace로 문서를 새로 받는다

로그인 뒤의 이동을 `router.replace`에서 `location.replace`로 바꿨습니다.

```ts
type SessionEntryDeps = {
  queryClient: Pick<QueryClient, 'clear'>
  /** 호출부는 window.location을 넘긴다. node 환경 테스트에서 주입하려고 받는다 */
  location: Pick<Location, 'replace'>
}

export function enterSession({ queryClient, location }: SessionEntryDeps, href: string) {
  queryClient.clear()
  location.replace(href)
}
```

```tsx
onSuccess: () => enterSession({ queryClient, location: globalThis.location }, returnTo),
```

- 문서 전체를 새로 받으므로 클라이언트 라우터 캐시가 함께 사라집니다.
- 서버가 새 쿠키로 모든 레이아웃을 다시 그립니다. 예전에 `refresh`로 막으려던 "헤더가 비로그인 모양으로 남는" 문제도 같은 캐시가 원인일 수 있는 자리여서 함께 닫혔습니다. 홈 헤더에서 로그인하고 돌아오는 흐름을 5번 확인했고 5번 모두 헤더가 로그인 모양이었습니다.
- `assign` 대신 `replace`를 써서 히스토리에 로그인 화면이 남지 않게 했습니다. 소셜 로그인의 `?code=&state=`도 남지 않습니다.
- `queryClient.clear()`는 남겨 두었습니다. 새 문서가 오면 캐시도 사라지지만, 도착하기 전 잠깐 동안 이전 사용자의 데이터가 보이는 것을 막습니다.

로그인 한 번에 문서를 한 번 새로 받는 비용이 생기지만, 로그인 앞의 클라이언트 상태를 이어 가야 할 이유가 없어서 받아들였습니다.

## 검토했다가 버린 방법

- **`refresh`를 `replace` 앞으로 옮기기**: 위에서 확인한 대로 route cache가 남아 로그인 폼에 머뭅니다.
- **로그인 화면에서 서버 리디렉션하기**: 세션과 `returnTo`가 함께 있으면 로그인 화면이 서버에서 `returnTo`로 보내는 방법입니다. `replace` 다음에 `refresh`가 오는 두 번의 왕복과 라우터 내부 순서에 기대야 했습니다. 다른 낡은 캐시 항목은 그대로 남고, 로그인 상태에서 로그인 화면에 오면 안내를 보여 주던 기존 동작도 바뀝니다.
- **로그인을 Server Action으로 옮기기**: Server Action 안에서 쿠키를 바꾸면 Next.js가 클라이언트 캐시를 무효화해 줍니다. 하지만 BFF를 거치는 인증 흐름 전체를 바꿔야 해서 이 버그를 고치는 범위를 넘었습니다.

## 테스트

`enterSession`은 훅 대신 일반 함수로 두었습니다. 이 프로젝트의 단위 테스트는 node 환경에서 돌아서 호출 순서만 검사할 수 있기 때문입니다.

```ts
it('캐시를 비우고 복귀 경로를 문서째 새로 받는다', () => {
  const { calls, queryClient, location } = fakes()

  enterSession({ queryClient, location }, '/plans')

  expect(calls).toEqual(['clear', 'location.replace:/plans'])
})
```

이 테스트는 누군가 `router.replace`로 되돌리는 것만 막습니다. 버그 자체는 브라우저의 라우터 캐시에서 생기므로 단위 테스트로는 재현할 수 없었습니다. 그래서 Playwright 테스트를 하나 더 붙였습니다.

```ts
test.describe('로그인 뒤 복귀', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('소개 화면의 반려견 등록하기로 로그인하면 반려견 등록 화면이 열린다', async ({ page }) => {
    await page.goto('/about')
    await page.getByRole('link', { name: '반려견 등록하기' }).first().click()
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fpets%2Fnew$/)

    // 목 계정으로 로그인
    await page.getByRole('button', { name: '로그인', exact: true }).click()

    await expect(page).toHaveURL(/\/pets\/new$/)
    await expect(page.getByText('이미 로그인되어 있어요')).toHaveCount(0)
    await expect(page.locator('header a[href="/login"]')).toHaveCount(0)
  })
})
```

`page.goto('/pets/new')`로 바로 들어가면 문서를 새로 받기 때문에 캐시가 비어 있어 버그가 재현되지 않습니다. 그래서 소개 화면에서 시작해 링크를 눌러 들어가도록 썼습니다. 테스트 위 주석에도 이 이유를 적어 두었습니다.

## 남긴 메모

- 같은 URL이라도 비로그인 때 받은 RSC 응답과 로그인 뒤의 응답은 다릅니다. 세션이 바뀌는 지점(로그인, 로그아웃)에서는 클라이언트 라우터 캐시를 믿지 않는 편으로 정했습니다.
- 버그가 화면 안의 링크 이동에서만 생기면 클라이언트 라우터 캐시를 먼저 의심합니다. e2e 테스트도 `goto`로 바로 들어가지 않고 실제 사용자처럼 링크를 눌러 들어가야 재현됩니다.
