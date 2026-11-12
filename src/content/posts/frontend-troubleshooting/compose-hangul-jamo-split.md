---
title: "관리자 입력 칸에서 한글 자모가 흩어지던 문제: Compose TextField와 늦게 돌아오는 상태"
date: "2026-11-13"
description: "Android 태블릿 키오스크 앱의 관리자 화면에서 매장 이름을 한글로 치면 '한'이 'ㅎㅏㄴ'처럼 자모로 흩어져 들어갔습니다. 입력 칸이 뷰모델 상태를 그대로 받아 그리는 구조에서, 상태가 한 박자 늦게 돌아오면 칸이 옛 값으로 다시 그려지며 키보드의 한글 조합이 끊기고 있었습니다. 원인을 찾은 과정과, 입력 칸이 글자를 직접 들고 보낸 적 없는 값만 받아들이게 바꾼 방법을 적었습니다."
tags: ["Android", "Jetpack Compose", "TextField", "IME", "한글 입력"]
---

# 관리자 입력 칸에서 한글 자모가 흩어지던 문제

## 증상

사진을 찍어 영수증 프린터로 뽑아 주는 키오스크 앱을 만들고 있습니다. 10인치 Android 태블릿에서 돌아가고, 매장 직원이 쓰는 관리자 화면이 따로 있습니다. 관리자 화면에서는 매장 이름, 영수증 머리글과 바닥글 문구, 프리셋 이름, PIN을 입력합니다.

매장 이름 칸에 "한글"을 치면 칸에 `ㅎㅏㄴㄱㅡㄹ`처럼 자모가 따로따로 들어가는 일이 있었습니다. 영문과 숫자는 문제가 없었고 한글만 그랬습니다. 머리글·바닥글 문구 칸도 같았습니다.
## 한글이 입력되는 방식

한글 키보드는 글자 하나를 여러 번에 나눠 만듭니다. "한"을 치면 키보드는 `ㅎ` → `하` → `한` 순서로 같은 자리의 글자를 바꿔 끼웁니다. 아직 확정되지 않은 이 글자를 조합 중인 글자(composing text)라고 부르고, 입력 칸은 어느 구간이 조합 중인지 키보드와 함께 기억하고 있어야 합니다.

조합 중에 입력 칸의 글자가 바깥에서 바뀌면 키보드는 조합을 끝내 버립니다. 그 상태에서 다음 자모를 치면 앞 글자와 합쳐지지 않고 새 글자로 들어갑니다. 자모가 흩어지는 건 이렇게 조합이 계속 끊기고 있다는 뜻입니다.

## 입력 칸 구조

관리자 화면의 입력 칸은 공통 컴포넌트 `AdminTextField` 하나로 그립니다. 처음에는 값을 문자열로 받아 그대로 넘기는 구조였습니다.

```kotlin
@Composable
internal fun AdminTextField(
    value: String,
    onValueChange: (String) -> Unit,
    // ...
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        // ...
    )
}
```

매장 이름 칸은 이렇게 썼습니다.

```kotlin
AdminTextField(
    value = settings.boothName,
    onValueChange = { if (!nameLocked) actions.onBoothNameChange(it) },
)
```

입력이 들어오면 뷰모델의 `updateBoothName`이 `StateFlow` 상태를 바꾸고, 화면은 그 상태를 다시 받아 칸을 그립니다. 칸에 보이는 글자는 늘 뷰모델 상태입니다.

## 원인

이 구조에서는 키보드가 `하`를 보냈는데 뷰모델 상태가 아직 `ㅎ`인 순간이 생깁니다. 상태 갱신이 화면에 반영되기까지 한 프레임 정도 늦을 수 있기 때문입니다. 그 사이에 칸이 다시 그려지면 칸은 `ㅎ`로 되돌아가고, 키보드 입장에서는 조합 중인 글자가 바깥에서 바뀐 것이 됩니다. 그래서 조합이 끊깁니다.

입력을 거르는 코드도 같은 문제를 만들었습니다. 바닥글 문구 칸은 글자 수 한도를 넘는 입력을 `onValueChange` 안에서 버렸고, PIN 칸은 숫자만 남기고 잘랐습니다.

```kotlin
// 머리글·바닥글 문구
onValueChange = { if (ReceiptTextLimit.accept(block.text, it)) onTextChange(it) }

// PIN
onValueChange = { onValueChange(it.filter(Char::isDigit).take(PIN_MAX_DIGITS)) }
```

입력을 버리면 칸은 이전 값으로 다시 그려집니다. 한도 근처에서 한글을 치면 조합 중인 글자가 사라졌다 돌아오면서 역시 조합이 끊겼습니다.
## 고친 방법

