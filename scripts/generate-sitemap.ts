import fs from "fs";
import path from "path";
import { getAllPosts } from "../src/lib/getAllPosts.ts";
import { games } from "../src/lib/gamesData.ts";

try {
  const siteUrl = "https://tech-book-lime.vercel.app";

  console.log("Getting posts...");
  const posts = getAllPosts("posts");
  console.log(`Found ${posts.length} posts.`);

  console.log("Getting games...");
  const gameArticles = getAllPosts("games"); // renamed to avoid conflict
  console.log(`Found ${gameArticles.length} games.`);

  const postUrls = posts
    .map((post) => {
      if (!post || !post.slug || !post.date) {
        console.error("Invalid post object:", post);
        return "";
      }
      return `
      <url>
        <loc>${siteUrl}/posts/${post.slug}</loc>
        <lastmod>${post.date}</lastmod>
      </url>`;
    })
    .join("");

  const gameUrls = gameArticles
    .map((post) => {
      if (!post || !post.slug || !post.date) {
        console.error("Invalid game post object:", post);
        return "";
      }
      return `
      <url>
        <loc>${siteUrl}/games/${post.slug}</loc>
        <lastmod>${post.date}</lastmod>
      </url>`;
    })
    .join("");

  const gamePlayUrls = games // use the imported 'games'
    .map(
      (game) => `
      <url>
        <loc>${siteUrl}/play/${game.playSlug}</loc> 
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>`
    )
    .join("");

  const staticPages = ["", "about", "posts", "games"];

  const staticPageUrls = staticPages
    .map(
      (page) => `
      <url>
        <loc>${siteUrl}/${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>`
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPageUrls}
  ${postUrls}
  ${gameUrls}
  ${gamePlayUrls}
</urlset>`;

  fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap);

  console.log("✅ sitemap.xml generated");
} catch (error) {
  console.error("Error generating sitemap:", error);
  process.exit(1);
}
