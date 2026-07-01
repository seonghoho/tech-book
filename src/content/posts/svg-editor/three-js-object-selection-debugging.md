---
title: "Three.js 오브젝트 선택이 실패할 때 확인한 것들"
date: "2026-06-20"
updated: "2026-07-01"
description: "Three.js 편집 UI에서 클릭이 안 잡히거나 엉뚱한 객체가 선택되는 문제를 Raycaster 대상, hit mesh, userData, 선택 우선순위로 좁힌 과정입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["Three.js", "Raycaster", "Debugging", "Interaction"]
---

# Three.js 오브젝트 선택이 실패할 때 확인한 것들

## 문제 상황

Three.js로 3D 교구를 만들 때 렌더링보다 더 까다로웠던 부분은 선택이었습니다.
화면에는 객체가 보이는데 클릭이 안 잡히거나, 분명히 꼭짓점을 눌렀는데 면이 선택되는 문제가 반복됐습니다.
특히 수학교구처럼 선, 면, 라벨, 핸들이 한 공간에 모여 있는 UI에서는 선택 실패가 곧 사용성 문제로 이어졌습니다.

처음에는 Raycaster를 scene 전체에 적용했습니다.

```ts
raycaster.setFromCamera(pointer, camera);
const hits = raycaster.intersectObjects(scene.children, true);
const target = hits[0]?.object;
```

작은 예제에서는 이 방식이 충분합니다.
하지만 편집 도구에서는 곧 한계가 드러났습니다.

- 보조선이나 라벨처럼 선택되면 안 되는 객체가 먼저 잡힘
- 얇은 edge가 클릭되지 않음
- 투명하거나 작은 handle이 거리 기준에서 밀림
- 삭제된 객체의 선택 정보가 남음
- 렌더링 구조와 편집 대상 구조가 달라 디버깅이 어려움

이 문제는 [Three.js Raycaster 선택 영역 넓히기](/posts/svg-editor/three-js-raycaster-hit-area)에서 다룬 hit area 문제와 연결됩니다.
이번 글에서는 hit mesh 자체보다, 선택 실패가 생겼을 때 어떤 순서로 원인을 좁혔는지를 정리합니다.

## 1단계: Raycaster 대상부터 줄인다

가장 먼저 한 일은 scene 전체를 검사하지 않는 것이었습니다.
선택 가능한 객체만 별도 registry에 등록했습니다.

```ts
const pickableObjects = new Set<THREE.Object3D>();

function registerPickable(object: THREE.Object3D) {
  pickableObjects.add(object);
}

function unregisterPickable(object: THREE.Object3D) {
  pickableObjects.delete(object);
}
```

선택 시에는 이 객체들만 Raycaster에 넘깁니다.

```ts
function pick(pointer: THREE.Vector2) {
  raycaster.setFromCamera(pointer, camera);

  return raycaster.intersectObjects([...pickableObjects], true);
}
```

이 변화만으로 디버깅 난이도가 많이 낮아졌습니다.
선택되면 안 되는 객체가 잡히는 문제를 구조적으로 줄일 수 있었고, 어떤 객체가 선택 후보인지 명확히 볼 수 있었습니다.

scene은 렌더링 트리이고, pickable registry는 편집 가능한 대상 목록입니다.
두 개를 같은 것으로 보면 편하지만, 편집 UI에서는 분리하는 편이 더 안전했습니다.

## 2단계: userData로 역할을 명시한다

Raycaster 결과는 `Object3D`입니다.
하지만 편집 도구에서 필요한 것은 “이 객체가 어떤 역할인지”입니다.
렌더링용 mesh인지, 클릭 영역인지, handle인지, face인지 알아야 다음 행동을 결정할 수 있습니다.

그래서 선택 가능한 객체에는 `userData`를 명시적으로 넣었습니다.

```ts
hitMesh.userData = {
  role: "hit-area",
  targetId: shape.id,
  targetType: "edge",
  pickPriority: 20,
};
```

선택 결과를 처리할 때는 이 정보를 기준으로 해석합니다.

```ts
function resolveHit(hit: THREE.Intersection) {
  const { role, targetId, targetType } = hit.object.userData;

  if (role !== "hit-area" || !targetId) {
    return null;
  }

  return {
    id: targetId as string,
    type: targetType as "face" | "edge" | "handle",
  };
}
```

이 방식의 장점은 렌더링 구조가 바뀌어도 편집 대상의 의미를 유지할 수 있다는 점입니다.
화면에는 여러 mesh가 하나의 교구를 표현하더라도, 선택 결과는 하나의 `targetId`로 모을 수 있습니다.

## 3단계: 보이는 객체와 선택 객체를 분리한다

얇은 선이나 작은 handle은 사용자가 정확히 클릭하기 어렵습니다.
그렇다고 보이는 객체를 모두 크게 만들면 교구의 시각적 밀도가 높아집니다.
그래서 보이는 객체와 선택 객체를 분리했습니다.

