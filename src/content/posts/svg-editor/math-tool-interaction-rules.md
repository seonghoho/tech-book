---
title: "수학교구 SVG 캔버스의 인터랙션 구조: 입력 이벤트, store 선택 흐름, 교구별 조작 규칙"
date: "2026-05-13"
updated: "2026-10-13"
description: "수학교구 SVG 캔버스에서 PointerEvent와 KeyboardEvent를 하나의 인터랙션 상태로 묶고, 교구를 store와 registry로 추적하며, drag·rotate·place 규칙을 교구 객체로 분기한 구조를 정리합니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "Interaction", "PointerEvent", "KeyboardEvent", "Pinia", "Architecture"]
---

# 수학교구 SVG 캔버스의 인터랙션 구조: 입력 이벤트, store 선택 흐름, 교구별 조작 규칙

> 2024년 9월에 진행한 작업을 2026년 5월에 정리한 기록입니다.

수학교구 캔버스에서는 사용자가 교구를 계속 생성하고, 선택하고, 이동하고, 삭제합니다.
겉으로 보면 대부분 드래그와 클릭이지만, 실제로 구현해 보니 세 가지 층의 문제가 얽혀 있었습니다.

- 포인터와 키보드라는 서로 다른 입력이 같은 조작을 바꾼다.
- 생성된 교구를 캔버스 밖의 UI에서도 알아야 하고, 선택 상태에 따라 많은 것이 달라진다.
- 같은 드래그라도 교구와 상황에 따라 의미가 다르다.

이 글에서는 입력 이벤트가 들어와서, 교구가 store에 등록·선택되고, 최종적으로 교구별 조작 규칙이 실행되기까지의 흐름을 순서대로 정리합니다.

## 1. 입력: PointerEvent와 KeyboardEvent를 하나의 상태로 묶기

### 따로 처리했을 때 생긴 문제

SVG 캔버스에서 교구를 조작할 때 입력은 마우스나 터치만으로 끝나지 않았습니다.
사용자는 도형을 드래그하면서 `Shift`로 비율을 고정하거나, `Delete`로 선택된 교구를 지우고, 방향키로 위치를 미세하게 조정할 수 있어야 했습니다.

처음에는 포인터 이벤트와 키보드 이벤트를 별도로 처리했습니다.
포인터는 SVG 요소에서 받고, 키보드는 window에서 받는 방식이었습니다.
하지만 두 입력이 같은 조작을 바꾸기 시작하면서 문제가 생겼습니다.

예를 들어 리사이즈 중 `Shift`를 누르면 비율 고정이 적용되어야 합니다.
이때 포인터 이벤트 핸들러가 현재 키보드 상태를 모르면, 드래그 중간에 규칙을 바꾸기 어렵습니다.
반대로 키보드 핸들러가 현재 선택된 교구와 조작 모드를 모르면, 삭제나 미세 이동이 엉뚱한 상태에서 실행될 수 있습니다.

### 키보드는 명령이면서 modifier다

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

### 전역 키보드 이벤트의 범위

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

## 2. 등록과 선택: 교구 객체를 store와 registry로 추적하기

### DOM만으로는 상태를 판단할 수 없었다

키보드 명령이 "선택 상태가 있을 때만" 실행되려면, 지금 무엇이 선택되어 있는지를 신뢰할 수 있어야 합니다.
교구가 SVG 안에 실제 DOM으로 존재하기 때문에 처음에는 DOM을 기준으로 상태를 찾는 방식도 가능해 보였습니다.
하지만 기능이 늘어나면서 DOM만 보고 현재 상태를 판단하는 방식은 한계가 있었습니다.

- 현재 선택된 교구가 무엇인지 UI 패널에서도 알아야 함
- 삭제나 복제 같은 명령은 객체 데이터가 필요함
- SVG element와 교구 클래스 인스턴스를 함께 추적해야 함
- 저장이나 공유를 위해 순수 데이터로 변환해야 함
- 선택 상태와 편집 상태를 여러 컴포넌트에서 참조해야 함

결국 캔버스 내부 상태와 서비스 UI 상태를 연결할 중심이 필요했습니다.

### store에는 공유 상태만, 인스턴스는 registry에

