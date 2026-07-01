---
title: "SVG 에디터에서 문서 상태와 편집 상태의 경계를 나눈 기준"
date: "2026-06-18"
updated: "2026-07-01"
description: "SVG 에디터에서 저장해야 하는 문서 데이터와 선택, hover, drag 같은 편집 UI 상태를 분리해 히스토리와 렌더링을 안정화한 기준입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "State", "Architecture", "Editor"]
---

# SVG 에디터에서 문서 상태와 편집 상태의 경계를 나눈 기준

## 문제 상황

SVG 에디터를 만들 때 가장 먼저 헷갈렸던 지점은 “어디까지가 문서 상태인가”였습니다.
도형을 만들고, 선택하고, 이동하고, 크기를 조절하는 기능은 모두 같은 화면에서 일어납니다.
그래서 초기에는 도형 객체 안에 편집에 필요한 값을 함께 넣는 방식이 자연스럽게 보였습니다.

```ts
type Shape = {
  id: string;
  type: "rect" | "line" | "circle";
  points: Point[];
  selected: boolean;
  hovered: boolean;
  dragging: boolean;
};
```

작은 예제에서는 이 구조가 빠릅니다.
도형을 렌더링할 때 `shape.selected`만 보면 되고, hover 상태도 같은 객체에서 바로 읽을 수 있습니다.
하지만 에디터 기능이 늘어나자 이 편한 구조가 문제를 만들었습니다.

- hover만 바뀌어도 문서가 변경된 것으로 처리됨
- 클릭으로 선택만 했는데 저장 버튼이 활성화됨
- undo/redo 시 선택 상태까지 과거로 돌아감
- 복사한 도형에 `selected: true`가 남아 붙여넣기 후 선택 상태가 꼬임
- 저장 파일에 화면에서만 필요한 상태가 섞임

이 문제는 [SVG 에디터 선택 상태와 렌더링 상태 분리하기](/posts/svg-editor/svg-selection-render-state)에서 다룬 내용과 연결됩니다.
다만 실제 구현에서는 단순히 `selected`를 밖으로 빼는 것만으로 충분하지 않았습니다.
문서 상태와 편집 상태의 경계를 팀이나 미래의 내가 다시 봐도 흔들리지 않게 정해야 했습니다.

## 기준은 저장 가능성

가장 유용했던 기준은 “이 상태를 저장 파일에 넣어도 되는가”였습니다.
사용자가 파일을 닫았다가 다시 열었을 때 유지되어야 하면 문서 상태입니다.
현재 조작 중인 화면에서만 의미가 있다면 편집 상태입니다.

```ts
type DocumentState = {
  shapes: Shape[];
  groups: Group[];
  viewport?: SavedViewport;
};

type EditorState = {
  selectedIds: string[];
  hoveredId: string | null;
  activeTool: ToolType;
  dragSession: DragSession | null;
  resizeSession: ResizeSession | null;
};
```

도형의 좌표, 크기, 스타일, 그룹 정보는 문서 상태입니다.
반면 선택된 도형, hover 대상, 현재 드래그 중인 포인터 위치, resize handle 정보는 편집 상태입니다.

이렇게 나누면 저장 로직은 단순해집니다.

```ts
function serializeDocument(documentState: DocumentState) {
  return JSON.stringify({
    version: 1,
    shapes: documentState.shapes,
    groups: documentState.groups,
  });
}
```

저장 함수가 `EditorState`를 알 필요가 없어집니다.
이것만으로도 저장, 복원, 히스토리, 렌더링 사이의 결합이 많이 줄었습니다.

## 히스토리에 넣을 상태와 넣지 않을 상태

undo/redo를 구현할 때도 같은 기준을 적용했습니다.
히스토리는 사용자의 작업 결과를 되돌리는 기능이지, 마우스가 지나간 흔적을 되돌리는 기능이 아닙니다.

그래서 히스토리 스냅샷에는 `DocumentState`만 넣었습니다.

```ts
type HistorySnapshot = {
  document: DocumentState;
  reason: "create" | "move" | "resize" | "delete";
  createdAt: number;
};
```

선택 상태를 히스토리에 넣지 않으면 복원 후 선택이 사라지는 단점이 있습니다.
하지만 그 단점보다 장점이 더 컸습니다.
히스토리 복원 후에는 문서가 기준이 되고, UI 상태는 문서에 맞춰 다시 정리하면 됩니다.

```ts
function restoreSnapshot(snapshot: HistorySnapshot) {
  documentState.value = snapshot.document;
  editorState.value = {
    ...editorState.value,
    selectedIds: [],
    hoveredId: null,
    dragSession: null,
    resizeSession: null,
  };
}
```

이 흐름은 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)와 같은 방향입니다.
히스토리가 안정적이려면 무엇을 저장할지보다 무엇을 저장하지 않을지가 더 중요했습니다.

## 렌더링은 두 상태를 조합한다

