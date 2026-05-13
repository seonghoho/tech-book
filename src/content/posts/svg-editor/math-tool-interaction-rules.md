---
title: "교구마다 다른 drag·rotate·place 규칙을 안정적으로 분기한 방법"
date: "2024-09-19"
updated: "2024-09-19"
description: "수학교구 캔버스에서 교구별 조작 규칙을 하나의 이벤트 흐름 안에서 안정적으로 분기한 기준을 정리합니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "Interaction", "PointerEvent", "Architecture"]
---

# 교구마다 다른 drag·rotate·place 규칙을 안정적으로 분기한 방법

## 문제 상황

수학교구 캔버스의 조작은 겉으로 보면 대부분 드래그입니다.
하지만 실제 구현에서는 같은 드래그라도 의미가 달랐습니다.

- 교구 전체를 이동하는 드래그
- 꼭짓점이나 핸들을 움직이는 드래그
- 회전 중심을 기준으로 각도를 바꾸는 드래그
- 새 점이나 선을 배치하는 드래그
- 이미 배치된 교구를 선택만 하는 클릭

처음에는 이벤트 핸들러 안에서 교구 타입을 확인하고 분기했습니다.
작은 규모에서는 괜찮았지만 교구가 늘어나면서 `if`와 `switch`가 계속 길어졌습니다.
특정 교구의 예외를 넣으면 다른 교구의 조작 흐름이 같이 영향을 받는 문제가 생겼습니다.

## 조작 모드를 먼저 나누기

해결의 시작은 “어떤 교구인가”보다 “지금 어떤 조작 중인가”를 먼저 구분하는 것이었습니다.
교구 타입은 다르더라도 사용자의 입력 상태는 비교적 명확하게 나눌 수 있습니다.

```ts
type InteractionMode =
  | "idle"
  | "selecting"
  | "dragging"
  | "rotating"
  | "placing"
  | "resizing";
```

이렇게 모드를 나누면 이벤트 핸들러는 현재 상태를 보고 다음 동작만 결정하면 됩니다.
교구별 세부 계산은 각 교구 객체가 처리하도록 넘겼습니다.

```ts
function handlePointerMove(event: PointerEvent) {
  if (!activeElement || mode === "idle") return;

  const point = getSvgPoint(event);
  if (!point) return;

  activeElement.handleMove({
    mode,
    point,
    keyboard,
  });
}
```

캔버스는 이벤트를 받고, 좌표를 변환하고, 현재 모드를 전달합니다.
교구는 전달받은 모드에 맞춰 자기 규칙을 실행합니다.

## 교구별 규칙은 객체 안으로 이동

예를 들어 회전 가능한 교구는 `rotating` 상태를 처리할 수 있지만, 회전이 없는 교구는 해당 모드를 무시하거나 지원하지 않는 동작으로 처리할 수 있습니다.

```ts
class RotatableTool extends DigitalMathElement {
  handleMove(context: MoveContext) {
    if (context.mode === "dragging") {
      this.moveTo(context.point);
      return;
    }

    if (context.mode === "rotating") {
      this.rotateByPointer(context.point);
      return;
    }
  }
}
```

이 방식의 장점은 분기가 사라지는 것이 아니라, 분기가 있어야 할 위치로 이동한다는 점입니다.
모든 교구의 예외를 캔버스가 아는 구조보다, 각 교구가 자기 조작 규칙을 갖는 구조가 유지보수하기 쉬웠습니다.

## pointerdown에서 의도를 확정하기

또 하나 중요했던 기준은 `pointermove`에서 조작 의도를 계속 판단하지 않는 것이었습니다.
사용자가 어떤 핸들을 눌렀는지, 어떤 교구를 선택했는지, 새 교구를 배치하는 중인지는 대부분 `pointerdown` 시점에 결정됩니다.

그래서 시작 시점에 다음 값을 저장했습니다.

- active element id
- interaction mode
- 시작 좌표
- 잡은 핸들 종류
- keyboard modifier 상태

이렇게 하면 `pointermove`는 매번 복잡한 hit test를 다시 하지 않아도 됩니다.
이미 확정된 조작 상태를 기준으로 좌표만 갱신하면 됩니다.

## 정리

교구별 조작 규칙이 많아질수록 이벤트 핸들러를 크게 만드는 방식은 오래 버티기 어렵습니다.
제가 정리한 기준은 다음과 같습니다.

- 이벤트 핸들러는 입력 흐름만 관리한다.
- 현재 조작 모드는 `pointerdown` 시점에 확정한다.
- 좌표 변환은 캔버스 계층에서 한 번만 처리한다.
- 교구별 계산 규칙은 교구 객체 안에 둔다.
- 지원하지 않는 모드는 명시적으로 무시한다.

이 구조는 새 교구를 추가할 때 특히 효과가 있었습니다.
캔버스의 이벤트 흐름은 그대로 두고, 새 교구가 자기 `handleMove` 규칙만 정의하면 되었기 때문입니다.

관련해서 좌표 변환 자체는 [SVG 좌표 변환에서 포인터 위치가 어긋나는 문제](/posts/svg-editor/svg-pointer-coordinate-transform)에 따로 정리해두었습니다.
