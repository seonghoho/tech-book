---
title: "서버 렌더링한 이미지의 onError가 불리지 않던 이유"
date: "2026-10-26"
description: "깨진 사진을 기본 그림으로 바꾸는 onError 처리가 있었는데도 서버 렌더링한 페이지에서는 깨진 이미지 아이콘이 그대로 남았습니다. 이미지의 error 이벤트가 하이드레이션보다 먼저 지나가는 순서 문제였고, React 19.2 소스에서 원인을 확인한 뒤 마운트 때 이미지 상태를 다시 읽는 훅으로 고쳤습니다."
tags: ["React", "Next.js", "SSR", "Hydration", "Image"]
---

# 서버 렌더링한 이미지의 onError가 불리지 않던 이유

## 증상

사이드 프로젝트 화면을 점검하다가 홈의 프로필 카드에 깨진 이미지 아이콘이 떠 있는 걸 봤습니다. 일정 상세의 동행 반려견 목록에서도 같은 아이콘이 보였습니다. 둘 다 사용자가 올린 반려견 사진을 보여 주는 자리였고, 개발 서버의 사진 저장소에 파일이 없어 404가 나는 경우였습니다.

사진을 불러오지 못하면 기본 그림을 보여 주는 처리는 이미 있었습니다. 아래는 단순화한 코드입니다.

```tsx
const [failed, setFailed] = useState(false)

useEffect(() => {
  setFailed(false) // URL이 바뀌면 실패 기록을 지운다
}, [url])

if (url && !failed) {
  return <img src={url} alt="" onError={() => setFailed(true)} />
}
return <DefaultPetIllustration />
```

`onError`에서 `failed`를 `true`로 바꾸면 기본 그림이 그려져야 했는데, 깨진 아이콘이 그대로 남아 있었습니다. 같은 컴포넌트에서 사진을 새로 올렸다가 실패하는 경우처럼, 클라이언트에서 이미지를 바꿀 때는 기본 그림으로 잘 바뀌었습니다. 처음 페이지를 열 때만 문제였습니다.

## 재현

처음 페이지를 열 때와 클라이언트에서 바꿀 때의 차이는 서버 렌더링 여부입니다. 서버 렌더링한 페이지에서 404 이미지만 그려 보는 임시 라우트를 만들어 확인했습니다.

페이지를 열고 하이드레이션이 끝난 뒤 그 `<img>`를 개발자 도구에서 확인하면 이랬습니다.

```js
img.complete     // true  — 로드 시도는 끝났다
img.naturalWidth // 0     — 그런데 그려진 이미지가 없다
```

이미지는 이미 실패한 상태였고, `onError`는 한 번도 불리지 않았습니다.

## 원인: error 이벤트가 하이드레이션보다 먼저 지나간다

서버 렌더링한 페이지가 열리는 순서를 따라가 보면 이유가 보입니다.

1. 브라우저가 서버에서 만든 HTML을 받습니다. 여기에는 `<img src="...">`가 이미 들어 있습니다.
2. 브라우저는 `<img>`를 보자마자 사진을 받기 시작합니다. 자바스크립트를 기다리지 않습니다.
3. 404가 오면 그 자리에서 `error` 이벤트가 발생합니다.
4. 그 뒤에 자바스크립트가 로드되고, React가 하이드레이션하면서 `onError` 리스너를 붙입니다.

리스너를 붙인 시점에는 `error` 이벤트가 이미 지나간 뒤입니다. 브라우저는 지나간 이벤트를 다시 보내 주지 않습니다.

그렇다면 클라이언트에서 새로 그린 이미지는 왜 괜찮았는지 궁금해서 React DOM 소스를 확인했습니다. 프로젝트가 쓰던 react-dom 19.2에서 DOM 요소를 마운트할 때 부르는 함수는 이렇습니다.

```js
function commitMount(domElement, type, newProps) {
  switch (type) {
    // ...
    case "img":
      newProps.src
        ? (domElement.src = newProps.src)
        : newProps.srcSet && (domElement.srcset = newProps.srcSet);
  }
}
function commitHydratedInstance() {}
```

React는 클라이언트에서 새로 만든 `<img>`에는 마운트할 때 `src`를 한 번 더 넣습니다. 리스너가 붙은 뒤에 다시 로드하게 해서, 그 사이에 놓친 `load`·`error` 이벤트를 다시 받기 위한 처리로 보입니다. 하이드레이션한 요소에 대해 부르는 `commitHydratedInstance`는 빈 함수입니다. 서버에서 온 `<img>`는 다시 로드하지 않으니, 하이드레이션 전에 지나간 이벤트는 다시 오지 않습니다.

같은 컴포넌트라도 `<img>`를 만든 곳에 따라 결과가 달랐습니다.

| `<img>`를 만든 곳 | 마운트 때 React가 하는 일 | 404일 때 onError |
|---|---|---|
| 클라이언트 | `src`를 다시 넣어 이벤트를 되살림 | 불림 |
| 서버 렌더링 후 하이드레이션 | 아무것도 하지 않음 | 하이드레이션 전에 실패하면 불리지 않음 |

