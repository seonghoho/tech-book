import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isPublished } from "../src/lib/publishing.ts";

const contentDirectory = path.join(process.cwd(), "src", "content");

function getMdFilesRecursively(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
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

const postFiles = getMdFilesRecursively(path.join(contentDirectory, 'posts'));
const gameFiles = getMdFilesRecursively(path.join(contentDirectory, 'games'));

const allFiles = [...postFiles, ...gameFiles];

const posts = allFiles.flatMap((fullPath) => {
  const type = fullPath.includes(`${path.sep}posts${path.sep}`) ? 'posts' : 'games';
  const slug = path.relative(path.join(contentDirectory, type), fullPath).replace(/\\/g, '/').replace(/\.md$/, "");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);
  // 예약 발행 글과 draft는 검색 인덱스(posts.json)에 넣지 않는다.
  if (type === 'posts' && !isPublished(data)) return [];
  return [{ slug, type, ...data }];
});

fs.writeFileSync(
  "./public/posts.json",
  JSON.stringify(posts, null, 2),
  "utf-8"
);

console.log("✅ posts.json created!");
