import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "src", "content");

export function getAllPosts(type: 'posts' | 'games') {
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
      } else {
        return [];
      }
    });

    return files;
  }

  const mdFilePaths = getMdFilesRecursively(targetDirectory);

  return mdFilePaths.map((fullPath) => {
    const slug = path.relative(targetDirectory, fullPath).replace(/\\/g, '/').replace(/\.md$/, "");
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      ...(data as { title: string; date: string; description?: string }),
    };
  });
}
