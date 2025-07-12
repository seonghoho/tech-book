import { getAllPosts } from "@/lib/getAllPosts";
export const runtime = "nodejs";
export async function GET(): Promise<Response> {
  const posts = getAllPosts();

  const urls = posts
    .map(
      (post) => `
      <url>
        <loc>https://tech-book-lime.vercel.app/posts/${post.slug}</loc>
        <lastmod>${post.date}</lastmod>
      </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://tech-book-lime.vercel.app/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    ${urls}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
