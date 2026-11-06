---
title: "두 번 보내도 한 번만 처리하기: R2 조건부 쓰기(If-None-Match: *)로 중복 막기"
date: "2026-10-30"
description: "Cloudflare Workers로 만든 사진 서버에서 같은 사진을 동시에 재시도하면 업로드 수가 두 번 올라가고, 어드민의 기기 등록 버튼을 두 번 누르면 키가 두 개 발급될 수 있었습니다. 먼저 읽고 없으면 쓰는 방식이 두 요청 사이에서 깨진 것이 원인이었습니다. R2 put의 onlyIf에 If-None-Match: *를 넣어 쓰기 자체를 한 번만 성공하게 바꾼 과정과 테스트 방법을 적었습니다."
tags: ["Cloudflare Workers", "R2", "Idempotency", "Race Condition", "Serverless"]
---

# 두 번 보내도 한 번만 처리하기: R2 조건부 쓰기(If-None-Match: *)로 중복 막기

## 배경

사이드 프로젝트로 포토부스 앱을 만들고 있습니다. 부스 기기(안드로이드 앱)가 사진을 찍으면 Cloudflare Workers로 만든 서버에 올리고, 서버는 사진을 R2에 저장합니다. 사진마다 토큰이 하나 있어서 업로드 주소는 `PUT /api/photos/{토큰}`입니다. 운영자가 보는 어드민 화면에는 날짜별·기기별 업로드 수가 나옵니다.

기기는 네트워크가 끊기면 같은 사진을 다시 보냅니다. 그래서 업로드는 처음부터 멱등하게 만들었습니다. 같은 토큰의 사진이 이미 있으면 다시 저장하지 않고 `200 { created: false }`로 답합니다. 업로드 수는 처음 저장했을 때(`201`)만 하나 올립니다.

업로드 수를 세는 기능을 붙이고 코드를 다시 읽다가 이 멱등 처리가 동시 요청에서는 깨진다는 걸 알았습니다. 같은 날 어드민의 기기 등록 화면에서도 같은 모양의 문제를 찾았습니다.

## 먼저 읽고 없으면 쓰던 업로드

고치기 전 업로드 처리는 이랬습니다.

```ts
const key = photoKey(token);
const existing = await env.PHOTOS.head(key);
if (existing !== null) {
  const meta = parsePhotoMetadata(existing.customMetadata);
  if (meta !== null && meta.deviceId === auth.device.deviceId) return json(200, { ok: true, created: false });
  return errorResponse(409, "conflict");
}

// ... 본문 검사 ...

const kept = await putPhotoUnlessGone(env.PHOTOS, token, body, { /* 메타데이터 */ });
if (!kept) return errorResponse(409, "gone");
defer(recordUpload(env.EVENTS, auth.device.deviceId, fileDateFor(checked.capturedAt, now)));
return json(201, { ok: true, created: true });
```

`head`로 사진이 있는지 보고, 없으면 `put`으로 씁니다. 요청이 하나씩 오면 문제가 없습니다. 그런데 기기가 첫 요청의 응답을 기다리다 시간이 넘어 같은 사진을 다시 보내면, 두 요청이 거의 동시에 서버에 도착할 수 있습니다.

```text
요청 A: head → 없음
요청 B: head → 없음
요청 A: put  → 저장, 201, 업로드 수 +1
요청 B: put  → 덮어씀, 201, 업로드 수 +1
```

두 요청 모두 `head`에서 "없음"을 봤기 때문에 둘 다 처음 올린 요청처럼 처리됩니다. `put`은 조건 없이 쓰니 B가 A의 사진을 덮어쓰고, 업로드 수는 두 번 올라갑니다. 다른 기기가 같은 토큰으로 올리는 경우라면 원래 `409 conflict`로 막아야 하는데, 이 순서에서는 그것도 빠져나갑니다.

## R2의 조건부 쓰기

R2의 `put`은 `onlyIf` 옵션으로 조건을 걸 수 있습니다. HTTP 조건부 요청 헤더와 같은 규칙입니다. `If-None-Match: *`는 "이 키에 객체가 하나도 없을 때만 쓴다"는 뜻입니다. 조건이 맞지 않으면 `put`이 예외를 던지지 않고 `null`을 돌려줍니다.

```ts
const written = await bucket.put(key, body, { onlyIf: new Headers({ "If-None-Match": "*" }) });
if (written === null) {
  // 이미 누가 썼다
}
```

`head`를 보고 판단하면 판단과 쓰기 사이에 틈이 생깁니다. 조건부 쓰기는 R2가 쓰는 순간에 조건을 확인하므로, 같은 키에 동시에 쓰려는 요청 가운데 하나만 성공합니다.

## 업로드 수정

사진을 쓰는 함수 `putPhotoUnlessGone`을 조건부 쓰기로 바꾸고, 결과를 세 가지로 나눴습니다.

