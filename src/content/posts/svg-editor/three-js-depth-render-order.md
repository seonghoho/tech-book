---
title: "Three.js 3D 수학교구에서 depth buffer와 renderOrder로 정보 가림 문제 해결하기"
date: "2025-07-30"
updated: "2026-05-29"
description: "3D 수학교구에서 블록, 축, 숫자 라벨이 서로 가려지는 문제를 depthTest, depthWrite, renderOrder 기준으로 정리한 과정입니다."
image: "/images/projects/mathcanvas/detail-02.png"
tags: ["Three.js", "WebGL", "Rendering", "Troubleshooting"]
---

# Three.js 3D 수학교구에서 depth buffer와 renderOrder로 정보 가림 문제 해결하기

## 문제 상황

Three.js로 3D 수학교구를 만들 때 단순히 물체를 그리는 것보다 더 까다로웠던 부분은 정보의 가독성이었습니다.
쌓기나무, 공간좌표, 입체도형처럼 여러 요소가 겹치는 화면에서는 블록, 좌표축, 숫자, 보조선이 함께 보입니다.

문제는 카메라 각도에 따라 중요한 정보가 가려진다는 점이었습니다.
예를 들어 블록 뒤에 있는 축 숫자가 완전히 사라지거나, 보조선이 도형 표면에 묻히거나, 라벨이 특정 각도에서 깜빡이는 현상이 있었습니다.

3D 공간에서는 가까운 물체가 먼 물체를 가리는 것이 자연스럽습니다.
하지만 수학교구에서는 항상 물리적으로 정확한 렌더링보다 “학습에 필요한 정보가 읽히는 것”이 더 중요할 때가 있습니다.

## depth buffer가 하는 일

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

## depthTest와 depthWrite 분리

라벨이나 보조선은 필요에 따라 depthTest와 depthWrite를 따로 조정했습니다.

![Three.js 3D 수학교구에서 실제 물체는 depth 처리를 유지하고 라벨 보조선 선택 표시는 depthTest depthWrite renderOrder로 정보 레이어를 분리하는 구조](/images/posts/svg-editor/three-js-depth-render-order/body-01.png)

```ts
const labelMaterial = new THREE.SpriteMaterial({
  map: labelTexture,
  transparent: true,
  depthTest: false,
  depthWrite: false,
});
```

`depthTest: false`는 다른 객체에 가려지지 않게 만듭니다.
`depthWrite: false`는 이 객체가 depth buffer에 영향을 주지 않게 합니다.

다만 모든 요소에 이 값을 적용하면 화면이 어색해집니다.
앞뒤 관계가 필요한 도형까지 항상 위에 떠 보이기 때문입니다.
그래서 정보성 요소에만 제한적으로 적용했습니다.

- 블록, 면, 입체도형: 기본 depth 처리 유지
- 축 라벨, 숫자, 안내 텍스트: depthTest를 끄거나 renderOrder 조정
- 보조선: 상황에 따라 depthTest 유지 또는 해제
- 선택 outline: 사용자가 조작 중일 때 더 높은 우선순위 부여

## renderOrder로 그리기 순서 보정

depth 설정만으로 부족한 경우에는 `renderOrder`를 함께 사용했습니다.

```ts
axisLine.renderOrder = 1;
guideLine.renderOrder = 2;
label.renderOrder = 3;
```

`renderOrder`는 렌더링 순서를 명시적으로 조정할 때 유용합니다.
특히 투명 객체나 안내 요소가 많을 때, 어떤 요소가 마지막에 보여야 하는지 기준을 줄 수 있습니다.

하지만 이것도 남용하면 디버깅이 어려워집니다.
그래서 객체 종류별로 대략적인 레이어 기준을 정했습니다.

```ts
const RENDER_ORDER = {
  solid: 0,
  guide: 10,
  selection: 20,
  label: 30,
} as const;
```

숫자를 직접 흩뿌리지 않고 이름을 붙여두면 이후에 어떤 의도로 순서를 조정했는지 이해하기 쉽습니다.

## 정리

Three.js에서 가려짐 문제를 볼 때는 단순히 `renderOrder`만 올리기보다 depth 처리와 함께 봐야 합니다.
특히 교육용 3D 도구에서는 화면의 정확성보다 정보 전달이 더 중요할 수 있습니다.

제가 정리한 기준은 다음과 같습니다.

- 실제 3D 물체는 기본 depth 처리를 유지한다.
- 라벨, 축 숫자, 안내선은 정보성 요소로 따로 본다.
- `depthTest`, `depthWrite`, `renderOrder`를 역할별로 조합한다.
- renderOrder 숫자는 상수로 관리해 의도를 남긴다.
- 모든 객체를 항상 위에 띄우는 방식은 피한다.

이 문제는 [Three.js 겨냥도 구현하기](/posts/svg-editor/three-js-line-basic-meterial)와도 비슷합니다.
3D 수학교구에서는 “정확히 그리는 것”과 “사용자가 이해하기 쉽게 보이는 것” 사이에서 계속 균형을 잡아야 했습니다.
