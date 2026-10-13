# 관리자 글쓰기 화면 (`/admin`)

브라우저(모바일 포함)에서 글을 쓰고 초안 저장, 발행, 예약 발행까지 할 수 있는 1인용 관리 화면이다. DB 없이 GitHub 저장소의 마크다운 파일을 직접 커밋하므로, 코드로 글을 쓰는 기존 방식과 그대로 호환된다.

설계 배경: [superpowers/specs/2026-10-13-admin-editor-design.md](./superpowers/specs/2026-10-13-admin-editor-design.md)

## 동작 방식

| 동작 | 커밋 대상 | 배포 |
|---|---|---|
| 초안 저장 | `src/content/drafts/<category>/<slug>.md` (`draft: true`) | 생략 |
| 이미지 업로드 | `public/images/posts/<category>/<slug>/img-*.webp` | 생략 |
| 발행 | 초안 삭제 + `src/content/posts/<category>/<slug>.md` 생성 (커밋 1개) | 진행 |
| 예약 발행 | 발행과 같음. `date` 가 미래면 그날 0시(KST)까지 사이트에서 숨김 | 진행. 당일 cron이 재배포 |
| 발행 글 수정 | 같은 경로, `updated` 만 오늘로 갱신 (`date`, slug는 고정) | 진행 |

- 배포 생략은 [`scripts/vercel-ignore-build.sh`](../scripts/vercel-ignore-build.sh)(Vercel Ignored Build Step)가 판단한다.
- 예약 공개는 [`src/lib/publishing.ts`](../src/lib/publishing.ts)의 `isPublished()` 필터와 매일 00:05 KST에 도는 cron(`/api/cron/redeploy`)이 함께 처리한다. cron은 오늘 공개할 글이 있을 때만 재배포한다.
- 커밋 메시지 규칙: `content(draft|publish|schedule|update|asset): <category>/<slug>`

> ⚠️ 이 저장소는 **public** 이다. 저장소에 커밋한 초안과 이미지는 GitHub에서 누구나 볼 수 있다. 초안을 숨기려면 저장소를 private으로 바꾼다. Vercel 배포에는 영향이 없다. 다만 private으로 바꾸면 에디터 미리보기의 GitHub raw 이미지가 보이지 않는다(방금 올린 이미지는 로컬 미리보기로 계속 보인다).

## 최초 설정

### 1. GitHub OAuth App (로그인용)

GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App** 에서 **두 개**를 만든다.

| 용도 | Homepage URL | Authorization callback URL |
|---|---|---|
| 로컬 | `http://localhost:5174` | `http://localhost:5174/api/admin/auth/callback` |
| 프로덕션 | `https://seonghoho.com` | `https://seonghoho.com/api/admin/auth/callback` |

각 앱의 Client ID와 Client secret을 `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` 에 넣는다. 요청하는 scope는 `read:user`뿐이고, 이 토큰은 신원 확인 직후 버린다.

### 2. 관리자 계정 ID

```bash
gh api user --jq .id
```

출력된 숫자를 `ADMIN_GITHUB_ID` 에 넣는다. 이 ID 외의 계정은 GitHub 로그인에 성공해도 거부된다.

### 3. 세션 서명 키

```bash
openssl rand -base64 48
```

출력값을 `ADMIN_SESSION_SECRET` 에 넣는다. 이 값을 바꾸면 기존 로그인이 모두 풀린다.

### 4. Fine-grained Personal Access Token (커밋용)

GitHub → Settings → Developer settings → Fine-grained tokens → **Generate new token**

- Repository access: **Only select repositories** → `seonghoho/tech-book`
- Permissions → Repository permissions → **Contents: Read and write** (나머지는 기본값 No access)
- 만료일은 1년 이내로 둔다. 만료되면 커밋이 실패하니 재발급해서 교체한다.

발급한 토큰을 `GITHUB_CONTENT_TOKEN` 에 넣는다.

### 5. 예약 발행 (프로덕션만)

- Vercel → Project → Settings → Git → **Deploy Hooks** 에서 `master` 브랜치 훅을 만든다 → `VERCEL_DEPLOY_HOOK_URL`
- `CRON_SECRET` 에 `openssl rand -hex 32` 값을 넣는다. Vercel이 cron 요청에 이 값을 Bearer 토큰으로 자동으로 붙인다.

### 6. 환경변수 등록

- 로컬: `.env.example` 을 `.env.local` 로 복사해 값을 채운다. 로컬용 OAuth App 값을 쓴다.
- 프로덕션: Vercel → Settings → Environment Variables (Production)에 같은 키를 등록한다. 프로덕션용 OAuth App 값을 쓴다. 등록 후 재배포한다.

## 사용법

1. `https://seonghoho.com/admin` 에 접속해 GitHub로 로그인한다. 세션은 7일간 유지된다.
2. **새 글 쓰기**: 정보 탭에서 제목, 카테고리, slug를 먼저 입력한다. 이미지 업로드에 slug가 필요하다.
3. 작성 탭에서 본문을 쓴다. 툴바로 소제목, 코드블록, 링크, 이미지를 넣을 수 있다. 모바일에서는 이미지 버튼으로 카메라나 앨범을 연다.
4. **초안 저장**: 저장소에 커밋되고 배포는 일어나지 않는다. 저장 전 변경분은 브라우저에도 자동 백업된다.
5. **발행 / 예약 발행**: 발행 전 체크(본문 1,500자, description 80~160자, 대표 이미지, 내부 링크, alt) 결과를 확인한 뒤 커밋한다. 체크는 경고만 하고 발행을 막지는 않는다.

## 보안

- `src/proxy.ts`가 `/admin/**`, `/api/admin/**`을 1차로 막는다. 모든 server action과 route에서도 `requireAdmin()`으로 다시 확인한다.
- 쓰기 가능한 경로는 `src/lib/admin/paths.ts`의 allowlist(`src/content/(posts|drafts)/<slug>/<slug>.md`, `public/images/posts/**`)로 제한한다.
- 커밋할 때 편집을 시작한 시점의 blob sha와 현재 sha를 비교한다. 다르면(다른 곳에서 수정됨) 저장을 거부하고 목록에서 다시 열도록 안내한다.
- `robots.txt`에서 `/admin`, `/api`를 차단하고, 관리자 페이지는 `noindex`다.

## 트러블슈팅

| 증상 | 확인할 것 |
|---|---|
| 로그인 후 "관리자 권한이 없습니다" | `ADMIN_GITHUB_ID` 가 숫자 ID인지 (login 이름이 아님) |
| 로그인 후 "요청이 만료" | 로컬/프로덕션 OAuth App을 바꿔 쓰지 않았는지 (callback URL 불일치) |
| 목록이 비어 있고 GitHub API 401 | `GITHUB_CONTENT_TOKEN` 만료 또는 권한 누락 |
| 발행했는데 사이트에 안 보임 | Vercel 배포 로그, 발행일이 미래(예약)인지 |
| 초안 저장이 배포를 일으킴 | 같은 커밋 범위에 코드 변경이 섞였는지 (ignore 스크립트는 하나라도 섞이면 빌드) |