```ts
// 사진을 없을 때만 쓰고 삭제 표시를 다시 본다. 같은 토큰을 다른 요청이 먼저 썼으면 "exists"다.
// 본문을 읽는 사이에 delete-photo가 표시를 썼으면 방금 쓴 사진을 지우고 "gone"이다.
export async function putPhotoUnlessGone(
  bucket: R2Bucket,
  token: string,
  body: Uint8Array,
  options: R2PutOptions,
): Promise<"created" | "exists" | "gone"> {
  const written = await bucket.put(photoKey(token), body, { ...options, onlyIf: new Headers({ "If-None-Match": "*" }) });
  if (written === null) return "exists";
  if ((await bucket.head(expiredKey(token))) === null) return "created";
  await bucket.delete(photoKey(token));
  return "gone";
}
```

원래 이 함수는 `boolean`을 돌려줬습니다. 쓴 뒤에 삭제 표시를 다시 보고, 그사이 사진이 삭제됐으면 방금 쓴 사진을 지우고 `false`를 돌려주는 함수였습니다. 여기에 "다른 요청이 먼저 썼다"는 경우가 생겨서 문자열 세 개로 바꿨습니다.

업로드 처리에서는 `"exists"`를 받으면 이긴 요청이 쓴 사진을 다시 읽어서, 처음부터 사진이 있었을 때와 같은 응답을 냅니다.

```ts
const existing = await env.PHOTOS.head(key);
if (existing !== null) return existingPhotoResponse(existing, auth.device.deviceId);

// ...

if (kept === "gone") return errorResponse(409, "gone");
// 같은 토큰을 동시에 올린 다른 요청이 먼저 썼으면 재전송처럼 답하고 세지 않는다. 그사이 지워졌으면 gone이다.
if (kept === "exists") {
  const winner = await env.PHOTOS.head(key);
  return winner === null ? errorResponse(409, "gone") : existingPhotoResponse(winner, auth.device.deviceId);
}
defer(recordUpload(env.EVENTS, auth.device.deviceId, fileDateFor(checked.capturedAt, now)));
return json(201, { ok: true, created: true });

// 이미 있는 사진에 대한 업로드 응답이다. 같은 기기면 200(멱등), 다른 기기가 쓴 토큰이면 409다.
function existingPhotoResponse(existing: R2Object, deviceId: string): Response {
  const meta = parsePhotoMetadata(existing.customMetadata);
  if (meta !== null && meta.deviceId === deviceId) return json(200, { ok: true, created: false });
  return errorResponse(409, "conflict");
}
```

앞쪽의 `head` 검사는 남겨 두었습니다. 대부분의 재전송은 앞 요청이 끝난 뒤에 오기 때문에, 여기서 걸러지면 본문을 검사하고 쓰기를 시도하는 일을 건너뛸 수 있습니다. 중복을 막는 역할은 이제 조건부 쓰기가 맡고, `head`는 지름길입니다.

이긴 요청의 사진을 다시 읽는 사이에 사진이 지워졌을 수도 있어서, 그때는 `409 gone`으로 답합니다. 앱은 `409`를 받으면 기기에 남은 사본을 지우게 되어 있습니다.

## 기기 등록 버튼을 두 번 누를 때

어드민에는 부스 기기를 등록하는 화면이 있습니다. 이름을 넣으면 확인 화면이 나오고, 확인 버튼을 누르면 서버가 기기용 키를 발급해 KV에 저장한 뒤 키 원문을 그 응답에서 한 번만 보여 줍니다.

중복 등록은 "같은 기기 ID의 활성 기기가 이미 있으면 409"로 막고 있었습니다. 기기 목록은 KV의 `list`로 읽습니다. 문제는 KV `list`가 최근에 쓴 키를 바로 보여 주지 않는다는 점이었습니다. 최대 60초 정도 늦을 수 있습니다. 확인 버튼을 두 번 누르거나, 결과 화면에서 새로 고침을 눌러 같은 폼이 다시 오면, 두 번째 요청의 `list`에는 첫 번째 등록이 아직 없을 수 있습니다. 그러면 키가 두 개 발급됩니다.

여기도 업로드와 같은 모양입니다. 읽어서 없음을 확인하고 쓰는데, 읽기가 늦게 따라오는 저장소라 틈이 더 넓었습니다.

## 확인 화면마다 일회용 값

확인 화면을 만들 때 16바이트 무작위 값을 숨은 칸에 넣었습니다. 처리 단계는 키를 발급하기 전에 이 값을 R2에 `If-None-Match: *`로 씁니다.

```ts
export const ADMIN_NONCE_PREFIX = "admin-nonce/";
const NONCE_PATTERN = /^[0-9a-f]{32}$/;

// 새 일회용 값(16바이트, 소문자 hex 32자)이다.
export function newAdminNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// 값을 처음 쓸 때만 true다. 이미 쓴 값이면 false다(같은 확인 페이지를 두 번 보냄).
export async function claimAdminNonce(bucket: R2Bucket, nonce: string): Promise<boolean> {
  if (!isValidAdminNonce(nonce)) throw new Error("bad nonce");
  return (await bucket.put(`${ADMIN_NONCE_PREFIX}${nonce}`, new Uint8Array(0), { onlyIf: new Headers({ "If-None-Match": "*" }) })) !== null;
}
```