입력 칸이 조합 중인 글자를 직접 들고 있게 바꿨습니다. 뷰모델 값은 칸이 보낸 적 없는 값, 즉 프리셋 불러오기나 원격 설정처럼 바깥에서 바뀐 값일 때만 받아들입니다.

### 1. 칸이 TextFieldValue를 직접 든다

```kotlin
var field by remember { mutableStateOf(TextFieldValue(value, TextRange(value.length))) }
val echo = remember { InputEcho(value) }
if (echo.isExternal(value, field.text)) field = TextFieldValue(value, TextRange(value.length))

OutlinedTextField(
    value = field,
    onValueChange = { next ->
        if (next.text == field.text) {
            field = next                 // 글자는 같고 커서·조합 구간만 바뀐 경우
        } else if (accept(next.text)) {
            field = next
            echo.sent(next.text)
            onValueChange(next.text)
        }
    },
)
```

`TextFieldValue`에는 글자뿐 아니라 커서 위치와 조합 중인 구간도 들어 있습니다. 문자열만 넘기던 때와 달리 키보드가 보낸 조합 상태가 칸 안에 그대로 남습니다.

### 2. 보낸 값과 돌아온 값을 맞춰 본다

뷰모델 값이 바뀔 때마다 이 값이 칸이 보낸 값이 늦게 돌아온 것인지, 바깥에서 새로 바뀐 것인지 구분해야 했습니다. 이 일을 `InputEcho`라는 작은 클래스에 맡겼습니다.

```kotlin
internal class InputEcho(private var seen: String) {
    private val pending = ArrayDeque<String>()

    fun sent(text: String) = pending.addLast(text)

    fun isExternal(value: String, shown: String): Boolean {
        if (value == seen) return false          // 바깥 값이 그대로면 아직 안 돌아온 것
        seen = value
        val acked = pending.indexOf(value)
        if (acked >= 0) {                        // 보낸 값이 돌아왔으면 그때까지 보낸 것을 비운다
            repeat(acked + 1) { pending.removeFirst() }
            return false
        }
        if (value == shown) return false
        pending.clear()
        return true                              // 보낸 적 없는 값이면 바깥 변경
    }
}
```

칸이 `ㅎ`, `하`, `한`을 차례로 보냈다면, 뷰모델에서 `ㅎ`나 `하`가 늦게 돌아와도 칸을 되돌리지 않습니다. 보낸 목록에 없는 값이 오면 그때만 칸을 그 값으로 맞춥니다.

### 3. 거르는 조건은 accept로 옮긴다

입력을 받은 뒤 버리면 칸이 되돌아가므로, 받지 않을 입력은 칸에 넣기 전에 거르게 했습니다. `AdminTextField`에 `accept` 인자를 더하고 각 칸의 조건을 그쪽으로 옮겼습니다.

```kotlin
// 매장 이름
accept = { !nameLocked && BoothName.accept(settings.boothName, it) }

// 머리글·바닥글 문구
accept = { ReceiptTextLimit.accept(block.text, it) }

// 프리셋 이름
accept = { it.length <= BrandPreset.MAX_NAME_LENGTH }

// PIN
accept = { it.length <= PIN_MAX_DIGITS && it.all(Char::isDigit) }
```

PIN은 예전에 숫자가 아닌 글자를 잘라 내고 넘겼는데, 이제는 숫자가 아닌 글자가 섞인 입력을 통째로 받지 않습니다.

## 테스트

`InputEcho`는 Compose 없이 돌아가는 클래스라 단위 테스트로 경우를 나눠 확인했습니다.

```kotlin
@Test
fun lateEchoDoesNotRewindComposingText() {
    val echo = InputEcho("")
    echo.sent("ㅎ")
    echo.sent("하")
    echo.sent("한")

    // 뷰모델 값이 그대로이거나 한 박자씩 늦게 돌아와도 칸("한")을 되돌리지 않는다.
    assertFalse(echo.isExternal("", "한"))
    assertFalse(echo.isExternal("ㅎ", "한"))
    assertFalse(echo.isExternal("하", "한"))
    assertFalse(echo.isExternal("한", "한"))
}
```

이 밖에 아래 경우를 테스트로 남겼습니다.

- 중간 값을 건너뛰고 마지막 값만 돌아와도 한꺼번에 처리되는지
- 프리셋을 불러와 보낸 적 없는 값이 오면 칸이 그 값으로 바뀌는지
- 뷰모델이 입력을 받지 않아 값이 그대로면 기다리고, 다른 값으로 바뀌면 그 값으로 맞추는지

마지막으로 삼성 한글 키보드를 쓰는 실제 태블릿에서 매장 이름, 머리글·바닥글 문구를 다시 입력해 보고 자모가 흩어지지 않는 것을 확인했습니다.
