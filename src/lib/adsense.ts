import { isIndexablePostSlug } from "./contentVisibility.ts";

export const ADSENSE_CLIENT_ID = "ca-pub-6884620250599904";

const ADSENSE_ENABLED_PATHS = ["/", "/about"] as const;

export function isAdsenseEligiblePath(pathname: string | null) {
  if (!pathname) return false;

  if (ADSENSE_ENABLED_PATHS.includes(pathname as (typeof ADSENSE_ENABLED_PATHS)[number])) {
    return true;
  }

  if (pathname.startsWith("/projects/")) {
    return true;
  }

  if (pathname.startsWith("/posts/")) {
    return isIndexablePostSlug(pathname.replace(/^\/posts\//, ""));
  }

  return false;
}
