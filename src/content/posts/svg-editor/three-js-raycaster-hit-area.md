---
title: "Three.js Raycaster 선택 영역 넓히기"
date: "2026-05-10"
updated: "2026-05-10"
description: "얇은 3D 선과 작은 핸들이 Raycaster에 잘 잡히지 않는 문제를 보이지 않는 hit mesh로 해결합니다."
tags: ["Three.js", "Raycaster", "Interaction", "UX"]
---

# Three.js Raycaster 선택 영역 넓히기

## 문제 상황

Three.js로 만든 편집 UI에서 얇은 선이나 작은 핸들을 클릭해야 하는 경우가 있습니다.
화면에는 충분히 보이지만 실제 클릭은 생각보다 어렵습니다.
특히 3D 공간에서는 카메라 거리, 투영 방식, 디바이스 픽셀 비율에 따라 사용자가 체감하는 클릭 영역이 크게 달라집니다.

처음에는 렌더링되는 mesh 자체를 Raycaster 대상으로 사용했습니다.

```ts
const intersects = raycaster.intersectObjects(scene.children, true);
const target = intersects[0]?.object;
```

하지만 다음 문제가 반복됐습니다.

- 선이 얇으면 클릭이 잘 되지 않음
- 카메라가 멀어질수록 핸들 선택이 어려움
- 시각적으로 겹친 객체 중 의도하지 않은 객체가 먼저 잡힘
- 모바일 터치에서는 거의 사용할 수 없는 수준이 됨

렌더링 품질만 보면 얇은 선이 맞지만, 인터랙션 품질까지 생각하면 실제 hit area는 더 넓어야 했습니다.

## 해결 방향

렌더링용 객체와 선택용 객체를 분리했습니다.
사용자에게 보이는 mesh는 그대로 두고, Raycaster에는 보이지 않는 hit mesh를 추가하는 방식입니다.

```ts
const visibleLine = createVisibleLine(start, end);
const hitLine = createHitLine(start, end);

hitLine.userData = {
  role: "hit-area",
  targetId: visibleLine.userData.id,
};

group.add(visibleLine);
group.add(hitLine);
```

핵심은 `hitLine`이 화면에 보이지 않지만 Raycaster에는 잡히도록 만드는 것입니다.

```ts
const hitMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
```

`visible = false`를 사용하면 Raycaster 대상에서도 제외될 수 있으므로, 투명 재질을 사용하는 편이 낫습니다.
필요하면 레이어나 별도 배열로 hit object만 관리해 Raycaster 검사 범위를 제한합니다.

## 선의 hit area 만들기

얇은 선은 `Line`보다 `CylinderGeometry`를 사용해 hit area를 만들기 좋습니다.
이미 [Three.js LineGeometry 문제 해결](/posts/svg-editor/three-js-line-geometry-error)에서 렌더링 안정성을 위해 cylinder edge를 사용한 경험이 있었고, 선택 영역에도 같은 접근을 적용했습니다.

```ts
function createCylinderBetweenPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 12),
    material
  );

  mesh.position.copy(center);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return mesh;
}
```

렌더링용 선의 반지름은 작게 두고, hit mesh의 반지름은 조금 더 크게 잡습니다.

```ts
const visibleEdge = createCylinderBetweenPoints(start, end, 0.01, visibleMaterial);
const hitEdge = createCylinderBetweenPoints(start, end, 0.08, hitMaterial);
```

이렇게 하면 화면에서는 얇은 선처럼 보이지만, 사용자는 여유 있는 선택 영역을 얻습니다.

## Raycaster 대상 분리

scene 전체를 대상으로 `intersectObjects`를 실행하면 불필요한 객체까지 검사하게 됩니다.
그래서 선택 가능한 객체만 별도 배열로 관리했습니다.

```ts
const pickableObjects: THREE.Object3D[] = [];

function registerPickable(object: THREE.Object3D) {
  pickableObjects.push(object);
}

function pick(event: PointerEvent) {
  const pointer = toNormalizedDeviceCoordinate(event);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(pickableObjects, true);
  const hit = hits.find((entry) => entry.object.userData.role === "hit-area");

  if (!hit) return null;

  return hit.object.userData.targetId as string;
}
```

이 구조는 디버깅에도 유리합니다.
선택이 안 되는 문제가 생겼을 때 렌더링 객체 문제인지, hit area 등록 문제인지 분리해서 확인할 수 있습니다.

## 선택 우선순위

여러 객체가 겹쳐 있을 때는 가장 가까운 객체가 항상 사용자의 의도와 일치하지 않습니다.
예를 들어 도형 면과 꼭짓점 핸들이 겹쳐 있다면 보통 핸들이 우선되어야 합니다.

그래서 `userData.pickPriority`를 두고 같은 지점에 걸린 객체를 한 번 더 정렬했습니다.

```ts
function getBestHit(hits: THREE.Intersection[]) {
  return hits
    .filter((hit) => hit.object.userData.role === "hit-area")
    .sort((a, b) => {
      const priorityA = a.object.userData.pickPriority ?? 0;
      const priorityB = b.object.userData.pickPriority ?? 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      return a.distance - b.distance;
    })[0];
}
```

핸들, edge, face처럼 선택 대상의 종류가 늘어날수록 이 우선순위가 중요해집니다.
단순히 “가장 가까운 것”만 고르면 편집 도구의 조작감이 떨어집니다.

## 정리

Raycaster를 사용할 때 보이는 객체와 선택 가능한 객체를 반드시 같게 둘 필요는 없습니다.
오히려 편집 도구에서는 두 레이어를 분리하는 편이 더 안정적입니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- 렌더링용 mesh와 hit mesh를 분리한다.
- hit mesh는 투명 재질로 두되 Raycaster 대상에는 포함한다.
- 얇은 선은 넓은 cylinder hit area를 별도로 만든다.
- 선택 가능한 객체만 배열로 관리해 검사 범위를 줄인다.
- 겹친 객체는 거리뿐 아니라 pick priority로 정렬한다.

사용자는 정확한 모델 구조보다 “잡고 싶은 것이 자연스럽게 잡히는지”를 먼저 느낍니다.
3D 편집 도구에서는 시각적 정밀함과 조작 편의성을 분리해서 설계하는 것이 중요합니다.
