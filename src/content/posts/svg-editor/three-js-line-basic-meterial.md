---
title: "Three.js 겨냥도 구현하기"
date: "2025-07-24"
updated: "2026-05-27"
description: "Three.js에서 직육면체의 겉 실선과 내부 점선을 분리해 겨냥도처럼 보이게 만든 렌더링 트러블슈팅입니다."
image: "/images/posts/svg-editor/three-js-line-basic-meterial/cover-og.png"
tags: ["Three.js", "WebGL", "Line", "Rendering"]
---

# Three.js에서 겨냥도 구현하기

**겉 실선·속 점선 렌더링 트러블슈팅**

> 목표: Three.js에서 직육면체의 **겉은 실선, 내부 투과되는 면은 점선**
> 겪게 되는 문제, 원인, 실제 해결방법, 중요 개념, 그리고 결과까지 단계별로 정리합니다.

## 1. 문제

![Three.js 겨냥도 구현 문제](/images/posts/svg-editor/three-js-line-basic-meterial/body-01.png)

- 원하는 결과:
  3D 직육면체의 겉은 **진한 실선**, 내부가 비칠 때는 **점선**만 보여서 “겨냥도”처럼 투명 박스 내부 구조가 한눈에 보이도록 하고 싶다.
- 실제 현상:
  - 겉 실선과 점선이 **겹쳐서** 보인다.
  - 박스 내부가 보여야 할 때도 **실선이 투과되어 내부에 남아** 점선이 깔끔하게 드러나지 않는다.
  - 렌더 순서·z값을 바꿔도 완전히 분리되지 않고, 움직일 때마다 겹침 현상이 생긴다.

이 문제는 [MathCanvas 프로젝트](/projects/mathcanvas)에서 3D 수학교구를 만들면서 마주친 렌더링 이슈였습니다.
수학 교구에서는 단순히 3D 물체가 예쁘게 보이는 것보다, 사용자가 입체 구조를 정확히 읽는 것이 더 중요합니다.
직육면체의 바깥쪽 모서리는 실선으로, 뒤쪽이나 내부에 해당하는 선은 점선으로 보여야 학습자가 도형의 앞뒤 관계를 빠르게 이해할 수 있습니다.

처음에는 `EdgesGeometry`를 하나만 만들고 material만 바꾸면 될 것이라고 생각했습니다.
하지만 같은 좌표에 실선과 점선을 동시에 올리는 순간, 카메라 각도에 따라 선이 겹치거나 깜빡였습니다.
화면을 정지해두면 괜찮아 보여도 OrbitControls로 회전하면 문제가 다시 드러났습니다.
이 기능은 사용자가 계속 회전하면서 확인하는 도구였기 때문에, 특정 각도에서만 정상인 구현은 사용할 수 없었습니다.

## 2. 문제 원인

### (1) Three.js의 Line 렌더링 한계

- LineBasicMaterial(실선), LineDashedMaterial(점선)은
  **WebGL 표준상 선(Line)은 면과 달리 ‘뒷면’만 숨기는 게 불가능**하다.
- **겹치는 위치(같은 좌표, 같은 Z-buf)에 여러 선이 그려지면 GPU가 어느 쪽을 보일지 보장하지 않는다.**

### (2) depthTest / depthWrite / transparent 설정의 의미

- **depthTest: true** → ‘내 시야에서 가까운 것’만 그린다.
- **depthWrite: true** → 깊이 버퍼(z-buffer)에 현재 그린 위치를 ‘기록’한다.
- **transparent: true** → 투명도 처리 시 GPU가 blending을 한다.

### (3) 동일 위치에서 실선/점선이 겹치면

**z-fighting(깊이 충돌)** 현상으로 실선과 점선이 계속 교차해서 겹쳐보이거나, 한쪽만 나올 때도 있음.

## 3. 해결 방법

### 겉 실선은 깊이 버퍼에만 남기고, 점선은 항상 위에서만(투과되는 내부만) 보이게 만들자.

---

### 실제 코드로 해결하는 단계

### 1) 실선(solid)은 깊이 버퍼에만 기록

