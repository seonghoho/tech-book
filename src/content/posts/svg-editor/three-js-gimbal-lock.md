---
title: "Three.js 좌표축 클릭 시 카메라 방향 꼬임 문제"
date: "2025-07-25"
updated: "2026-05-27"
description: "Three.js에서 좌표축 클릭 시 카메라 up vector와 lookAt 방향이 평행해져 화면이 뒤집히는 문제를 해결한 과정입니다."
image: "/images/posts/svg-editor/three-js-gimbal-lock/cover-og.png"
tags: ["Three.js", "WebGL", "Camera", "Math"]
---

# Three.js 공간좌표 좌표축 클릭 시 카메라 방향 꼬임 문제 (업벡터 이슈)

## 문제 상황: 축 클릭 시 카메라 시점이 비정상적으로 보임

수학 교구 제작하는 과정에서 Three.js를 사용해 좌표평면을 구현하고 있습니다.

3D 평면 위에 X, Y, Z축을 시각적으로 구현하고, 각 축을 클릭할 때마다 카메라 시점을 해당 축 방향에서 보는 기능을 개발하였습니다.

축 클릭 이벤트마다 아래와 같이 카메라의 위치와 LookAt을 지정하는 로직을 작성하였습니다.

```jsx
const CAMERA_EPSILON = 0.00001;

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

![Three.js 공간좌표 좌표축 예시](/images/posts/svg-editor/three-js-gimbal-lock/body-01.png)

## 이상현상: Y축(Top) 시점에서 화면이 뒤집히거나, 컨트롤이 꼬임

- ‘front’ 또는 ‘side’ 축은 정상적으로 동작하였습니다.
- 하지만 ‘top’ 축, 즉 (0, 40, 0) 위치에서 원점을 바라보게 했을 때 **화면이 돌거나 뒤집히는 현상**이 발생하였습니다.
- OrbitControls에서 마우스를 움직이면 예상과 다른 방향으로 회전하거나, 화면 전체가 뒤집혀버렸습니다.

아래는 예상과 다른 위치로 이동한 시점입니다.
![Three.js 공간좌표 좌표축 이동 문제](/images/posts/svg-editor/three-js-gimbal-lock/body-02.png)

아래는 예상되는 위치로 이동한 시점입니다.
![Three.js 공간좌표 좌표축 이동 문제](/images/posts/svg-editor/three-js-gimbal-lock/body-03.png)

## 수치 실험: x, z축에 아주 작은 값(-0.00001) 추가해보기

문제 원인을 파악하기 위해 다양한 값을 시도해보던 중, x축 위치에 값을 추가했을 때 원하는 방향으로 회전한 다는 것을 알았고, 그 값을 줄일 수록 원하는 모습으로 이동하는 것을 알았습니다.

그런데 0을 입력하면 계속 같은 문제가 발생했고, 아주 작은 값을 추가하면 어떻게 될 지 시도했습니다.

```jsx
// 이전: camera.position.set(0, 2 * DIST, 0);
camera.position.set(-0.00001, 2 * DIST, 0); // x축에 미세값 추가
```

이렇게 변경 후, 더 이상 화면이 뒤집히지 않고 컨트롤도 정상적으로 동작하였습니다.

이 단계에서는 아직 해결책이라기보다 원인에 가까운 단서를 찾은 상태였습니다.
`-0.00001`이라는 값 자체가 특별한 의미를 가진 것은 아닙니다.
중요한 것은 카메라의 시선 방향이 기본 up vector와 완전히 같은 축에 놓이지 않도록 아주 작은 편차를 만든다는 점입니다.
즉, 이 값은 "정확히 위에서 내려다보는 카메라"를 "거의 위에서 내려다보는 카메라"로 바꿔주는 역할을 합니다.

실무 구현에서는 이런 미세값을 코드 곳곳에 직접 넣지 않는 편이 좋습니다.
숫자만 보면 왜 필요한지 알기 어렵고, 나중에 누군가 0으로 되돌릴 가능성이 큽니다.
그래서 최종 구현에서는 `CAMERA_EPSILON`처럼 의도를 드러내는 상수로 분리하는 방식이 더 안전합니다.

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
const CAMERA_EPSILON = 0.00001;

case 'top': // Y축 위에서 바라보는 경우
  targetPosition.set(-CAMERA_EPSILON, 2 * DIST, 0); // up vector와 시선 방향이 평행해지는 것을 방지
  break;
```

