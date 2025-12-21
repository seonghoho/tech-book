import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getAllCategories, getAllPosts, getAllTags } from "@/lib/getAllPosts";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/posts",
    "/games",
    "/ux-lab",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
  }));

  const posts = getAllPosts("posts").map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    lastModified: new Date(post.date),
  }));

  const gameDocs = getAllPosts("games").map((post) => ({
    url: absoluteUrl(`/games/${post.slug}`),
    lastModified: new Date(post.date),
  }));

  const categories = getAllCategories("posts").map((category) => ({
    url: absoluteUrl(`/categories/${category}`),
    lastModified: now,
  }));

  const tags = getAllTags("posts").map((tag) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`),
    lastModified: now,
  }));

  return [...staticPages, ...posts, ...gameDocs, ...categories, ...tags];
}
