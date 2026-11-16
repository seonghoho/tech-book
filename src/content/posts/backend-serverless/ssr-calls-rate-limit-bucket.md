---
title: "서버 렌더링 요청이 방문자 요청 한도를 같이 쓰던 문제: 내부 호출을 토큰으로 구분하기"
date: "2026-11-16"
description: "Next.js 서버 컴포넌트가 렌더링 중에 부르는 API는 브라우저가 아니라 웹 파드에서 나갑니다. 이 요청이 비인증 IP 한도(분당 60회)에 들어가면서 방문자 전체가 웹 파드 IP 하나의 버킷을 나눠 쓰고 있었습니다. 처음 시도한 네트워크 기반 판정이 쿠버네티스에서 브라우저 트래픽까지 내부로 넘긴 이유, 공유 토큰과 별도 버킷으로 바꾼 방법, 토큰이 브라우저 번들에 들어가지 않게 한 처리를 적었습니다."
tags: ["Rate Limit", "Next.js", "Server Components", "Spring Boot", "Kubernetes"]
---

# 서버 렌더링 요청이 방문자 요청 한도를 같이 쓰던 문제

## 상황

읽고 본 것을 기분과 함께 기록하는 사이드 프로젝트는 Next.js 웹과 Spring Boot API로 나뉘어 있고, 둘 다 쿠버네티스에 올라가 있습니다. API에는 요청 수 한도가 있습니다.

| 구분 | 한도 |
|---|---|
| 로그인한 사용자 | 600/min |
| 비로그인 (IP 기준) | 60/min |
| 검색 | 30/min |

홈, 공개 프로필 페이지, sitemap 같은 화면은 서버 컴포넌트가 렌더링하면서 API를 부릅니다. 이 요청은 방문자의 브라우저가 아니라 웹 파드에서 나갑니다. 로그인 정보도 없으니 API 입장에서는 비로그인 요청이고, IP는 웹 파드의 IP입니다.

결과적으로 비로그인 방문자 전체가 웹 파드 IP 하나에 걸린 분당 60회 버킷을 나눠 쓰고 있었습니다.

## 잘 드러나지 않는 이유

한도에 걸린 렌더링은 오류 화면이 아니라 빈 상태로 그려졌습니다. 서버 컴포넌트가 API 실패를 빈 목록으로 처리하기 때문입니다. 로그인한 사용자는 자기 토큰으로 요청하니 화면이 정상이고, 로그아웃한 방문자와 검색 크롤러에게만 빈 화면이 나갑니다. 개발하는 사람은 대개 로그인한 상태로 화면을 보기 때문에 알아채기 어려운 구조였습니다.

## 한도에서 빼지 않고 별도 버킷으로

서버 렌더링 요청은 "누구의 요청"으로 셀 수가 없습니다. 캐시된 렌더링 결과 하나가 여러 방문자에게 나가기 때문입니다. 그래서 요청 주체를 웹 파드로 두고 따로 분당 6000회 버킷을 줬습니다.

한도에서 아예 빼지는 않았습니다. 렌더링 코드에 버그가 생겨 API를 반복해서 부르는 경우에도 한도에 걸려야 하기 때문입니다.

```java
boolean internal = !authenticated && internalCallDetector.isInternal(request);

if (authenticated) {
    subject = "u:" + userId;
    scope = "authenticated";
    limit = config.authenticated();
} else if (internal) {
    // 파드 하나가 주체다. 파드가 늘면 버킷도 늘어난다.
    subject = "int:" + request.getRemoteAddr();
    scope = "internal";
    limit = config.internal();
}
```

주체를 파드 IP로 잡았기 때문에 파드가 늘어나면 버킷도 파드마다 생깁니다. 한 파드의 렌더링이 다른 파드의 몫을 쓰지 않습니다.

## 네트워크로 판정했다가 바꾼 이유

남은 문제는 "이 요청이 웹 파드에서 왔는지"를 어떻게 아느냐였습니다. 처음에는 네트워크 정보로 판정했습니다.

- `X-Forwarded-For` 같은 프록시 헤더가 없고
- 소켓 주소가 사설 대역이면 내부 호출로 본다

ingress를 거친 브라우저 요청에는 프록시 헤더가 붙어 있을 테니 구분될 거라고 생각했습니다. 그런데 클러스터에 올려 보니 브라우저 트래픽까지 내부 호출로 판정됐습니다.

원인은 Spring Boot의 플랫폼 자동 감지였습니다.

1. 파드 안에는 `KUBERNETES_SERVICE_HOST` 환경 변수가 있습니다.
2. Spring Boot는 이 값을 보고 쿠버네티스에서 돈다고 판단해 forward-headers 처리를 스스로 켭니다.
3. 그러면 Tomcat이 `X-Forwarded-For`를 읽어 `getRemoteAddr()`를 그 값으로 바꾸고, 헤더는 소비해 버립니다.

그래서 애플리케이션 코드에 도착했을 때는 프록시 헤더가 없었고, 소켓 주소는 이미 접속자의 주소로 바뀌어 있었습니다. 로컬 클러스터에서는 접속자 주소도 사설 대역이라 조건 두 개를 모두 통과했습니다.

이 동작은 제가 설정한 것이 아니라 프레임워크가 환경을 보고 고른 것이었습니다. 의존성을 올리다가 바뀔 수도 있고, 바뀌는 순간 네트워크로 판정하는 코드는 외부 트래픽 전체에 분당 6000회 한도를 열어 줍니다. 한도 판정을 이런 동작에 기대게 둘 수는 없다고 판단했습니다.

