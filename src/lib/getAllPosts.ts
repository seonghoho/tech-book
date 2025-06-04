import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
};

export const getAllPosts = (): PostMeta[] => {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, file);
      const content = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(content);

      return {
        slug,
        title: data.title,
        date: data.date,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};
