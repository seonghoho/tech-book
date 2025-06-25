---
title: "useLine 로직 합치기"
date: "2024-12-19"
description: "두 점으로 그리는 도형 4가지를 하나의 객체로 통합합니다."
---

## 마주한 문제

기존에는 점, 선, 사각형, 원을 그릴 때 4개의 각각의 class 모듈을 만들고 사용했습니다.
또한 내부 로직은 `useDot.ts` 와 `useLine.ts` 에서 실행하고 있습니다.

사용성에는 문제가 발생하지 않습니다만, 비슷한 동작을 4개의 각 모듈로 제작하여 관리하니 문제가 발생하면 유지보수 차원에서 좋지 않은 코드일 수 있습니다.

하나의 요구사항 및 문제가 발생하면 네 모듈을 모두 다시 뜯어보고 수정을 해야하기 때문입니다.
이러한 문제를 미리 줄이기 위해 하나의 class로 제작하여 사용하기로 결정했습니다.

svg를 그릴 때는 입력받은 `type` 에 따라 `d 속성` 을 다르게 구성해 그리도록 합니다.

```tsx
export const getPathAttribute = (
  type: "line" | "rect" | "circle",
  points: number[][]
): string => {
  switch (type) {
    case "line": {
      const [start, end] = points;
      const [x1, y1] = start;
      const [x2, y2] = end;
      return `M${x1},${y1} L${x2},${y2}`;
    }
    case "rect": {
      const [point1, point2] = points;
      const x1 = Math.min(point1[0], point2[0]);
      const y1 = Math.min(point1[1], point2[1]);
      const x2 = Math.max(point1[0], point2[0]);
      const y2 = Math.max(point1[1], point2[1]);
      return `M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1},${y2} Z`;
    }
    case "circle": {
      const [center, edge] = points;
      const [cx, cy] = center;
      const [ex, ey] = edge;
      const radius = Math.sqrt((ex - cx) ** 2 + (ey - cy) ** 2);
      return `M${cx - radius},${cy} A${radius},${radius} 0 1,0 ${
        cx + radius
      },${cy} A${radius},${radius} 0 1,0 ${cx - radius},${cy}`;
    }
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};
```

`getPathAttribute()` 함수를 제작해 두 좌표에 따른 `path` 값을 구현했습니다.
dot은 path로 그리기 문제가 있었습니다. path로 반지름이 8인 circle을 그리면 내부가 비게 되지만, fill 속성을 사용해 채우기에는 `line` 과 `rect`, `circle` 에서 fill 속성을 사용하는 부분이 중복되어 문제가 발생합니다.
그래서 `dot` 은 `circle` 을 사용하도록 분기처리 해 진행했습니다.

- 두 크기 조절 핸들러 기준으로 기울기 조절 핸들러 위치 변경하는 로직 리팩토링
  기존 코드

  ```tsx
  const biggerX = Math.max(circleCoords[0][0], circleCoords[1][0]);
  const smallerX = Math.min(circleCoords[0][0], circleCoords[1][0]);
  const handlerFlg =
    (circleCoords[1][0] - circleCoords[0][0] > 0 &&
      circleCoords[1][1] - circleCoords[0][1] > 0) ||
    (circleCoords[1][0] - circleCoords[0][0] < 0 &&
      circleCoords[1][1] - circleCoords[0][1] < 0);
  const smallerY = Math.min(circleCoords[0][1], circleCoords[1][1]);
  radiusHandler?.setAttribute(
    "transform",
    `translate(${
      handlerFlg ? biggerX - currentElem.radius : smallerX + currentElem.radius
    }, ${smallerY})`
  );
  ```

  ### 변경된 코드

  ```tsx
  const [x1, y1] = circleCoords[0];
  const [x2, y2] = circleCoords[1];
  // 같은 방향인지 확인
  const isSameDirection = (x2 - x1) * (y2 - y1) > 0;
  const smallerY = Math.min(y1, y2);
  const targetX = isSameDirection
    ? Math.max(x1, x2) - currentElem.radius
    : Math.min(x1, x2) + currentElem.radius;

  radiusHandler?.setAttribute(
    "transform",
    `translate(${targetX}, ${smallerY})`
  );
  ```

- 0보다 작을 때, minLength와 사이일 때, minLength보다 클 때 조건 분기 리팩토링
  ```tsx
  if (r < 0) {
    this.r = 0;
  } else if (r < minLength) {
    this.r = r;
  } else {
    this.r = minLength;
  }
  ```
  ⇒ `this.r = Math.max(0, Math.min(r, minLength));`
  [pointerMove 부분 리팩토링](https://www.notion.so/pointerMove-161d6b9f5310800bb94ceea784a31a48?pvs=21)
  약 1100줄 → 약 600줄로 수정
