---
title: "Three.js 카메라 상태 저장"
date: "2025-07-24"
updated: "2026-05-29"
description: "cloneDeep으로 저장한 Three.js 카메라가 컴포넌트 재생성 후 복원되지 않던 문제를 position, quaternion, zoom 값만 저장하는 방식으로 고친 기록입니다."
image: "/images/posts/svg-editor/three-js-camera-state/cover-og.png"
tags: ["Three.js", "WebGL", "Camera", "State"]
featured: true
---

# Three.js 카메라 상태 저장과 복원

## 1. 문제 상황

당시 진행하던 프로젝트에서 3D 수학 교구를 제작하고 있었습니다.
3D 환경을 하나의 객체로 만들고, 카메라 위치·각도·확대 상태를 저장해 두었다가 복원하거나 undo/redo에 사용했습니다.

이때 3D 환경을 저장한 상위 객체의 카메라 객체(camera)에 `Lodash`의 `딥클론(cloneDeep)`을 사용해서 카메라 상태를 저장했는데, 컴포넌트 언마운트 후 재생성하는 상황에서 상태가 사라져 카메라 위치가 제대로 복원되지 않는 문제가 발생했습니다.

## 2. 원인 분석

- Three.js의 Camera 객체는 단순한 데이터 덩어리가 아닙니다. 내부적으로 WebGL 렌더링 상태, 컨트롤, 디스플레이와 연결된 다양한 참조와 메서드를 가집니다.
- 일반적인 깊은 복사(예: Lodash의 \_.cloneDeep), 혹은 JSON 직렬화로 camera 객체 전체를 복제하면 prototype, getter/setter, 내부 참조 등 중요한 정보가 유실됩니다.
- 커스텀 HTMLElement, React/Vue 컴포넌트 등에서 camera를 인스턴스 내부 프로퍼티로 저장할 경우, 컴포넌트 언마운트, 리렌더링, 히스토리 복원 등에서 camera 상태가 보존되지 않습니다.

## 3. 해결책

상위 plain object(데이터 모델)에 camera의 상태값만 저장하고, 복원할 때는 이 값을 camera 객체에 직접 할당했습니다.

![Three.js 카메라 객체 전체를 복사하지 않고 position quaternion zoom 같은 순수 cameraState만 저장한 뒤 camera에 수동 복원하는 구조](/images/posts/svg-editor/three-js-camera-state/body-01.png)

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

## 4. 값만 저장한 이유

camera 객체는 WebGL 렌더링 상태나 컨트롤과 연결된 내부 참조를 갖고 있어서, cloneDeep으로 복사해 두어도 컴포넌트가 다시 만들어진 뒤에는 시점이 복원되지 않았습니다.
camera 객체를 통째로 저장하면 내부 참조까지 함께 복사되므로 값만 따로 저장했습니다.

cameraState에는 position, quaternion, zoom, left, right, top, bottom, near, far 값만 들어 있습니다.
숫자 값뿐이라 JSON으로 저장하거나 Pinia 히스토리에 그대로 넣을 수 있습니다.

## 5. 결과

복원할 때는 저장한 값을 camera에 다시 넣고 `updateProjectionMatrix()`를 호출합니다.
이렇게 바꾼 뒤에는 컴포넌트가 다시 만들어져도 저장한 값으로 카메라 시점을 복원할 수 있었습니다.
