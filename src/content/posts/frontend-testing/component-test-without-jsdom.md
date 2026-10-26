---
title: "jsdom 없이 React 컴포넌트 테스트하기: renderToStaticMarkup과 문자열 단언"
date: "2026-10-26"
description: "사이드 프로젝트의 프론트엔드 테스트를 jsdom과 Testing Library 없이 node 환경의 vitest로 돌리고 있습니다. 컴포넌트는 renderToStaticMarkup으로 HTML 문자열을 만들어 단언하고, 문자열로 볼 수 없는 레이아웃과 로그인 뒤 화면은 Playwright로 넘깁니다. 설정, 테스트로 무엇을 보고 무엇을 포기했는지, 소스를 문자열로 읽을 때 주석 때문에 테스트가 거짓으로 통과한 일을 적었습니다."
tags: ["Testing", "Vitest", "React", "Next.js", "Playwright"]
---

# jsdom 없이 React 컴포넌트 테스트하기: renderToStaticMarkup과 문자열 단언

## 이 방식을 고른 이유

사이드 프로젝트의 프론트엔드는 Next.js App Router로 만들었고, 테스트는 vitest로 돌립니다. 보통 React 컴포넌트를 테스트하면 jsdom으로 브라우저 DOM을 흉내 내고 Testing Library로 렌더링합니다. 이 프로젝트는 그 둘을 쓰지 않았습니다.

- vitest 환경은 `environment: 'node'`입니다. DOM이 없습니다.
- 컴포넌트는 `react-dom/server`의 `renderToStaticMarkup`으로 HTML 문자열을 만듭니다.
- 그 문자열에 원하는 글자가 있는지 `toContain`, `not.toContain`, `toMatch`로 확인합니다.

처음 이렇게 정한 이유는 일정이었습니다. 짧은 기간 안에 화면을 많이 만들어야 했고, 테스트 환경 설정에 시간을 쓰기보다 에러 판정이나 포맷 함수 같은 순수 로직부터 빨리 테스트로 덮고 싶었습니다. node 환경은 설정할 것이 거의 없었습니다.

지금 이 프로젝트에는 테스트 파일이 482개 있고, 그중 183개가 `renderToStaticMarkup`으로 컴포넌트를 렌더링합니다.

## 설정

```ts
// vitest.config.ts
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'app/**/*.test.ts'],
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 'server-only'는 node 환경에서 throw 하므로 빈 스텁으로 바꾼다
      'server-only': fileURLToPath(new URL('./src/test/stubs/server-only.ts', import.meta.url)),
    },
  },
})
```

- 테스트 파일은 `.test.ts`만 모읍니다. `.tsx`를 쓰지 않기 때문에 테스트 안에서는 JSX 대신 `createElement`로 엘리먼트를 만듭니다.
- `server-only` 별칭이 없으면 테스트가 import 단계에서 실패합니다. 환경 변수나 인증 모듈이 `server-only`를 불러오는데, 이 패키지는 React 서버 환경이 아닌 곳에서 import 되면 에러를 던집니다. 테스트에서는 빈 파일(`export {}`)로 바꿔 둡니다.
- `globals: false`로 두고 `describe`, `it`, `expect`를 매번 import 합니다. 빠뜨리면 타입 검사에서 바로 걸립니다.

## 컴포넌트 테스트 예시

목록 화면에서 에러가 났을 때 보여 주는 컴포넌트를 테스트하는 예입니다. 데이터가 없는 404에서는 "다시 시도" 버튼이 없어야 하고, 서버 장애인 5xx에서는 버튼이 있어야 합니다.

