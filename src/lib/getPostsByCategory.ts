import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PostMeta } from "@/types/post";

const contentDirectory = path.join(process.cwd(), "src", "content");

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
      const { data } = matter(content);

      return {
        slug: `${category}/${slug}`,
        title: data.title,
        date: data.date,
      };
    });

    // Sort posts by date descending
    posts.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    result[category] = posts;
  });

  return result;
}
