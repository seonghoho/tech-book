---
title: "SVG 에디터 undo/redo 스냅샷 설계"
date: "2026-05-11"
updated: "2026-05-11"
description: "SVG 편집기에서 히스토리를 안정적으로 관리하기 위해 전체 객체 대신 직렬화 가능한 스냅샷을 저장한 과정입니다."
tags: ["SVG", "State", "History", "Architecture"]
featured: true
---

# SVG 에디터 undo/redo 스냅샷 설계

## 문제 상황

SVG 에디터에는 도형 생성, 이동, 크기 변경, 스타일 수정처럼 되돌릴 수 있어야 하는 작업이 많습니다.
처음에는 변경이 일어날 때마다 현재 객체 배열을 그대로 히스토리에 넣는 방식으로 접근했습니다.

```ts
history.push(shapes);
```

하지만 이 방식은 금방 문제가 드러났습니다.
배열만 새로 저장했을 뿐 내부 도형 객체는 같은 참조를 공유하고 있었기 때문입니다.
이후 도형을 수정하면 과거 히스토리까지 같이 바뀌는 문제가 발생했습니다.

다음 단계로 깊은 복사를 적용했습니다.

```ts
history.push(structuredClone(shapes));
```

단순한 도형 데이터만 있을 때는 괜찮았습니다.
하지만 클래스 인스턴스, 메서드, 임시 선택 상태, DOM 참조가 섞이기 시작하면 히스토리가 불안정해졌습니다.
복원 후 메서드가 사라지거나, 현재 선택 상태까지 과거 상태로 되돌아가면서 UI가 꼬이는 문제가 생겼습니다.

## 히스토리에 저장할 것과 저장하지 않을 것

해결의 핵심은 “에디터 상태 전체”가 아니라 “문서 상태”만 저장하는 것이었습니다.
undo/redo의 대상은 사용자가 만든 결과물이지, 현재 UI의 모든 임시 상태가 아닙니다.

그래서 상태를 두 종류로 나눴습니다.

| 구분 | 예시 | 히스토리 저장 여부 |
| --- | --- | --- |
| 문서 상태 | 도형 좌표, path, 색상, stroke, z-index | 저장 |
| UI 상태 | hover, selectedId, dragState, openedPanel | 저장하지 않음 |
| 런타임 참조 | SVGElement, ResizeObserver, class instance | 저장하지 않음 |

이 기준을 정하면 히스토리 구조가 단순해집니다.
저장해야 하는 데이터는 JSON으로 표현 가능한 plain object여야 합니다.

## 스냅샷 타입 정의

도형 클래스 전체를 저장하지 않고, 복원 가능한 순수 데이터만 별도 타입으로 정의했습니다.

```ts
type ShapeSnapshot = {
  id: string;
  type: "line" | "rect" | "circle" | "path";
  points: Array<[number, number]>;
  style: {
    stroke: string;
    strokeWidth: number;
    fill: string;
    opacity: number;
  };
  order: number;
};

type DocumentSnapshot = {
  version: 1;
  shapes: ShapeSnapshot[];
};
```

`version`을 둔 이유는 이후 데이터 구조가 바뀌었을 때 migration 지점을 만들기 위해서입니다.
지금 당장은 과해 보일 수 있지만, 저장 파일이나 localStorage와 연결될 가능성이 있으면 버전 필드는 저렴한 안전장치가 됩니다.

## 저장 시점 제어

모든 `pointermove`마다 히스토리를 저장하면 undo 한 번에 1px씩만 되돌아가는 문제가 생깁니다.
사용자 관점에서 하나의 드래그는 하나의 작업입니다.

그래서 히스토리 저장 시점을 아래처럼 제한했습니다.

- 도형 생성 완료 시점
- 드래그 종료 시점
- 리사이즈 종료 시점
- 스타일 패널에서 값 확정 시점
- 삭제 또는 복제 같은 명령 실행 직후

포인터 이동 중에는 현재 문서 상태만 갱신하고, `pointerup`에서 최종 상태를 한 번만 기록합니다.

```ts
function commitHistory(reason: HistoryReason) {
  const snapshot = createDocumentSnapshot(editorState.shapes);

  undoStack.push({
    reason,
    snapshot,
    createdAt: Date.now(),
  });

  redoStack.length = 0;
}
```

새 작업이 커밋되면 redo stack은 비워야 합니다.
과거로 이동한 뒤 새로운 편집을 시작하면 기존 redo 경로는 더 이상 현재 문서의 미래가 아니기 때문입니다.

## 복원 로직

복원할 때도 스냅샷을 그대로 화면 객체로 쓰지 않았습니다.
스냅샷은 저장 포맷이고, 런타임 모델은 에디터가 조작하기 좋은 형태여야 합니다.

```ts
function restoreSnapshot(snapshot: DocumentSnapshot) {
  editorState.shapes = snapshot.shapes.map((shape) => createShapeFromSnapshot(shape));
  editorState.selectedIds = [];
  editorState.dragState = null;
}
```

복원 후 선택 상태를 비우는 것도 중요했습니다.
삭제된 도형 ID가 선택 상태에 남아 있거나, 이전 도형의 핸들이 그대로 보이는 문제를 막기 위해서입니다.
문서 상태는 복원하지만 UI의 임시 상태는 현재 문서에 맞게 초기화합니다.

## 중복 스냅샷 방지

같은 상태가 연속으로 저장되면 히스토리 품질이 떨어집니다.
예를 들어 클릭만 하고 아무 것도 움직이지 않았는데 스냅샷이 쌓이면 undo가 동작하지 않는 것처럼 느껴집니다.

그래서 저장 직전에 이전 스냅샷과 비교했습니다.

```ts
function shouldCommit(next: DocumentSnapshot) {
  const prev = undoStack.at(-1)?.snapshot;
  if (!prev) return true;

  return JSON.stringify(prev) !== JSON.stringify(next);
}
```

큰 문서에서는 매번 stringify하는 방식이 부담될 수 있습니다.
하지만 초기 규모에서는 구현이 단순하고 실수를 줄일 수 있어 충분했습니다.
문서 크기가 커진 뒤에는 shape 단위 revision이나 hash로 바꾸는 편이 낫습니다.

## 정리

undo/redo는 단순히 배열을 저장하는 기능이 아닙니다.
무엇을 되돌릴 것인지 경계를 먼저 정해야 안정적으로 동작합니다.

이번 구현에서 얻은 기준은 다음과 같습니다.

- 히스토리에는 문서 상태만 저장한다.
- DOM 참조, 선택 상태, 드래그 상태는 저장하지 않는다.
- 클래스 인스턴스 대신 직렬화 가능한 스냅샷을 저장한다.
- 드래그 중이 아니라 작업 완료 시점에 커밋한다.
- 새 작업이 들어오면 redo stack을 비운다.
- 복원 후 UI 임시 상태는 현재 문서 기준으로 초기화한다.

이 방식은 [Three.js 카메라 상태 저장](/posts/svg-editor/three-js-camera-state)에서 정리한 원칙과도 비슷합니다.
런타임 객체를 통째로 저장하는 대신, 복원에 필요한 최소 상태만 plain object로 관리하는 것이 장기적으로 더 안전합니다.
