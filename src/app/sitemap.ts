import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getAllPosts } from "@/lib/getAllPosts";
import { games } from "@/lib/gamesData";

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

  const gamePlays = games.map((game) => ({
    url: absoluteUrl(`/play/${game.playSlug}`),
    lastModified: now,
  }));

  return [...staticPages, ...posts, ...gameDocs, ...gamePlays];
}
