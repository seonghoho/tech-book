---
title: "오전 9시 전에만 달력에서 어제를 고를 수 있던 이유"
date: "2026-10-26"
description: "일정 만들기 화면의 달력이 한국 시간 오전 9시 전에만 어제를 선택할 수 있게 열렸습니다. 서버가 오늘 날짜를 toISOString().slice(0, 10)으로 만들고 있었고, 이 값이 UTC 날짜라 생긴 문제였습니다. 원인과 수정, 같은 실수가 다시 들어오지 않게 붙인 테스트를 정리했습니다."
tags: ["JavaScript", "Date", "Timezone", "Next.js", "Testing"]
---

# 오전 9시 전에만 달력에서 어제를 고를 수 있던 이유

## 아침에만 실패하는 e2e 테스트

사이드 프로젝트에는 일정을 만드는 화면이 두 개 있습니다. 직접 만드는 화면과 AI에게 조건을 주고 만드는 화면입니다. 둘 다 여행 날짜를 고르는 달력이 있고, 오늘 이전 날짜는 고를 수 없게 막아 두었습니다.

이 달력을 검사하는 e2e 테스트 중 "지난 날짜는 고를 수 없다" 두 건이 이상하게 실패했습니다. 오전 8시대에 돌리면 실패하고, 9시가 넘어서 다시 돌리면 통과했습니다. 코드를 바꾸지 않았는데 시각에 따라 결과가 달랐습니다.

실패한 화면을 열어 보니 달력에서 어제 날짜가 선택 가능한 상태로 열려 있었습니다.

## 원인: toISOString은 UTC 날짜다

두 만들기 화면은 서버에서 오늘 날짜를 만들어 달력에 넘기고 있었습니다.

```ts
// 두 만들기 화면의 page.tsx (수정 전)
const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
```

이 `today`가 달력이 고를 수 있는 가장 이른 날짜(`min`)가 됩니다.

문제는 `toISOString()`이 항상 **UTC 기준**으로 시각을 문자열로 바꾼다는 점입니다. 한국 시간(KST)은 UTC보다 9시간 빠르기 때문에, 한국 시간으로 0시부터 9시 전까지는 UTC 날짜가 아직 전날입니다.

```ts
const earlyMorning = new Date("2026-10-12T08:30:00+09:00") // 한국 시간 10월 12일 오전 8시 30분

earlyMorning.toISOString()               // "2026-10-11T23:30:00.000Z"
earlyMorning.toISOString().slice(0, 10)  // "2026-10-11" — 어제
```

그래서 오전 9시 전에는 달력의 최소 날짜가 어제가 되었고, 어제를 고를 수 있었습니다. e2e 테스트가 8시대에만 실패한 이유입니다.

오전 9시부터 자정까지는 UTC 날짜와 한국 날짜가 같아서, 그 시간대에 화면을 열면 문제가 드러나지 않습니다.

## 다른 화면은 왜 괜찮았나

같은 프로젝트의 다른 화면들은 오늘 날짜를 `todayDay(new Date())`로 만들고 있었습니다. 홈, 일정 상세, 브리핑 화면이 모두 이 함수를 썼고, 두 만들기 화면만 직접 `toISOString()`을 자르고 있었습니다.

```ts
/** 같은 기준(UTC 자정)으로 오늘을 읽는다 */
export function todayUtc(today: Date): number {
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
}

/** UTC 자정 epoch → 'YYYY-MM-DD' */
export function toDayString(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** 오늘을 달력의 칸으로 */
export function todayDay(today: Date): string {
  return toDayString(todayUtc(today))
}
```

`todayDay`도 마지막에는 `toISOString().slice(0, 10)`을 씁니다. 차이는 그 전 단계입니다. `todayUtc`는 `getFullYear`, `getMonth`, `getDate`로 **서버 로컬 시간대의** 연·월·일을 읽은 뒤, 그 날짜의 UTC 자정을 만듭니다. UTC 자정을 다시 UTC로 문자열로 바꾸니 날짜가 밀리지 않습니다.

운영 서버 컨테이너는 시간대를 서울로 설정해 두었으니, 서버 로컬 날짜가 곧 한국 날짜입니다. 같은 프로젝트 안에 오늘을 만드는 기준이 둘 있었고, 그중 한쪽만 틀려 있었습니다.

## 수정

