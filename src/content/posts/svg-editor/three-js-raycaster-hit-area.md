---
title: "Three.js 오브젝트 선택 디버깅: Raycaster 대상, hit area, 선택 우선순위 정리"
date: "2026-05-12"
updated: "2026-10-13"
description: "Three.js 편집 UI에서 얇은 선이 클릭되지 않거나 엉뚱한 객체가 선택되는 문제를 pickable registry, userData, 투명 hit mesh, 선택 우선순위, 생명주기 관리로 좁혀 간 과정입니다."
image: "/images/posts/svg-editor/three-js-raycaster-hit-area/cover-og.png"
tags: ["Three.js", "Raycaster", "Interaction", "UX", "Debugging"]
---

# Three.js 오브젝트 선택 디버깅: Raycaster 대상, hit area, 선택 우선순위 정리

> 2025년 8월에 진행한 작업을 2026년 5월에 정리한 기록입니다.

## 문제 상황

Three.js로 3D 교구를 만들 때 렌더링보다 더 까다로웠던 부분은 선택이었습니다.
화면에는 객체가 보이는데 클릭이 안 잡히거나, 분명히 꼭짓점을 눌렀는데 면이 선택되는 문제가 반복됐습니다.
특히 수학교구처럼 선, 면, 라벨, 핸들이 한 공간에 모여 있는 UI에서는 선택 실패가 곧 사용성 문제로 이어졌습니다.

이 문제는 [MathCanvas 프로젝트](/projects/mathcanvas)의 3D 수학교구를 편집 가능한 도구로 만들면서 중요해졌습니다.
사용자가 선을 클릭해 선택하고 핸들을 잡아 옮겨야 했기 때문에 얇은 선이 문제가 됐습니다.

처음에는 사용자가 정확히 클릭하면 된다고 생각하기 쉽습니다.
하지만 3D 공간에서는 카메라 거리, 투영 방식, 디바이스 픽셀 비율에 따라 사용자가 체감하는 클릭 영역이 크게 달라집니다.
같은 1px 선이라도 카메라 거리와 각도에 따라 체감 난이도가 다르고, 태블릿이나 터치 환경에서는 마우스보다 입력 지점이 넓고 정밀도가 낮습니다.

처음에는 렌더링되는 mesh 자체를 대상으로, Raycaster를 scene 전체에 적용했습니다.

```ts
raycaster.setFromCamera(pointer, camera);
const hits = raycaster.intersectObjects(scene.children, true);
const target = hits[0]?.object;
```

작은 예제에서는 이 방식이 충분합니다.
하지만 편집 도구에서는 곧 다음 문제가 반복됐습니다.

- 선이 얇으면 클릭이 잘 되지 않음
- 카메라가 멀어질수록 핸들 선택이 어려움
- 투명하거나 작은 handle이 거리 기준에서 밀림
- 시각적으로 겹친 객체 중 의도하지 않은 객체가 먼저 잡힘
- 보조선이나 라벨처럼 선택되면 안 되는 객체가 먼저 잡힘
- 삭제된 객체의 선택 정보가 남음
- 모바일 터치에서는 거의 사용할 수 없는 수준이 됨
- 렌더링 구조와 편집 대상 구조가 달라 디버깅이 어려움

이 글은 이 문제들을 어떤 순서로 좁혔는지 정리한 것입니다.
가장 효과가 컸던 것은 보이는 객체와 선택용 객체를 나눈 것이었습니다.

## 먼저 시도했다가 버린 접근

가장 먼저 시도한 것은 Raycaster threshold 값을 조정하는 방식이었습니다.
Three.js의 `Raycaster.params.Line.threshold`를 키우면 선 선택이 쉬워질 것처럼 보입니다.
하지만 이 값은 모든 라인 선택에 일괄 적용되기 때문에, 특정 도구나 특정 거리에서만 선택 영역을 다르게 가져가기가 어렵습니다.
또한 실제 렌더링을 `Line`이 아니라 `Mesh` 기반 edge로 바꾼 경우에는 같은 방식으로 제어하기 어렵습니다.

두 번째로는 보이는 선 자체를 굵게 만드는 방법을 검토했습니다.
이 방법은 선택 문제는 줄이지만, 수학교구 화면에서는 정보량이 과해집니다.
좌표축, 보조선, 모서리, 핸들이 모두 굵어지면 도형 구조를 읽기 어려워지고, 실제 교구보다 편집 UI가 더 튀어 보입니다.
그래서 이 방법은 쓰지 않았습니다.

세 번째로는 앞의 코드처럼 scene 전체를 Raycaster 대상으로 두고, 클릭 후 결과를 필터링하는 방식이었습니다.
교구가 늘어나면 불필요한 객체까지 매번 검사하게 됩니다.
무엇보다 선택이 잘못됐을 때 원인이 불분명했습니다.
렌더링 객체가 먼저 잡힌 것인지, hit mesh가 등록되지 않은 것인지, 우선순위가 낮아서 밀린 것인지 구분하기 어려웠습니다.
그래서 선택 가능한 객체만 명시적으로 등록하고, 역할과 우선순위를 `userData`에 넣는 구조로 바꿨습니다.
아래는 그 구조를 만든 순서입니다.

## 1. Raycaster 대상을 pickable registry로 줄이기

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
선택이 안 되는 문제가 생겼을 때도 렌더링 객체 문제인지, hit area 등록 문제인지 분리해서 확인할 수 있습니다.

scene은 렌더링 트리이고, pickable registry는 편집 가능한 대상 목록입니다.
두 개를 같은 것으로 보면 편하지만, 편집 UI에서는 둘을 나눴습니다.