처음부터 모든 것을 store에 넣지는 않았습니다.
DOM element나 이벤트 리스너 같은 런타임 참조를 그대로 전역 상태에 넣으면 추적하기 어렵고, 저장 가능한 데이터와도 섞입니다.
그래서 store에는 캔버스가 외부 UI와 공유해야 하는 상태를 중심으로 넣었습니다.

![수학교구 캔버스에서 store에는 공유 상태를 두고 registry에는 런타임 교구 인스턴스를 두어 생성과 선택 흐름을 추적하는 구조](/images/posts/svg-editor/math-tool-store-selection-flow/body-01.png)

```ts
type CanvasStoreState = {
  elementIds: string[];
  selectedElementId: string | null;
  activeTool: ToolType | null;
  editingMode: "idle" | "placing" | "editing";
};
```

교구 인스턴스 자체는 별도 map으로 관리하고, store는 현재 화면이 알아야 할 식별자와 편집 흐름을 갖게 했습니다.
이렇게 나누면 UI 컴포넌트는 DOM이나 클래스 인스턴스를 몰라도 현재 상태를 표시할 수 있습니다.

### 생성 흐름

교구 생성은 대략 아래 순서로 정리했습니다.

1. 사용자가 도구 버튼을 선택한다.
2. store에 `activeTool`과 `placing` 상태를 기록한다.
3. 캔버스에서 pointerdown이 발생하면 교구 인스턴스를 만든다.
4. 인스턴스를 registry에 등록한다.
5. store에 id를 추가하고 선택 상태를 갱신한다.

```ts
function registerElement(element: DigitalMathElement) {
  elementRegistry.set(element.id, element);
  canvasStore.addElementId(element.id);
  canvasStore.selectElement(element.id);
}
```

중요한 점은 생성 직후 선택 상태를 명확히 갱신하는 것이었습니다.
그렇지 않으면 오른쪽 속성 패널이 이전 교구를 보여주거나, 방금 만든 교구에 키보드 명령이 적용되지 않는 문제가 생깁니다.

### 선택 변경의 진입점은 하나로

선택은 단순히 `selected = true`만 바꾸는 일이 아니었습니다.
선택된 교구에 따라 핸들 표시, 속성 패널, 삭제 버튼, 키보드 명령 가능 여부가 모두 달라졌습니다.

그래서 선택 변경 시에는 아래 일을 한 번에 처리했습니다.

- 이전 교구의 선택 표시 제거
- 새 교구의 선택 표시 적용
- store의 selected id 갱신
- 편집 패널 상태 갱신
- 현재 조작 모드 초기화

선택 변경을 여러 위치에서 직접 처리하면 누락이 생기기 쉽습니다.
그래서 선택을 바꾸는 진입점은 하나로 모았습니다.

```ts
function selectElement(id: string | null) {
  const prev = getSelectedElement();
  prev?.deselect();

  canvasStore.selectedElementId = id;

  const next = getSelectedElement();
  next?.select();
}
```

## 3. 조작: 교구마다 다른 drag·rotate·place 규칙 분기하기

### 같은 드래그, 다른 의미

선택된 교구를 실제로 움직이는 단계에서는 또 다른 문제가 있었습니다.
같은 드래그라도 의미가 달랐습니다.

- 교구 전체를 이동하는 드래그
- 꼭짓점이나 핸들을 움직이는 드래그
- 회전 중심을 기준으로 각도를 바꾸는 드래그
- 새 점이나 선을 배치하는 드래그
- 이미 배치된 교구를 선택만 하는 클릭

처음에는 이벤트 핸들러 안에서 교구 타입을 확인하고 분기했습니다.
작은 규모에서는 괜찮았지만 교구가 늘어나면서 `if`와 `switch`가 계속 길어졌습니다.
특정 교구의 예외를 넣으면 다른 교구의 조작 흐름이 같이 영향을 받는 문제가 생겼습니다.

### 교구 타입보다 조작 모드를 먼저

해결의 시작은 "어떤 교구인가"보다 "지금 어떤 조작 중인가"를 먼저 구분하는 것이었습니다.
교구 타입은 다르더라도 사용자의 입력 상태는 비교적 명확하게 나눌 수 있습니다.

