import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src", "posts");

import { PostMeta } from "@/types/post";

export function getPostsByCategory(type: 'post' | 'game' = 'post') {
  const currentDirectory = path.join(postsDirectory, type);

  const categories = fs
    .readdirSync(currentDirectory)
    .filter((name) =>
      fs.statSync(path.join(currentDirectory, name)).isDirectory()
    );

  const result: Record<string, PostMeta[]> = {};

  categories.forEach((category) => {
    const categoryPath = path.join(currentDirectory, category);
    const files = fs.readdirSync(categoryPath);

    result[category] = files.map((file) => {
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
  });

  return result;
}
