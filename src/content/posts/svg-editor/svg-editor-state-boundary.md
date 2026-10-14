---
title: "SVG 에디터에서 문서 상태와 편집 상태의 경계를 나눈 기준"
date: "2026-07-01"
updated: "2026-10-13"
description: "SVG 에디터에서 저장할 문서 데이터와 선택, hover, drag 같은 편집 상태를 저장 가능성 기준으로 나누고, 선택 여부를 렌더링할 때 계산하도록 바꿔 저장, 히스토리, 복사/붙여넣기 버그를 줄인 과정입니다."
image: "/images/posts/svg-editor/svg-selection-render-state/cover-og.png"
tags: ["SVG", "State", "Architecture", "Editor", "Refactor"]
---

# SVG 에디터에서 문서 상태와 편집 상태의 경계를 나눈 기준

## 도형 객체에 모든 상태를 넣었을 때

SVG 에디터를 만들 때 가장 먼저 헷갈렸던 지점은 “어디까지가 문서 상태인가”였습니다.
도형을 만들고, 선택하고, 이동하고, 크기를 조절하는 기능은 모두 같은 화면에서 일어납니다.
그래서 처음에는 선택 여부, hover 여부도 도형 객체에 함께 넣었습니다.

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
- 저장 파일에 `selected`, `hovered` 같은 화면에서만 필요한 임시 UI 상태가 섞임
- 협업이나 동기화 구조로 확장하기 어려움

문서 데이터와 UI 상태가 같은 객체에 섞이면 “저장해야 하는 상태”와 “현재 화면에서만 필요한 상태”를 구분하기 어려워집니다.
해결 방향 자체는 단순했습니다. 도형 자체의 데이터와 에디터 UI 상태를 분리하는 것입니다.
다만 `selected`만 밖으로 빼서는 부족했고, 어떤 상태를 어느 쪽에 둘지 기준이 필요했습니다.

## 저장 파일에 넣을 수 있는지로 나누기

가장 유용했던 기준은 “이 상태를 저장 파일에 넣어도 되는가”였습니다.
사용자가 파일을 닫았다가 다시 열었을 때 유지되어야 하면 문서 상태입니다.
현재 조작 중인 화면에서만 의미가 있다면 편집 상태입니다.

![SVG 에디터에서 문서 상태와 선택 hover drag 같은 UI 상태를 분리하고 렌더링 시점에 파생값으로 계산하는 구조](/images/posts/svg-editor/svg-selection-render-state/body-01.png)

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
반면 선택된 도형, hover 대상, 현재 드래그 중인 포인터 위치, resize handle 정보, 현재 도구는 편집 상태입니다.

이 기준을 적용하면 `Shape`에는 결과물에 필요한 데이터만 남습니다.

```ts
type Shape = {
  id: string;
  type: "rect" | "circle" | "line";
  points: Array<[number, number]>;
  style: ShapeStyle;
};
```

그리고 저장 로직은 단순해집니다.

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

## 선택 여부는 렌더링 파생값으로 계산한다

도형에 `selected`를 넣지 않으면 렌더링 시점에 선택 여부를 계산해야 합니다.
처음에는 이 부분이 번거롭게 느껴졌습니다.
하지만 렌더링은 원래 “문서 데이터”와 “현재 UI 맥락”을 합쳐 화면을 만드는 단계입니다.

가장 단순하게는 도형마다 `selectedIds`에 포함되어 있는지 확인하면 됩니다.

```ts
const selected = editorState.selectedIds.includes(shape.id);
```

매번 `includes`를 호출하는 것이 신경 쓰일 수 있는데, 선택 대상이 많아진다면 `Set`으로 바꿔 계산 비용을 줄이면 됩니다.
렌더링 레이어에서는 이렇게 두 상태를 조합합니다.

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

선택 여부는 도형 데이터에 넣지 않고 렌더링할 때 계산합니다.
이 구조 덕분에 같은 문서를 읽더라도 보기 모드, 편집 모드, 프리뷰 모드에서 서로 다른 UI 상태를 붙여 렌더링할 수 있었습니다.

## 히스토리에 넣을 상태와 넣지 않을 상태

undo/redo를 구현할 때도 같은 기준을 적용했습니다.
히스토리로 되돌릴 대상은 사용자가 바꾼 도형이고, hover나 선택은 대상이 아닙니다.

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
히스토리 복원 후에는 문서가 기준이 되고, UI 임시 상태는 현재 문서에 맞게 초기화하면 됩니다.

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