![수학교구 캔버스에서 pointerdown 시점에 조작 모드를 확정하고 교구 객체가 drag rotate place 규칙을 처리하는 구조](/images/posts/svg-editor/math-tool-interaction-rules/body-01.png)

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
교구별 세부 계산은 각 교구 객체가 처리하도록 넘겼고, 이때 앞에서 모아 둔 keyboard state도 함께 전달했습니다.

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

캔버스는 이벤트를 받고, 좌표를 변환하고, 현재 모드를 전달합니다.
교구는 전달받은 모드에 맞춰 자기 규칙을 실행합니다.
교구별 로직은 `keyboard.shift` 여부를 보고 비율 고정, 각도 스냅, 축 고정 같은 규칙을 적용할 수 있습니다.

여기서 중요한 점은 keyboard event handler에서 직접 교구를 움직이지 않는다는 것입니다.
포인터 조작 중에는 포인터 흐름이 계속 주도권을 갖고, 키보드는 modifier 역할만 합니다.

### 교구별 규칙은 객체 안으로

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

### pointerdown에서 의도를 확정하기

또 하나 중요했던 기준은 `pointermove`에서 조작 의도를 계속 판단하지 않는 것이었습니다.
사용자가 어떤 핸들을 눌렀는지, 어떤 교구를 선택했는지, 새 교구를 배치하는 중인지는 대부분 `pointerdown` 시점에 결정됩니다.
교구 생성 흐름에서 pointerdown 시점에 인스턴스를 만들고 선택 상태를 갱신한 것도 같은 맥락입니다.

그래서 시작 시점에 다음 값을 저장했습니다.

- active element id
- interaction mode
- 시작 좌표
- 잡은 핸들 종류
- keyboard modifier 상태

이렇게 하면 `pointermove`는 매번 복잡한 hit test를 다시 하지 않아도 됩니다.
이미 확정된 조작 상태를 기준으로 좌표만 갱신하면 됩니다.

좌표 변환 자체는 [SVG 좌표 변환에서 포인터 위치가 어긋나는 문제](/posts/svg-editor/svg-pointer-coordinate-transform)에 따로 정리해두었습니다.

## 설계 기준 정리

SVG 캔버스에서는 DOM, 클래스 인스턴스, UI 상태, 그리고 여러 종류의 입력이 쉽게 섞입니다.
입력 → 등록·선택 → 조작이라는 흐름에서 각 단계의 책임을 나누며 정리한 기준은 다음과 같습니다.

**입력**

- 포인터 이벤트는 좌표와 조작 흐름을 담당하고, 키보드 이벤트는 명령 또는 modifier 상태를 담당한다.
- 두 입력은 같은 interaction state를 참조한다.
- 입력창 포커스 상태에서는 캔버스 단축키를 막는다.

**등록과 선택**

- store에는 UI와 공유해야 하는 최소 상태만 두고, 교구 인스턴스는 별도 registry로 관리한다.
- 선택 변경 진입점은 하나로 모은다.
- 생성 직후 선택 상태와 편집 모드를 명시적으로 갱신한다.
- 저장 가능한 문서 상태와 런타임 참조를 섞지 않는다.

**조작**

- 현재 조작 모드는 `pointerdown` 시점에 확정한다.
- 좌표 변환은 캔버스 계층에서 한 번만 처리한다.
- 교구별 계산 규칙은 교구 객체 안에 두고, 조작 중 keyboard state를 함께 전달한다.
- 지원하지 않는 모드는 명시적으로 무시한다.

이 구조는 기능을 추가할 때 특히 효과가 있었습니다.
새 교구를 추가할 때는 캔버스의 이벤트 흐름은 그대로 두고 새 교구가 자기 `handleMove` 규칙만 정의하면 되었고, 단축키를 추가할 때도 기존 드래그 로직을 크게 건드리지 않아도 됐습니다.

store를 단순히 모든 것을 넣는 장소로 쓰면 오히려 복잡해진다는 점은 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)에서 정리한 기준과도 이어집니다.
저장해야 하는 상태와 지금 화면에서만 필요한 상태를 나누고, 입력 흐름의 책임을 먼저 나누는 것이 복잡한 캔버스 UI에서는 생각보다 중요했습니다.
