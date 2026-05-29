---
title: "SVG 좌표 변환에서 포인터 위치가 어긋나는 문제"
date: "2024-11-07"
updated: "2026-05-27"
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
이 문제는 SVG 에디터의 거의 모든 상호작용에 영향을 줍니다.
도형 이동, 선 생성, 리사이즈 핸들, 회전 핸들, 선택 박스가 모두 포인터 좌표를 기준으로 동작하기 때문입니다.
좌표 변환이 흔들리면 각 기능을 따로 고쳐도 같은 종류의 버그가 계속 반복됩니다.

그래서 이 문제는 특정 도형의 버그가 아니라 캔버스 입력 계층의 문제로 봐야 했습니다.
[MathCanvas 프로젝트](/projects/mathcanvas)처럼 여러 수학교구가 같은 SVG 캔버스 위에서 동작하는 구조에서는, 교구별 로직보다 먼저 공통 좌표 변환 규칙을 안정화하는 것이 중요했습니다.

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

![브라우저 viewport 좌표를 SVG 내부 좌표로 변환해 포인터 드래그 오차를 제거하는 흐름](/images/posts/svg-editor/svg-pointer-coordinate-transform/body-01.png)

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

이 변환 함수는 이벤트 핸들러 안에 직접 흩뿌리지 않고, 공통 유틸리티처럼 다루는 편이 좋습니다.
포인터 입력을 받는 모든 기능이 같은 좌표계를 사용해야 하기 때문입니다.
예를 들어 선을 생성하는 로직과 사각형을 리사이즈하는 로직이 서로 다른 방식으로 좌표를 변환하면, 같은 포인터 위치에서도 결과가 조금씩 달라질 수 있습니다.
이 차이는 처음에는 눈에 잘 띄지 않지만, 저장/복원이나 undo/redo를 붙이면 더 큰 문제로 드러납니다.

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

## 실패했던 접근

처음에는 `getBoundingClientRect()`로 SVG의 화면 위치를 구하고, `clientX - rect.left`, `clientY - rect.top`을 계산하는 방식도 생각했습니다.
이 방식은 SVG가 화면 크기와 같은 좌표계를 쓸 때는 간단하게 동작합니다.
하지만 `viewBox`가 적용되면 화면 픽셀과 SVG 내부 좌표의 비율이 달라집니다.
여기에 반응형 레이아웃이나 CSS transform까지 들어가면 별도의 scale 계산이 계속 늘어납니다.

두 번째 접근은 viewBox 비율을 직접 계산하는 방식이었습니다.
`viewBox.width / rect.width`, `viewBox.height / rect.height`를 이용하면 기본적인 변환은 가능합니다.
하지만 SVG가 preserveAspectRatio로 중앙 정렬되거나 여백이 생기면 오차가 발생합니다.
이 여백까지 직접 계산하기 시작하면 브라우저가 이미 제공하는 변환 행렬을 다시 구현하는 셈이 됩니다.

세 번째로는 도형별로 보정값을 따로 두는 방법도 있었습니다.
예를 들어 특정 도형이 드래그할 때만 x축 오차가 있으니 offset을 더하는 식입니다.
이 방식은 당장의 증상은 줄일 수 있지만, 근본적으로 좌표계가 섞인 상태를 숨기는 것에 가깝습니다.
결국 다른 도형이나 다른 화면 배율에서 같은 문제가 반복됩니다.
그래서 입력 좌표는 반드시 한 지점에서 SVG 내부 좌표로 변환하고, 이후 로직은 모두 변환된 좌표만 사용하도록 정리했습니다.

## 검증 기준

수정 후에는 아래 상황을 기준으로 확인했습니다.

- SVG가 페이지 중앙에 있어도 포인터와 도형 위치가 어긋나지 않는가
- 브라우저 확대/축소 또는 반응형 크기 변경 후에도 드래그 거리가 과하게 커지거나 작아지지 않는가
- 도형의 중앙을 잡고 이동할 때 시작 순간에 도형이 튀지 않는가
- SVG 밖으로 빠르게 드래그했다가 다시 들어와도 pointerup이 정상 처리되는가
- 선, 사각형, 원처럼 기준점이 다른 도형에서도 같은 변환 함수를 사용할 수 있는가

특히 마지막 기준이 중요했습니다.
좌표 변환 함수는 특정 도형을 위한 코드가 아니라 캔버스 입력의 기반이어야 합니다.
이 기반이 안정되어야 [SVG 도형 리사이즈 핸들 제약 조건 정리](/posts/svg-editor/svg-resize-handle-constraint)처럼 핸들 기반 계산도 예측 가능해집니다.

## 다른 기능과의 연결

좌표 변환은 화면에서 끝나는 문제가 아닙니다.
변환된 좌표가 그대로 도형 데이터에 저장되고, 이 데이터가 히스토리와 저장 포맷의 기준이 됩니다.
만약 드래그 중에는 화면 좌표를 쓰고 저장 시점에는 SVG 좌표로 바꾸는 식으로 섞으면, undo/redo나 복원 시점에 미세한 차이가 생깁니다.
그래서 저는 입력 단계에서 바로 SVG 좌표로 변환하고, 이후 상태 관리에서는 SVG 좌표만 다루는 흐름을 선호합니다.

이 기준은 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)와도 연결됩니다.
히스토리에 저장할 데이터가 안정적이려면, 그 데이터가 만들어지는 입력 좌표부터 일관되어야 합니다.

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
