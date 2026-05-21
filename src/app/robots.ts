import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/ads.txt"],
      disallow: ["/play"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
