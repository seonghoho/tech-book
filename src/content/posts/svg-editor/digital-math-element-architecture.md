---
title: "SVG 수학교구 20종을 확장 가능하게 만든 DigitalMathElement 설계"
date: "2024-09-03"
updated: "2026-05-29"
description: "교구마다 다른 생성, 선택, 이동, 렌더링 로직을 DigitalMathElement 기준으로 정리해 신규 교구 추가 비용을 줄인 과정입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "TypeScript", "Architecture", "Refactor"]
---

# SVG 수학교구 20종을 확장 가능하게 만든 DigitalMathElement 설계

## 문제 상황

수학교구 캔버스에서는 자, 각도기, 도형, 좌표, 조작형 교구처럼 서로 다른 성격의 도구를 계속 추가해야 했습니다.
처음에는 교구별로 클래스를 만들고 필요한 이벤트와 렌더링 로직을 각각 구현하는 방식이 가장 빨랐습니다.

문제는 교구 수가 늘어나면서 같은 코드가 반복되기 시작했다는 점입니다.
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
그렇게 하면 상위 클래스가 점점 커지고, 결국 모든 교구의 예외를 아는 거대한 객체가 됩니다.

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

## 정리

이 작업의 핵심은 멋진 추상화를 만드는 것이 아니었습니다.
교구가 계속 늘어나는 상황에서 수정 범위를 줄이는 것이 목적이었습니다.

정리하면 기준은 다음과 같습니다.

- 캔버스가 필요한 공통 동작을 먼저 정한다.
- 교구별 예외는 상위 클래스에 억지로 넣지 않는다.
- 상위 클래스는 생명주기와 기본 상호작용만 담당한다.
- 하위 클래스는 자기 교구의 계산 규칙을 책임진다.

이 구조를 만들고 나니 새 교구를 추가할 때 확인해야 할 위치가 줄었습니다.
또한 선택, 이동, 삭제 같은 공통 동작을 수정할 때 전체 교구에 같은 기준을 적용하기 쉬워졌습니다.

이 글은 [SVG 에디터 선택 상태와 렌더링 상태 분리하기](/posts/svg-editor/svg-selection-render-state)와도 연결됩니다.
객체 구조를 잡을 때도 결국 중요한 것은 “어떤 상태를 어디에서 책임질 것인가”였습니다.
