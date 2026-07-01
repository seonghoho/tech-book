import type { MetadataRoute } from "next";
import { aboutProjects } from "@/lib/aboutData";
import { absoluteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/getAllPosts";
import { isIndexablePostSlug } from "@/lib/contentVisibility";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = ["", "/about", "/projects", "/posts", "/privacy"].map(
    (path) => ({
      url: absoluteUrl(path || "/"),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const posts = getAllPosts("posts")
    .filter((post) => isIndexablePostSlug(post.slug))
    .map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const projectPages = aboutProjects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages, ...posts];
}
