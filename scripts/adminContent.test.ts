import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parsePostFile, serializePostFile } from "../src/lib/admin/frontmatter.ts";
import {
  contentPath,
  imagePath,
  isWritablePath,
  parseContentPath,
  toPreviewImageSrc,
} from "../src/lib/admin/paths.ts";
import { proseLength, runQualityChecks } from "../src/lib/admin/quality.ts";

describe("admin content paths", () => {
  it("builds and parses content paths", () => {
    const path = contentPath("drafts", "svg-editor", "new-post");
    assert.equal(path, "src/content/drafts/svg-editor/new-post.md");
    assert.deepEqual(parseContentPath(path), {
      kind: "drafts",
      category: "svg-editor",
      slug: "new-post",
    });
  });

  it("rejects traversal and unexpected locations", () => {
    assert.throws(() => contentPath("posts", "..", "x"));
    assert.throws(() => contentPath("posts", "svg-editor", "../../package"));
    assert.throws(() => contentPath("posts", "SVG", "x"));
    assert.throws(() => imagePath("svg-editor", "post", "../x.webp"));
    assert.equal(isWritablePath("package.json"), false);
    assert.equal(isWritablePath("src/content/posts/a/../b.md"), false);
    assert.equal(isWritablePath("src/content/games/a/b.md"), false);
    assert.equal(isWritablePath("public/images/posts/a/b/img-1.webp"), true);
    assert.equal(isWritablePath("public/images/posts/a/b/img-1.svg"), false);
  });

  it("maps public image urls to raw GitHub urls for preview", () => {
    const repo = { owner: "o", repo: "r", branch: "master" };
    assert.equal(
      toPreviewImageSrc("/images/posts/a/b/c.webp", repo),
      "https://raw.githubusercontent.com/o/r/master/public/images/posts/a/b/c.webp",
    );
    assert.equal(toPreviewImageSrc("https://example.com/x.png", repo), "https://example.com/x.png");
  });
});

describe("admin frontmatter", () => {
  it("round-trips in the existing file format", () => {
    const raw = serializePostFile(
      {
        title: 'Three.js "렌더링" 순서',
        date: "2026-10-13",
        description: "설명",
        image: "/images/posts/a/b/cover.webp",
        tags: ["Three.js", "Render"],
        draft: true,
      },
      "\n\n## 본문\n\n내용",
    );
    assert.ok(raw.startsWith('---\ntitle: "Three.js \\"렌더링\\" 순서"\ndate: "2026-10-13"\n'));
    assert.ok(raw.includes('tags: ["Three.js","Render"]\ndraft: true\n---\n\n## 본문'));

    const parsed = parsePostFile(raw);
    assert.equal(parsed.frontmatter.title, 'Three.js "렌더링" 순서');
    assert.equal(parsed.frontmatter.date, "2026-10-13");
    assert.deepEqual(parsed.frontmatter.tags, ["Three.js", "Render"]);
    assert.equal(parsed.frontmatter.draft, true);
    assert.equal(parsed.body, "## 본문\n\n내용\n");
  });

  it("omits empty optional fields", () => {
    const raw = serializePostFile({ title: "t", date: "2026-10-13", tags: [] }, "body");
    assert.equal(raw, '---\ntitle: "t"\ndate: "2026-10-13"\n---\n\nbody\n');
  });
});

describe("admin quality checks", () => {
  it("measures prose without code blocks", () => {
    assert.equal(proseLength("가나다\n```ts\nconst a = 1;\n```\n`x` 라마"), 5);
  });

  it("flags short posts without links or cover", () => {
    const checks = runQualityChecks({ title: "짧은 제목", body: "![](/images/x.webp) 짧은 글" });
    const failed = checks.filter((check) => !check.ok).map((check) => check.id);
    assert.deepEqual(failed.sort(), ["alt", "cover", "description", "internal-link", "length", "title"]);
  });
});
