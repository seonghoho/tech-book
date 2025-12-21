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

export function getPostsByCategory(type: "posts" | "games") {
  const currentDirectory = path.join(contentDirectory, type);

  if (!fs.existsSync(currentDirectory)) {
    return {};
  }

  const categories = fs
    .readdirSync(currentDirectory)
    .filter((name) =>
      fs.statSync(path.join(currentDirectory, name)).isDirectory()
    );

  const result: Record<string, PostMeta[]> = {};

  categories.forEach((category) => {
    const categoryPath = path.join(currentDirectory, category);
    const files = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith(".md"));

    const posts = files.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(categoryPath, file);
      const content = fs.readFileSync(fullPath, "utf8");
      const { data, content: body } = matter(content);

      return {
        slug: `${category}/${slug}`,
        title: data.title,
        date: data.date,
        description: data.description,
        tags: normalizeTags(data.tags),
        category,
        updated: data.updated,
        readingTime: getReadingTime(body),
        image: data.image,
        featured: Boolean(data.featured),
      };
    });

    // Sort posts by date descending
    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    result[category] = posts;
  });

  return result;
}
