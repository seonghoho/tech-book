import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { isPublished } from "@/lib/publishing";

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

export async function getPostData(type: "posts" | "games", slug: string) {
  const fullPath = path.join(contentDirectory, type, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found for slug: ${slug} in ${type}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 예약 발행 글(미래 날짜)과 draft는 공개 전까지 존재하지 않는 글로 취급한다.
  if (type === "posts" && !isPublished(data)) {
    throw new Error(`Post not found for slug: ${slug} in ${type}`);
  }

  const contentHtml = await renderMarkdownToHtml(content, { stripLeadingH1: type === "posts" });

  return {
    slug,
    contentHtml,
    rawMarkdown: content,
    title: data.title,
    date: data.date,
    description: data.description,
    tags: normalizeTags(data.tags),
    updated: data.updated,
    readingTime: getReadingTime(content),
    image: data.image,
    featured: Boolean(data.featured),
  };
}