- **depthTest: true**
- **depthWrite: true**
- **transparent: false**
- **renderOrder: 1**

```jsx
const createSolidOutlineBox = (min, max) => {
  const geometry = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(max.x - min.x, max.y - min.y, max.z - min.z)
  );
  const material = new THREE.LineBasicMaterial({
    color: 0xff0000,
    depthTest: true,
    depthWrite: true, // 깊이 버퍼에만 남김
    transparent: false,
    opacity: 1.0,
    linewidth: 2,
  });
  const outline = new THREE.LineSegments(geometry, material);
  outline.position.copy(min.clone().add(max).multiplyScalar(0.5));
  outline.renderOrder = 1;
  return outline;
};
```

### 2) 점선(dashed)은 깊이 판정 없이 항상 맨 위에

- **depthTest: false**
- **depthWrite: false**
- **transparent: true**
- **opacity: 0.9**
- **renderOrder: 99**

```jsx
const createDashedOutlineBox = (min, max) => {
  const geometry = new THREE.EdgesGeometry(
    new THREE.BoxGeometry(max.x - min.x, max.y - min.y, max.z - min.z)
  );
  const material = new THREE.LineDashedMaterial({
    color: 0xff0000,
    dashSize: 0.3, // 적당히 조절!
    gapSize: 0.2,
    depthTest: false, // 깊이 무시!
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
    linewidth: 2, // 대부분 브라우저에선 1px만 적용됨
  });
  const dashedOutline = new THREE.LineSegments(geometry, material);
  dashedOutline.computeLineDistances();
  dashedOutline.position.copy(min.clone().add(max).multiplyScalar(0.5));
  dashedOutline.renderOrder = 99; // 항상 위에!
  return dashedOutline;
};
```

### 3) group으로 함께 추가

```jsx
const group = new THREE.Group();
group.add(box, solidOutline, dashedOutline); // 순서 중요
return group;
```

### 실패했던 접근

가장 먼저 시도한 방법은 `renderOrder`만 조정하는 것이었습니다.
실선을 먼저 그리고 점선을 나중에 그리면 점선이 위에 올라올 것이라고 생각했습니다.
하지만 `renderOrder`는 렌더링 순서에 개입할 뿐, 깊이 테스트에서 이미 가려진 픽셀을 원하는 방식으로 다시 분리해주지는 않습니다.
같은 위치의 선이 겹치면 결국 z-buffer 조건과 material 설정이 함께 영향을 줍니다.

두 번째로는 실선과 점선의 좌표를 아주 조금 떨어뜨리는 방식을 시도했습니다.
예를 들어 내부 점선의 좌표를 `0.001` 정도 안쪽으로 밀어 넣는 방식입니다.
이 방법은 특정 박스 크기에서는 효과가 있었지만, 도형의 크기가 달라지면 간격이 눈에 보이거나 다시 겹침이 생겼습니다.
수학교구에서는 모서리 위치가 정확해야 하므로, 시각적 보정을 위해 실제 좌표를 흔드는 방식은 적합하지 않았습니다.

세 번째로는 면의 투명도를 더 낮춰 실선과 점선의 대비를 키우는 방식도 시도했습니다.
하지만 이 방법은 문제를 해결한 것이 아니라 겹침을 덜 눈에 띄게 만드는 것에 가까웠습니다.
선의 표시 규칙이 명확하지 않으면 사용자는 어느 선이 앞쪽이고 어느 선이 뒤쪽인지 계속 해석해야 합니다.
그래서 최종적으로는 실선, 점선, 반투명 면의 depth 설정을 명시적으로 나누는 쪽으로 정리했습니다.

## 4. 중요한 개념

### ① 겨냥도란?

> 겉은 실선, 내부는 점선(투과선)으로 표현하여 입체 구조를 명확히 보여주는 기하/수학 도면의 표기법

### ② Three.js의 선(Line) 렌더링 특징

- \*면(Mesh)\*\*처럼 FrontSide/BackSide 분리 불가
- 동일 위치의 여러 선이 있을 때는 항상 z-fighting 이슈가 생길 수 있음

### ③ depthTest와 depthWrite