```ts
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PlaceListSection from '@/features/place/place-list-section'

describe('PlaceListSection', () => {
  it('데이터 부재(404)에서는 재시도 버튼을 노출하지 않는다', () => {
    const markup = renderToStaticMarkup(
      createElement(PlaceListSection, { status: 404, message: '조건에 맞는 장소가 없습니다.' }),
    )

    expect(markup).toContain('조건에 맞는 장소가 없습니다.')
    expect(markup).not.toContain('다시 시도')
  })

  it('일시 장애(5xx)에서는 재시도 버튼을 노출한다', () => {
    const markup = renderToStaticMarkup(
      createElement(PlaceListSection, { status: 503, message: null }),
    )

    expect(markup).toContain('다시 시도')
  })
})
```

접근성 속성도 문자열에 그대로 나오기 때문에 같은 방식으로 확인합니다.

```ts
it('교환 중임을 role=status 로 알린다', () => {
  const markup = render('kakao', { status: 'exchanging' })

  expect(markup).toContain('role="status"')
  expect(markup).toContain(messages.auth.oauthExchanging)
})
```

소셜 로그인 콜백 화면의 테스트입니다. 상태가 저절로 바뀌는 화면이라 스크린 리더가 읽을 수 있게 `role="status"`를 붙였고, 그 약속을 테스트로 남겨 두었습니다.

## 테스트하는 것과 순서

문자열 단언은 마크업이 조금만 바뀌어도 깨질 수 있습니다. 그래서 테스트할 대상에 순서를 정했습니다.

1. **순수 로직:** API 응답 래퍼 판별, HTTP 상태별 에러 종류, 비동기 작업의 실패 판정, 거리·기온·금액 포맷, 좌표 검증, URL 필터를 문자열로 만들었다가 다시 읽는 왕복 변환. 입력과 출력이 분명해서 가장 싸고 덜 깨집니다.
2. **렌더 분기:** 로딩, 빈 상태와 404, 5xx, 성공 상태가 서로 겹치지 않고 하나씩만 나오는지. 서버가 보낸 에러 문구가 그대로 보이는지, 모르는 enum 코드가 와도 화면이 비지 않는지.
3. **접근성 속성:** `aria-label`, `aria-pressed`, `aria-expanded`, `role`처럼 마크업에 드러나는 것.

커버리지 숫자 목표는 두지 않았습니다. 대신 "에러 분기 판정 함수", "새 화면의 404와 5xx 분기"처럼 빠지면 안 되는 항목을 목록으로 두고, 그 목록이 비어 있으면 아직 덜 된 것으로 봅니다.

## 렌더링할 수 없는 컴포넌트

node 환경에서 `renderToStaticMarkup`으로 그릴 수 없는 컴포넌트가 있습니다.

- **async 서버 컴포넌트:** `renderToStaticMarkup`은 비동기 컴포넌트를 기다려 주지 않습니다. 안에서 쓰는 순수 함수를 따로 빼서 그 함수를 테스트합니다.
- **React Query 훅이나 Zustand 스토어를 쓰는 컴포넌트:** 데이터를 가져오는 부분과 화면을 그리는 부분을 나눕니다. 화면 쪽은 props로 데이터를 받는 컴포넌트로 만들고, 그 컴포넌트를 테스트합니다.

두 번째 경우가 이 방식에서 가장 자주 부딪히는 부분이었습니다. 컴포넌트를 나누고 나면 404, 5xx, 빈 상태를 props만 바꿔서 확인할 수 있습니다.

훅이 아닌 일반 함수로 빼는 경우도 있습니다. 로그인 뒤처리를 `useRouter`에 기대는 훅 대신 `location`을 인자로 받는 함수로 만든 것이 그런 예입니다. 호출 순서를 node 환경에서 검사할 수 있습니다. 이 함수에서 생긴 버그 이야기는 [로그인한 뒤 원래 화면으로 돌아가지 않던 이유](/posts/frontend-troubleshooting/login-return-to-router-cache)에 적었습니다.

## 테스트 데이터

응답 데이터는 테스트 파일마다 손으로 쓰지 않고, 도메인별 fixture 파일과 응답 래퍼를 만드는 함수(`ok()`, `fail()`)로 모았습니다. fixture에는 규칙을 몇 가지 두었습니다.

