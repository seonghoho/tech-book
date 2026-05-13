---
title: "Three.js LineGeometry 문제 해결"
date: "2025-07-11"
updated: "2026-05-13"
description: "Three.js LineGeometry로 만든 선이 특정 시점에서 사라지는 문제를 CylinderGeometry 기반 edge로 우회한 과정을 정리합니다."
image: "/images/posts/svg-editor/three-js-line-geometry-error/cover-og.png"
tags: ["Three.js", "WebGL", "LineGeometry", "Troubleshooting"]
featured: true
---

## 1. 문제 상황

![Line Geometry 오류](/images/posts/svg-editor/three-js-line-geometry-error/body-01.png)

**Three.js** 다각형 전개도 모듈에서 내부 실선이 시점에 따라 간헐적으로 보이지 않는 문제가 발생했습니다.

기존에는 `LineGeometry` 와 `LineMaterial`을 사용해 선을 그렸습니다. 하지만 특정 각도에서 선이 전혀 렌더링되지 않는 문제가 반복적으로 나타났습니다.

이전에도 공간 좌표축을 `Line`으로만 제작했을 때 같은 문제가 있었고, 당시에는 **CylinderGeometry**를 사용해 해결한 경험이 있었습니다.

이 문제는 단순히 선 색상이나 카메라 위치를 바꾸는 것으로 해결되지 않았습니다. 같은 좌표를 쓰더라도 어떤 각도에서는 보이고, 어떤 각도에서는 사라졌습니다. 사용자는 모델을 회전하면서 도형의 내부 선을 기준으로 구조를 파악해야 했기 때문에, 선이 사라지는 순간 편집 화면의 신뢰도가 떨어졌습니다.

다각형 전개도 화면에서 edge는 장식 요소가 아닙니다. 사용자가 면의 경계, 접힘 기준, 선택 가능한 구조를 이해하는 핵심 정보입니다. 따라서 "대부분 보인다"가 아니라 "카메라가 어떤 방향이든 항상 보인다"가 요구사항이었습니다.

## 2. 원인 가설

정확한 내부 원인은 Three.js의 라인 렌더링 구현과 카메라/클리핑/해상도 처리 조건이 함께 영향을 주는 문제로 보았습니다. `LineGeometry`와 `LineMaterial`은 두께가 있는 선을 표현할 수 있지만, 화면 공간 기준으로 선 두께를 계산하는 과정에서 특정 시점이나 깊이 조건에서 기대와 다르게 보일 수 있습니다.

처음에는 아래 항목을 순서대로 의심했습니다.

- 카메라 near/far 값이 너무 좁아 선 일부가 clipping 되는지
- 선과 면이 같은 위치에 있어 z-fighting이 발생하는지
- `LineMaterial`의 `resolution` 값이 렌더 사이즈와 맞지 않는지
- 선 두께가 모델 스케일에 비해 너무 얇은지

각 항목을 조정해도 문제가 완전히 사라지지는 않았습니다. 그래서 라인을 "화면에 그려지는 선"으로 유지하기보다, 실제 3D 공간에 존재하는 얇은 mesh로 바꾸는 방향을 선택했습니다.

## 3. 해결 방법

문제가 발생한 선들을 `LineGeometry`에서 `CylinderGeometry`로 변경했습니다.

**CylinderGeometry**를 사용하면 얇은 원기둥 형태의 실체가 되기 때문에 어떤 시점에서도 안정적으로 보입니다.

Cylinder edge는 선처럼 보이지만 Three.js 입장에서는 일반 mesh입니다. 즉 카메라, 조명, 깊이 테스트, clipping 처리가 다른 모델과 같은 방식으로 적용됩니다. 이 방식은 `LineGeometry`보다 생성 비용이 크지만, 전개도 화면에서 edge 개수가 제한적이고 안정적인 표시가 더 중요했기 때문에 적절한 선택이었습니다.

이번 작업에서 정한 기준은 다음과 같습니다.

- 선은 두 점 사이를 잇는 원기둥 mesh로 만든다.
- 원기둥의 중심은 시작점과 끝점의 중간으로 둔다.
- 원기둥의 기본 방향은 y축이므로, edge 방향으로 quaternion을 회전시킨다.
- 폐곡선 여부에 따라 마지막 점과 첫 점을 연결할지 결정한다.
- edge 생성 로직은 삼각형, 사각형 등 여러 도형에서 재사용할 수 있게 함수로 분리한다.

## 4. 구현 코드

### 4-1. 꼭짓점 배열로 Cylinder Edge 추가 함수

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

핵심은 `edgeVec`와 `center` 계산입니다. 두 점을 빼면 edge가 향해야 할 방향과 길이를 얻을 수 있습니다. 원기둥 geometry는 기본적으로 y축 방향으로 서 있으므로, `setFromUnitVectors`를 사용해 y축을 edge 방향으로 회전시킵니다. 그 다음 중심점을 두 점의 중간으로 옮기면 시작점과 끝점 사이를 정확히 잇는 edge가 됩니다.

