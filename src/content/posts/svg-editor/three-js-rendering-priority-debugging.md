---
title: "Three.js 3D 수학교구의 가림 문제를 depthTest, depthWrite, renderOrder로 정리한 기준"
date: "2026-07-01"
updated: "2026-10-13"
description: "Three.js 3D 수학교구에서 면, edge, 내부 점선, 축, 라벨, handle이 서로 가려질 때 객체 역할을 먼저 나누고 depthTest, depthWrite, renderOrder를 조합해 정보 위계를 잡은 디버깅 기준입니다."
image: "/images/projects/mathcanvas/cover-og.png"
tags: ["Three.js", "WebGL", "Rendering", "Debugging", "Troubleshooting"]
---

# Three.js 3D 수학교구의 가림 문제를 depthTest, depthWrite, renderOrder로 정리한 기준

## 보여야 할 정보가 가려지는 문제

Three.js로 3D 수학교구를 만들 때 단순히 물체를 그리는 것보다 더 까다로웠던 부분은 정보의 가독성이었습니다.
가장 자주 만난 시각 문제도 “보여야 할 것이 가려지는” 문제였습니다.
쌓기나무, 공간좌표, 입체도형처럼 여러 요소가 겹치는 화면에서는 블록, 좌표축, 숫자, 보조선이 함께 보입니다.
직육면체의 면, 모서리, 내부 점선, 좌표축, 숫자 라벨이 한 장면 안에 같이 들어오면 WebGL의 기본 depth 동작만으로는 원하는 정보 위계를 만들기 어렵습니다.

카메라 각도에 따라 중요한 정보가 가려졌고, 구체적으로는 이런 문제가 생겼습니다.

- 숫자 라벨이 도형 뒤로 숨어 읽히지 않음 (블록 뒤에 있는 축 숫자가 완전히 사라지기도 함)
- 보조선이 도형 표면에 묻히거나, 반대로 내부 점선이 면 위로 튀어나와 도형 구조가 어색해짐
- 좌표축이 도형에 가려져 방향 정보를 잃음
- edge가 면과 z-fighting처럼 깜빡이고, 라벨도 특정 각도에서 깜빡임
- 카메라 각도에 따라 같은 객체의 가시성이 달라짐

3D 공간에서는 가까운 물체가 먼 물체를 가리는 것이 자연스럽습니다.
하지만 수학교구에서는 항상 물리적으로 정확한 렌더링보다 “학습에 필요한 정보가 읽히는 것”이 더 중요할 때가 있습니다.

처음에는 `renderOrder` 값을 조금씩 바꾸며 맞췄습니다.
하지만 객체가 늘어나자 임시 조정은 금방 한계가 왔습니다.
어떤 객체는 depth를 따라야 하고, 어떤 객체는 항상 위에 보여야 하며, 어떤 객체는 depth는 검사하되 depth buffer에는 쓰지 않아야 했습니다.
이 글에서는 그 과정에서 depth buffer를 다시 이해하고, 렌더링 우선순위를 정할 때 사용한 기준을 정리합니다.

## depth buffer가 하는 일과 투명 material의 오해

Three.js는 기본적으로 depth buffer를 사용해 어떤 픽셀이 앞에 있는지 판단합니다.
그래서 나중에 그린 객체라도 더 뒤에 있으면 보이지 않습니다.

이 동작 자체는 정상입니다.
문제는 라벨, 축, 보조선처럼 시각 정보 역할을 하는 요소까지 같은 규칙으로 처리하면 가독성이 떨어진다는 점입니다.

```ts
const labelMaterial = new THREE.SpriteMaterial({
  map: labelTexture,
  transparent: true,
});
```

처음에는 투명 material만 주면 라벨이 자연스럽게 보일 거라고 생각했습니다.
하지만 투명 여부와 depth 처리 여부는 별개였습니다.
투명 객체도 depth test를 통과하지 못하면 여전히 가려집니다.

## depthTest와 depthWrite는 다른 스위치다

Three.js 재질에서 `depthTest`와 `depthWrite`는 이름이 비슷하지만 역할이 다릅니다.
`depthTest`는 이미 그려진 depth buffer와 비교할지 결정합니다.
`depthWrite`는 이 객체를 그린 뒤 depth buffer에 기록할지 결정합니다.

![Three.js 3D 수학교구에서 실제 물체는 depth 처리를 유지하고 라벨 보조선 선택 표시는 depthTest depthWrite renderOrder로 정보 레이어를 분리하는 구조](/images/posts/svg-editor/three-js-depth-render-order/body-01.png)

그래서 `depthTest: false`는 다른 객체에 가려지지 않게 만들고, `depthWrite: false`는 이 객체가 depth buffer에 영향을 주지 않게 합니다.
다만 모든 요소에 이 값을 적용하면 화면이 어색해집니다.
앞뒤 관계가 필요한 도형까지 항상 위에 떠 보이기 때문입니다.
그래서 처음에는 정보성 요소에만 제한적으로 적용하는 기준을 세웠습니다.

