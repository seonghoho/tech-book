---
title: "2D SVG 교구와 3D Three.js 교구를 하나의 캔버스 경험으로 묶기"
date: "2025-09-04"
updated: "2025-09-04"
description: "SVG 기반 2D 교구와 Three.js 기반 3D 교구를 같은 서비스 흐름 안에서 다루기 위해 상태와 UI 경계를 맞춘 과정을 정리합니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "Three.js", "Vue", "Architecture"]
---

# 2D SVG 교구와 3D Three.js 교구를 하나의 캔버스 경험으로 묶기

## 문제 상황

수학교구 캔버스에서는 2D 교구와 3D 교구가 함께 필요했습니다.
평면도형이나 자, 각도기처럼 SVG가 적합한 교구도 있고, 쌓기나무나 공간좌표처럼 Three.js가 자연스러운 교구도 있었습니다.

기술적으로는 완전히 다른 렌더링 환경입니다.
SVG는 DOM 기반이고, 각 요소를 직접 선택하거나 속성을 바꾸기 쉽습니다.
Three.js는 WebGL scene, camera, renderer, controls를 중심으로 동작합니다.

문제는 사용자 입장에서는 둘이 다른 기술로 만들어졌다는 사실이 중요하지 않다는 점입니다.
도구를 선택하고, 배치하고, 움직이고, 삭제하는 경험은 비슷해야 했습니다.

## 공통 경험과 내부 구현 분리

먼저 공통으로 맞춰야 하는 사용자 경험을 정리했습니다.

- 도구 목록에서 교구를 선택한다.
- 캔버스에 배치한다.
- 선택 상태를 확인한다.
- 속성이나 보기 옵션을 조정한다.
- 삭제, 초기화, 공유 흐름에 연결된다.

반대로 내부 구현은 억지로 하나로 합치지 않았습니다.
SVG 교구와 Three.js 교구는 렌더링 방식이 너무 다르기 때문에, 같은 추상화로 모든 것을 처리하려고 하면 오히려 복잡해집니다.

그래서 바깥쪽 서비스 흐름만 공통화하고, 렌더링 계층은 분리했습니다.

```ts
type CanvasItem =
  | { kind: "svg"; id: string; toolType: SvgToolType }
  | { kind: "three"; id: string; toolType: ThreeToolType };
```

상위 UI는 `kind`와 `id`를 기준으로 현재 선택 상태를 다루고, 실제 렌더링과 조작은 각 캔버스 계층이 맡는 구조입니다.

## 상태 경계 맞추기

가장 중요했던 부분은 선택 상태였습니다.
SVG 교구는 DOM element에 선택 표시를 붙일 수 있고, Three.js 교구는 scene object나 helper mesh를 통해 선택을 표현합니다.
표현 방식은 다르지만 서비스 UI는 “현재 선택된 교구가 무엇인가”만 알면 됩니다.

그래서 선택 상태는 공통 store에서 관리하고, 각 렌더러가 그 상태를 받아 자기 방식으로 반영했습니다.

```ts
function selectCanvasItem(item: CanvasItem | null) {
  canvasStore.selectedItem = item;
  svgLayer.syncSelection(item);
  threeLayer.syncSelection(item);
}
```

이 구조에서는 SVG와 Three.js가 서로의 내부 구현을 몰라도 됩니다.
공통 store의 선택 상태만 기준으로 각자 화면을 갱신합니다.

## UI는 기술이 아니라 작업 기준으로 나누기

도구 패널도 “SVG 도구”, “Three.js 도구”처럼 기술 기준으로만 나누면 사용자에게 어색합니다.
사용자는 기술을 선택하는 것이 아니라 교구를 선택합니다.

그래서 UI에서는 교구 목적을 기준으로 묶고, 내부에서 필요한 렌더러를 선택하는 방향이 더 자연스러웠습니다.

```ts
const tool = {
  label: "쌓기나무",
  renderer: "three",
  defaultMode: "placing",
};
```

이렇게 하면 UI 문구와 사용 흐름은 교구 중심으로 유지하면서, 구현에서는 어떤 렌더링 계층을 사용할지 명확히 정할 수 있습니다.

## 정리

SVG와 Three.js를 하나의 구조로 완전히 합치는 것은 좋은 목표가 아니었습니다.
중요한 것은 사용자가 느끼는 작업 흐름을 같게 만들고, 내부 구현은 각 기술의 장점을 살리는 것이었습니다.

정리한 기준은 다음과 같습니다.

- 사용자 경험은 교구 작업 흐름 기준으로 통일한다.
- 렌더링 계층은 SVG와 Three.js로 분리한다.
- 선택 상태, active tool, 편집 모드는 공통 store에서 관리한다.
- 각 렌더러는 공통 상태를 자기 방식으로 화면에 반영한다.
- UI는 기술 이름보다 교구 목적을 기준으로 구성한다.

이 기준을 잡고 나니 2D 교구와 3D 교구를 같은 서비스 안에서 다루기가 훨씬 수월해졌습니다.
기술 계층은 다르지만 사용자에게는 하나의 캔버스처럼 보이는 것이 목표였습니다.
