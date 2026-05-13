---
title: "빈칸 채우기 퀴즈에서 선택지, 정답, 피드백 상태를 관리하는 방법"
date: "2024-05-23"
updated: "2024-05-23"
description: "영단어 빈칸 채우기 화면에서 선택지, 제출, 정답 표시, 피드백 상태를 분리해 관리한 방식을 정리합니다."
image: "/images/portfolio/voca-study-3.png"
tags: ["React", "State", "Quiz", "UX"]
---

# 빈칸 채우기 퀴즈에서 선택지, 정답, 피드백 상태를 관리하는 방법

## 문제 상황

빈칸 채우기 퀴즈는 보기에는 단순합니다.
문장에 빈칸이 있고, 아래 선택지 중 하나를 고르면 됩니다.

하지만 실제 상태를 보면 단순하지 않습니다.

- 사용자가 아직 선택하지 않은 상태
- 선택했지만 제출하지 않은 상태
- 정답인 상태
- 오답인 상태
- 정답을 보여주는 상태
- 다음 문제로 넘어갈 수 있는 상태

이 상태들을 하나의 boolean으로 처리하면 금방 꼬입니다.
예를 들어 `isCorrect`만 있으면 아직 제출하지 않은 상태와 오답 상태를 구분하기 어렵습니다.

## 퀴즈 상태를 단계로 나누기

먼저 퀴즈의 진행 상태를 명확히 나눴습니다.

```ts
type QuizStatus = "idle" | "selected" | "submitted";

type QuizState = {
  selectedChoiceId: string | null;
  status: QuizStatus;
};
```

선택 여부와 제출 여부를 분리하면 UI 조건이 단순해집니다.
선택지만 고른 상태에서는 강조만 보여주고, 제출된 뒤에야 정답과 오답 피드백을 보여줄 수 있습니다.

## 선택지와 정답 데이터 분리

선택지 데이터에는 정답 여부를 직접 넣을 수도 있습니다.
하지만 UI 렌더링에서 모든 선택지가 자기 정답 여부를 알고 있으면, 제출 전에도 정답 상태가 새어 나올 수 있습니다.

그래서 문제 데이터는 정답 id를 별도로 갖게 했습니다.

```ts
type QuizQuestion = {
  id: string;
  sentenceBeforeBlank: string;
  sentenceAfterBlank: string;
  answerChoiceId: string;
  choices: Array<{
    id: string;
    label: string;
  }>;
};
```

렌더링할 때는 현재 제출 여부를 먼저 확인합니다.

```ts
function getChoiceState(choiceId: string, state: QuizState, question: QuizQuestion) {
  if (state.status !== "submitted") {
    return state.selectedChoiceId === choiceId ? "selected" : "idle";
  }

  if (choiceId === question.answerChoiceId) return "correct";
  if (choiceId === state.selectedChoiceId) return "wrong";
  return "idle";
}
```

이렇게 하면 제출 전에는 정답이 노출되지 않습니다.
사용자는 먼저 선택하고, 제출 후에 피드백을 받습니다.

## 빈칸 표시와 선택지 연결

선택한 단어는 빈칸 위치에도 반영했습니다.
이때 빈칸 자체를 input처럼 만들 수도 있지만, 선택지 기반 문제라면 실제 입력 필드가 아니어도 됩니다.

선택한 값이 있으면 빈칸에 표시하고, 없으면 빈 상태를 유지합니다.

```tsx
<span className={selected ? "blank is-filled" : "blank"}>
  {selected?.label}
</span>
```

이 방식은 사용자가 선택한 답이 문장 안에서 어떻게 들어가는지 바로 확인할 수 있다는 장점이 있습니다.
선택지만 아래에서 강조하는 것보다 문장 안에 반영되는 편이 학습 효과가 더 좋았습니다.

## 정리

빈칸 채우기 퀴즈는 화면보다 상태 설계가 더 중요했습니다.
선택, 제출, 피드백을 구분하지 않으면 정답이 먼저 보이거나, 오답 상태가 애매하게 표현될 수 있습니다.

정리한 기준은 다음과 같습니다.

- 선택 상태와 제출 상태를 분리한다.
- 정답 여부는 제출 이후에만 계산한다.
- 문제 데이터는 answer id를 별도로 가진다.
- 선택한 단어는 빈칸 위치에도 반영한다.
- 정답, 오답, 선택, idle 상태를 명확히 나눈다.

이 구조를 만들면 문제 수가 늘어나도 퀴즈 UI가 크게 흔들리지 않습니다.
새 문제로 넘어갈 때는 `selectedChoiceId`와 `status`만 초기화하면 됩니다.