상태를 나누면 렌더링 컴포넌트는 두 상태를 조합해야 합니다.
처음에는 이 부분이 번거롭게 느껴졌습니다.
하지만 렌더링은 원래 “문서 데이터”와 “현재 UI 맥락”을 합쳐 화면을 만드는 단계입니다.

```tsx
function ShapeLayer({
  documentState,
  editorState,
}: {
  documentState: DocumentState;
  editorState: EditorState;
}) {
  const selectedIdSet = new Set(editorState.selectedIds);

  return documentState.shapes.map((shape) => (
    <ShapeRenderer
      key={shape.id}
      shape={shape}
      selected={selectedIdSet.has(shape.id)}
      hovered={editorState.hoveredId === shape.id}
      activeTool={editorState.activeTool}
    />
  ));
}
```

도형 객체 자체는 순수한 문서 데이터로 유지하고, 선택 여부는 렌더링 시점의 파생값으로 계산합니다.
이 구조 덕분에 같은 문서를 읽더라도 보기 모드, 편집 모드, 프리뷰 모드에서 서로 다른 UI 상태를 붙여 렌더링할 수 있었습니다.

## 이벤트 핸들러의 책임도 나뉜다

상태 경계가 정해지면 이벤트 핸들러의 책임도 분명해집니다.
포인터가 도형 위에 올라가는 것은 편집 상태 변경입니다.
도형을 실제로 이동시키는 것은 문서 상태 변경입니다.

```ts
function onPointerEnterShape(shapeId: string) {
  editorState.hoveredId = shapeId;
}

function onDragShape(shapeId: string, delta: Point) {
  documentState.shapes = documentState.shapes.map((shape) =>
    shape.id === shapeId ? moveShape(shape, delta) : shape
  );
}
```

이 차이를 지키지 않으면 dirty 상태가 쉽게 오염됩니다.
hover, focus, selected 같은 상태가 문서 변경으로 처리되면 사용자는 “아무것도 안 바꿨는데 저장하라고 뜨는” 경험을 하게 됩니다.

반대로 실제 도형 좌표가 바뀌었는데 편집 상태만 바꾸고 끝나면 저장과 히스토리에 반영되지 않습니다.
그래서 이벤트를 만들 때마다 먼저 질문했습니다.

- 이 이벤트는 결과물을 바꾸는가?
- 다시 열었을 때 유지되어야 하는가?
- undo/redo 대상인가?
- 저장 버튼 활성화 조건에 포함되는가?

네 가지 질문 중 하나라도 “그렇다”에 가까우면 문서 상태를 바꾸는 흐름으로 다뤘습니다.

## 복사와 붙여넣기에서 얻은 효과

상태 경계를 나눈 효과는 복사/붙여넣기에서 특히 분명했습니다.
복사는 선택된 도형을 기준으로 하지만, 복사되는 데이터에는 선택 상태가 들어가면 안 됩니다.

```ts
function copySelectedShapes() {
  const selected = documentState.shapes.filter((shape) =>
    editorState.selectedIds.includes(shape.id)
  );

  clipboard.value = selected.map(stripEditorOnlyFields);
}
```

붙여넣기 후에는 새 도형을 만들고, 그 새 도형만 선택 상태로 지정합니다.

```ts
function pasteShapes() {
  const pastedShapes = clipboard.value.map((shape) => ({
    ...shape,
    id: createShapeId(),
    points: offsetPoints(shape.points, { x: 16, y: 16 }),
  }));

  documentState.shapes.push(...pastedShapes);
  editorState.selectedIds = pastedShapes.map((shape) => shape.id);
}
```

이 흐름에서는 문서 데이터와 편집 상태가 서로의 역할을 침범하지 않습니다.
복사할 때는 편집 상태를 읽지만, 복사되는 값은 문서 데이터입니다.
붙여넣기 후 선택 상태는 새롭게 계산됩니다.

## 정리

SVG 에디터에서 상태를 잘 나누려면 상태의 이름보다 수명이 더 중요했습니다.
오래 유지되어야 하는 상태와 현재 조작에만 필요한 상태를 섞지 않는 것이 핵심입니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- 저장 파일에 들어갈 수 있으면 문서 상태로 둔다.
- 선택, hover, drag, resize session은 편집 상태로 둔다.
- 히스토리에는 문서 상태만 저장한다.
- 렌더링 시점에 문서 상태와 편집 상태를 조합한다.
- 이벤트 핸들러는 결과물을 바꾸는지 먼저 판단한다.

이 구조는 [MathCanvas 프로젝트](/projects/mathcanvas)처럼 2D SVG 교구와 3D 교구가 함께 있는 환경에서도 유효했습니다.
어떤 기술로 렌더링하든 편집 도구에서 가장 먼저 안정화해야 하는 것은 “무엇이 결과물이고 무엇이 현재 조작 상태인가”였습니다.
