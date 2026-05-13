"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT_ID, isAdsenseEligiblePath } from "@/lib/adsense";

export default function GoogleAdsense() {
  const pathname = usePathname();

  if (!isAdsenseEligiblePath(pathname)) return null;

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
