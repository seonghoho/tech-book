import fs from "fs";
import { getAllPosts } from "../src/lib/getAllPosts.js";

const SITE_URL = "https://tech-book-lime.vercel.app";

const generateSitemap = () => {
  const posts = getAllPosts("posts");
  const games = getAllPosts("games");
  const today = new Date().toISOString();

  const staticPages = [
    {
      loc: `${SITE_URL}/`,
      priority: "1.0",
      changefreq: "daily",
    },
    {
      loc: `${SITE_URL}/about`,
      priority: "0.8",
      changefreq: "monthly",
    },
    {
      loc: `${SITE_URL}/posts`,
      priority: "0.8",
      changefreq: "weekly",
    },
    {
      loc: `${SITE_URL}/games`,
      priority: "0.8",
      changefreq: "weekly",
    },
    {
      loc: `${SITE_URL}/ux-lab`,
      priority: "0.5",
      changefreq: "monthly",
    },
  ];

  const staticPageXml = staticPages
    .map(({ loc, priority, changefreq }) => {
      return `
      <url>
        <loc>${loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
      </url>
    `;
    })
    .join("");

  const postPagesXml = posts
    .map(({ slug, date }) => {
      return `
      <url>
        <loc>${SITE_URL}/posts/${slug}</loc>
        <lastmod>${new Date(date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
    })
    .join("");

  const gamePagesXml = games
    .map(({ slug, date }) => {
      return `
      <url>
        <loc>${SITE_URL}/games/${slug}</loc>
        <lastmod>${new Date(date).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
    })
    .join("");

  const sitemap = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPageXml}
      ${postPagesXml}
      ${gamePagesXml}
    </urlset>
  `;

  fs.writeFileSync("public/sitemap.xml", sitemap);

  console.log("Sitemap generated successfully!");
};

generateSitemap();
