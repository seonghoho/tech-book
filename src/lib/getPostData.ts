import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { visit } from "unist-util-visit";
import type { Node } from "unist";

const contentDirectory = path.join(process.cwd(), "src", "content");
const publicDirectory = path.join(process.cwd(), "public");

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

const getPngSize = (filePath: string) => {
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const getImageSize = (src: string) => {
  if (!src.startsWith("/")) return null;
  const filePath = path.join(publicDirectory, src);
  if (!fs.existsSync(filePath)) return null;
  if (path.extname(filePath).toLowerCase() === ".png") {
    return getPngSize(filePath);
  }
  return null;
};

type RehypeElement = {
  tagName?: string;
  properties?: Record<string, unknown>;
};

const isElementNode = (node: unknown): node is RehypeElement => {
  return typeof node === "object" && node !== null;
};

const rehypeImageAttrs = () => {
  return (tree: Node) => {
    visit(tree, "element", (node: unknown) => {
      if (!isElementNode(node) || node.tagName !== "img") return;
      node.properties = node.properties ?? {};
      if (!node.properties.loading) node.properties.loading = "lazy";
      if (!node.properties.decoding) node.properties.decoding = "async";
      const src = node.properties.src;
      if (typeof src === "string") {
        const size = getImageSize(src);
        if (size && !node.properties.width && !node.properties.height) {
          node.properties.width = size.width;
          node.properties.height = size.height;
        }
      }
    });
  };
};

export async function getPostData(type: "posts" | "games", slug: string) {
  const fullPath = path.join(contentDirectory, type, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found for slug: ${slug} in ${type}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrism)
    .use(rehypeSlug)
    .use(rehypeImageAttrs)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

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
