import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { visit } from "unist-util-visit";
import type { Node } from "unist";
import { rehypeCodeBlockFrame, stripLeadingH1Html } from "@/lib/postContentHtml";

const publicDirectory = path.join(process.cwd(), "public");

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

type RenderOptions = {
  stripLeadingH1?: boolean;
};

// 글 상세와 관리자 미리보기가 같은 결과를 내도록 마크다운 렌더링을 한곳에서 관리한다.
export async function renderMarkdownToHtml(markdown: string, options: RenderOptions = {}) {
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrism)
    .use(rehypeSlug)
    .use(rehypeImageAttrs)
    .use(rehypeCodeBlockFrame)
    .use(rehypeStringify)
    .process(markdown);

  const html = processed.toString();
  return options.stripLeadingH1 ? stripLeadingH1Html(html) : html;
}
