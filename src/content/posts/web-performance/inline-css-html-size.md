---
title: "정적 블로그 HTML이 300KB였던 이유: inlineCss에 실린 @font-face와 404 사본"
date: "2026-11-24"
description: "Next.js 정적 export로 만든 블로그의 홈 HTML이 299KB였습니다. 열어 보니 Pretendard @font-face 92개(47.5KB)가 inlineCss 때문에 한 페이지에 세 번 실려 있었고, 루트 not-found.tsx가 404 경계로 모든 페이지에 헤더·푸터·CSS 사본을 하나씩 더 싣고 있었습니다. 글꼴 CSS를 캐시되는 파일로 빼고 global-not-found로 옮겨 HTML을 평균 297KB에서 118KB로 줄인 과정과, 화면과 SEO 태그가 그대로인지 확인한 방법을 적었습니다."
tags: ["Next.js", "inlineCss", "Web Performance", "Web Font", "Static Export"]
---

# 정적 블로그 HTML이 300KB였던 이유

## 상황

Next.js App Router의 정적 export(`output: "export"`)로 만든 블로그를 따로 운영하고 있습니다. 빌드하면 HTML 파일이 490개 나오고, Cloudflare Workers 정적 자산으로 배포합니다.

빌드 결과의 HTML이 컸습니다. 홈이 298,956바이트, 글 페이지 하나가 335,318바이트였고, 490개 파일 평균은 297KB였습니다. 본문 분량으로는 설명이 안 되는 크기였습니다.

## HTML 안에 무엇이 들어 있었나

HTML을 나눠 보면 본문과 상관없는 덩어리 두 개가 컸습니다.

![고치기 전 홈 HTML 298,956바이트는 본문과 앱 CSS, 세 번 반복된 @font-face 묶음, 404 화면 사본으로 이루어져 있었다. 고친 뒤에는 본문과 앱 CSS만 남아 117,056바이트가 됐다](/images/posts/web-performance/inline-css-html-size/html-composition.png)

### 1. @font-face 92개가 한 페이지에 세 번

이 블로그는 Pretendard를 dynamic subset으로 씁니다. 글꼴 파일을 유니코드 범위별로 92조각으로 나누고, `@font-face` 규칙 92개에 `unicode-range`를 붙여 페이지에 쓰인 글자가 든 조각만 받게 하는 방식입니다. 이 규칙 묶음만 47.5KB였고, `globals.css`에 들어 있었습니다.

```css
@font-face{font-family:"Pretendard";font-display:swap;font-weight:400 700;
  src:url("/fonts/pretendard/PretendardVariable.subset.0.woff2") format("woff2-variations");
  unicode-range:U+f9ca-fa0b, U+ff03-ff05, ...}
/* 이런 규칙이 92개 */
```

문제는 `experimental.inlineCss`였습니다. 이 옵션을 켜면 Next.js가 CSS 파일을 `<link>`로 거는 대신 HTML의 `<style>`에 넣습니다. 동시에 같은 스타일시트가 RSC flight 페이로드에도 실립니다. 그래서 47.5KB짜리 글꼴 규칙이 페이지마다 세 번, 합쳐서 약 142KB가 들어가 있었습니다.

`inlineCss`를 켠 이유는 렌더링을 막는 CSS 요청을 없애기 위해서였습니다. 앱 CSS는 30KB 정도라 HTML에 넣어도 부담이 적었습니다. 그런데 글꼴 규칙까지 같은 파일에 있다 보니 같이 들어가 버렸습니다.

### 2. 404 화면 사본

두 번째는 루트의 `app/not-found.tsx`였습니다. 루트 레이아웃의 notFound 경계로 쓰이는 이 컴포넌트가 모든 페이지의 flight 데이터에 통째로 실리고 있었습니다. 헤더, 푸터, 인라인 CSS까지 들어간 두 번째 사본이라 약 40KB였습니다.

정적 export에서는 없는 주소를 서버가 `404.html`로 응답합니다. 클라이언트에서 이 경계가 그려질 일이 없으니, 모든 페이지가 쓰지 않는 사본을 하나씩 들고 있던 셈입니다.

## 고친 방법

### 글꼴 CSS를 캐시되는 파일로 뺀다

`@font-face` 92개를 `globals.css`에서 빼서 `public/fonts/pretendard/pretendard.v1.css`로 옮겼습니다. `/fonts/*`에는 글꼴 파일 때문에 이미 1년짜리 immutable 캐시 헤더를 걸어 두었기 때문에, 한 번 받으면 다음 페이지부터는 다시 받지 않습니다.

```text
# public/_headers
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

immutable 캐시라 파일 내용을 바꾸면 이름의 버전(`v1`)도 올려야 합니다. 파일 맨 위 주석에 이 규칙을 적어 뒀습니다.

이 파일을 `<link rel="stylesheet">`로 그냥 걸면 다시 렌더링을 막는 요청이 생깁니다. 글꼴 규칙에는 이미 `font-display: swap`이 있어서 첫 화면은 시스템 글꼴로 먼저 그려도 됩니다. 그래서 `<head>`의 작은 인라인 스크립트가 `<link>`를 나중에 붙이게 했습니다.

```tsx
const FONT_CSS_HREF = "/fonts/pretendard/pretendard.v1.css";
const fontLoadScript = `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href="${FONT_CSS_HREF}";document.head.appendChild(l)})()`;

