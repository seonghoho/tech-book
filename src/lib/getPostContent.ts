import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

export function extractHeadings(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown);

  const headings: { text: string; depth: number; id: string }[] = [];

  visit(tree, "heading", (node) => {
    const text = node.children
      .filter((n) => n.type === "text")
      .map((n) => n.value)
      .join("");

    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^가-힣\w\-]/g, "");

    headings.push({ text, depth: node.depth, id });
  });

  return headings;
}
