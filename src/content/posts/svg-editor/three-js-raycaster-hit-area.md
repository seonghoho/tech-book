---
title: "Three.js Raycaster 선택 영역 넓히기"
date: "2025-08-14"
updated: "2026-05-27"
description: "얇은 3D 선과 작은 핸들이 Raycaster에 잘 잡히지 않는 문제를 보이지 않는 hit mesh로 해결합니다."
image: "/images/posts/svg-editor/three-js-raycaster-hit-area/cover-og.png"
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
이 문제는 [MathCanvas 프로젝트](/projects/mathcanvas)의 3D 수학교구를 편집 가능한 도구로 만들면서 중요해졌습니다.
단순히 모델을 보여주는 화면이라면 선이 얇아도 괜찮습니다.
하지만 사용자가 그 선을 클릭해서 선택하고, 핸들을 잡아 이동하고, 특정 edge를 기준으로 작업해야 한다면 시각적 두께와 선택 가능한 두께를 분리해야 합니다.

처음에는 사용자가 정확히 클릭하면 된다고 생각하기 쉽습니다.
하지만 3D 화면에서는 같은 1px 선이라도 카메라 거리와 각도에 따라 체감 난이도가 달라집니다.
특히 태블릿이나 터치 환경에서는 마우스보다 입력 지점이 넓고 정밀도가 낮기 때문에, 렌더링 객체만 Raycaster 대상으로 삼으면 조작 실패가 반복됩니다.
편집 도구에서 선택 실패는 작은 불편이 아니라 사용자가 도구를 신뢰하지 못하게 만드는 문제였습니다.

## 해결 방향

렌더링용 객체와 선택용 객체를 분리했습니다.
사용자에게 보이는 mesh는 그대로 두고, Raycaster에는 보이지 않는 hit mesh를 추가하는 방식입니다.

![Three.js Raycaster에서 보이는 렌더링 객체와 투명 hit mesh를 분리해 선택 영역을 넓히는 구조](/images/posts/svg-editor/three-js-raycaster-hit-area/body-01.png)

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

이때 중요한 것은 hit mesh를 렌더링 객체의 자식으로 둘지, 별도 그룹에서 관리할지입니다.
렌더링 객체와 함께 이동해야 하는 경우에는 같은 group에 넣는 편이 안전합니다.
그래야 도형 이동, 회전, 삭제 시 hit mesh도 같은 생명주기를 따릅니다.
반대로 Raycaster 검사 성능이나 디버깅을 위해서는 `pickableObjects` 배열에 hit mesh만 따로 등록해두는 것이 좋습니다.
저는 두 방식을 함께 사용했습니다.
scene 구조상으로는 같은 group에 묶고, Raycaster 대상으로는 hit mesh만 별도 배열에 등록했습니다.

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

## 실패했던 접근

가장 먼저 시도한 것은 Raycaster threshold 값을 조정하는 방식이었습니다.
Three.js의 `Raycaster.params.Line.threshold`를 키우면 선 선택이 쉬워질 것처럼 보입니다.
하지만 이 값은 모든 라인 선택에 일괄 적용되기 때문에, 특정 도구나 특정 거리에서만 선택 영역을 다르게 가져가기가 어렵습니다.
또한 실제 렌더링을 `Line`이 아니라 `Mesh` 기반 edge로 바꾼 경우에는 같은 방식으로 제어하기 어렵습니다.

두 번째로는 보이는 선 자체를 굵게 만드는 방법을 검토했습니다.
이 방법은 선택 문제는 줄이지만, 수학교구 화면에서는 정보량이 과해집니다.
좌표축, 보조선, 모서리, 핸들이 모두 굵어지면 도형 구조를 읽기 어려워지고, 실제 교구보다 편집 UI가 더 튀어 보입니다.
선택 편의성 때문에 시각 표현을 희생하는 것은 맞지 않았습니다.

세 번째로는 scene 전체를 Raycaster 대상으로 두고, 클릭 후 결과를 필터링하는 방식이었습니다.
작은 예제에서는 충분하지만, 교구가 늘어나면 불필요한 객체까지 매번 검사하게 됩니다.
무엇보다 선택이 잘못됐을 때 원인이 불분명했습니다.
렌더링 객체가 먼저 잡힌 것인지, hit mesh가 등록되지 않은 것인지, 우선순위가 낮아서 밀린 것인지 구분하기 어려웠습니다.
그래서 선택 가능한 객체만 명시적으로 등록하고, `role`, `targetId`, `pickPriority`를 `userData`에 넣는 구조로 바꿨습니다.

## 검증 기준

수정 후에는 세 가지 상황을 기준으로 확인했습니다.

첫째, 카메라 거리를 바꿔도 edge 선택이 지나치게 어려워지지 않아야 합니다.
확대했을 때만 잘 잡히고, 축소하면 거의 잡히지 않는다면 실제 편집 도구로 사용하기 어렵습니다.
그래서 hit mesh의 반지름은 화면상 조작 가능성과 도형 간 오선택 가능성을 함께 보면서 조정했습니다.

둘째, 핸들과 edge가 겹친 경우 핸들이 우선 선택되어야 합니다.
사용자는 작은 조작점을 클릭할 때 해당 핸들이 선택될 것을 기대합니다.
따라서 `pickPriority`는 face보다 edge, edge보다 handle이 높도록 두었습니다.

셋째, 삭제나 복제 후 pickable 배열에 오래된 hit mesh가 남지 않아야 합니다.
렌더링 객체는 사라졌는데 hit mesh만 남아 있으면 화면에는 없는 객체가 선택되는 문제가 생깁니다.
그래서 객체 제거 시 group에서 제거하는 것과 pickable registry에서 제거하는 것을 같은 흐름으로 묶었습니다.

이 기준은 [Three.js LineGeometry 문제 해결](/posts/svg-editor/three-js-line-geometry-error)에서 정리한 cylinder edge 방식과도 연결됩니다.
렌더링 안정성과 선택 안정성은 다른 문제지만, 둘 다 “보이는 선 하나”를 실제로는 여러 역할의 객체로 나누어 다루는 접근이 필요했습니다.

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