### 4-2. 꼭짓점 추출 함수

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

`BufferGeometry`에서 position attribute를 읽어 `Vector3` 배열로 바꾸는 함수입니다. 이 과정을 분리해 둔 이유는 edge 생성 함수가 geometry의 내부 구조를 몰라도 되게 만들기 위해서입니다. edge 생성 함수는 꼭짓점 배열만 받으면 되고, 꼭짓점을 어떻게 얻는지는 호출부에서 결정합니다.

### 4-3. ShapeGeometry 예시 적용

```ts
function createRectangleWithEdges() {
  const rectangle = new THREE.Mesh(rectangleGeometry, material);
  const vertices = getVerticesFromBufferGeometry(rectangleGeometry);
  addCylinderEdges(rectangle, vertices, true, edgeRadius, edgeMaterial);
  return rectangle;
}
```

실제 적용부에서는 면을 먼저 만들고, 같은 geometry에서 꼭짓점을 꺼내 edge를 추가했습니다. 이 방식은 rectangle뿐 아니라 triangle, polygon에도 같은 패턴으로 적용할 수 있습니다. 단, 복잡한 geometry에서는 중복 꼭짓점이나 인덱스 순서가 원하는 외곽선 순서와 다를 수 있으므로, 그런 경우에는 외곽선용 vertex 배열을 별도로 관리하는 편이 더 안전합니다.

## 5. 결과

![CylinderGeometry 사용한 결과](/images/posts/svg-editor/three-js-line-geometry-error/body-02.png)

`Line`으로 구현했던 선들이 **CylinderGeometry**로 대체되면서 시점에 상관없이 선이 항상 안정적으로 보이도록 수정되었습니다.

수정 후 확인한 기준은 다음과 같습니다.

- 모델을 좌우/상하로 회전해도 edge가 사라지지 않는지
- 면과 edge가 겹쳐 보일 때 깜빡임이 없는지
- zoom in/out 상태에서도 edge 두께가 과도하게 튀지 않는지
- 도형별 꼭짓점 연결 순서가 깨지지 않는지

`CylinderGeometry`로 바꾸면 선 두께가 화면 기준이 아니라 월드 좌표 기준으로 보입니다. 그래서 카메라 줌에 따라 상대적인 두께가 달라질 수 있습니다. 이 부분은 장단점이 있습니다. 화면 기준으로 항상 같은 두께를 유지해야 하는 UI 보조선에는 `LineMaterial`이 더 자연스러울 수 있지만, 3D 모델의 실제 경계처럼 항상 존재해야 하는 선에는 mesh 방식이 더 예측 가능했습니다.

## 6. 선택의 트레이드오프

이번 해결책은 `LineGeometry` 자체를 고치는 방식이 아닙니다. 렌더링 안정성을 위해 표현 방식을 바꾼 우회 전략입니다.

장점은 명확합니다.

- 일반 mesh처럼 렌더링되어 카메라 각도에 덜 민감하다.
- raycast, hover, 선택 영역 확장 같은 기능을 붙이기 쉽다.
- 삼각형/사각형/다각형 edge 생성 로직을 공통화할 수 있다.

단점도 있습니다.

- edge 하나마다 geometry와 mesh가 생기므로 오브젝트 수가 늘어난다.
- 월드 좌표 기준 두께라 카메라 거리별 시각 보정이 필요할 수 있다.
- 아주 많은 edge를 가진 모델에서는 성능 최적화가 필요하다.

현재 전개도 편집 화면에서는 edge 수가 제한적이고, 사용자가 구조를 안정적으로 보는 것이 더 중요했습니다. 그래서 성능 비용보다 렌더링 안정성을 우선했습니다. 만약 수천 개 edge를 동시에 렌더링해야 한다면 `InstancedMesh`나 병합 geometry를 추가로 고려하는 것이 맞습니다.

## 요약 정리

| 구분 | 설명                                 | 형식             |
| ---- | ------------------------------------ | ---------------- |
| 문제 | LineGeometry 선이 시점에 따라 사라짐 | 렌더링 오류      |
| 원인 | 화면 공간 기준 라인 렌더링의 불안정성 | LineMaterial     |
| 해결 | CylinderGeometry로 교체              | 원기둥 형태 실선 |
| 효과 | 어떤 시점에서도 선이 사라지지 않음   | 안정성 확보      |

## 주요 포인트

- **LineGeometry**는 시점에 따라 보이지 않을 수 있다.
- 항상 보여야 하는 3D edge는 **CylinderGeometry**로 대체하면 안정적이다.
- 꼭짓점 배열과 반복문으로 실선 생성 가능.
- 유지보수성과 재사용성을 높이기 위해 공통 함수로 분리한다.
- edge 개수가 많은 화면에서는 `InstancedMesh` 같은 최적화 전략을 함께 검토한다.
