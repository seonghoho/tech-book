import fs from "fs";
import path from "path";
import matter from "gray-matter";

const gamesContentDirectory = path.join(process.cwd(), "src/content/games");

export const getAllGamePosts = () => {
  const categories = fs.readdirSync(gamesContentDirectory);

  const allPosts = categories.flatMap((category) => {
    const categoryPath = path.join(gamesContentDirectory, category);
    if (!fs.statSync(categoryPath).isDirectory()) {
      return [];
    }
    const fileNames = fs.readdirSync(categoryPath);

    return fileNames.map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(categoryPath, fileName);
      const content = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(content);

      return {
        slug,
        title: data.title,
        date: data.date,
        category,
      };
    });
  });

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
};