## 2. userData로 역할을 명시하기

Raycaster 결과는 `Object3D`입니다.
하지만 편집 도구에서 필요한 것은 "이 객체가 어떤 역할인지"입니다.
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

렌더링 구조가 바뀌어도 선택 결과는 같은 `targetId`로 처리됩니다.
화면에는 여러 mesh가 하나의 교구를 표현하더라도, 선택 결과는 하나의 `targetId`로 모을 수 있습니다.

## 3. 보이는 객체와 선택용 hit mesh 분리하기

렌더링 품질만 보면 얇은 선이 맞지만, 인터랙션 품질까지 생각하면 실제 hit area는 더 넓어야 했습니다.
그렇다고 보이는 객체를 모두 크게 만들면 교구의 시각적 밀도가 높아집니다.
그래서 시각적 두께와 선택 가능한 두께를 분리했습니다.
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

`hitLine`은 화면에 보이지 않지만 Raycaster에는 잡히도록 만듭니다.

```ts
const hitMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
```

`visible = false`를 사용하면 Raycaster 대상에서도 제외될 수 있으므로, 투명 재질을 사용하는 편이 낫습니다.

이때 중요한 것은 hit mesh를 렌더링 객체의 자식으로 둘지, 별도 그룹에서 관리할지입니다.
렌더링 객체와 함께 이동해야 하는 경우에는 같은 group에 넣었습니다.
그래야 도형 이동, 회전, 삭제 시 hit mesh도 같은 생명주기를 따릅니다.
반대로 Raycaster 검사 성능이나 디버깅을 위해서는 pickable registry에 hit mesh만 따로 등록해두는 것이 좋습니다.
저는 두 방식을 함께 사용했습니다.
scene 구조상으로는 같은 group에 묶고, Raycaster 대상으로는 hit mesh만 registry에 등록했습니다.

### 얇은 선의 hit area는 cylinder로

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
화면 표현과 조작 편의성을 따로 조절할 수 있는 셈입니다.

Three.js에서 "선 하나"라고 생각한 대상도 실제 구현에서는 렌더링 안정성, 선택 안정성, 디버깅 가능성을 위해 여러 객체로 나눠야 할 때가 많았습니다.

## 4. 거리순 대신 선택 우선순위 두기

Raycaster는 기본적으로 거리순으로 결과를 줍니다.
하지만 여러 객체가 겹쳐 있을 때 가장 가까운 객체가 항상 사용자의 의도와 일치하지는 않습니다.
면 위에 handle이 있고, 그 근처에 edge가 있다면 보통 handle이 우선되어야 합니다.

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

제가 사용한 기본 우선순위는 다음과 같았습니다.

- handle: 30
- edge: 20
- face: 10
- guide: 0

이 기준은 절대적인 정답은 아닙니다.
다만 한 번 기준을 정해두면 "왜 이 객체가 먼저 선택됐는가"를 설명할 수 있습니다.
핸들, edge, face처럼 선택 대상의 종류가 늘어날수록 이 우선순위가 중요해집니다.

## 5. 렌더링 객체와 hit mesh의 생명주기 함께 관리하기

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

## 6. 디버그 모드에서 hit area 보이게 하기

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

클릭이 안 잡히는 이유가 hit area가 너무 작아서인지, 위치가 어긋나서인지, registry에 등록되지 않아서인지 바로 볼 수 있었습니다.

## 수정 후 확인한 기준

수정 후에는 세 가지를 확인했습니다.

- 카메라 거리를 바꿔도 edge 선택이 지나치게 어려워지지 않는지
- 핸들과 edge가 겹친 경우 핸들이 먼저 선택되는지
- 삭제나 복제 후 pickable registry에 오래된 hit mesh가 남지 않는지

확대했을 때만 잘 잡히고 축소하면 거의 잡히지 않으면 편집 도구로 쓰기 어렵습니다.
그래서 hit mesh의 반지름은 화면상 조작 가능성과 도형 간 오선택 가능성을 함께 보면서 조정했습니다.

작은 조작점을 클릭하면 핸들이 선택되어야 해서, `pickPriority`는 face보다 edge, edge보다 handle이 높도록 두었습니다.

렌더링 객체는 사라졌는데 hit mesh만 남아 있으면 화면에는 없는 객체가 선택되는 문제가 생깁니다.
그래서 앞에서처럼 객체 제거 시 group에서 제거하는 것과 registry에서 제거하는 것을 같은 흐름으로 묶었습니다.

## 정리

scene 전체를 클릭 대상으로 삼으면 처음에는 편하지만, 편집 기능이 늘어날수록 문제를 추적하기 어려워집니다.
보이는 객체와 선택용 객체는 따로 두었습니다.

선택이 실패할 때 확인한 순서는 다음과 같습니다.

- scene 전체가 아니라 pickable registry를 Raycaster 대상으로 사용한다.
- `userData`에 role, targetId, targetType, pickPriority를 명시한다.
- 렌더링용 mesh와 hit mesh를 분리하고, hit mesh는 투명 재질로 두되 Raycaster 대상에는 포함한다.
- 얇은 선은 넓은 cylinder hit area를 별도로 만든다.
- 거리순만 믿지 말고 선택 우선순위로 정렬한다.
- 렌더링 객체와 hit mesh의 생명주기를 함께 관리한다.
- debug mode에서 hit area를 볼 수 있게 한다.

[MathCanvas 프로젝트](/projects/mathcanvas)의 3D 교구는 사용자가 직접 선택하고 편집하는 도구였습니다.