```ts
// 키 발급·KV 쓰기 전에 일회용 값을 "없을 때만" 쓴다. 이미 있으면 이 확인 페이지는 처리된 것이다.
if (!(await claimAdminNonce(c.env.EVENTS, nonce as string))) return adminErrorPage(409, "already_done", A.alreadyDone, c.user);
const { record, token, key } = await issueDevice(deviceId, name);
```

R2는 쓰자마자 읽기에 반영되기 때문에, KV `list`가 늦어도 같은 확인 화면에서 온 두 번째 요청은 여기서 막힙니다. 같은 기기 ID 검사는 지우지 않고 보조로 남겼습니다.

몇 가지를 같이 정했습니다.

- **값은 키 이름에 들어가니 형식을 먼저 검사합니다.** 소문자 hex 32자가 아니면 `400`입니다. `../`가 섞인 값이 키 경로에 들어가지 않게 하려는 것입니다.
- **값은 하루 동안 둡니다.** 1시간마다 도는 Cron이 하루 지난 `admin-nonce/` 객체를 지웁니다. 확인 화면을 하루 넘게 열어 두었다면 화면을 새로 열면 됩니다.
- **값은 확인 화면을 만들 때 정합니다.** 처리 단계에서 만들면 두 요청이 서로 다른 값을 쓰게 되어 아무것도 막지 못합니다.

## 테스트

동시 요청을 테스트에서 실제로 겹치게 만들기는 어렵습니다. 그래서 "두 요청이 모두 없음을 본 뒤, 이 요청의 `put` 직전에 다른 요청이 먼저 썼다"는 순서를 직접 만드는 버킷을 만들었습니다.

```ts
export function racingBucket(bucket: R2Bucket, key: string, interfere: () => Promise<unknown>): R2Bucket {
  let pending = true;
  return new Proxy(bucket, {
    get(target, prop) {
      if (prop === "put") {
        return async (name: string, value: Parameters<R2Bucket["put"]>[1], options?: R2PutOptions) => {
          if (name === key && pending) {
            pending = false;
            await interfere();
          }
          return target.put(name, value, options);
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
```

이 버킷으로 업로드를 보내면 `head`는 "없음"을 보고, `put` 직전에 `interfere`가 같은 토큰의 사진을 먼저 씁니다. 이긴 요청이 같은 기기일 때와 다른 기기일 때를 나눠 확인했습니다.

```ts
const same = await send(racingBucket(env.PHOTOS, photoKey(PHOTO), winner("booth-01")));
expect(same.status).toBe(200);
expect(await same.json()).toEqual({ ok: true, created: false });
expect(await uploads(date)).toBeNull();

await env.PHOTOS.delete(photoKey(PHOTO));
const other = await send(racingBucket(env.PHOTOS, photoKey(PHOTO), winner("booth-02")));
expect(other.status).toBe(409);
expect(await other.json()).toEqual({ error: "conflict" });
expect(await uploads(date)).toBeNull();
expect((await env.PHOTOS.head(photoKey(PHOTO)))?.customMetadata?.deviceId).toBe("booth-02");
```

마지막 줄은 진 요청이 이긴 요청의 사진을 덮어쓰지 않았는지 확인합니다.

기기 등록은 KV `list`가 늘 빈 결과를 돌려주는 KV로 바꿔 끼워, 목록이 늦은 상황을 만들었습니다.

```ts
export function staleListKv(kv: KVNamespace): KVNamespace {
  return new Proxy(kv, {
    get(target, prop) {
      if (prop === "list") return async () => ({ keys: [], list_complete: true, cacheStatus: null });
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
```

이 KV로 같은 확인 화면의 폼을 두 번 보내면 첫 번째는 `200`, 두 번째는 `409`이고, 응답에 키 입력칸이 없으며, 저장된 기기 기록과 감사 기록이 각각 하나인지 확인했습니다. 일회용 값이 없거나 형식이 틀린 경우(`""`, 31자, 33자, 대문자, `../`가 섞인 값 등)는 모두 `400`이고 아무것도 발급하지 않는지도 확인했습니다.

## 남긴 메모

- 읽고 나서 쓰는 코드는 요청이 하나씩 올 때만 맞습니다. 저장소가 쓰는 순간 조건을 확인해 주는 기능(R2 `onlyIf`, DB 유니크 제약 같은 것)이 있으면 중복 판단은 그쪽에 맡겼습니다.
- KV처럼 읽기가 늦게 따라오는 저장소는 이 틈이 수십 초까지 벌어집니다. 중복 검사에 KV `list`를 쓰고 있었다면 한 번 더 보는 게 좋겠습니다.
- 조건부 쓰기가 실패했을 때 무엇을 돌려줄지도 같이 정해야 했습니다. 업로드에서는 진 요청이 이미 있던 사진에 대한 응답과 같은 응답을 받게 해서, 기기 쪽 앱은 바꾸지 않았습니다.
- 테스트에서는 실제 동시 실행 대신 `Proxy`로 "다른 요청이 끼어드는 시점"을 고정했습니다. 타이밍에 기대지 않으니 매번 같은 순서로 재현됩니다.
