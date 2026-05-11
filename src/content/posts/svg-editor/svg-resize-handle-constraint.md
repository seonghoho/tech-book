---
title: "SVG 도형 리사이즈 핸들 제약 조건 정리"
date: "2026-05-09"
updated: "2026-05-09"
description: "SVG 도형 리사이즈 중 음수 크기, 중심점 이동, 최소 크기 제한을 일관된 계산 규칙으로 정리합니다."
tags: ["SVG", "PointerEvent", "Resize", "UX"]
---

# SVG 도형 리사이즈 핸들 제약 조건 정리

## 문제 상황

SVG 에디터에서 도형을 선택하면 모서리에 리사이즈 핸들이 나타납니다.
사용자는 핸들을 드래그해서 사각형, 원, 선 같은 도형의 크기를 조절할 수 있어야 합니다.

겉보기에는 단순한 기능이지만 실제 구현에서는 여러 예외가 생깁니다.

- 왼쪽 핸들을 오른쪽으로 넘기면 width가 음수가 됨
- 위쪽 핸들을 아래쪽으로 넘기면 height가 음수가 됨
- 너무 작게 줄이면 핸들이 서로 겹침
- 원은 중심과 반지름 기준이라 사각형과 계산 방식이 다름
- shift 키를 누른 비율 고정 리사이즈가 필요할 수 있음

처음에는 각 핸들마다 조건문을 따로 작성했습니다.

```ts
if (handle === "right-bottom") {
  rect.width = pointer.x - rect.x;
  rect.height = pointer.y - rect.y;
}

if (handle === "left-top") {
  rect.width = rect.x + rect.width - pointer.x;
  rect.height = rect.y + rect.height - pointer.y;
  rect.x = pointer.x;
  rect.y = pointer.y;
}
```

핸들이 8개로 늘어나자 조건문도 같이 늘어났습니다.
작동은 하지만 수정 비용이 너무 컸고, 특정 방향에서만 최소 크기 제한이 깨지는 문제가 생겼습니다.

## 기준을 box로 통일하기

해결을 위해 모든 도형의 리사이즈 계산을 먼저 `box` 기준으로 통일했습니다.

```ts
type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};
```

사각형은 그대로 box가 됩니다.
원은 중심과 반지름을 box로 변환하고, 계산이 끝난 뒤 다시 원 데이터로 되돌립니다.
선은 두 점을 감싸는 box를 만들고, 필요할 때 점 좌표를 다시 계산합니다.

이렇게 하면 리사이즈 제약 조건을 도형마다 중복해서 구현하지 않아도 됩니다.

## anchor와 moving point 분리

리사이즈에서 가장 중요한 개념은 고정점(anchor)과 이동점(moving point)입니다.
오른쪽 아래 핸들을 잡으면 왼쪽 위가 고정점이고, 오른쪽 아래가 이동점입니다.

```ts
type ResizeHandle = "left-top" | "right-top" | "right-bottom" | "left-bottom";

function getAnchor(box: Box, handle: ResizeHandle) {
  switch (handle) {
    case "left-top":
      return { x: box.x + box.width, y: box.y + box.height };
    case "right-top":
      return { x: box.x, y: box.y + box.height };
    case "right-bottom":
      return { x: box.x, y: box.y };
    case "left-bottom":
      return { x: box.x + box.width, y: box.y };
  }
}
```

이제 포인터 위치와 anchor만 있으면 새 box를 만들 수 있습니다.

```ts
function createBoxFromPoints(anchor: Point, moving: Point): Box {
  const x = Math.min(anchor.x, moving.x);
  const y = Math.min(anchor.y, moving.y);
  const width = Math.abs(moving.x - anchor.x);
  const height = Math.abs(moving.y - anchor.y);

  return { x, y, width, height };
}
```

이 방식은 핸들이 반대편을 넘어가도 width와 height가 음수가 되지 않습니다.
도형이 뒤집히는 상황도 box 계산에서는 자연스럽게 처리됩니다.

