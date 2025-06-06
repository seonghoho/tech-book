import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
};

export const getPostsByCategory = () => {
  const categories = fs
    .readdirSync(postsDirectory)
    .filter((name) =>
      fs.statSync(path.join(postsDirectory, name)).isDirectory()
    );

  const result: Record<string, PostMeta[]> = {};

  categories.forEach((category) => {
    const categoryPath = path.join(postsDirectory, category);
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
};

// export const getAllPosts = (): PostMeta[] => {
//   const fileNames = fs.readdirSync(postsDirectory);

//   return fileNames
//     .map((file) => {
//       const slug = file.replace(/\.md$/, "");
//       const fullPath = path.join(postsDirectory, file);
//       const content = fs.readFileSync(fullPath, "utf8");
//       const { data } = matter(content);

//       return {
//         slug,
//         title: data.title,
//         date: data.date,
//       };
//     })
//     .sort((a, b) => (a.date < b.date ? 1 : -1));
// };
