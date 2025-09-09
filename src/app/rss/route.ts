import { NextResponse } from "next/server";
import posts from "../../../public/posts.json"; // 글 목록 import
import { getSiteUrl } from "@/lib/site";

export async function GET() {
  // 최신글 목록 순서대로 정렬(필요시)
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // RSS XML 생성
  const base = getSiteUrl();
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Tech Book Blog</title>
    <link>${base}/</link>
    <description>Tech Book 최신 포스트</description>
    <language>ko</language>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${base}/posts/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${base}/posts/${post.slug}</guid>
      <description>${post.description || ""}</description>
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