- **기본 fixture에 실제 같은 긴 한국어 데이터를 넣습니다.** 장소 이름이 `'테스트'`처럼 짧으면 글자가 넘치는 문제를 테스트가 영영 보지 못합니다.
- **null이 될 수 있는 필드는 기본값을 null로 둡니다.** 값이 항상 있다고 가정한 코드가 기본 경로에서 바로 드러납니다.
- **문자열 ID는 문자열로 둡니다.** 백엔드가 큰 정수 ID를 문자열로 내려 주는데, fixture에서 숫자로 바꾸면 실제와 다른 데이터로 테스트하게 됩니다.
- **`fetch`를 모킹하지 않습니다.** 함수나 컴포넌트가 데이터를 인자로 받게 만들고 fixture를 직접 넣습니다.
- **fixture는 실제 API 응답을 받아서 만듭니다.** 인증이 필요 없는 GET 응답을 받아 필요한 부분만 옮기고, 파일 위에 출처와 확인한 날을 주석으로 남깁니다. 상상으로 만든 응답으로 테스트하면 백엔드 계약이 바뀌어도 테스트는 계속 통과합니다.

## 소스를 문자열로 읽는 테스트와 주석

렌더링 자체가 안 되는 파일도 있습니다. `error.tsx`, `not-found.tsx`, `loading.tsx`, `layout.tsx`처럼 Next.js가 라우트에 끼워 넣는 파일입니다. 이런 파일에서 지켜야 할 약속(어떤 컴포넌트를 쓰는지, 어떤 클래스를 붙이는지)은 소스 파일을 문자열로 읽어서 확인했습니다.

그런데 이 방식으로 테스트가 거짓으로 통과한 일이 있었습니다. 이 프로젝트는 코드에 이유를 길게 적는 편이라 주석에 클래스명이나 컴포넌트명이 그대로 들어갑니다. 코드에서 클래스를 지워도 주석에 같은 글자가 남아 있어서 `toContain`이 통과했습니다. 그 뒤로 일부러 코드를 망가뜨려 테스트가 실패하는지 확인해 보니, 같은 이유로 통과하던 단언이 세 군데 더 나왔습니다.

반대 경우도 있었습니다. "이 prop을 넘기지 않는다"를 주석으로 적어 둔 파일에서는, 주석 속 prop 이름 때문에 "이 prop이 없다"는 단언이 이유 없이 실패했습니다.

그래서 소스 단언은 주석을 걷어 낸 사본에 대해서만 하도록 헬퍼를 하나 만들었습니다.

```ts
export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

export function readSourceWithoutComments(relative: string): string {
  return stripComments(readSource(relative))
}
```

- 줄 주석은 줄 첫머리에 있는 것만 지웁니다. 줄 가운데의 `//`까지 지우면 `'https://...'` 같은 문자열이 잘립니다.
- 헬퍼를 만들기 전에는 아홉 개 테스트 파일이 각자 비슷한 함수를 갖고 있었습니다. 이름도 제각각이었고, 블록 주석만 지우는 것과 줄 주석까지 지우는 것이 섞여 있었습니다. 같은 이름의 함수가 파일마다 다른 일을 하고 있었습니다.

JSX 태그를 찾는 것도 정규식 대신 작은 스캐너로 바꿨습니다. `/<Foo\b[\s\S]*?\/>/` 같은 정규식은 `action={<BackLink />}`처럼 prop 안에 들어 있는 다른 태그의 `/>`에서 잘립니다.

이 블로그에도 같은 종류의 테스트가 있습니다. 글 상세 경로에 `loading.tsx`가 다시 생기지 않는지 파일을 읽어 확인하는 테스트입니다. 왜 그 파일을 두면 안 되는지는 [없는 글 주소가 404 대신 200으로 응답하던 이유](/posts/frontend-troubleshooting/soft-404-loading-tsx)에 적었습니다.

