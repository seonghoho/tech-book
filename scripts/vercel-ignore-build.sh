#!/usr/bin/env bash
# Vercel "Ignored Build Step". exit 0 = 빌드 생략, exit 1 = 빌드 진행.
# 관리자 화면의 초안 저장(src/content/drafts)과 이미지 업로드(public/images/posts)만 바뀐 커밋은
# 사이트에 보이는 변화가 없으므로 배포를 생략한다. 판단이 애매하면 항상 빌드한다.
set -u

if [ -n "${CHANGED_FILES+x}" ]; then
  # 테스트용: 변경 파일 목록을 직접 주입
  changed="$CHANGED_FILES"
else
  base="${VERCEL_GIT_PREVIOUS_SHA:-}"
  if [ -z "$base" ] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
    echo "이전 배포 커밋을 찾을 수 없어 빌드합니다."
    exit 1
  fi
  changed="$(git diff --name-only "$base" HEAD)" || exit 1
fi

if [ -z "$changed" ]; then
  echo "변경 파일이 없어도(재배포 요청) 빌드합니다."
  exit 1
fi

if printf '%s\n' "$changed" | grep -qvE '^(src/content/drafts/|public/images/posts/)'; then
  echo "사이트에 영향을 주는 변경이 있어 빌드합니다."
  exit 1
fi

echo "초안/이미지만 변경되어 빌드를 생략합니다."
exit 0
