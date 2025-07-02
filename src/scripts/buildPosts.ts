import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src", "posts");

function getMdFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getMdFilesRecursively(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      return [fullPath];
    } else {
      return [];
    }
  });
}

const mdFilePaths = getMdFilesRecursively(postsDirectory);

const posts = mdFilePaths.map((fullPath) => {
  const slug = path.relative(postsDirectory, fullPath).replace(/\.md$/, "");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  return { slug, ...data };
});

fs.writeFileSync(
  "./public/posts.json",
  JSON.stringify(posts, null, 2),
  "utf-8"
);

console.log("✅ posts.json created!");
