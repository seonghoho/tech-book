---
title: "Three.js 좌표축 클릭 시 카메라 방향 꼬임 문제"
date: "2025-07-25"
description: "Three.js에서 카메라 방향 꼬임 문제를 해결하는 과정을 알아봅니다."
---

# Three.js 공간좌표 좌표축 클릭 시 카메라 방향 꼬임 문제 (업벡터 이슈)

## 문제 상황: 축 클릭 시 카메라 시점이 비정상적으로 보임

수학 교구 제작하는 과정에서 Three.js를 사용해 좌표평면을 구현하고 있습니다.

3D 평면 위에 X, Y, Z축을 시각적으로 구현하고, 각 축을 클릭할 때마다 카메라 시점을 해당 축 방향에서 보는 기능을 개발하였습니다.

축 클릭 이벤트마다 아래와 같이 카메라의 위치와 LookAt을 지정하는 로직을 작성하였습니다.

```jsx
function moveCameraToAxis(axis) {
  let DIST = 20;
  let targetPosition = new THREE.Vector3();
  let targetLookAt = new THREE.Vector3(0, 0, 0);

  switch (axis) {
    case "front": // Z+
      targetPosition.set(0, 0, DIST);
      break;
    case "top": // Y+
      targetPosition.set(0, DIST, 0);
      break;
    case "side": // X-
      targetPosition.set(-DIST, 0, 0);
      break;
  }
  camera.position.copy(targetPosition);
  camera.lookAt(targetLookAt);
  controls.target.copy(targetLookAt);
  controls.update();
}
```

기대했던 동작은 축을 클릭할 때마다 카메라가 그 방향에서 평면의 중심을 바라보는 것이었습니다.

![Three.js 공간좌표 좌표축 예시](/images/svg-editor/04_threejs-gimbal-lock-01.png)

## 이상현상: Y축(Top) 시점에서 화면이 뒤집히거나, 컨트롤이 꼬임

- ‘front’ 또는 ‘side’ 축은 정상적으로 동작하였습니다.
- 하지만 ‘top’ 축, 즉 (0, 40, 0) 위치에서 원점을 바라보게 했을 때 **화면이 돌거나 뒤집히는 현상**이 발생하였습니다.
- OrbitControls에서 마우스를 움직이면 예상과 다른 방향으로 회전하거나, 화면 전체가 뒤집혀버렸습니다.

아래는 예상과 다른 위치로 이동한 시점입니다.
![Three.js 공간좌표 좌표축 이동 문제](/images/svg-editor/04_threejs-gimbal-lock-02.png)

아래는 예상되는 위치로 이동한 시점입니다.
![Three.js 공간좌표 좌표축 이동 문제](/images/svg-editor/04_threejs-gimbal-lock-03.png)

## 수치 실험: x, z축에 아주 작은 값(-0.00001) 추가해보기

문제 원인을 파악하기 위해 다양한 값을 시도해보던 중, x축 위치에 값을 추가했을 때 원하는 방향으로 회전한 다는 것을 알았고, 그 값을 줄일 수록 원하는 모습으로 이동하는 것을 알았습니다.

그런데 0을 입력하면 계속 같은 문제가 발생했고, 아주 작은 값을 추가하면 어떻게 될 지 시도했습니다.

```jsx
// 이전: camera.position.set(0, 2 * DIST, 0);
camera.position.set(-0.00001, 2 * DIST, 0); // x축에 미세값 추가
```

이렇게 변경 후, 더 이상 화면이 뒤집히지 않고 컨트롤도 정상적으로 동작하였습니다.

## 원인 분석: 업벡터(up vector)와 시선 방향(lookAt)의 평행성 문제

Three.js의 카메라 시스템에서는 **카메라의 “업벡터(up)”**와 **카메라에서 “lookAt”으로 가는 방향**이 수학적으로 평행(또는 정반대)이 되면 행렬 연산 과정에서 방향성을 잃어버리거나, Gimbal Lock(짐벌락)으로 인해 “회전축 정보가 소실”되는 문제가 발생합니다.

기본적으로 카메라의 업벡터는 (0, 1, 0)입니다.

카메라가 (0, 40, 0) → (0, 0, 0)로 내려다볼 때,

- 시선 방향 역시 (0, -1, 0)
- 업벡터 (0, 1, 0)과 수직이 아닌, ‘정확히 평행’ 또는 ‘정반대’가 됨

이때 OrbitControls, trackball, 기타 회전 연산에서 “어느 방향이 위쪽(Up)인가”에 대한 기준이 모호해지고, 화면이 한쪽으로 뒤집히거나 컨트롤이 의도치 않은 축으로 동작하게 됩니다.

아주 작은 수라도 x, z값을 더해주면

1. 업벡터와 시선 방향이 평행하지 않게 되고
2. 내부적으로 외적(cross product) 연산이 정상적으로 동작하여

   시점 전환/컨트롤에서 꼬임이 없어집니다.

## 해결 방법 및 최종 코드

아래와 같이 Y축 위쪽 시점에서는 반드시 x, z 중 하나에 0이 아닌 미세값을 추가하는 것이 안정적입니다.

```jsx
case 'top': // Y축 위에서 바라보는 경우
  targetPosition.set(-0.00001, 2 * DIST, 0); // x축에 아주 작은 값 추가
  break;
```

![Three.js 공간좌표 좌표축 이동 해결](/images/svg-editor/04_threejs-gimbal-lock-04.png)

전체 코드는 다음과 같습니다.

```jsx
function moveCameraToAxis(axis) {
  let DIST = 20;
  let targetPosition = new THREE.Vector3();
  let targetLookAt = new THREE.Vector3(0, 0, 0);

  switch (axis) {
    case "front": // Z+
      targetPosition.set(0, 0, DIST);
      break;
    case "top": // Y+
      targetPosition.set(-0.00001, DIST, 0); // x축에 미세값
      break;
    case "side": // X-
      targetPosition.set(-DIST, 0, 0);
      break;
  }
  camera.position.copy(targetPosition);
  camera.lookAt(targetLookAt);
  controls.target.copy(targetLookAt);
  controls.update();
}
```

## 참고 문서

- [Three.js 카메라 공식문서](https://threejs.org/docs/index.html?q=camera#api/en/cameras/Camera)
- [OrbitControls - three.js docs](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [Gimbal Lock - Wikipedia (EN)](https://en.wikipedia.org/wiki/Gimbal_lock)