export function BaseHeadTags() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <script dangerouslySetInnerHTML={{ __html: fontLoadScript }} />
      <noscript>
        <link rel="stylesheet" href={FONT_CSS_HREF} />
      </noscript>
    </>
  );
}
```

스크립트가 꺼진 환경을 위해 `<noscript>` 안에 일반 `<link>`도 남겼습니다.

### 404를 global-not-found로 옮긴다

`app/not-found.tsx`를 지우고 `app/global-not-found.tsx`를 만들었습니다. Next.js의 `experimental.globalNotFound`를 켜면 쓸 수 있는 파일로, 어떤 라우트에도 맞지 않는 주소에 쓰이고 레이아웃을 거치지 않습니다.

```ts
// next.config.ts
experimental: { inlineCss: true, globalNotFound: true },
```

레이아웃을 거치지 않기 때문에 `<html>`, `<body>`, 전역 CSS, 테마 스크립트를 이 파일이 직접 렌더링해야 합니다. 위의 `BaseHeadTags`를 레이아웃과 404가 같이 쓰게 묶은 이유입니다.

```tsx
export default function GlobalNotFound() {
  const dict = getDictionary("ko");
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <BaseHeadTags />
      </head>
      <body>
        <SiteHeader locale="ko" />
        <main id="main">
          <div className="container not-found">
            <h1 className="page-title">{dict.common.notFoundTitle}</h1>
            {/* ... */}
          </div>
        </main>
        <SiteFooter locale="ko" />
      </body>
    </html>
  );
}
```

## 결과

`pnpm build` 결과로 쟀습니다.

| 페이지 | 고치기 전 | 고친 뒤 | 줄어든 비율 |
|---|---|---|---|
| 홈 (`out/index.html`) | 298,956 B | 117,056 B | 61% |
| 글 페이지 하나 | 335,318 B | 153,405 B | 54% |
| HTML 490개 평균 | 297 KB | 118 KB | 60% |

앱 CSS 30KB는 계속 `inlineCss`로 HTML에 넣었습니다. 이것까지 빼면 렌더링을 막는 CSS 요청이 다시 생기기 때문입니다.

바뀐 게 크기뿐인지도 확인했습니다.

- 490개 페이지 모두 title, meta, canonical, JSON-LD가 고치기 전과 같았습니다.
- 콘텐츠 페이지 487개는 본문 마크업도 같았습니다.
- 375px 너비로 찍은 홈과 글 페이지 스크린샷이 고치기 전과 바이트 단위로 같았습니다.

## 다른 방법

| 방법 | 결과 |
|---|---|
| `inlineCss`를 끈다 | HTML은 줄지만 앱 CSS가 렌더링을 막는 외부 요청으로 돌아간다 |
| 글꼴 CSS를 `<link rel="stylesheet">`로 건다 | 캐시는 되지만 이 요청도 렌더링을 막는다 |
| `<link rel="preload" as="style">` 후 `onload`에서 stylesheet로 바꾼다 | 렌더링을 막지 않고 미리 받기도 하지만, 마크업과 `noscript` 대비가 조금 더 복잡하다 |
| 인라인 스크립트로 `<link>`를 붙인다 (이번 방법) | 렌더링을 막지 않고 파일은 캐시된다. 스크립트가 실행된 뒤에 요청이 시작된다 |

Next.js 문서도 `inlineCss`는 Tailwind처럼 CSS가 작은 경우에 쓰고, CSS가 크거나 재방문자가 많으면 외부 파일이 낫다고 설명합니다. 이번 일은 같은 CSS 안에 성격이 다른 두 덩어리가 섞여 있었던 경우였습니다. 화면을 그리는 데 바로 필요한 앱 CSS는 인라인으로, 크고 잘 바뀌지 않는 글꼴 규칙은 캐시되는 파일로 나눴습니다. 다만 문서에는 이 옵션이 아직 실험 단계라 프로덕션 사용을 권하지 않는다는 안내도 있습니다. `globalNotFound`도 실험 옵션이라, Next.js를 올릴 때는 이 두 동작이 그대로인지 다시 봐야 합니다.

## 비슷한 문제를 알아보는 법

- 정적 페이지인데 HTML이 100KB를 훌쩍 넘는다
- HTML에서 `@font-face`를 검색하면 같은 규칙이 여러 번 나온다
- 404 화면에만 있는 문구가 일반 페이지 HTML에서도 검색된다
- `self.__next_f.push(...)` 스크립트 안에 CSS나 다른 화면의 마크업이 문자열로 들어 있다

빌드 결과 폴더에서 아래처럼 세어 보면 쉽게 확인할 수 있습니다.

```bash
grep -o "@font-face" out/index.html | wc -l
```

선언한 규칙 수보다 많이 나오면 같은 CSS가 여러 곳에 실린 것입니다. 지금 이 블로그의 홈 HTML에서는 글꼴 규칙이 외부 파일로 빠져서 0이 나옵니다.

## 함께 보면 좋은 글

이 사이트도 같은 Pretendard dynamic subset을 쓰는데, 처음 적용한 과정은 [Pretendard를 dynamic subset으로 바꿔 모바일 LCP 줄이기](/posts/web-performance/pretendard-dynamic-subset-lcp)에 적었습니다. 서브셋을 만들 때 생긴 다른 문제는 [폰트 서브셋을 만들었더니 tabular-nums가 꺼진 이유](/posts/web-performance/font-subset-lost-tnum)에 있습니다. `immutable` 캐시와 파일 이름 버전 관리는 [HTTP 캐시 정리](/posts/web-performance/http-cache-basics)와 [정적 JS 캐시 전략 비교](/posts/web-performance/static-js-cache-strategy)에서 다뤘습니다.

## 참고

- [inlineCss](https://nextjs.org/docs/app/api-reference/config/next-config-js/inlineCss) (Next.js): 인라인 CSS가 유리한 경우와 외부 CSS가 나은 경우
- [not-found.js, global-not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) (Next.js): global-not-found가 레이아웃을 거치지 않는 동작
- [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) (MDN): `swap`의 동작
- [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) (MDN): 글꼴을 유니코드 범위로 나눠 받는 방식
