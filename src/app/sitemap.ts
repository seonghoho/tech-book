import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts"; // 글 목록 가져오는 함수 예시

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `https://tech-book-lime.vercel.app/posts/${post.slug}`,
    lastModified: post.date,
  }));

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