## 최소 크기 제한

너무 작은 도형은 조작하기 어렵습니다.
그래서 최소 크기를 적용했습니다.

```ts
const MIN_SIZE = 8;

function applyMinSize(box: Box, anchor: Point, moving: Point): Box {
  const directionX = moving.x >= anchor.x ? 1 : -1;
  const directionY = moving.y >= anchor.y ? 1 : -1;

  const width = Math.max(box.width, MIN_SIZE);
  const height = Math.max(box.height, MIN_SIZE);

  const nextMoving = {
    x: anchor.x + width * directionX,
    y: anchor.y + height * directionY,
  };

  return createBoxFromPoints(anchor, nextMoving);
}
```

단순히 `Math.max(width, MIN_SIZE)`만 적용하면 x, y가 맞지 않는 경우가 있습니다.
특히 왼쪽이나 위쪽 핸들을 움직일 때는 고정점 기준으로 다시 moving point를 계산해야 합니다.

## 비율 고정 리사이즈

shift 키를 누른 상태에서는 원래 비율을 유지하도록 처리했습니다.
이때도 anchor 기준으로 계산하는 편이 단순합니다.

```ts
function applyAspectRatio(box: Box, anchor: Point, moving: Point, ratio: number): Box {
  const width = box.width;
  const height = box.height;

  let nextWidth = width;
  let nextHeight = height;

  if (width / height > ratio) {
    nextHeight = width / ratio;
  } else {
    nextWidth = height * ratio;
  }

  const directionX = moving.x >= anchor.x ? 1 : -1;
  const directionY = moving.y >= anchor.y ? 1 : -1;

  return createBoxFromPoints(anchor, {
    x: anchor.x + nextWidth * directionX,
    y: anchor.y + nextHeight * directionY,
  });
}
```

비율 고정과 최소 크기 제한은 적용 순서도 중요합니다.
일반적으로는 포인터 위치로 box를 만들고, 비율을 맞춘 뒤, 마지막에 최소 크기 제한을 적용했습니다.

## 도형별 반영

계산 결과는 다시 각 도형의 데이터 구조로 반영합니다.

```ts
function applyBoxToRect(rect: RectShape, box: Box) {
  rect.x = box.x;
  rect.y = box.y;
  rect.width = box.width;
  rect.height = box.height;
}

function applyBoxToCircle(circle: CircleShape, box: Box) {
  const size = Math.min(box.width, box.height);

  circle.cx = box.x + size / 2;
  circle.cy = box.y + size / 2;
  circle.r = size / 2;
}
```

원은 정사각형 box를 기준으로 처리했습니다.
타원까지 지원한다면 `rx`, `ry`를 분리하면 되지만, 원 도구에서는 하나의 반지름만 유지하는 편이 사용자 기대와 맞았습니다.

## 정리

리사이즈 기능은 핸들별 조건문으로 밀어붙이면 금방 복잡해집니다.
도형마다 다른 계산을 하기 전에 공통 box 모델을 먼저 만들면 제약 조건을 훨씬 단순하게 다룰 수 있습니다.

이번 구현 기준은 다음과 같습니다.

- 모든 도형의 리사이즈 계산을 box 기준으로 통일한다.
- 핸들별로 고정점(anchor)을 구하고 포인터를 moving point로 사용한다.
- box는 `Math.min`, `Math.abs`로 만들어 음수 크기를 막는다.
- 최소 크기는 anchor 기준으로 다시 계산한다.
- 비율 고정은 box 단계에서 처리하고, 도형별 데이터는 마지막에 반영한다.

이 구조를 적용하면 리사이즈 핸들이 늘어나도 핵심 계산은 크게 변하지 않습니다.
도형별 차이는 “box를 어떻게 만들고 다시 어떻게 반영할 것인가”로 좁혀집니다.
