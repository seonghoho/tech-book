import fs from "fs";
import path from "path";
import { getAllPosts } from "../src/lib/getAllPosts.ts";

const baseUrl = "https://tech-book-lime.vercel.app";

const posts = getAllPosts("posts");
const games = getAllPosts("games");

const postUrls = posts
  .map(
    (post) => `
  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
  </url>`
  )
  .join("");

const gameUrls = games
  .map(
    (post) => `
  <url>
    <loc>${baseUrl}/games/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
  </url>`
  )
  .join("");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  ${postUrls}
  ${gameUrls}
</urlset>`;

fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap);

console.log("✅ sitemap.xml generated");