이 흐름은 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)에서 다룬 히스토리 구조와 같은 방향입니다.

## 이벤트 핸들러 나누기

상태 경계가 정해지면 이벤트 핸들러의 책임도 분명해집니다.
선택이나 포인터가 도형 위에 올라가는 것은 편집 상태 변경입니다.
도형을 실제로 이동시키는 것은 문서 상태 변경입니다.

```ts
function selectShape(id: string) {
  editorState.selectedIds = [id];
}

function onPointerEnterShape(shapeId: string) {
  editorState.hoveredId = shapeId;
}

function onDragShape(shapeId: string, delta: Point) {
  documentState.shapes = documentState.shapes.map((shape) =>
    shape.id === shapeId ? moveShape(shape, delta) : shape
  );
}
```

도형 이동은 문서 데이터인 좌표를 바꿉니다.
위 `onDragShape`처럼 새 배열을 만드는 대신, id로 도형을 찾아 `points`를 직접 바꾸는 형태로 쓸 수도 있습니다. 어느 쪽이든 바뀌는 대상은 문서 상태입니다.

```ts
function moveShape(id: string, delta: Point) {
  const shape = documentState.shapes.find((item) => item.id === id);
  if (!shape) return;

  shape.points = shape.points.map(([x, y]) => [x + delta.x, y + delta.y]);
}
```

이 차이를 지키지 않으면 dirty 상태가 쉽게 오염됩니다.
hover, focus, selected 같은 상태가 문서 변경으로 처리되면 클릭만 해도 문서가 dirty 상태가 됩니다. 아무것도 안 바꿨는데 저장 버튼이 활성화됩니다.

반대로 실제 도형 좌표가 바뀌었는데 편집 상태만 바꾸고 끝나면 저장과 히스토리에 반영되지 않습니다.
그래서 이벤트를 만들 때마다 먼저 질문했습니다.

- 이 이벤트는 결과물을 바꾸는가?
- 다시 열었을 때 유지되어야 하는가?
- undo/redo 대상인가?
- 저장 버튼 활성화 조건에 포함되는가?

네 가지 질문 중 하나라도 “그렇다”에 가까우면 문서 상태를 바꾸는 흐름으로 다뤘습니다.

## 복사와 붙여넣기

상태 경계를 나눈 효과는 복사/붙여넣기에서 특히 분명했습니다.
복사는 선택된 도형을 기준으로 하지만, 복사되는 데이터에는 선택 상태가 들어가면 안 됩니다.
도형 데이터만 복사하면 선택 상태가 같이 딸려가지 않습니다.

```ts
function copySelectedShapes() {
  const selected = documentState.shapes.filter((shape) =>
    editorState.selectedIds.includes(shape.id)
  );

  clipboard.value = selected.map(stripEditorOnlyFields);
}
```

편집 전용 필드를 걸러내는 대신, 복사 시점에 새 id를 붙여 도형 데이터만 담는 방식도 가능합니다.

```ts
clipboard = selected.map((shape) => ({
  ...shape,
  id: createId(),
}));
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

복사할 때는 편집 상태를 읽지만, 복사되는 값은 문서 데이터입니다.
붙여넣기 후 선택 상태는 새롭게 계산됩니다.
문서 데이터와 UI 상태가 섞여 있었다면 복사된 도형의 `selected: true`가 그대로 남아 예상하지 못한 선택 상태를 만들었을 것입니다.

## 정리

편집기에서 모든 상태를 하나의 객체에 넣으면 초기 구현은 빨라집니다.
하지만 저장, 히스토리, 복사/붙여넣기, 협업 구조까지 생각하면 문서 상태와 편집 상태를 나눠야 했습니다.
상태를 나눌 때는 이름보다 얼마나 오래 유지되는지를 봤습니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- 저장 파일에 들어갈 수 있으면 문서 상태로 두고, 도형 객체에는 결과물에 필요한 데이터만 둔다.
- 선택, hover, drag, resize session, activeTool은 편집 상태로 둔다.
- 렌더링 시점에 두 상태를 조합하고, 선택 여부는 파생값으로 계산한다.
- 저장과 히스토리는 문서 상태만 대상으로 하고, 복원 후 UI 임시 상태는 초기화한다.
- 이벤트 핸들러는 결과물을 바꾸는지 먼저 판단한다.

[MathCanvas 프로젝트](/projects/mathcanvas)에서는 2D SVG 교구와 3D 교구에 같은 기준을 적용했습니다.
