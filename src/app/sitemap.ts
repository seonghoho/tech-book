import type { MetadataRoute } from "next";
import { aboutProjects } from "@/lib/aboutData";
import { absoluteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/getAllPosts";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = ["", "/about", "/projects", "/posts", "/privacy"].map(
    (path) => ({
      url: absoluteUrl(path || "/"),
      lastModified: now,
    }),
  );

  const posts = getAllPosts("posts").map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    lastModified: new Date(post.date),
  }));

  const projectPages = aboutProjects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: now,
  }));

  return [...staticPages, ...projectPages, ...posts];
}
