---
title: "Three.js LineGeometry 시점 문제 해결"
date: "2024-12-20"
description: "LineGeometry로 만든 선이 시점에 따라 사라지는 문제를 CylinderGeometry로 교체해 해결한 사례입니다."
---

## 1. 문제 상황

![Line Geometry 오류](/public/images/svg-editor/02_threejs-line-geometry-01.png)

**Three.js** 다각형 전개도 모듈에서 내부 실선이 시점에 따라 간헐적으로 보이지 않는 문제가 발생했습니다.

기존에는 `LineGeometry` 와 `LineMaterial`을 사용해 선을 그렸습니다. 하지만 특정 각도에서 선이 전혀 렌더링되지 않는 문제가 반복적으로 나타났습니다.

이전에도 공간 좌표축을 `Line`으로만 제작했을 때 같은 문제가 있었고, 당시에는 **CylinderGeometry**를 사용해 해결한 경험이 있었습니다.

---

## 2. 해결 방법

문제가 발생한 선들을 `LineGeometry`에서 `CylinderGeometry`로 변경했습니다.

**CylinderGeometry**를 사용하면 얇은 원기둥 형태의 실체가 되기 때문에 어떤 시점에서도 안정적으로 보입니다.

---

## 3. 구현 코드

### 3-1. 꼭짓점 배열로 Cylinder Edge 추가 함수

```ts
/**
 * 지정한 꼭짓점 배열(vertexArray)에 따라 edge를 Cylinder로 추가
 * @param {THREE.Mesh} mesh - 테두리를 추가할 mesh (삼각형, 사각형 등)
 * @param {THREE.Vector3[]} vertexArray - 꼭짓점 배열 (순서대로 연결)
 * @param {boolean} closed - 마지막과 처음 연결할지 여부 (true: 폐곡선)
 * @param {number} edgeRadius - cylinder 반지름
 * @param {THREE.Material} edgeMaterial - cylinder 재질
 */
export const addCylinderEdges = (
  mesh: THREE.Mesh,
  vertexArray: THREE.Vector3[],
  closed: boolean,
  edgeRadius: number,
  edgeMaterial: THREE.Material
) => {
  const len = vertexArray.length;
  const loop = closed ? len : len - 1;
  for (let i = 0; i < loop; i++) {
    const start = vertexArray[i];
    const end = vertexArray[(i + 1) % len];
    const edgeVec = new THREE.Vector3().subVectors(end, start);
    const length = edgeVec.length();
    const center = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);

    const edge = new THREE.Mesh(
      new THREE.CylinderGeometry(edgeRadius, edgeRadius, length, 10),
      edgeMaterial
    );
    edge.position.copy(center);
    edge.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      edgeVec.clone().normalize()
    );
    mesh.add(edge);
  }
};
```

---

### 3-2. 꼭짓점 추출 함수

```ts
export const getVerticesFromBufferGeometry = (
  geometry: THREE.BufferGeometry
) => {
  const pos = geometry.attributes.position;
  const vertices = [];
  for (let i = 0; i < pos.count; i++) {
    vertices.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
  }
  return vertices;
};
```

---

### 3-3. ShapeGeometry 예시 적용

```ts
function createRectangleWithEdges() {
  const rectangle = new THREE.Mesh(rectangleGeometry, material);
  const vertices = getVerticesFromBufferGeometry(rectangleGeometry);
  addCylinderEdges(rectangle, vertices, true, edgeRadius, edgeMaterial);
  return rectangle;
}
```

---

## 4. 결과

![CylinderGeometry 사용한 결과](/public/images/svg-editor/02_threejs-line-geometry-02.png)

`Line`으로 구현했던 선들이 **CylinderGeometry**로 대체되면서 시점에 상관없이 선이 항상 안정적으로 보이도록 수정되었습니다.

---

## 요약 정리

| 구분 | 설명                                 | 형식             |
| ---- | ------------------------------------ | ---------------- |
| 문제 | LineGeometry 선이 시점에 따라 사라짐 | 렌더링 오류      |
| 원인 | Line 요소의 두께/렌더링 처리         | LineMaterial     |
| 해결 | CylinderGeometry로 교체              | 원기둥 형태 실선 |
| 효과 | 어떤 시점에서도 선이 사라지지 않음   | 안정성 확보      |

---

## 주요 포인트

- **LineGeometry**는 시점에 따라 보이지 않을 수 있다.
- **CylinderGeometry**로 대체하면 안정적이다.
- 꼭짓점 배열과 반복문으로 실선 생성 가능.
- 유지보수성과 재사용성을 높이기 위해 공통 함수로 분리한다.