## 공유 토큰으로 판정한다

웹과 API가 같은 비밀 값을 나눠 갖고, 웹이 서버 렌더링 요청에 그 값을 헤더로 붙이게 했습니다.

```java
public boolean isInternal(HttpServletRequest request) {
    if (token == null) {
        return false;
    }
    String presented = request.getHeader(INTERNAL_HEADER);
    if (presented == null) {
        return false;
    }
    // 값 비교는 상수 시간으로 한다. 응답 시간으로 토큰을 맞춰 보는 시도를 막는다.
    if (!MessageDigest.isEqual(token, presented.getBytes(StandardCharsets.UTF_8))) {
        return false;
    }
    if (networks.isEmpty()) {
        return true;
    }
    String remoteAddress = request.getRemoteAddr();
    return remoteAddress != null
            && !remoteAddress.isBlank()
            && networks.stream().anyMatch(network -> network.matches(remoteAddress));
}
```

- 토큰을 설정하지 않으면 내부 판정은 아예 동작하지 않습니다. 설정이 빠졌을 때 조용히 열리는 것보다 조용히 닫히는 쪽이 안전하다고 봤습니다.
- 대역(CIDR) 조건은 추가 제약으로 남겼습니다. 토큰이 새더라도 클러스터 밖에서는 쓸 수 없게 하기 위해서입니다. ingress를 거친 요청의 소켓 주소는 위에서 본 이유로 접속자 주소가 되므로 파드 대역에 들지 않습니다.
- 대역 형식이 잘못되면 생성자에서 예외가 나서 서버가 뜨지 않습니다. 잘못된 값을 무시하면 판정이 늘 거짓이 되고, 그건 이 기능이 없는 것과 구분되지 않습니다.

## 웹 쪽: 서버 fetch를 한곳으로 모으기

웹에서는 파일마다 `API_BASE`를 복사해 `fetch`를 부르고 있었습니다. 이대로 두면 새 호출부를 만들 때 헤더를 빠뜨리기 쉽고, 그 증상은 "그 페이지만 가끔 빈다"로 나타나 원인을 찾기 어렵습니다. 그래서 서버 컴포넌트, sitemap, OG 이미지가 쓰는 `serverFetch` 하나로 모았습니다.

```ts
import 'server-only'

const INTERNAL_HEADER = 'X-Litmood-Internal'

export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  // 호출할 때 읽는다. 이미지를 빌드할 때 값이 없어도 런타임에 주면 동작해야 한다.
  const baseUrl = process.env.API_INTERNAL_BASE_URL ?? 'http://localhost:8080'
  const token = process.env.INTERNAL_API_TOKEN

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set(INTERNAL_HEADER, token)
  }
  return fetch(`${baseUrl}${path}`, { ...init, headers })
}
```

```diff
- const API_BASE = process.env.API_INTERNAL_BASE_URL ?? 'http://localhost:8080'
- fetch(`${API_BASE}/api/v1/moods?limit=12`, {
+ serverFetch(`/api/v1/moods?limit=12`, {
```

신경 쓴 부분은 두 가지입니다.

- 환경 변수 이름에 `NEXT_PUBLIC_`을 붙이지 않았습니다. 붙이면 값이 브라우저 번들에 들어가 누구나 넉넉한 한도를 쓸 수 있게 됩니다.
- 파일 맨 위에 `import 'server-only'`를 뒀습니다. 이 모듈을 클라이언트 컴포넌트에서 가져오면 빌드가 실패합니다.

쿠버네티스에서는 웹 파드가 앱 시크릿 가운데 이 토큰 키 하나만 참조하게 했습니다. 다른 키가 웹에 있을 이유가 없어서입니다. 참조는 optional로 뒀습니다. 키를 빠뜨린 배포에서 웹이 아예 뜨지 못하는 것보다, 예전처럼 방문자 한도를 받으며 도는 쪽이 낫다고 봤습니다.

## 테스트

API 쪽에는 판정기 테스트(`InternalCallDetectorTest`)와 한도 필터 테스트(`RateLimitInternalTest`)를 넣었습니다. 웹 쪽에는 `serverFetch`가 토큰이 있을 때 헤더를 붙이고 없을 때 붙이지 않는지 확인하는 테스트를 넣었습니다. 헤더가 빠져도 화면이 깨지지 않고 비기만 하기 때문에, 테스트가 아니면 잡을 방법이 마땅치 않았습니다.

웹 테스트를 돌리면서 `server-only` 때문에 한 번 막혔습니다. Next.js는 서버 번들을 `react-server` 조건으로 해석해 `server-only`를 빈 모듈로 풀지만, vitest에는 그 조건이 없어서 import하는 순간 예외를 던지는 클라이언트용 진입점이 잡혔습니다. vitest 설정에서 `conditions`에 `react-server`를 넣어 보면 React까지 서버용 빌드로 풀려 `createContext`가 사라지고, 스토어와 쿼리 테스트가 전부 깨졌습니다. 결국 vitest에서만 `server-only`를 빈 모듈로 연결했습니다.

```ts
// vitest.config.ts
resolve: {
  alias: {
    'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
  },
},
```

## 따로 남긴 문제

네트워크 판정을 확인하는 과정에서, API의 `X-Forwarded-For` 처리가 두 군데에서 의도대로 동작하지 않는다는 것도 알게 됐습니다. 클라이언트 IP를 구하는 코드가 클러스터에서는 사실상 쓰이지 않고 있었고, 신뢰할 프록시 목록 설정은 효과가 없었습니다. 이 문제는 범위가 달라서 별도 이슈로 나눴습니다.
