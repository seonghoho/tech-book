import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/getAllPosts";

// ISR: RSS는 최신 글 기준으로 주기적 갱신.
export const revalidate = 3600;

export async function GET() {
  const sortedPosts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const base = getSiteUrl();
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Tech Book Blog</title>
    <link>${base}/</link>
    <description>Tech Book 최신 포스트</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${base}/posts/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${base}/posts/${post.slug}</guid>
      <description>${post.description || ""}</description>
      ${(post.tags ?? [])
        .map((tag) => `<category>${tag}</category>`)
        .join("")}
    </item>
    `
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