```ts
const visibleEdge = createVisibleEdge(start, end);
const edgeHitArea = createEdgeHitArea(start, end);

edgeHitArea.material = transparentHitMaterial;
edgeHitArea.userData = {
  role: "hit-area",
  targetId: edgeId,
  targetType: "edge",
  pickPriority: 20,
};
```

이 구조에서는 화면 표현과 조작 편의성을 따로 조절할 수 있습니다.
보이는 edge는 얇게 유지하고, hit area만 넓힙니다.

이 접근은 [Three.js LineGeometry 문제 해결](/posts/svg-editor/three-js-line-geometry-error)에서 얻은 경험과도 이어집니다.
Three.js에서 “선 하나”라고 생각한 대상도 실제 구현에서는 렌더링 안정성, 선택 안정성, 디버깅 가능성을 위해 여러 객체로 나눠야 할 때가 많았습니다.

## 4단계: 선택 우선순위를 둔다

Raycaster는 기본적으로 거리순으로 결과를 줍니다.
하지만 편집 UI에서 거리순이 항상 사용자 의도와 같지는 않습니다.
면 위에 handle이 있고, 그 근처에 edge가 있다면 보통 handle이 우선되어야 합니다.

그래서 `pickPriority`를 기준으로 한 번 더 정렬했습니다.

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

제가 사용한 기본 우선순위는 다음과 같았습니다.

- handle: 30
- edge: 20
- face: 10
- guide: 0

이 기준은 절대적인 정답은 아닙니다.
다만 한 번 기준을 정해두면 “왜 이 객체가 먼저 선택됐는가”를 설명할 수 있습니다.
선택 문제는 감각적인 문제처럼 보이지만, 실제로는 일관된 우선순위 규칙이 필요했습니다.

## 5단계: 생명주기를 같이 관리한다

선택 실패 중 가장 헷갈렸던 문제는 화면에는 없는 객체가 선택되는 경우였습니다.
대부분 렌더링 객체는 제거됐지만 pickable registry에 hit mesh가 남아 있을 때 생겼습니다.

그래서 객체 생성과 제거를 같은 API 안에 묶었습니다.

```ts
function addEditableObject(group: THREE.Group, hitAreas: THREE.Object3D[]) {
  scene.add(group);
  hitAreas.forEach(registerPickable);

  return () => {
    scene.remove(group);
    hitAreas.forEach(unregisterPickable);
  };
}
```

편집 대상의 생명주기를 scene과 registry 양쪽에서 같이 관리해야 합니다.
한쪽만 제거하면 화면과 선택 상태가 어긋납니다.

이 문제는 SVG 에디터의 선택 상태 관리와도 비슷합니다.
문서에는 없는 객체가 선택 상태에 남으면 UI가 꼬입니다.
3D에서는 그 문제가 `Object3D`와 Raycaster registry 사이에서 발생했습니다.

## 디버깅용 시각화

hit mesh는 보통 투명합니다.
하지만 선택 문제가 생기면 투명한 것이 오히려 문제를 숨깁니다.
그래서 debug mode에서는 hit area를 반투명하게 보여주도록 했습니다.

```ts
function setHitAreaDebugVisible(visible: boolean) {
  pickableObjects.forEach((object) => {
    const material = (object as THREE.Mesh).material;
    if (!material || Array.isArray(material)) return;

    material.opacity = visible ? 0.18 : 0;
    material.transparent = true;
    material.needsUpdate = true;
  });
}
```

이 기능은 단순하지만 효과가 컸습니다.
클릭이 안 잡히는 이유가 hit area가 너무 작아서인지, 위치가 어긋나서인지, registry에 등록되지 않아서인지 바로 볼 수 있었습니다.

## 정리

Three.js 선택 문제를 해결할 때는 Raycaster 자체보다 주변 구조가 더 중요했습니다.
scene 전체를 클릭 대상으로 삼으면 처음에는 편하지만, 편집 기능이 늘어날수록 문제를 추적하기 어려워집니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- scene 전체가 아니라 pickable registry를 Raycaster 대상으로 사용한다.
- `userData`에 role, targetId, targetType, pickPriority를 명시한다.
- 보이는 객체와 선택용 hit mesh를 분리한다.
- 거리순만 믿지 말고 선택 우선순위를 둔다.
- 렌더링 객체와 hit mesh의 생명주기를 함께 관리한다.
- debug mode에서 hit area를 볼 수 있게 한다.

[MathCanvas 프로젝트](/projects/mathcanvas)의 3D 교구는 단순 뷰어가 아니라 편집 가능한 도구였습니다.
그래서 렌더링이 잘 되는지만큼 “사용자가 잡고 싶은 객체가 안정적으로 잡히는가”가 중요했습니다.
