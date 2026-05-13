---
title: "SVG 좌표 변환에서 포인터 위치가 어긋나는 문제"
date: "2024-11-07"
updated: "2024-11-07"
description: "브라우저 좌표와 SVG 내부 좌표가 달라 드래그 위치가 어긋나는 문제를 getScreenCTM 기반으로 해결합니다."
image: "/images/posts/svg-editor/svg-pointer-coordinate-transform/cover-og.png"
tags: ["SVG", "PointerEvent", "Coordinate", "Troubleshooting"]
featured: true
---

# SVG 좌표 변환에서 포인터 위치가 어긋나는 문제

## 문제 상황

SVG 에디터에서 도형을 드래그하거나 핸들을 움직일 때 가장 먼저 마주치는 문제는 좌표계 차이입니다.
마우스 이벤트에서 얻는 `clientX`, `clientY`는 브라우저 viewport 기준 좌표입니다.
하지만 SVG 내부의 도형은 `viewBox` 기준 좌표로 배치됩니다.

처음에는 이벤트 좌표를 그대로 사용했습니다.

```ts
function handlePointerMove(event: PointerEvent) {
  selectedShape.x = event.clientX;
  selectedShape.y = event.clientY;
}
```

화면 배율이 100%이고 SVG가 원점에 붙어 있을 때는 얼핏 맞아 보입니다.
하지만 실제 에디터에서는 아래 조건이 붙습니다.

- SVG가 페이지 가운데에 배치됨
- `viewBox`와 실제 렌더링 크기가 다름
- 브라우저 확대/축소가 가능함
- 캔버스 영역에 padding 또는 transform이 적용될 수 있음

이 상태에서 `clientX`, `clientY`를 그대로 저장하면 포인터와 도형 사이에 일정한 오차가 생깁니다.
특히 드래그를 시작하는 순간 도형이 튀거나, 확대된 화면에서 움직임이 과하게 반응하는 문제가 발생합니다.

## 원인

핵심 원인은 좌표계가 두 개라는 점입니다.

| 구분 | 기준 |
| --- | --- |
| `clientX`, `clientY` | 브라우저 viewport |
| SVG 도형 좌표 | SVG user coordinate |

SVG는 화면에 렌더링될 때 내부 좌표를 브라우저 화면 좌표로 변환합니다.
`viewBox="0 0 1000 600"`인 SVG가 실제 화면에서 `500px x 300px`으로 보이면 내부 좌표 1은 화면 픽셀 0.5에 해당합니다.
반대로 화면 픽셀을 SVG 내부 좌표로 되돌리려면 변환 행렬을 역으로 적용해야 합니다.

이 변환을 직접 계산할 수도 있지만, 스크롤, CSS transform, viewBox 비율까지 고려하면 실수할 가능성이 큽니다.
SVG DOM은 이미 이 계산을 위한 API를 제공합니다.

## 해결 방향

`SVGSVGElement.createSVGPoint()`와 `getScreenCTM().inverse()`를 사용해 viewport 좌표를 SVG 내부 좌표로 변환했습니다.

```ts
function getSvgPoint(svg: SVGSVGElement, event: PointerEvent) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return null;
  }

  return point.matrixTransform(ctm.inverse());
}
```

사용하는 쪽에서는 null 케이스를 명시적으로 처리합니다.

```ts
function handlePointerMove(event: PointerEvent) {
  const svgPoint = getSvgPoint(svgElement, event);
  if (!svgPoint) return;

  selectedShape.x = svgPoint.x;
  selectedShape.y = svgPoint.y;
}
```

이렇게 바꾸면 브라우저 좌표를 직접 저장하지 않고, SVG 내부 모델이 기대하는 좌표만 저장하게 됩니다.
도형 데이터와 렌더링 좌표가 같은 단위를 쓰게 되므로 이후 계산도 단순해집니다.

## 드래그 시작점 보정

좌표 변환만으로 끝나지 않는 경우도 있습니다.
도형의 좌상단을 포인터 위치에 바로 맞추면, 사용자가 도형 가운데를 잡았을 때 도형이 순간적으로 튀어 보입니다.
그래서 드래그 시작 시점의 offset을 별도로 저장했습니다.

```ts
type DragState = {
  shapeId: string;
  offsetX: number;
  offsetY: number;
};

function startDrag(event: PointerEvent, shape: Shape) {
  const point = getSvgPoint(svgElement, event);
  if (!point) return;

  dragState = {
    shapeId: shape.id,
    offsetX: point.x - shape.x,
    offsetY: point.y - shape.y,
  };
}

function moveDrag(event: PointerEvent) {
  if (!dragState) return;

  const point = getSvgPoint(svgElement, event);
  if (!point) return;

  const shape = findShape(dragState.shapeId);
  if (!shape) return;

  shape.x = point.x - dragState.offsetX;
  shape.y = point.y - dragState.offsetY;
}
```

이 방식의 장점은 도형의 기준점이 무엇인지와 상관없이 사용자가 잡은 위치를 유지할 수 있다는 점입니다.
사각형은 좌상단, 원은 중심, 선은 시작점처럼 도형마다 기준점이 달라도 드래그 UX는 일관되게 만들 수 있습니다.

## Pointer Capture 적용

드래그 중 포인터가 SVG 밖으로 나가면 `pointermove` 이벤트가 끊길 수 있습니다.
이 경우 도형이 중간에 멈추거나, `pointerup`을 받지 못해 선택 상태가 남는 문제가 생깁니다.

그래서 드래그 시작 시점에 `setPointerCapture`를 적용했습니다.

```ts
function handlePointerDown(event: PointerEvent) {
  const target = event.currentTarget as SVGElement;
  target.setPointerCapture(event.pointerId);
}

function handlePointerUp(event: PointerEvent) {
  const target = event.currentTarget as SVGElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
}
```

좌표 변환과 pointer capture를 함께 사용하면 드래그 상태가 훨씬 안정적입니다.
특히 빠르게 마우스를 움직이거나 캔버스 경계를 넘어가는 상황에서 차이가 큽니다.

## 정리

SVG 에디터에서 포인터 좌표를 다룰 때는 이벤트 좌표를 그대로 사용하지 않는 편이 안전합니다.
`clientX`, `clientY`는 화면 좌표이고, 도형 데이터는 SVG 내부 좌표입니다.
둘 사이의 변환을 명확히 분리해야 확대, 스크롤, 반응형 레이아웃에서도 예측 가능한 동작을 만들 수 있습니다.

이번 문제를 해결하면서 정리한 기준은 다음과 같습니다.

- 이벤트 좌표는 바로 모델에 저장하지 않는다.
- `getScreenCTM().inverse()`로 SVG 내부 좌표로 변환한다.
- 드래그 시작 시점의 offset을 저장해 도형 튐을 막는다.
- 드래그 중에는 pointer capture로 이벤트 흐름을 유지한다.

이 구조는 이후 [useLine 로직 통합하기](/posts/svg-editor/use-line)에서처럼 선, 사각형, 원의 생성 로직을 하나로 묶을 때도 기반이 됩니다.
도형별 구현보다 먼저 좌표 변환 규칙을 안정화해야 나머지 인터랙션이 흔들리지 않습니다.
