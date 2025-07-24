---
title: "Three.js 카메라 상태 저장"
date: "2025-07-24"
description: "Three.js에서 카메라 상태 저장에 대해 알아봅니다."
---

# Three.js에서 카메라 상태 저장과 복원 — 안전한 관리 방법과 이유

## 1. 문제 상황

현재 진행중인 프로젝트에서 3D 수학 교구를 제작하고 있습니다.
Three.js로 3D 환경을 만들 때 단순히 한 컴포넌트에 렌더링하는 것으로 끝나는 것이 아닌, 3D 환경을 하나의 객체로 제작한 뒤, 카메라의 위치, 각도, 확대/축소 상태를 저장해두었다가 이전 상태로 복원하거나, 히스토리(undo/redo) 기능을 사용하곤 합니다.

이때 3D 환경을 저장한 상위 객체의 카메라 객체(camera)에 `Lodash`의 `딥클론(cloneDeep)`을 사용해서 카메라 상태를 저장했는데, 컴포넌트 언마운트 후 재생성하는 상황에서 상태가 사라져 카메라 위치가 제대로 복원되지 않는 문제가 발생했습니다.

## 2. 원인 분석

- Three.js의 Camera 객체는 단순한 데이터 덩어리가 아닙니다. 내부적으로 WebGL 렌더링 상태, 컨트롤, 디스플레이와 연결된 다양한 참조와 메서드를 가집니다.
- 일반적인 깊은 복사(예: Lodash의 \_.cloneDeep), 혹은 JSON 직렬화로 camera 객체 전체를 복제하면 prototype, getter/setter, 내부 참조 등 중요한 정보가 유실됩니다.
- 커스텀 HTMLElement, React/Vue 컴포넌트 등에서 camera를 인스턴스 내부 프로퍼티로 저장할 경우, 컴포넌트 언마운트, 리렌더링, 히스토리 복원 등에서 camera 상태가 보존되지 않습니다.

## 3. 해결책

### 핵심

항상 상위 plain object(데이터 모델)에 camera의 순수 상태값만 직접 저장하고, 복원 시에도 이 값만을 camera 객체에 수동 할당합니다.

### 저장할 경우

```jsx
// 카메라 상태를 plain object로 저장
item.cameraState = {
  position: camera.position.toArray(),
  quaternion: camera.quaternion.toArray(),
  zoom: camera.zoom,
  left: camera.left,
  right: camera.right,
  top: camera.top,
  bottom: camera.bottom,
  near: camera.near,
  far: camera.far,
};
```

### 복원할 경우

```jsx
// 복원 시 cameraState에서 값을 수동 할당
if (item.cameraState) {
  camera.position.fromArray(item.cameraState.position);
  camera.quaternion.fromArray(item.cameraState.quaternion);
  camera.zoom = item.cameraState.zoom;
  camera.left = item.cameraState.left;
  camera.right = item.cameraState.right;
  camera.top = item.cameraState.top;
  camera.bottom = item.cameraState.bottom;
  camera.near = item.cameraState.near;
  camera.far = item.cameraState.far;
  camera.updateProjectionMatrix();
}
```

## 4. 왜 이렇게 해야 할까

1. Three.js 카메라 객체는 순수 데이터가 아니라서, deepclone/직렬화/스토어에 직접 넣으면 내부 상태가 유실되거나 꼬일 수 있습니다.
2. 컴포넌트 환경에서는 인스턴스가 매번 새로 생성·파괴되므로, camera의 내부 참조 대신 plain object에 직접 저장해야 어떤 상황에서도 안정적으로 camera 상태를 복원할 수 있습니다.
3. 직접 저장한 cameraState는 JSON, Redux, Pinia 등 어떤 상태관리/히스토리에서도 안정적으로 다룰 수 있습니다.
4. camera 객체를 통째로 저장하면 참조 꼬임, 메모리 릭, WebGL 에러 등 불필요한 문제가 발생할 수 있으니 상태값만 분리해서 보관하는 것이 실전에서 가장 안전합니다.

## 5. 결과 및 장점

- 히스토리 저장/복원, 선택·조작 후에도 항상 원하는 카메라 시점으로 정확하게 복원할 수 있습니다.
- 프로젝트 구조가 바뀌거나, 여러 컴포넌트/객체에서 camera를 복사·재생성해도 상태가 유실되지 않습니다.
- 데이터 직렬화, 협업, 저장소 이동 등 다양한 상황에서 호환성과 신뢰성이 높아집니다.

## 6. 결론

Three.js에서 카메라의 상태를 상위 데이터 객체에 직접 cameraState로 저장하고, 복원 시에도 이 값을 명시적으로 camera에 할당하는 패턴을 적용하면 프로젝트 구조와 상관없이 카메라 시점을 항상 안전하게 유지할 수 있습니다.

---

이 방식은 실무 3D 프로젝트, 협업 도구, 다양한 프레임워크 환경에서 가장 예측 가능하고 확실한 방법입니다.

상태 동기화, 히스토리, undo/redo, 상태 복원 등 모든 측면에서 안정적으로 동작합니다.
