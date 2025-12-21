---
title: "Three.js 겨냥도 구현하기"
date: "2025-07-24"
updated: "2025-07-24"
description: "Three.js에서 겨냥도를 구현합니다."
image: "/images/svg-editor/03_threejs-line-meterial-01.png"
tags: ["Three.js", "WebGL", "Line", "Rendering"]
---

# Three.js에서 겨냥도 구현하기

**겉 실선·속 점선 렌더링 트러블슈팅**

> 목표: Three.js에서 직육면체의 **겉은 실선, 내부 투과되는 면은 점선**
> 겪게 되는 문제, 원인, 실제 해결방법, 중요 개념, 그리고 결과까지 단계별로 정리합니다.

## 1. 문제

![Three.js 겨냥도 구현 문제](/images/svg-editor/03_threejs-line-meterial-01.png)

- 원하는 결과:
  3D 직육면체의 겉은 **진한 실선**, 내부가 비칠 때는 **점선**만 보여서 “겨냥도”처럼 투명 박스 내부 구조가 한눈에 보이도록 하고 싶다.
- 실제 현상:
  - 겉 실선과 점선이 **겹쳐서** 보인다.
  - 박스 내부가 보여야 할 때도 **실선이 투과되어 내부에 남아** 점선이 깔끔하게 드러나지 않는다.
  - 렌더 순서·z값을 바꿔도 완전히 분리되지 않고, 움직일 때마다 겹침 현상이 생긴다.

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

![Three.js 겨냥도 구현 결과](/images/svg-editor/03_threejs-line-meterial-02.png)

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

## 마치며

- Three.js에서 **겨냥도 스타일(겉 실선/속 점선) 구현은 depthTest, depthWrite, renderOrder를 적절히 조합해야만 한다**.
- 100% 완벽한 분리는 한계가 있지만,
  이 방식이 실제 겨냥도에 가장 가깝게 표현할 수 있는 실전 팁이다.
- 브라우저/WebGL 제한으로 선 두께(linewidth)는 대부분 1px로 고정되니, 시각적 구분은 색·투명도·dashSize로 조정하는 것이 현실적이다.

---

### 참고

- [Three.js Docs: LineBasicMaterial](https://threejs.org/docs/#api/en/materials/LineBasicMaterial)
- [Three.js Docs: LineDashedMaterial](https://threejs.org/docs/#api/en/materials/LineDashedMaterial)
