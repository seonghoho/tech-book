---
title: "없는 글 주소가 404 대신 200으로 응답하던 이유: loading.tsx와 스트리밍"
date: "2026-11-11"
description: "이 블로그에서 초안 글 주소를 열면 \"찾을 수 없음\" 화면이 나오는데 응답 코드는 200이었습니다. 글 상세 경로의 loading.tsx와 레이아웃의 Suspense가 응답을 먼저 보내서 notFound()가 상태 코드를 바꾸지 못하고 있었습니다. 원인을 확인한 과정과 수정, 같은 이유로 초기 HTML에서 빠졌던 광고 스크립트 이야기를 함께 적었습니다."
tags: ["Next.js", "App Router", "SEO", "404", "Streaming"]
draft: true
---

# 없는 글 주소가 404 대신 200으로 응답하던 이유: loading.tsx와 스트리밍

## 초안 주소가 200으로 열렸다

이 블로그는 마크다운 글에 `draft: true`를 붙이거나 날짜를 미래로 두면 공개 전까지 없는 글로 취급합니다. 글을 읽어 오는 함수가 이런 글을 만나면 "Post not found" 에러를 던지고, 글 상세 페이지는 그 에러를 받아 `notFound()`를 부릅니다.

```tsx
const getPostOrNotFound = async (slugString: string) => {
  try {
    return await getPostData("posts", slugString);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Post not found for slug:")) {
      notFound();
    }

    throw error;
  }
};
```

초안 몇 편을 올려 둔 뒤 배포된 사이트에서 초안 주소를 열어 봤습니다. 화면에는 "찾을 수 없음" 페이지가 나왔습니다. 그런데 응답 헤더를 보니 상태 코드가 200이었습니다.

```bash
curl -sI https://seonghoho.com/posts/<초안 경로> | head -1
# HTTP/2 200
```

HTML 안의 robots 메타 태그도 `index, follow`였습니다. 검색 엔진 입장에서는 내용이 "찾을 수 없음"뿐인 정상 페이지입니다. Search Console은 이런 페이지를 소프트 404로 분류할 수 있습니다. 검색엔진 최적화 작업을 하던 중이라 그냥 둘 수 없었습니다.

다른 경로도 확인해 보니 문제가 더 있었습니다.

- 없는 게임 로그 주소(`/games/...`)는 500을 돌려줬습니다. 게임 상세 페이지는 "Post not found" 에러를 잡지 않고 그대로 던지고 있었습니다.
- 글이 하나도 없는 카테고리나 태그 주소는 빈 목록을 200으로 보여 줬습니다.

## 원인: 응답이 먼저 나간 뒤 notFound()가 불린다

글 상세 경로에는 `loading.tsx`가 있었습니다. 글 목록 모양의 회색 스켈레톤을 보여 주는 파일입니다. 그리고 `(main)` 라우트 그룹의 레이아웃이 페이지를 `Suspense`로 한 번 더 감싸고 있었습니다.

```tsx
// src/app/(main)/layout.tsx (수정 전)
<div className="min-w-0 flex-1">
  <Suspense fallback={<Loading />}>{children}</Suspense>
</div>
```

App Router에서 `loading.tsx`는 그 경로의 페이지를 `Suspense`로 감싸는 것과 같습니다. 서버는 페이지가 준비될 때까지 기다리지 않고 레이아웃과 로딩 화면을 먼저 스트리밍으로 보냅니다.

HTTP 상태 코드는 응답 헤더에 들어가고, 헤더는 본문의 첫 조각보다 먼저 나갑니다. 로딩 화면을 보내는 순간 상태 코드는 200으로 정해집니다. 그 뒤에 페이지에서 `notFound()`가 불리면 Next.js는 이미 열린 스트림 안에 "찾을 수 없음" 화면을 그려 넣을 수만 있고, 상태 코드는 바꿀 수 없습니다.

빌드 때 미리 만든 글은 이 문제가 없습니다. 이 페이지는 `generateStaticParams`로 공개된 글만 미리 만들고, 나머지 주소는 요청이 올 때 서버에서 렌더링합니다. 초안이나 예약 글 주소는 미리 만든 목록에 없으니 요청 시점에 렌더링되고, 그때 스트리밍이 끼어듭니다.

```tsx
export const dynamic = "force-static";
export const revalidate = 3600;
```

## 하나씩 빼 보며 확인한 것

원인을 좁히려고 하나씩 빼고 다시 빌드해서 응답을 확인했습니다.

- 레이아웃의 `Suspense`만 뺐을 때: 여전히 200이었습니다. 글 상세 경로의 `loading.tsx`가 남아 있어서 같은 일이 생겼습니다.
- `force-static`만 뺐을 때: 여전히 200이었습니다. 정적/동적 설정과는 관계가 없었습니다.
- `loading.tsx`와 레이아웃의 `Suspense`를 둘 다 뺐을 때: 404와 `noindex`가 함께 나왔습니다. 404 응답도 그대로 캐시됐습니다.

## 수정

- `posts/[...slug]/loading.tsx`와 `games/[...slug]/loading.tsx`를 지웠습니다.
- `(main)` 레이아웃에서 `Suspense`를 빼고 `children`을 그대로 렌더링했습니다.
- 게임 상세 페이지도 글 상세와 같이 "Post not found" 에러를 잡아 `notFound()`를 부르게 했습니다. 500이 404로 바뀌었습니다.
- 카테고리와 태그 페이지는 글이 하나도 없으면 `notFound()`를 부르게 했습니다.

