import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";

type ExtractHeadingsOptions = {
  excludeDepths?: number[];
};

export function extractHeadings(markdown: string, options?: ExtractHeadingsOptions) {
  const tree = unified().use(remarkParse).parse(markdown);
  const excludedDepths = new Set(options?.excludeDepths ?? []);

  const headings: { text: string; depth: number; id: string }[] = [];

  visit(tree, "heading", (node) => {
    if (excludedDepths.has(node.depth)) {
      return;
    }

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