- 블록, 면, 입체도형: 기본 depth 처리 유지
- 축 라벨, 숫자, 안내 텍스트: depthTest를 끄거나 renderOrder 조정
- 보조선: 상황에 따라 depthTest 유지 또는 해제
- 선택 outline: 사용자가 조작 중일 때 더 높은 우선순위 부여

면처럼 실제 공간을 차지하는 객체는 depth를 검사하고 기록해야 합니다.

```ts
const solidMaterial = new THREE.MeshStandardMaterial({
  color: "#6ea8fe",
  transparent: true,
  opacity: 0.35,
  depthTest: true,
  depthWrite: true,
});
```

반면 edge나 label은 depth를 검사하되, 다른 객체의 depth 판단을 방해하지 않는 편이 좋을 때가 있습니다.

```ts
const edgeMaterial = new THREE.MeshBasicMaterial({
  color: "#1f2937",
  depthTest: true,
  depthWrite: false,
});
```

`depthWrite: false`를 쓰면 edge가 화면에는 보이지만 depth buffer를 더럽히지 않습니다.
이 기준을 세운 뒤 edge, 라벨, 보조선의 깜빡임이 줄었습니다.

## 렌더링 순서보다 객체 역할을 먼저 나눈다

위의 구분만으로는 객체가 늘어날수록 판단이 흔들렸습니다.
그래서 렌더링 순서를 정하기 전에 객체 역할부터 나눴습니다.
같은 mesh라도 역할에 따라 depth 정책이 달라집니다.

```ts
type RenderRole = "solid" | "edge" | "hidden-edge" | "axis" | "label" | "handle";
```

역할별 기본 정책은 다음처럼 잡았습니다.

| 역할 | 목적 | 기본 정책 |
| --- | --- | --- |
| solid | 도형의 실제 면 | depthTest와 depthWrite 사용 |
| edge | 외곽선 | depthTest 사용, renderOrder 높임 |
| hidden-edge | 내부 점선 | depthTest 사용, 낮은 opacity |
| axis | 방향 정보 | 필요 시 depthTest 완화 |
| label | 숫자/텍스트 정보 | 항상 읽히도록 우선순위 높임 |
| handle | 편집 조작점 | 가장 높은 우선순위 |

이렇게 역할을 나누지 않으면 모든 객체에 같은 처방을 하게 됩니다.
하지만 라벨과 면, handle과 내부 점선은 렌더링 목적이 다릅니다.

## renderOrder는 마지막 정렬 기준으로 쓴다

depth 설정만으로 부족한 경우에는 `renderOrder`를 함께 사용했습니다.

```ts
axisLine.renderOrder = 1;
guideLine.renderOrder = 2;
label.renderOrder = 3;
```

`renderOrder`는 렌더링 순서를 명시적으로 조정할 때 유용합니다.
특히 투명 객체나 안내 요소가 많을 때, 어떤 요소가 마지막에 보여야 하는지 기준을 줄 수 있습니다.

하지만 `renderOrder`는 강력한 만큼, 모든 문제를 해결하는 도구로 쓰면 금방 꼬이고 디버깅이 어려워집니다.
그래서 depth 정책을 먼저 정하고, 그 다음 같은 계층 안에서 정보 위계를 잡는 용도로만 `renderOrder`를 사용했습니다.
숫자를 직접 흩뿌리지 않고 객체 종류별로 이름 붙인 레이어 기준을 두었습니다.
처음에는 대략적인 레이어만 나눴습니다.

```ts
const RENDER_ORDER = {
  solid: 0,
  guide: 10,
  selection: 20,
  label: 30,
} as const;
```

앞에서 나눈 역할에 맞추면 기준은 다음처럼 더 세분화됩니다.

```ts
const RENDER_ORDER = {
  solid: 0,
  hiddenEdge: 10,
  edge: 20,
  axis: 30,
  label: 40,
  handle: 50,
} as const;
```

객체를 만들 때 역할에 따라 값을 부여합니다.

```ts
edge.renderOrder = RENDER_ORDER.edge;
label.renderOrder = RENDER_ORDER.label;
handle.renderOrder = RENDER_ORDER.handle;
```

중요한 것은 `renderOrder` 숫자 자체가 아니라 기준을 문서화하는 것입니다.
이름을 붙여두면 이후에 어떤 의도로 순서를 조정했는지 이해하기 쉽습니다.
기준이 없으면 새 객체를 추가할 때마다 “이번에는 999를 넣자” 같은 임시 값이 생깁니다.
그 값이 쌓이면 나중에 어떤 객체가 왜 위에 보이는지 알기 어렵습니다.

## 라벨은 읽힘을 우선한다

수학교구에서 라벨은 장식이 아니라 정보입니다.
좌표값이나 숫자가 읽히지 않으면 교구의 목적이 약해집니다.
그래서 라벨은 일반 mesh보다 높은 우선순위를 줬습니다.

```ts
const labelMaterial = new THREE.SpriteMaterial({
  map: labelTexture,
  transparent: true,
  depthTest: false,
  depthWrite: false,
});

label.renderOrder = RENDER_ORDER.label;
```