```tsx
// 글이 없는 카테고리는 빈 목록(200) 대신 404로 응답한다.
if (posts.length === 0) notFound();
```

수정한 뒤 사이트맵에 있는 주소 31개를 모두 다시 요청해 200이 나오는 것을 확인했습니다. 초안 주소는 404를 돌려줬습니다.

대신 글 상세로 이동할 때 보이던 로딩 스켈레톤은 없어졌습니다. 공개된 글은 빌드 때 미리 만들어 두기 때문에 이 차이는 받아들이기로 했습니다.

## dynamicParams = false를 쓰지 않은 이유

`dynamicParams = false`를 두면 `generateStaticParams`에 없는 주소는 모두 404가 됩니다. 이 방법이 더 간단해 보였지만 예약 발행과 맞지 않았습니다.

이 블로그는 글 날짜를 미래로 두고 배포해 두면, 그 날짜가 지난 뒤 `revalidate` 주기에 맞춰 공개되게 해 두었습니다. 배포할 때는 아직 공개 전이라 `generateStaticParams` 목록에 없습니다. `dynamicParams = false`를 쓰면 날짜가 지나도 다음 배포 전까지 계속 404가 납니다.

## 다시 들어오지 않게 막은 테스트

`loading.tsx`는 누군가 로딩 화면이 있으면 좋겠다고 생각하는 순간 다시 생기기 쉬운 파일입니다. 파일이 있는지만 확인하는 테스트를 하나 붙였습니다.

```ts
// 글·게임 상세 경로와 (main) 레이아웃에 loading.tsx나 Suspense가 있으면, 응답이 200으로
// 먼저 나간 뒤 notFound()가 불려 없는 주소가 404 대신 200(소프트 404)이 된다.
describe("not-found boundaries", () => {
  it("post and game detail routes have no loading.tsx", () => {
    assert.equal(existsSync("src/app/(main)/posts/[...slug]/loading.tsx"), false);
    assert.equal(existsSync("src/app/(main)/games/[...slug]/loading.tsx"), false);
  });

  it("the (main) layout does not wrap pages in Suspense", () => {
    const layout = readFileSync("src/app/(main)/layout.tsx", "utf8");
    assert.equal(layout.includes("Suspense"), false);
  });
});
```

글 상세 페이지 코드에도 같은 이유를 주석으로 남겼습니다. 테스트가 실패했을 때 왜 이 파일을 두면 안 되는지 바로 알 수 있게 하려는 것입니다.

## 같은 이유로 놓쳤던 광고 스크립트

비슷한 일을 전에도 겪었습니다. 브라우저 화면에서는 멀쩡한데, 서버가 처음 보내는 HTML에는 빠져 있던 경우입니다.

AdSense 신청을 하려면 사이트의 `<head>`에 광고 스크립트를 넣어야 합니다. 처음에는 `next/script`를 `afterInteractive`로 넣었습니다.

```tsx
<Script
  async
  src={ADSENSE_SCRIPT_SRC}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

브라우저 개발자 도구에서는 스크립트가 보였지만, 정적으로 만든 홈 HTML을 열어 보면 태그가 없었습니다. `afterInteractive`는 하이드레이션 뒤에 클라이언트에서 스크립트를 넣기 때문입니다. 심사하는 크롤러가 HTML만 읽는다면 광고 코드를 찾지 못합니다. 루트 레이아웃의 `<head>`에 일반 `<script async>`를 직접 넣는 것으로 고쳤습니다.

몇 달 뒤 광고를 홈과 글 상세에서만 불러오도록 바꾸면서 같은 문제가 다시 생겼습니다. 현재 경로를 알아야 해서 `usePathname`을 쓰는 클라이언트 컴포넌트를 만들었고, 그 안에서 다시 `next/script`를 썼습니다.

```tsx
"use client";

export default function GoogleAdsense() {
  const pathname = usePathname();

  if (!isAdsenseEligiblePath(pathname)) return null;

  return <Script /* ... */ />;
}
```

경로 판단을 클라이언트로 옮기면서 스크립트를 넣는 시점도 클라이언트로 함께 넘어간 것입니다. 이번에는 경로를 판단하지 않고, 광고가 필요한 페이지(홈, 색인되는 글 상세)에서 서버 컴포넌트를 직접 렌더링하게 바꿨습니다.

```tsx
// 서버 컴포넌트에서 일반 <script async>로 렌더링해 초기 HTML <head>에 포함시킨다.
export default function AdsenseScript() {
  return <script async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" />;
}
```

```tsx
// 글 상세 페이지
{isIndexablePostSlug(slugString) ? <AdsenseScript /> : null}
```

## 확인하는 습관

두 문제 모두 브라우저로 볼 때는 이상이 없었습니다. 소프트 404는 화면에 "찾을 수 없음"이 제대로 나왔고, 광고 스크립트는 개발자 도구에 보였습니다. 크롤러가 받는 것은 첫 응답의 상태 코드와 HTML이라 브라우저 화면만으로는 알 수 없었습니다.

그 뒤로 검색이나 광고와 관련된 변경을 배포하면 아래 두 가지를 확인합니다.

- `curl -I`로 상태 코드를 봅니다. 특히 없는 주소, 초안 주소, 빈 목록 주소를 봅니다.
- `curl`로 받은 HTML에서 필요한 태그(robots 메타, 광고 스크립트, 구조화 데이터)를 검색합니다.
