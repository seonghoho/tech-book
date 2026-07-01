import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/site";
import { getAllPosts } from "@/lib/getAllPosts";
import { filterIndexablePosts } from "@/lib/contentVisibility";

// ISR: RSS는 최신 글 기준으로 주기적 갱신.
export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const sortedPosts = filterIndexablePosts(getAllPosts("posts")).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const base = SITE_CONFIG.url;
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${base}/</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/posts/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${base}/posts/${post.slug}</guid>
      <description>${escapeXml(post.description || "")}</description>
      ${(post.tags ?? []).map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
    </item>
    `,
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
