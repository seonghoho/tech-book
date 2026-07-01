---
title: "SVG 에디터 인터랙션이 꼬일 때 디버깅한 순서"
date: "2026-06-19"
updated: "2026-07-01"
description: "SVG 에디터에서 drag, resize, keyboard 입력이 서로 간섭할 때 포인터 좌표, active tool, capture, 히스토리 기록 순서로 문제를 좁힌 경험입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["SVG", "PointerEvent", "KeyboardEvent", "Debugging"]
---

# SVG 에디터 인터랙션이 꼬일 때 디버깅한 순서

## 문제 상황

SVG 에디터의 인터랙션 문제는 대부분 “가끔 이상하다”는 형태로 나타납니다.
도형이 조금 늦게 따라오거나, resize 중에 선택이 풀리거나, 드래그가 끝났는데도 마우스를 따라오는 문제가 생깁니다.
사용자 입장에서는 단순히 버그지만, 구현하는 입장에서는 원인이 여러 층에 걸쳐 있습니다.

- 브라우저 좌표를 SVG 좌표로 변환하는 과정
- pointer capture 유무
- active tool 상태
- 선택 상태와 drag 상태의 순서
- keyboard modifier 처리
- 히스토리 기록 타이밍

처음에는 문제가 보이는 위치에서 바로 고치려고 했습니다.
resize가 이상하면 resize 함수만 보고, drag가 이상하면 move 함수만 보는 식이었습니다.
하지만 편집기 인터랙션은 여러 상태가 동시에 움직이기 때문에 증상 위치와 원인 위치가 다를 때가 많았습니다.

그래서 디버깅 순서를 정했습니다.
문제가 생기면 항상 아래 순서로 좁혔습니다.

1. 포인터 좌표가 맞는가
2. 이벤트 흐름이 끊기지 않았는가
3. 현재 tool과 mode가 맞는가
4. 선택 상태가 먼저 바뀌었는가
5. 문서 상태 변경과 히스토리 기록이 한 번만 일어났는가

## 1단계: 좌표 변환 확인

SVG 인터랙션에서 가장 먼저 확인할 것은 좌표입니다.
마우스 이벤트의 `clientX`, `clientY`는 브라우저 viewport 기준입니다.
하지만 도형을 이동시키려면 SVG 내부 좌표계로 바꿔야 합니다.

```ts
function toSvgPoint(event: PointerEvent, svg: SVGSVGElement) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const matrix = svg.getScreenCTM();
  if (!matrix) return null;

  return point.matrixTransform(matrix.inverse());
}
```

문제가 생겼을 때는 먼저 이 값부터 로그로 확인했습니다.

```ts
console.table({
  clientX: event.clientX,
  clientY: event.clientY,
  svgX: svgPoint.x,
  svgY: svgPoint.y,
});
```

좌표가 틀리면 이후 로직은 모두 정상이어도 결과가 틀어집니다.
특히 zoom, scroll, transform이 들어간 화면에서는 좌표 변환 문제를 먼저 배제해야 합니다.
이 내용은 [SVG 좌표 변환에서 포인터 위치가 어긋나는 문제](/posts/svg-editor/svg-pointer-coordinate-transform)에서 더 자세히 다뤘습니다.

## 2단계: pointer capture 확인

두 번째로 확인한 것은 이벤트가 끝까지 들어오는지였습니다.
드래그 중 포인터가 도형 밖으로 나가면 `pointermove`나 `pointerup`이 기대한 대상에 들어오지 않을 수 있습니다.
그러면 drag session이 종료되지 않고 남습니다.

```ts
function onPointerDown(event: PointerEvent) {
  const target = event.currentTarget as SVGElement;
  target.setPointerCapture(event.pointerId);
  startDrag(event);
}

function onPointerUp(event: PointerEvent) {
  const target = event.currentTarget as SVGElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  endDrag(event);
}
```

문제가 생겼을 때는 `pointerdown`, `pointermove`, `pointerup`, `pointercancel`이 같은 `pointerId`로 이어지는지 확인했습니다.

```ts
function logPointer(label: string, event: PointerEvent) {
  console.log(label, {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    buttons: event.buttons,
    target: (event.target as Element).tagName,
  });
}
```

`pointerup`이 누락되면 대부분 상태 정리가 되지 않습니다.
이때 resize나 drag 계산식을 고쳐도 문제가 해결되지 않습니다.
이벤트 흐름이 먼저 안정되어야 합니다.

## 3단계: active tool 확인

SVG 에디터에서는 같은 클릭이라도 현재 도구에 따라 의미가 달라집니다.
선택 도구에서는 도형 선택이고, 선 도구에서는 점 추가이며, 이동 모드에서는 pan일 수 있습니다.

그래서 이벤트 핸들러 안에서 현재 tool을 명시적으로 분기했습니다.

```ts
function handleCanvasPointerDown(event: PointerEvent) {
  switch (editorState.activeTool) {
    case "select":
      return startSelection(event);
    case "line":
      return appendLinePoint(event);
    case "pan":
      return startPan(event);
  }
}
```

