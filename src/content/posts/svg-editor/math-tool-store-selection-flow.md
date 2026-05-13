---
title: "생성된 교구 객체를 store에 등록하고 선택·편집 흐름을 추적한 구조"
date: "2024-10-24"
updated: "2024-10-24"
description: "SVG 캔버스에서 생성된 교구 객체를 store에 등록하고 선택, 편집, 삭제 흐름을 안정적으로 추적한 방식을 정리합니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["Vue", "Pinia", "SVG", "State"]
---

# 생성된 교구 객체를 store에 등록하고 선택·편집 흐름을 추적한 구조

## 문제 상황

수학교구 캔버스에서는 사용자가 교구를 계속 생성하고, 선택하고, 이동하고, 삭제합니다.
교구가 SVG 안에 실제 DOM으로 존재하기 때문에 처음에는 DOM을 기준으로 상태를 찾는 방식도 가능해 보였습니다.

하지만 기능이 늘어나면서 DOM만 보고 현재 상태를 판단하는 방식은 한계가 있었습니다.

- 현재 선택된 교구가 무엇인지 UI 패널에서도 알아야 함
- 삭제나 복제 같은 명령은 객체 데이터가 필요함
- SVG element와 교구 클래스 인스턴스를 함께 추적해야 함
- 저장이나 공유를 위해 순수 데이터로 변환해야 함
- 선택 상태와 편집 상태를 여러 컴포넌트에서 참조해야 함

결국 캔버스 내부 상태와 서비스 UI 상태를 연결할 중심이 필요했습니다.

## store에 무엇을 넣을지 정하기

처음부터 모든 것을 store에 넣지는 않았습니다.
DOM element나 이벤트 리스너 같은 런타임 참조를 그대로 전역 상태에 넣으면 추적하기 어렵고, 저장 가능한 데이터와도 섞입니다.

그래서 store에는 캔버스가 외부 UI와 공유해야 하는 상태를 중심으로 넣었습니다.

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

## 생성 흐름

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

## 선택과 편집 흐름

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

## 정리

SVG 캔버스에서는 DOM, 클래스 인스턴스, UI 상태가 쉽게 섞입니다.
이때 store를 단순히 모든 것을 넣는 장소로 쓰면 오히려 복잡해집니다.

제가 정리한 기준은 다음과 같습니다.

- store에는 UI와 공유해야 하는 최소 상태만 둔다.
- 교구 인스턴스는 별도 registry로 관리한다.
- 선택 변경 진입점은 하나로 모은다.
- 생성 직후 선택 상태와 편집 모드를 명시적으로 갱신한다.
- 저장 가능한 문서 상태와 런타임 참조를 섞지 않는다.

이 구조는 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)에서 정리한 기준과도 이어집니다.
저장해야 하는 상태와 지금 화면에서만 필요한 상태를 나누면, 이후 기능을 붙일 때 훨씬 덜 흔들립니다.