사진 서버가 빨리 404를 돌려줄수록, 자바스크립트가 늦게 로드될수록 이 문제가 잘 드러납니다. 개발 서버에서는 사진 저장소가 바로 404를 돌려줘서 이 상황이 그대로 드러났습니다.

## 수정: 마운트할 때 이미지 상태를 한 번 더 읽기

놓친 이벤트를 다시 받을 수는 없지만, 실패했다는 흔적은 `<img>` 요소에 남아 있습니다. 재현할 때 본 `complete: true`, `naturalWidth: 0`입니다. 마운트할 때 이 값을 읽어서 이미 깨진 이미지면 실패로 처리했습니다.

```ts
// 로드가 끝났는데 크기가 0이면 깨진 이미지
export function isBrokenImage(
  img: Pick<HTMLImageElement, "complete" | "naturalWidth"> | null,
): boolean {
  return img !== null && img.complete && img.naturalWidth === 0
}

export function useImageFallback(url: string | null) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // 마운트할 때, 그리고 URL이 바뀔 때 다시 판정한다
  useEffect(() => {
    setFailed(isBrokenImage(imgRef.current))
  }, [url])

  return { failed, imgRef, onError: () => setFailed(true) }
}
```

컴포넌트는 이 훅만 쓰면 됩니다.

```tsx
const { failed, imgRef, onError } = useImageFallback(url)

if (url && !failed) {
  return <img src={url} alt="" ref={imgRef} onError={onError} />
}
return <DefaultPetIllustration />
```

판정에서 신경 쓴 경우는 세 가지입니다.

- **아직 받는 중일 때** (`complete === false`): 실패라고 단정하지 않습니다. 이 경우는 리스너가 이미 붙어 있으니, 나중에 실패하면 `onError`가 알려 줍니다.
- **이미 기본 그림을 그리는 중일 때**: `<img>`가 없어 `ref`가 비어 있으니 `false`가 됩니다. 이 상태에서 URL이 바뀌면 새 사진을 다시 시도하고, 그 `<img>`는 클라이언트에서 만든 것이라 `onError`가 제대로 불립니다.
- **URL이 바뀔 때**: 실패 기록을 그대로 두면 한 번 깨진 뒤 새 사진을 올려도 계속 기본 그림만 보입니다. 원래 코드가 URL이 바뀔 때 `failed`를 `false`로 되돌리던 이유이고, 훅에서는 이 자리에서 이미지 상태를 다시 판정합니다.

반려견 아바타, 반려견 사진, 프로필 아바타 세 컴포넌트가 실패 상태와 URL 초기화 코드를 각자 복사해 쓰고 있었는데, 이 훅 하나로 모았습니다.

## 테스트와 확인

이 프로젝트의 테스트는 jsdom 없이 node 환경에서 돌아서 훅을 직접 렌더링할 수 없었습니다. 그래서 판정 함수만 따로 검증했습니다.

```ts
describe("isBrokenImage", () => {
  it("로드가 끝났는데 크기가 0이면 깨진 이미지다", () => {
    expect(isBrokenImage({ complete: true, naturalWidth: 0 })).toBe(true)
  })
  it("로드가 끝나고 크기가 있으면 정상이다", () => {
    expect(isBrokenImage({ complete: true, naturalWidth: 640 })).toBe(false)
  })
  it("아직 받는 중이면 단정하지 않는다", () => {
    expect(isBrokenImage({ complete: false, naturalWidth: 0 })).toBe(false)
  })
  it("img가 없으면 실패가 아니다", () => {
    expect(isBrokenImage(null)).toBe(false)
  })
})
```

훅이 실제로 동작하는지는 재현에 썼던 임시 라우트에서 확인했습니다. 세 컴포넌트 모두 404 사진은 기본 그림이나 사람 아이콘으로 바뀌었고, 정상 사진은 그대로 사진으로 남았습니다.

## 다른 방법과 비교

같은 문제를 다르게 피하는 방법도 있습니다.

| 방법 | 장점 | 단점 |
|---|---|---|
| 마운트 때 상태 다시 읽기 (이번 방법) | 서버 렌더링을 그대로 유지. 코드가 작음 | 하이드레이션 전까지는 깨진 아이콘이 잠깐 보일 수 있음 |
| 이미지 부분만 클라이언트에서 렌더링 | `onError`가 항상 불림 | 첫 화면 HTML에 이미지가 없어 사진이 늦게 뜸 |
| HTML 속성 `onerror`를 인라인 스크립트로 넣기 | 하이드레이션 전에도 처리됨 | React 상태와 따로 놀고, 인라인 스크립트를 허용해야 함 |
| 서버에서 사진이 있는지 미리 확인 | 깨진 이미지가 아예 내려가지 않음 | 요청마다 사진 서버를 한 번 더 불러야 함 |

사진은 서버 렌더링으로 빨리 보여 주고 싶었고, 깨지는 경우는 드물다고 봐서 첫 번째 방법을 골랐습니다.

`onError`를 써 둔 이미지 컴포넌트가 서버 렌더링되는 페이지에 있다면, 404 이미지를 서버 렌더링해서 `complete`와 `naturalWidth`를 한 번 확인해 볼 만합니다.