항상 `depthTest: false`가 정답은 아닙니다.
도형 뒤에 있어야 자연스러운 라벨도 있습니다.
하지만 축 라벨이나 조작 안내처럼 읽힘이 중요한 정보는 depth보다 가독성을 우선했습니다.

이 기준은 UI 관점의 선택입니다.
물리적으로 정확한 3D 장면보다 학습 도구로서 읽기 쉬운 장면이 더 중요했습니다.

## 내부 점선은 보이되 튀지 않게 한다

겨냥도처럼 내부 구조를 보여줘야 할 때는 숨은 모서리를 점선으로 표현해야 했습니다.
이때 내부 점선이 너무 강하게 보이면 외곽선과 경쟁합니다.
반대로 너무 약하면 정보가 사라집니다.

```ts
const hiddenEdgeMaterial = new THREE.LineDashedMaterial({
  color: "#64748b",
  transparent: true,
  opacity: 0.45,
  depthTest: true,
  depthWrite: false,
  dashSize: 0.08,
  gapSize: 0.05,
});
```

내부 점선은 depth를 완전히 무시하지 않았습니다.
어느 정도 공간감을 따라야 하기 때문입니다.
대신 opacity와 renderOrder로 외곽선보다 낮은 시각 강도를 유지했습니다.

관련 구현은 [Three.js 겨냥도 구현하기](/posts/svg-editor/three-js-line-basic-meterial)에서 다룬 내용과 이어집니다.
점선 표현은 단순한 스타일 문제가 아니라, 3D 정보를 어떤 우선순위로 보여줄지의 문제였습니다.

## handle은 편집 UI로 본다

handle은 3D 모델의 일부가 아니라 편집 UI입니다.
따라서 실제 도형 뒤에 있다고 해서 항상 가려지면 안 됩니다.
사용자가 조작해야 하는 대상이기 때문입니다.

```ts
const handleMaterial = new THREE.MeshBasicMaterial({
  color: "#22c55e",
  depthTest: false,
  depthWrite: false,
});

handle.renderOrder = RENDER_ORDER.handle;
```

이 선택은 [Three.js Raycaster 선택 영역 넓히기](/posts/svg-editor/three-js-raycaster-hit-area)와도 연결됩니다.
handle은 보이는 방식과 선택되는 방식 모두에서 일반 도형보다 UI 요소에 가깝게 다뤄야 했습니다.

## 디버깅할 때 본 값

렌더링 순서 문제를 잡을 때는 material과 object 값을 같이 확인했습니다.

```ts
function debugRenderObject(object: THREE.Object3D) {
  const material = (object as THREE.Mesh).material as THREE.Material | undefined;

  console.log({
    name: object.name,
    renderOrder: object.renderOrder,
    depthTest: material?.depthTest,
    depthWrite: material?.depthWrite,
    transparent: material?.transparent,
    opacity: "opacity" in (material ?? {}) ? material.opacity : undefined,
  });
}
```

이 로그를 통해 “renderOrder가 낮아서 안 보이는지”, “depthTest 때문에 가려지는지”, “depthWrite가 다른 객체에 영향을 주는지”를 분리해서 볼 수 있었습니다.
렌더링 문제는 감으로 값을 바꾸기 시작하면 오래 걸립니다.
객체의 역할, material depth 설정, renderOrder를 함께 봐야 원인을 좁힐 수 있었습니다.

## 정리

Three.js에서 가려짐 문제를 볼 때는 `renderOrder` 하나만 올려서 해결하려고 하면 안 됩니다.
먼저 객체가 실제 3D 모델인지, 보조 정보인지, 편집 UI인지 나누고, 그 다음 depthTest, depthWrite, renderOrder를 역할에 맞게 조합하는 편이 안정적입니다.
특히 교육용 3D 도구에서는 화면의 정확성보다 정보 전달이 더 중요할 수 있습니다.

이번 구현에서 정리한 기준은 다음과 같습니다.

- solid, edge, hidden-edge, axis, label, handle처럼 역할을 먼저 나눈다.
- 실제 면과 3D 물체는 depthTest와 depthWrite를 사용하는 기본 depth 처리를 유지한다.
- 투명 material이라고 해서 가려지지 않는 것은 아니므로 depth 설정을 따로 본다.
- edge와 보조선은 depthWrite를 끄는 편이 안정적인 경우가 많다.
- label은 정보 읽힘이 중요하면 depth보다 가독성을 우선한다.
- handle은 모델이 아니라 편집 UI로 보고 높은 우선순위를 준다.
- renderOrder는 임시 숫자가 아니라 역할별 상수로 관리해 의도를 남긴다.
- 모든 객체를 항상 위에 띄우는 방식은 피한다.

[MathCanvas 프로젝트](/projects/mathcanvas)의 3D 수학교구에서는 “정확히 그리는 것”과 “사용자가 이해하기 쉽게 보이는 것” 사이에서 계속 균형을 잡아야 했습니다.
사용자가 어느 선을 봐야 하는지, 어떤 라벨을 읽어야 하는지, 어떤 handle을 잡아야 하는지 분명해야 편집 가능한 교구가 됩니다.
