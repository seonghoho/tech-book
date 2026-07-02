import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import { rehypeCodeBlockFrame, stripLeadingH1Html } from "../src/lib/postContentHtml.ts";

const renderMarkdown = async (markdown: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCodeBlockFrame)
    .use(rehypeStringify)
    .process(markdown);

  return file.toString();
};

describe("post content html", () => {
  it("removes the leading h1 from post content", () => {
    assert.equal(
      stripLeadingH1Html("<h1>Title</h1>\n<p>Body</p>"),
      "<p>Body</p>",
    );
  });

  it("wraps code blocks with language labels and copy buttons", async () => {
    const html = await renderMarkdown("```ts\nconst value = 1;\n```");

    assert.match(html, /class="post-code-block post-code-block--dark"/);
    assert.match(html, /class="post-code-language"/);
    assert.match(html, />TypeScript</);
    assert.match(html, /data-code-copy-button/);
    assert.match(html, /aria-label="코드 복사"/);
  });

  it("uses text as the fallback language label for code blocks without language", async () => {
    const html = await renderMarkdown("```\nplain text\n```");

    assert.match(html, />Text</);
  });
});
