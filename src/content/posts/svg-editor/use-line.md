---
title: "useLine 로직 통합하기"
date: "2024-12-19"
updated: "2024-12-19"
description: "두 점으로 그리는 도형 4가지의 로직을 하나의 객체로 통합합니다."
image: "/og-image.png"
tags: ["SVG", "Canvas", "Architecture", "Refactor"]
---

## 1. 문제 상황

기존에는 점(Dot), 선(Line), 사각형(Rect), 원(Circle)을 각각 별도의 Class로 만들어 관리했습니다.  
내부 동작은 `useDot.ts` 와 `useLine.ts` 로 나누어 작성했습니다.

이 방식은 동작에는 문제가 없지만, 비슷한 동작을 각기 다른 모듈에서 관리하다 보니  
문제가 발생하면 4개의 파일을 모두 수정해야 하고, 유지보수가 어려워집니다.

이에 따라 동일한 구조를 가진 도형은 하나의 Class로 통합하여 관리하기로 했습니다.

## 2. getPathAttribute 함수

`type` 값에 따라 두 점의 좌표로 SVG Path를 다르게 만들어 반환합니다.

```tsx
export const getPathAttribute = (
  type: "line" | "rect" | "circle",
  points: number[][]
): string => {
  switch (type) {
    case "line": {
      const [[x1, y1], [x2, y2]] = points;
      return `M${x1},${y1} L${x2},${y2}`;
    }
    case "rect": {
      const [[x1, y1], [x2, y2]] = points;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      return `M${minX},${minY} L${maxX},${minY} L${maxX},${maxY} L${minX},${maxY} Z`;
    }
    case "circle": {
      const [center, edge] = points;
      const [cx, cy] = center;
      const [ex, ey] = edge;
      const r = Math.hypot(ex - cx, ey - cy);
      return `M${cx - r},${cy} A${r},${r} 0 1,0 ${
        cx + r
      },${cy} A${r},${r} 0 1,0 ${cx - r},${cy}`;
    }
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};
```

> `dot` 은 `path` 로 그리면 내부가 비게 되므로, 별도로 `circle` 요소를 사용하여 처리합니다.  
> `fill` 속성을 공유하면 충돌이 생기기 때문입니다.

## 3. 로직 리팩토링 예시

### 3-1. 핸들러 위치 계산 개선

기존 코드:

```tsx
const biggerX = Math.max(x1, x2);
const smallerX = Math.min(x1, x2);
const handlerFlg = (x2 - x1 > 0 && y2 - y1 > 0) || (x2 - x1 < 0 && y2 - y1 < 0);
const targetX = handlerFlg ? biggerX - radius : smallerX + radius;
```

리팩토링 후:

```tsx
const [x1, y1] = circleCoords[0];
const [x2, y2] = circleCoords[1];
const isSameDirection = (x2 - x1) * (y2 - y1) > 0;
const targetX = isSameDirection
  ? Math.max(x1, x2) - radius
  : Math.min(x1, x2) + radius;
```

### 3-2. 범위 제한 간소화

기존:

```tsx
if (r < 0) {
  this.r = 0;
} else if (r < minLength) {
  this.r = r;
} else {
  this.r = minLength;
}
```

리팩토링:

```tsx
this.r = Math.max(0, Math.min(r, minLength));
```

## 4. 요약 정리

| 구분     | 설명                                           |
| -------- | ---------------------------------------------- |
| 관리     | 점, 선, 사각형, 원을 하나의 Class로 통합       |
| 렌더링   | `type` 에 따라 `getPathAttribute` 로 Path 반환 |
| dot 처리 | `path` 대신 `circle` 요소 사용                 |
| 개선     | 핸들러 위치, 값 범위 계산 로직 단순화          |
| 성과     | 약 1100줄 -> 600줄로 간소화         |