![Three.js 공간좌표 좌표축 이동 해결](/images/posts/svg-editor/three-js-gimbal-lock/body-04.png)

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
      targetPosition.set(-CAMERA_EPSILON, DIST, 0); // x축에 미세값
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

## 왜 camera.up을 바꾸지 않았는가?

다른 해결책으로는 `camera.up`을 축마다 바꾸는 방법도 있습니다.
예를 들어 top view에서는 up vector를 `(0, 0, -1)`처럼 바꾸면, 카메라가 위에서 원점을 바라보더라도 시선 방향과 up vector가 평행하지 않게 만들 수 있습니다.
수학적으로는 이 방법도 가능합니다.

하지만 이 프로젝트에서는 축 버튼을 누를 때마다 OrbitControls를 계속 사용해야 했습니다.
`camera.up`을 동적으로 바꾸면 현재 컨트롤 상태와 사용자가 기대하는 회전 방향까지 함께 바뀔 수 있습니다.
특히 사용자가 top, front, side를 빠르게 전환한 뒤 직접 드래그하면, 이전 시점의 up 기준이 남아 있는 것처럼 느껴질 수 있습니다.
그래서 전역 기준인 `camera.up`은 유지하고, top view의 target position만 아주 작게 보정하는 방식을 선택했습니다.

이 선택은 완벽한 수학 모델이라기보다 제품 동작의 안정성을 우선한 결정입니다.
사용자에게 중요한 것은 카메라가 정확히 수직축 위에 있는지보다, 축 버튼을 눌렀을 때 화면이 뒤집히지 않고 이후 컨트롤이 자연스럽게 이어지는지였습니다.

## 검증 기준

수정 후에는 세 가지 흐름을 확인했습니다.

첫째, 각 축 버튼을 단독으로 눌렀을 때 카메라가 의도한 방향으로 이동해야 합니다.
front, side, top 모두 원점을 바라보고, 좌표축 라벨이 화면에서 예측 가능한 방향으로 보여야 합니다.

둘째, 축 버튼을 연속으로 눌러도 화면 방향이 누적해서 틀어지지 않아야 합니다.
`top -> front -> top -> side`처럼 빠르게 전환하면 OrbitControls의 내부 상태가 꼬이기 쉽습니다.
그래서 `camera.position`, `camera.lookAt`, `controls.target`, `controls.update()` 순서를 고정했습니다.

셋째, 축 전환 후 사용자가 직접 마우스로 회전해도 컨트롤 방향이 자연스러워야 합니다.
이 문제는 버튼 클릭 순간보다 클릭 이후의 조작에서 더 잘 드러납니다.
top view로 이동한 뒤 드래그했을 때 화면이 갑자기 반대로 움직이면, 좌표축 보기 기능 전체의 신뢰도가 떨어집니다.

이 카메라 전환 문제는 [MathCanvas 프로젝트](/projects/mathcanvas)의 3D 수학교구 경험을 하나의 캔버스 흐름으로 맞추는 과정에서 나온 이슈였습니다.
2D SVG 도구와 3D Three.js 도구를 같은 서비스 경험으로 묶은 기준은 [2D SVG 교구와 3D Three.js 교구를 하나의 캔버스 경험으로 묶기](/posts/svg-editor/svg-threejs-canvas-experience)에서 이어서 정리했습니다.

## 참고 문서

- [Three.js 카메라 공식문서](https://threejs.org/docs/index.html?q=camera#api/en/cameras/Camera)
- [OrbitControls - three.js docs](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [Gimbal Lock - Wikipedia (EN)](https://en.wikipedia.org/wiki/Gimbal_lock)
