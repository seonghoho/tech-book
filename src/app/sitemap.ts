import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/getAllPosts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `https://tech-book-lime.vercel.app/posts/${post.slug}`,
    lastModified: post.date,
  }));
  // console.log("posts", posts);
  // console.log("postUrls", postUrls);
  return [
    {
      url: "https://tech-book-lime.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://tech-book-lime.vercel.app/posts",
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
