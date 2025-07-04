import { type MetadataRoute } from "next";
import posts from "../../public/posts.json";
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1시간(3600초)마다 자동 갱신

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = posts.map((post) => ({
    url: `https://tech-book-lime.vercel.app/posts/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
  }));

  return [
    {
      url: "https://tech-book-lime.vercel.app/",
      lastModified: new Date().toISOString(),
    },
    ...routes,
  ];
}

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const posts = getAllPosts();

//   const routes = posts.map((post) => ({
//     url: `https://tech-book-lime.vercel.app/posts/${post.slug}`,
//     lastModified: post.date,
//   }));

//   return [
//     {
//       url: "https://tech-book-lime.vercel.app/",
//       lastModified: new Date().toISOString(),
//     },
//     ...routes,
//   ];
// }

// import { getAllPosts } from "@/lib/getAllPosts";

// export async function GET(): Promise<Response> {
//   const posts = getAllPosts();

//   const urls = posts
//     .map(
//       (post) => `
//       <url>
//         <loc>https://tech-book-lime.vercel.app/posts/${post.slug}</loc>
//         <lastmod>${post.date}</lastmod>
//       </url>
//     `
//     )
//     .join("");

//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//     <url>
//       <loc>https://tech-book-lime.vercel.app/</loc>
//       <lastmod>${new Date().toISOString()}</lastmod>
//     </url>
//     ${urls}
//   </urlset>`;

//   // console.log(getAllPosts());

//   return new Response(sitemap, {
//     headers: {
//       "Content-Type": "application/xml",
//     },
//   });
// }
