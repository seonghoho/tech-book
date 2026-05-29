---
title: "SVG 캔버스에서 PointerEvent와 KeyboardEvent를 함께 제어한 이유"
date: "2024-10-08"
updated: "2026-05-29"
description: "포인터 입력과 키보드 보조 입력을 분리하지 않고 하나의 인터랙션 상태로 묶어 처리한 이유와 구현 기준을 정리합니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "PointerEvent", "KeyboardEvent", "Interaction"]
---

# SVG 캔버스에서 PointerEvent와 KeyboardEvent를 함께 제어한 이유

## 문제 상황

SVG 캔버스에서 교구를 조작할 때 입력은 마우스나 터치만으로 끝나지 않았습니다.
사용자는 도형을 드래그하면서 `Shift`로 비율을 고정하거나, `Delete`로 선택된 교구를 지우고, 방향키로 위치를 미세하게 조정할 수 있어야 했습니다.

처음에는 포인터 이벤트와 키보드 이벤트를 별도로 처리했습니다.
포인터는 SVG 요소에서 받고, 키보드는 window에서 받는 방식이었습니다.
하지만 두 입력이 같은 조작을 바꾸기 시작하면서 문제가 생겼습니다.

예를 들어 리사이즈 중 `Shift`를 누르면 비율 고정이 적용되어야 합니다.
이때 포인터 이벤트 핸들러가 현재 키보드 상태를 모르면, 드래그 중간에 규칙을 바꾸기 어렵습니다.
반대로 키보드 핸들러가 현재 선택된 교구와 조작 모드를 모르면, 삭제나 미세 이동이 엉뚱한 상태에서 실행될 수 있습니다.

## 입력 상태를 하나로 모으기

해결 방향은 키보드 입력을 독립된 명령으로만 보지 않는 것이었습니다.
키보드는 포인터 조작의 modifier가 되기도 하고, 단독 명령이 되기도 합니다.

![SVG 캔버스에서 PointerEvent와 KeyboardEvent를 같은 InteractionState로 모아 modifier와 명령을 분기하는 흐름](/images/posts/svg-editor/pointer-keyboard-event-flow/body-01.png)

그래서 현재 입력 상태를 별도로 관리했습니다.

```ts
type KeyboardState = {
  shift: boolean;
  alt: boolean;
  meta: boolean;
  space: boolean;
};

type InteractionState = {
  mode: "idle" | "dragging" | "rotating" | "resizing";
  activeElementId: string | null;
  keyboard: KeyboardState;
};
```

포인터 이벤트는 좌표와 함께 현재 키보드 상태를 참조합니다.
키보드 이벤트는 현재 조작 모드와 선택 상태를 확인한 뒤 실행 가능한 명령만 처리합니다.

## 전역 이벤트의 범위 정리

키보드 이벤트를 window에 바로 붙이면 편하긴 합니다.
하지만 입력창에 포커스가 있을 때도 삭제나 단축키가 실행되는 문제가 생길 수 있습니다.

그래서 아래 기준을 두었습니다.

- 캔버스가 활성화된 상태에서만 키보드 명령을 처리한다.
- input, textarea, contenteditable 안에서는 캔버스 단축키를 무시한다.
- 조작 중에는 필요한 modifier만 상태로 저장한다.
- 삭제, 복제, 미세 이동 같은 명령은 선택 상태가 있을 때만 실행한다.

```ts
function shouldIgnoreKeyboardEvent(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}
```

이 작은 방어 로직이 없으면 서비스 UI와 캔버스 UI가 같은 페이지에 있을 때 충돌이 자주 생깁니다.

## 포인터 흐름에 keyboard state 전달

드래그나 리사이즈 중에는 매번 keyboard state를 함께 전달했습니다.

```ts
function handlePointerMove(event: PointerEvent) {
  const point = getSvgPoint(event);
  if (!point || !activeElement) return;

  activeElement.handleMove({
    point,
    mode: interaction.mode,
    keyboard: interaction.keyboard,
  });
}
```

이렇게 하면 교구별 로직은 `keyboard.shift` 여부를 보고 비율 고정, 각도 스냅, 축 고정 같은 규칙을 적용할 수 있습니다.
중요한 점은 keyboard event handler에서 직접 교구를 움직이지 않는다는 것입니다.
포인터 조작 중에는 포인터 흐름이 계속 주도권을 갖고, 키보드는 modifier 역할만 합니다.

## 정리

PointerEvent와 KeyboardEvent를 따로 보면 구현은 단순해 보입니다.
하지만 실제 편집 도구에서는 두 입력이 같은 조작 상태를 바꾸기 때문에 하나의 interaction state로 묶는 편이 안정적이었습니다.

정리한 기준은 다음과 같습니다.

- 포인터 이벤트는 좌표와 조작 흐름을 담당한다.
- 키보드 이벤트는 명령 또는 modifier 상태를 담당한다.
- 두 입력은 같은 interaction state를 참조한다.
- 입력창 포커스 상태에서는 캔버스 단축키를 막는다.
- 조작 중 keyboard state는 교구별 계산에 전달한다.

이 구조를 만든 뒤에는 단축키를 추가할 때도 기존 드래그 로직을 크게 건드리지 않아도 됐습니다.
입력 흐름의 책임을 먼저 나누는 것이 복잡한 캔버스 UI에서는 생각보다 중요했습니다.
