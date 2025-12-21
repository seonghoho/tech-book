import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PostMeta } from "@/types/post";

const contentDirectory = path.join(process.cwd(), "src", "content");

const normalizeTags = (tags: unknown): string[] | undefined => {
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return undefined;
};

const getReadingTime = (content: string) => {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

export function getAllPosts(type: "posts" | "games"): PostMeta[] {
  const targetDirectory = path.join(contentDirectory, type);

  function getMdFilesRecursively(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const files = entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getMdFilesRecursively(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }
      return [];
    });

    return files;
  }

  const mdFilePaths = getMdFilesRecursively(targetDirectory);

  return mdFilePaths.map((fullPath) => {
    const slug = path
      .relative(targetDirectory, fullPath)
      .replace(/\\/g, "/")
      .replace(/\.md$/, "");
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const [category] = slug.split("/");

    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      tags: normalizeTags(data.tags),
      category,
      updated: data.updated,
      readingTime: getReadingTime(content),
      image: data.image,
      featured: Boolean(data.featured),
    };
  });
}

export function getAllTags(type: "posts" | "games") {
  const posts = getAllPosts(type);
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags?.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function getAllCategories(type: "posts" | "games") {
  const posts = getAllPosts(type);
  const categories = new Set<string>();
  posts.forEach((post) => {
    if (post.category) categories.add(post.category);
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}
