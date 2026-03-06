import type { MetadataRoute } from "next";
import { aboutProjects } from "@/lib/aboutData";
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

  const aboutProjectPages = aboutProjects.map((project) => ({
    url: absoluteUrl(`/about/projects/${project.slug}`),
    lastModified: now,
  }));

  return [
    ...staticPages,
    ...aboutProjectPages,
    ...posts,
    ...gameDocs,
    ...categories,
    ...tags,
  ];
}
