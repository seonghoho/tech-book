---
title: "수학교구 캔버스 구조: DigitalMathElement와 2D·3D 렌더러 경계"
date: "2026-05-13"
updated: "2026-10-20"
description: "SVG 수학교구 20종의 공통 동작을 DigitalMathElement 상위 클래스로 묶고, SVG 교구와 Three.js 교구를 하나의 캔버스 흐름에서 다루도록 상태와 렌더링 계층을 나눈 과정입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "Three.js", "TypeScript", "Architecture"]
---

# 수학교구 캔버스 구조: DigitalMathElement와 2D·3D 렌더러 경계

> 교구 상위 클래스는 2024년 9월, 2D·3D 캔버스 통합은 2025년 9월에 진행한 작업을 2026년 5월에 정리한 기록입니다.

## 문제 상황

수학교구 캔버스에서는 자, 각도기, 도형, 좌표, 조작형 교구처럼 서로 다른 성격의 도구를 계속 추가해야 했습니다.
처음에는 교구별로 클래스를 만들고 필요한 이벤트와 렌더링 로직을 각각 구현하는 방식이 가장 빨랐습니다.

교구 수가 늘어나면서 같은 코드가 반복되기 시작했습니다.
선택 상태를 바꾸는 코드, SVG element를 생성하는 코드, 위치를 갱신하는 코드, 삭제와 복제를 처리하는 코드가 교구마다 조금씩 달랐습니다.
작은 버그를 고쳐도 특정 교구에서는 반영되지 않거나, 새 교구를 추가할 때 기존 교구의 예외를 계속 따라가야 했습니다.

## 공통 기준을 먼저 정리하기

교구마다 모양은 달라도 캔버스 입장에서 필요한 최소 동작은 비슷했습니다.
그래서 상위 클래스를 먼저 두고, 교구가 반드시 가져야 하는 계약을 정리했습니다.

![DigitalMathElement 상위 클래스가 공통 생명주기를 담당하고 하위 수학교구 클래스가 교구별 계산 규칙을 담당하는 구조](/images/posts/svg-editor/digital-math-element-architecture/body-01.png)

```ts
abstract class DigitalMathElement {
  id: string;
  x: number;
  y: number;
  selected = false;

  abstract render(): SVGElement;
  abstract move(dx: number, dy: number): void;

  select() {
    this.selected = true;
  }

  deselect() {
    this.selected = false;
  }

  remove() {
    this.element?.remove();
  }
}
```

실제 코드는 교구 특성에 맞게 더 많은 속성과 메서드가 필요했지만, 기준은 단순했습니다.
캔버스가 어떤 교구를 다루든 `render`, `move`, `select`, `remove` 같은 공통 동작은 같은 방식으로 호출할 수 있어야 했습니다.

## 상속으로 해결한 것과 남긴 것

모든 로직을 상위 클래스에 넣지는 않았습니다.
그렇게 하면 상위 클래스가 모든 교구의 예외를 알아야 합니다.

공통으로 올린 것은 아래 정도였습니다.

- 식별자와 기본 위치
- 선택 상태
- SVG element 참조
- 공통 이벤트 등록과 해제
- 캔버스 store 등록에 필요한 최소 메타데이터

반대로 교구별로 달라지는 계산은 하위 클래스에 남겼습니다.
예를 들어 회전 가능한 교구, 점을 추가하는 교구, 길이를 조절하는 교구는 조작 규칙이 다릅니다.
이 규칙까지 억지로 공통화하면 조건문만 늘어나기 때문에, 하위 클래스가 자기 규칙을 직접 갖는 편이 낫다고 판단했습니다.

## 캔버스와 교구 사이의 경계

상위 클래스를 만든 뒤 가장 좋아진 부분은 캔버스 코드였습니다.
캔버스는 더 이상 교구 종류를 세세하게 알 필요가 없었습니다.

```ts
function addElement(element: DigitalMathElement) {
  elements.set(element.id, element);
  svg.appendChild(element.render());
}

function moveSelected(dx: number, dy: number) {
  selectedElements.forEach((element) => {
    element.move(dx, dy);
  });
}
```

이 구조에서는 새 교구를 추가할 때 캔버스 전체를 수정하는 대신, 새 교구 클래스가 공통 계약만 지키면 됩니다.
캔버스는 교구를 조작하고, 교구는 자기 내부 규칙을 책임지는 형태가 됩니다.

## 2D 교구와 3D 교구를 같은 캔버스에서 다루기

교구 상위 클래스를 만든 뒤에는 3D 교구가 들어왔습니다. 수학교구 캔버스에서는 2D 교구와 3D 교구가 함께 필요했습니다.
평면도형이나 자, 각도기처럼 SVG가 적합한 교구도 있고, 쌓기나무나 공간좌표처럼 Three.js가 자연스러운 교구도 있었습니다.

기술적으로는 완전히 다른 렌더링 환경입니다.
SVG는 DOM 기반이고, 각 요소를 직접 선택하거나 속성을 바꾸기 쉽습니다.
Three.js는 WebGL scene, camera, renderer, controls를 중심으로 동작합니다.

사용자는 어떤 교구가 SVG이고 어떤 교구가 Three.js인지 알 필요가 없었습니다.
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

![SVG와 Three.js 교구를 하나의 캔버스 경험으로 묶기 위해 공통 store와 분리된 렌더링 계층을 연결한 구조](/images/posts/svg-editor/svg-threejs-canvas-experience/body-01.png)

```ts
type CanvasItem =
  | { kind: "svg"; id: string; toolType: SvgToolType }
  | { kind: "three"; id: string; toolType: ThreeToolType };
```

상위 UI는 `kind`와 `id`를 기준으로 현재 선택 상태를 다루고, 실제 렌더링과 조작은 각 캔버스 계층이 맡는 구조입니다.

## 상태 경계 맞추기

먼저 맞춘 것은 선택 상태였습니다.
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
사용자는 교구 이름을 보고 도구를 고릅니다.

그래서 UI에서는 교구 목적을 기준으로 묶고, 내부에서 교구마다 렌더러를 정하도록 했습니다.

```ts
const tool = {
  label: "쌓기나무",
  renderer: "three",
  defaultMode: "placing",
};
```

이렇게 하면 UI 문구와 사용 흐름은 교구 중심으로 유지하면서, 구현에서는 어떤 렌더링 계층을 사용할지 명확히 정할 수 있습니다.

## 설계 기준

두 작업에서 정한 기준은 이렇습니다.

- 캔버스가 필요한 공통 동작(`render`, `move`, `select`, `remove`)을 먼저 정하고, 교구별 계산 규칙은 하위 클래스에 남긴다.
- 사용자 경험은 교구 작업 흐름 기준으로 통일하고, 렌더링 계층은 SVG와 Three.js로 분리한다.
- 선택 상태, active tool, 편집 모드는 공통 store에서 관리하고, 각 렌더러가 자기 방식으로 화면에 반영한다.
- UI는 기술 이름보다 교구 목적을 기준으로 구성한다.

새 교구를 추가할 때 확인할 위치가 줄었고, 선택·이동·삭제 같은 공통 동작을 고칠 때 전체 교구에 같은 기준을 적용할 수 있게 됐습니다.

이 글은 [SVG 에디터에서 문서 상태와 편집 상태의 경계를 나눈 기준](/posts/svg-editor/svg-editor-state-boundary)과도 연결됩니다.