## 문자열로 볼 수 없는 것은 Playwright로

node 환경의 문자열 테스트로는 볼 수 없는 것이 분명히 있습니다.

| 대상 | 도구 | 이유 |
| --- | --- | --- |
| 순수 로직 | vitest | 입출력이 분명하고 가장 쌉니다 |
| 렌더 분기 (로딩, 404, 5xx, 성공) | vitest | 마크업 문자열로 충분합니다 |
| 마크업에 드러나는 접근성 속성 | vitest | `aria-*`, `role`은 문자열에 있습니다 |
| 계산된 레이아웃 (배경, 둥근 모서리, 정렬) | Playwright | 브라우저가 계산해야 알 수 있습니다 |
| 로그인이 필요한 화면 | Playwright | proxy를 거치는 경로는 렌더 테스트가 닿지 않습니다 |
| 클릭, 입력 같은 상호작용 | 아직 없음 | 필요해지면 jsdom과 Testing Library를 들이는 편이 쌉니다 |

`class="..."` 문자열이 붙어 있는지는 vitest로 볼 수 있지만, 그 클래스가 실제로 어떤 크기와 색을 만드는지는 브라우저가 계산해야 압니다. 문자열 테스트로 레이아웃까지 확인하려 들면 테스트는 통과하는데 화면은 깨져 있는 상황이 생깁니다.

Playwright에서는 스크린샷 비교(`toHaveScreenshot`)를 쓰지 않고 `getComputedStyle`과 `getBoundingClientRect`로 값을 재서 단언합니다. 개발 서버 오버레이 때문에 픽셀이 흔들리고, macOS와 CI(Linux)의 글꼴 렌더링이 달라 기준 이미지를 따로 관리해야 했기 때문입니다. 그동안 Playwright로 잡은 결함을 모아 보니, 스크린샷 비교로만 잡을 수 있었던 것은 하나도 없었습니다. 폭, 간격, 겹침, 스크롤 위치처럼 모두 값으로 잴 수 있는 것이었습니다.

로그인 뒤에 원래 화면으로 돌아가지 않던 버그도 이 경계에 걸렸습니다. Next.js 클라이언트 라우터 캐시에서 생기는 문제라 node 환경 테스트로는 재현할 수 없었고, Playwright 테스트를 따로 붙여 막았습니다.

## 써 보고 느낀 장단점

좋았던 점

- 설정이 거의 없고 빠릅니다. 테스트가 수백 개여도 브라우저를 띄우지 않습니다.
- 테스트할 수 있게 만들려다 보니 데이터를 가져오는 코드와 화면을 그리는 코드가 갈라졌습니다.

불편했던 점

- 클릭이나 입력 뒤의 변화를 볼 수 없습니다. 상태를 바꾸는 로직은 순수 함수로 빼서 따로 테스트해야 합니다.
- 문자열 단언은 마크업이 조금만 바뀌어도 깨지거나, 반대로 엉뚱한 곳의 글자에 걸려 통과할 수 있습니다. 주석 문제가 그런 경우였습니다.
- `useEffect` 안의 동작은 서버 렌더링에서 실행되지 않아 볼 수 없습니다. [SSR 이미지의 onError가 하이드레이션 전에 놓치던 문제](/posts/frontend-troubleshooting/ssr-image-onerror-before-hydration)를 다룬 글에서도 같은 이유로 훅 대신 판정 함수만 따로 검증했습니다.

클릭과 입력을 많이 다루는 화면이 늘어나면 그 부분만 jsdom과 Testing Library로 옮길 생각입니다. 지금까지는 순수 로직과 렌더 분기는 node 환경에서, 레이아웃과 로그인 뒤 화면은 Playwright에서 보는 나눔으로 부족함 없이 쓰고 있습니다.
