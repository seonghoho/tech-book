import { isIndexablePostSlug } from "./contentVisibility.ts";

export const ADSENSE_CLIENT_ID = "ca-pub-6884620250599904";

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

// 광고는 게시자 콘텐츠(홈 + 색인 대상 글 상세)에만 로드한다.
// About / Projects 같은 포트폴리오 페이지는 광고 인벤토리로 제출하지 않는다.
export function isAdsenseEligiblePath(pathname: string | null) {
  if (!pathname) return false;

  if (pathname === "/") return true;

  if (pathname.startsWith("/posts/")) {
    return isIndexablePostSlug(pathname.replace(/^\/posts\//, ""));
  }

  return false;
}
