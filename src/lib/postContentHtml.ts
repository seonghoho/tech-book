import { visit } from "unist-util-visit";
import type { Node } from "unist";

type RehypeElement = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: RehypeNode[];
};

type RehypeText = {
  type?: string;
  value?: string;
};

type RehypeNode = RehypeElement | RehypeText;

const languageLabels: Record<string, string> = {
  js: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  sh: "Shell",
  bash: "Shell",
  zsh: "Shell",
  text: "Text",
  txt: "Text",
};

const isElement = (node: unknown): node is RehypeElement => {
  return typeof node === "object" && node !== null && (node as RehypeElement).type === "element";
};

const getClassNames = (node: RehypeElement) => {
  const className = node.properties?.className;

  if (Array.isArray(className)) {
    return className.map(String);
  }

  if (typeof className === "string") {
    return className.split(/\s+/).filter(Boolean);
  }

  return [];
};

const findCodeElement = (node: RehypeElement) => {
  return node.children?.find((child): child is RehypeElement => {
    return isElement(child) && child.tagName === "code";
  });
};

const getLanguage = (preNode: RehypeElement, codeNode?: RehypeElement) => {
  const classNames = [...getClassNames(preNode), ...(codeNode ? getClassNames(codeNode) : [])];
  const languageClass = classNames.find((className) => className.startsWith("language-"));
  const language = languageClass?.replace("language-", "").trim().toLowerCase();

  if (!language) {
    return "text";
  }

  return language;
};

const getLanguageLabel = (language: string) => {
  return languageLabels[language] ?? language.toUpperCase();
};

const createElement = (
  tagName: string,
  properties: Record<string, unknown>,
  children: RehypeNode[] = [],
): RehypeElement => ({
  type: "element",
  tagName,
  properties,
  children,
});

export const stripLeadingH1Html = (html: string) => {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
};

export const rehypeCodeBlockFrame = () => {
  return (tree: Node) => {
    visit(tree, "element", (node: unknown, index: number | undefined, parent: RehypeElement) => {
      if (!isElement(node) || node.tagName !== "pre" || index === undefined || !parent?.children) {
        return;
      }

      const codeNode = findCodeElement(node);
      const language = getLanguage(node, codeNode);
      const label = getLanguageLabel(language);

      parent.children[index] = createElement(
        "div",
        {
          className: ["post-code-block", "post-code-block--dark"],
          "data-code-language": language,
        },
        [
          createElement(
            "div",
            {
              className: ["post-code-header"],
            },
            [
              createElement(
                "span",
                {
                  className: ["post-code-language"],
                },
                [{ type: "text", value: label }],
              ),
              createElement(
                "button",
                {
                  type: "button",
                  className: ["post-code-copy-button"],
                  "data-code-copy-button": true,
                  "aria-label": "코드 복사",
                },
                [{ type: "text", value: "복사" }],
              ),
            ],
          ),
          node,
        ],
      );
    });
  };
};
