export const ADSENSE_CLIENT_ID = "ca-pub-6884620250599904";

const ADSENSE_ENABLED_PATHS = ["/", "/about", "/projects", "/posts"] as const;

export function isAdsenseEligiblePath(pathname: string | null) {
  if (!pathname) return false;

  return (
    ADSENSE_ENABLED_PATHS.includes(pathname as (typeof ADSENSE_ENABLED_PATHS)[number]) ||
    pathname.startsWith("/projects/") ||
    pathname.startsWith("/posts/")
  );
}
