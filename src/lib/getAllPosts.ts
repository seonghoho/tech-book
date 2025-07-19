import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src", "posts");

export function getAllPosts(type?: 'post' | 'game') {
  const targetDirectory = type ? path.join(postsDirectory, type) : postsDirectory;

  function getMdFilesRecursively(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const files = entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getMdFilesRecursively(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      } else {
        return [];
      }
    });

    return files;
  }

  const mdFilePaths = getMdFilesRecursively(targetDirectory);

  return mdFilePaths.map((fullPath) => {
    const slug = path.relative(postsDirectory, fullPath).replace(/\.md$/, "");
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug, // 하위 경로 포함 ex: "dir1/post"
      ...(data as { title: string; date: string; description?: string }),
    };
  });
}
