---
title: "SVG 에디터 선택 상태와 렌더링 상태 분리하기"
date: "2024-12-05"
updated: "2024-12-05"
description: "선택, hover, drag 같은 UI 상태를 문서 데이터와 분리해 저장과 렌더링을 예측 가능하게 만든 과정입니다."
image: "/images/posts/svg-editor/svg-selection-render-state/cover-og.png"
tags: ["SVG", "State", "Architecture", "Refactor"]
---

# SVG 에디터 선택 상태와 렌더링 상태 분리하기

## 문제 상황

SVG 에디터를 만들다 보면 도형 데이터에 여러 상태를 붙이고 싶어집니다.
처음에는 도형 객체 안에 선택 여부와 hover 여부를 함께 넣었습니다.

```ts
type Shape = {
  id: string;
  type: "rect" | "circle" | "line";
  x: number;
  y: number;
  selected: boolean;
  hovered: boolean;
};
```

작은 규모에서는 이 방식이 편합니다.
도형 하나를 렌더링할 때 `shape.selected`만 보면 되기 때문입니다.

하지만 기능이 늘어나면서 문제가 생겼습니다.

- 저장 파일에 `selected`, `hovered` 같은 임시 UI 상태가 섞임
- undo/redo 시 선택 상태까지 과거로 돌아감
- hover만 바뀌어도 도형 데이터가 변경된 것으로 처리됨
- 복사/붙여넣기 시 선택 상태가 같이 복제됨
- 협업이나 동기화 구조로 확장하기 어려움

문서 데이터와 UI 상태가 같은 객체에 섞이면 “저장해야 하는 상태”와 “현재 화면에서만 필요한 상태”를 구분하기 어려워집니다.

## 상태를 두 층으로 나누기

해결 방향은 단순했습니다.
도형 자체의 데이터와 에디터 UI 상태를 분리했습니다.

```ts
type DocumentState = {
  shapes: Shape[];
};

type EditorUiState = {
  selectedIds: string[];
  hoveredId: string | null;
  dragState: DragState | null;
  activeTool: Tool;
};
```

이제 `Shape`에는 결과물에 필요한 데이터만 남깁니다.

```ts
type Shape = {
  id: string;
  type: "rect" | "circle" | "line";
  points: Array<[number, number]>;
  style: ShapeStyle;
};
```

이 기준을 세우면 저장, 복원, 렌더링, 히스토리의 책임이 더 명확해집니다.

## 렌더링에서 선택 상태 계산하기

도형에 `selected`를 넣지 않으면 렌더링 시점에 선택 여부를 계산해야 합니다.

```tsx
function ShapeLayer({ documentState, uiState }: Props) {
  return documentState.shapes.map((shape) => {
    const selected = uiState.selectedIds.includes(shape.id);
    const hovered = uiState.hoveredId === shape.id;

    return (
      <ShapeRenderer
        key={shape.id}
        shape={shape}
        selected={selected}
        hovered={hovered}
      />
    );
  });
}
```

처음에는 매번 `includes`를 호출하는 것이 신경 쓰일 수 있습니다.
선택 대상이 많아진다면 `Set`으로 바꿔 계산 비용을 줄이면 됩니다.

```ts
const selectedIdSet = new Set(uiState.selectedIds);
const selected = selectedIdSet.has(shape.id);
```

중요한 점은 선택 여부가 도형 데이터의 일부가 아니라 렌더링 파생값이라는 것입니다.

## 저장과 히스토리가 단순해지는 효과

상태를 분리하면 저장 로직이 단순해집니다.
문서 저장은 `DocumentState`만 대상으로 하면 됩니다.

```ts
function serializeDocument(state: DocumentState) {
  return JSON.stringify({
    version: 1,
    shapes: state.shapes,
  });
}
```

undo/redo도 마찬가지입니다.
히스토리에는 문서 상태만 저장하고, 복원 후 UI 상태는 현재 문서에 맞게 초기화합니다.

```ts
function restoreDocument(snapshot: DocumentState) {
  documentState.shapes = snapshot.shapes;
  uiState.selectedIds = [];
  uiState.hoveredId = null;
  uiState.dragState = null;
}
```

이 방식은 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)에서 다룬 히스토리 구조와 연결됩니다.
히스토리에 무엇을 넣지 않을지 결정하는 것이 undo/redo 안정성에 직접적인 영향을 줍니다.

## 이벤트 처리도 명확해짐

상태가 분리되면 이벤트 핸들러도 역할이 분명해집니다.
선택 이벤트는 UI 상태만 바꾸고, 도형 이동 이벤트는 문서 상태를 바꿉니다.

```ts
function selectShape(id: string) {
  uiState.selectedIds = [id];
}

function moveShape(id: string, delta: Point) {
  const shape = documentState.shapes.find((item) => item.id === id);
  if (!shape) return;

  shape.points = shape.points.map(([x, y]) => [x + delta.x, y + delta.y]);
}
```

이 구분이 없으면 클릭만 했는데 문서가 dirty 상태가 되거나, hover만 바뀌었는데 저장 버튼이 활성화되는 문제가 생깁니다.
실제 사용자는 이런 작은 상태 불일치를 민감하게 느낍니다.

## 복사와 붙여넣기

복사/붙여넣기에서도 분리의 효과가 있습니다.
도형 데이터만 복사하면 선택 상태가 같이 딸려가지 않습니다.

```ts
function copySelectedShapes() {
  const selected = documentState.shapes.filter((shape) =>
    uiState.selectedIds.includes(shape.id)
  );

  clipboard = selected.map((shape) => ({
    ...shape,
    id: createId(),
  }));
}
```

붙여넣기 후에는 새로 생성된 도형만 선택 상태로 만들 수 있습니다.

```ts
function pasteShapes() {
  const pasted = clipboard.map((shape) => ({
    ...shape,
    id: createId(),
  }));

  documentState.shapes.push(...pasted);
  uiState.selectedIds = pasted.map((shape) => shape.id);
}
```

문서 데이터와 UI 상태가 섞여 있었다면 복사된 도형의 `selected: true`가 그대로 남아 예상하지 못한 선택 상태를 만들 수 있습니다.

## 정리

편집기에서 모든 상태를 하나의 객체에 넣으면 초기 구현은 빨라집니다.
하지만 저장, 히스토리, 복사/붙여넣기, 협업 구조까지 생각하면 문서 상태와 UI 상태를 분리하는 편이 더 안전합니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- 도형 객체에는 결과물에 필요한 데이터만 둔다.
- 선택, hover, drag, activeTool은 UI 상태로 분리한다.
- 렌더링 시점에 선택 여부를 파생값으로 계산한다.
- 저장과 히스토리는 문서 상태만 대상으로 한다.
- 복원 후 UI 임시 상태는 초기화한다.

이 구조는 처음에는 한 단계 돌아가는 것처럼 보입니다.
하지만 편집 기능이 늘어날수록 “무엇이 저장되는 상태인가”가 명확해져 유지보수 비용을 줄여줍니다.