두 만들기 화면을 다른 화면과 같은 함수로 바꿨습니다.

```ts
// 수정 후
const today = todayDay(new Date())
```

오늘 날짜를 서버에서 만들어 내려보내는 구조는 그대로 두었습니다. 클라이언트 컴포넌트가 따로 `new Date()`를 부르면, 자정 근처에서 서버 렌더링 결과와 하이드레이션 결과가 하루 어긋날 수 있기 때문입니다. 서버가 정한 오늘 하나를 내려보내야 두 쪽이 같은 날짜를 봅니다.

## 다시 들어오지 않게 하는 테스트

수정과 함께, 같은 코드가 다시 들어오지 않게 막을 방법도 필요했습니다. `toISOString().slice(0, 10)`은 짧고 자주 쓰이는 코드라, 새 화면을 만들 때 또 들어오기 쉽습니다. 테스트를 두 겹으로 붙였습니다.

**1. 시간대를 바꿔서 실제 값을 비교하는 테스트**

Node는 `process.env.TZ`를 바꾸면 이후 날짜 계산에 바로 반영합니다. 테스트 안에서 서울 시간대로 바꾸고, 오전 8시 30분에 두 계산이 어떻게 다른지 직접 비교했습니다.

```ts
describe("서울 시간대 오전 9시 전", () => {
  const originalTz = process.env.TZ
  afterEach(() => {
    process.env.TZ = originalTz
  })

  it("todayDay는 오늘이고, toISOString으로 자르면 어제다", () => {
    process.env.TZ = "Asia/Seoul"
    const earlyMorning = new Date("2026-10-12T08:30:00+09:00")

    expect(todayDay(earlyMorning)).toBe("2026-10-12")
    expect(earlyMorning.toISOString().slice(0, 10)).toBe("2026-10-11")
  })
})
```

이 테스트는 테스트를 돌리는 컴퓨터의 시간대와 상관없이 같은 결과가 나옵니다. CI 서버가 UTC든 다른 나라 시간대든 똑같이 동작합니다.

**2. 라우트 파일에서 같은 코드를 찾는 테스트**

모든 라우트 파일(`app/` 아래)을 읽어서 `toISOString().slice(0, 10)`이 있으면 실패하게 했습니다. 주석은 빼고 코드만 검사합니다.

```ts
it("어느 라우트도 toISOString으로 날짜를 자르지 않는다", () => {
  const offenders = routeFiles(APP_DIR)
    .filter((path) => /toISOString\(\)\.slice\(0,\s*10\)/.test(readSourceWithoutComments(path)))

  expect(offenders).toEqual([])
})
```

검사 범위를 라우트 파일로 한정한 이유가 있습니다. 위의 `toDayString`처럼 이미 UTC 자정으로 맞춘 값을 문자열로 바꾸는 곳에서는 `toISOString()`을 써도 맞습니다. 라우트가 오늘 날짜를 직접 만들 일은 `todayDay` 하나뿐이라, 라우트에서만 이 코드를 금지했습니다.

수정 전 코드에서 이 테스트가 두 화면을 정확히 잡아 실패하는 것을 먼저 확인하고, 그다음에 수정했습니다.

## 같은 계열의 실수

이 프로젝트의 날짜 모듈 주석에는 비슷한 함정이 하나 더 적혀 있었습니다.

```ts
new Date("2026-09-12")          // UTC 자정으로 읽힘
new Date("2026-09-12T00:00:00") // 로컬 자정으로 읽힘
```

날짜만 있는 문자열은 UTC로, 시각까지 있는 문자열은 로컬 시간으로 읽힙니다. 둘을 섞으면 한국 시간에서 요일이 하루 밀립니다. 그래서 이 프로젝트는 여행 날짜를 시각 대신 "달력의 칸"으로 보고, 날짜 문자열은 모두 UTC 자정으로 통일해서 다룹니다.

남은 전제도 하나 있습니다. `todayDay`는 서버의 로컬 시간대를 읽기 때문에, 서버 시간대가 서울로 설정되어 있어야 맞습니다. 컨테이너 설정이 바뀌거나 시간대를 정할 수 없는 환경에 배포한다면 `Intl.DateTimeFormat`에 `timeZone: "Asia/Seoul"`을 직접 넘겨 날짜를 읽는 쪽이 더 확실합니다.