- **depthTest**: 시야에서 ‘가장 가까운 것’만 그린다 (겹치는 선, 면 판정)
- **depthWrite**: 깊이 버퍼에 기록, 이후 렌더 순서에도 영향

### ④ renderOrder는 완벽하지 않음

- **renderOrder**는 ‘동일한 깊이’일 때만 강제 렌더 순서에 개입
- 겹치는 선이 정확히 같은 z 위치면, GPU가 무작위로 처리할 수 있음

## 5. 결과

![Three.js 겨냥도 구현 결과](/images/posts/svg-editor/three-js-line-basic-meterial/body-02.png)

- 겉 실선은 **정확히 박스 외곽**만 표시된다.
- **투명한 박스 안**을 볼 때, 내부에 있는 부분은 **점선만 남아 겨냥도처럼 보인다**.
- 점선이 실선과 겹쳐서 보이는 현상이 사라지고,
  카메라 시점이 바뀌거나 움직여도 겨냥도 효과가 계속 유지된다.

### 최종 구현 예시

```jsx
const group = new THREE.Group();
const min = new THREE.Vector3(...); // 점A
const max = new THREE.Vector3(...); // 점B

const solidOutline = createSolidOutlineBox(min, max);
const dashedOutline = createDashedOutlineBox(min, max);
const box = new THREE.Mesh(
  new THREE.BoxGeometry(max.x - min.x, max.y - min.y, max.z - min.z),
  new THREE.MeshStandardMaterial({
    color: 0xff6699,
    transparent: true,
    opacity: 0.5,
  })
);

group.add(box, solidOutline, dashedOutline);
scene.add(group);
```

## 6. 적용하면서 확인한 기준

이 구현은 단일 화면에서만 맞으면 부족했습니다.
실제 3D 교구에서는 카메라 회전, 확대/축소, 도형 크기 변경이 모두 일어나기 때문입니다.
그래서 결과 확인도 세 가지 상황으로 나눴습니다.

첫째, 정면에서 봤을 때 외곽 실선이 끊기지 않아야 합니다.
겨냥도는 내부 구조를 보여주기 위한 보조 표현이지만, 바깥 윤곽이 흐려지면 도형 자체가 불안정해 보입니다.
그래서 실선은 `depthTest`와 `depthWrite`를 유지해 기본적인 깊이 기준을 따르게 했습니다.

둘째, 회전 중에도 내부 점선이 실선과 섞여 보이지 않아야 합니다.
점선은 학습자가 보이지 않는 모서리를 인식하기 위한 정보입니다.
실선과 같은 강도로 겹치면 오히려 도형이 복잡해 보입니다.
그래서 점선은 `depthTest: false`, `depthWrite: false`로 두고, 투명도와 dash 간격으로 시각적 위계를 조정했습니다.

셋째, 면의 투명도와 선의 대비가 함께 맞아야 합니다.
면이 너무 진하면 내부 점선이 잘 보이지 않고, 너무 연하면 박스의 부피감이 사라집니다.
결국 geometry보다 material 조합이 사용자 이해에 더 큰 영향을 주는 부분이었습니다.
이 문제는 이후 [Three.js 3D 수학교구에서 depth buffer와 renderOrder로 정보 가림 문제 해결하기](/posts/svg-editor/three-js-depth-render-order)에서도 같은 기준으로 이어졌습니다.

## 7. 마치며

- Three.js에서 **겨냥도 스타일(겉 실선/속 점선) 구현은 depthTest, depthWrite, renderOrder를 적절히 조합해야만 한다**.
- 100% 완벽한 분리는 한계가 있지만,
  이 방식이 실제 겨냥도에 가장 가깝게 표현할 수 있는 실전 팁이다.
- 브라우저/WebGL 제한으로 선 두께(linewidth)는 대부분 1px로 고정되니, 시각적 구분은 색·투명도·dashSize로 조정하는 것이 현실적이다.

---

### 참고

- [Three.js Docs: LineBasicMaterial](https://threejs.org/docs/#api/en/materials/LineBasicMaterial)
- [Three.js Docs: LineDashedMaterial](https://threejs.org/docs/#api/en/materials/LineDashedMaterial)