디버깅할 때는 이벤트마다 `activeTool`, `selectedIds`, `dragSession`을 함께 찍었습니다.
단순히 포인터 좌표만 보면 정상인데, 실제로는 tool이 바뀌지 않아 다른 핸들러가 실행되는 경우가 있었습니다.

이 기준은 [SVG 캔버스에서 PointerEvent와 KeyboardEvent를 함께 제어한 이유](/posts/svg-editor/pointer-keyboard-event-flow)와도 연결됩니다.
포인터와 키보드는 따로 움직이는 것처럼 보이지만, 편집기 안에서는 하나의 인터랙션 상태를 공유해야 했습니다.

## 4단계: 선택과 drag 시작 순서

가장 자주 꼬인 부분은 선택과 drag 시작 순서였습니다.
사용자가 선택되지 않은 도형을 바로 드래그할 때, 먼저 선택을 바꾸고 그 다음 drag session을 만들어야 합니다.

```ts
function startShapeDrag(shapeId: string, point: Point) {
  if (!editorState.selectedIds.includes(shapeId)) {
    editorState.selectedIds = [shapeId];
  }

  editorState.dragSession = {
    targetIds: editorState.selectedIds,
    startPoint: point,
  };
}
```

순서가 반대면 문제가 생깁니다.
drag session을 먼저 만들면 이전 선택 목록을 기준으로 이동이 시작됩니다.
그 뒤 선택 상태가 바뀌면 화면에서는 새 도형이 선택된 것처럼 보이지만 실제 이동 대상은 이전 도형이 됩니다.

이런 종류의 버그는 화면만 보면 헷갈립니다.
그래서 drag 시작 시점에는 반드시 snapshot을 남겼습니다.

```ts
console.log("drag:start", {
  shapeId,
  selectedIds: [...editorState.selectedIds],
  startPoint: point,
});
```

## 5단계: 히스토리 기록 타이밍

마지막으로 확인한 것은 히스토리 기록 타이밍입니다.
드래그 중 `pointermove`마다 히스토리를 쌓으면 undo를 한 번 눌렀을 때 아주 조금만 되돌아갑니다.
반대로 `pointerup`에서만 기록하려고 하면 드래그 시작 전 상태를 잃기 쉽습니다.

제가 사용한 기준은 시작 시점에 이전 상태를 보관하고, 종료 시점에 한 번만 기록하는 방식입니다.

```ts
function startDrag(point: Point) {
  editorState.dragSession = {
    startPoint: point,
    before: cloneDocument(documentState),
  };
}

function endDrag() {
  const session = editorState.dragSession;
  if (!session) return;

  pushHistory({
    before: session.before,
    after: cloneDocument(documentState),
    reason: "move",
  });

  editorState.dragSession = null;
}
```

resize도 같은 기준을 적용했습니다.
계산은 `pointermove`마다 하지만, 히스토리에는 하나의 사용자 작업으로 들어가야 합니다.
이 내용은 [SVG 도형 리사이즈 핸들 제약 조건 정리](/posts/svg-editor/svg-resize-handle-constraint)와 [SVG 에디터 undo/redo 스냅샷 설계](/posts/svg-editor/svg-history-snapshot-undo-redo)의 중간 지점에 있는 문제였습니다.

## 디버깅 로그는 구조화한다

인터랙션 문제를 잡을 때 단순 문자열 로그는 금방 한계가 옵니다.
저는 이벤트 단계별로 같은 모양의 로그를 남기는 편이 더 도움이 됐습니다.

```ts
function debugInteraction(label: string, payload: Record<string, unknown>) {
  if (!isDebugMode) return;

  console.log(`[editor:${label}]`, {
    activeTool: editorState.activeTool,
    selectedIds: [...editorState.selectedIds],
    drag: editorState.dragSession?.targetIds,
    ...payload,
  });
}
```

이렇게 해두면 문제가 생겼을 때 “좌표 문제인지, tool 문제인지, 선택 순서 문제인지”를 한 화면에서 비교할 수 있습니다.
디버깅 로그도 기능 코드처럼 일관된 형식이 있어야 실제로 쓸 수 있었습니다.

## 정리

SVG 에디터 인터랙션 문제는 보이는 증상만 따라가면 오래 걸립니다.
좌표, 이벤트 흐름, tool 상태, 선택 순서, 히스토리 타이밍을 순서대로 확인하면 원인을 훨씬 빠르게 좁힐 수 있습니다.

이번 구현에서 사용한 디버깅 기준은 다음과 같습니다.

- 좌표 변환이 맞는지 먼저 확인한다.
- `pointerdown`부터 `pointerup`까지 같은 흐름으로 들어오는지 본다.
- 현재 active tool과 실행된 핸들러가 일치하는지 확인한다.
- 선택 상태를 갱신한 뒤 drag session을 만든다.
- 히스토리는 사용자 작업 단위로 한 번만 기록한다.
- 로그는 매번 같은 구조로 남긴다.

에디터는 단일 기능보다 상태 전이가 더 어렵습니다.
[MathCanvas 프로젝트](/projects/mathcanvas)에서 SVG 교구 편집 경험을 안정화하려면 계산식보다 먼저 이벤트 흐름을 예측 가능하게 만드는 일이 필요했습니다.
