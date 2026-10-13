// 관리자 화면이 저장소에 쓸 수 있는 경로를 한정한다. 모든 쓰기는 이 allowlist 를 통과해야 한다.

export type ContentKind = "posts" | "drafts";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const CONTENT_PATH_PATTERN = /^src\/content\/(posts|drafts)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const IMAGE_PATH_PATTERN =
  /^public\/images\/posts\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.(webp|png|jpe?g|gif)$/;

export const isValidSlug = (value: string) => SLUG_PATTERN.test(value);

export function contentPath(kind: ContentKind, category: string, slug: string) {
  if (!isValidSlug(category) || !isValidSlug(slug)) {
    throw new Error("category 와 slug 는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.");
  }
  return `src/content/${kind}/${category}/${slug}.md`;
}

export function parseContentPath(path: string) {
  const match = CONTENT_PATH_PATTERN.exec(path);
  if (!match) return null;
  return { kind: match[1] as ContentKind, category: match[2], slug: match[3] };
}

export function imagePath(category: string, slug: string, fileName: string) {
  const path = `public/images/posts/${category}/${slug}/${fileName}`;
  if (!IMAGE_PATH_PATTERN.test(path)) {
    throw new Error("이미지 경로가 올바르지 않습니다.");
  }
  return path;
}

export function isWritablePath(path: string) {
  return CONTENT_PATH_PATTERN.test(path) || IMAGE_PATH_PATTERN.test(path);
}

// public/ 아래 파일의 공개 URL 경로 (마크다운에 넣는 값)
export const publicUrlFromPath = (path: string) => path.replace(/^public/, "");

// 배포 전 이미지도 미리보기에서 보이도록 GitHub raw URL 로 바꾼다 (공개 저장소 전제).
export function toPreviewImageSrc(src: string, repo: { owner: string; repo: string; branch: string }) {
  if (!src.startsWith("/images/")) return src;
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/public${src}`;
}
