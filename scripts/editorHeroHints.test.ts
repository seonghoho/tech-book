import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  editorHints,
  resolveHintPosts,
} from "../src/components/landing/editor-hero/editorHints.ts";

const postsDir = path.join(process.cwd(), "src", "content", "posts");

describe("editor hero hints", () => {
  it("points every hint at a post that exists in src/content/posts", () => {
    for (const [kind, hint] of Object.entries(editorHints)) {
      if (!hint.postSlug) continue;
      assert.ok(
        fs.existsSync(path.join(postsDir, `${hint.postSlug}.md`)),
        `${kind} → ${hint.postSlug}.md 가 없습니다`,
      );
    }
  });

  it("resolves titles and hrefs from the given post list", () => {
    const links = resolveHintPosts([
      { slug: "svg-editor/svg-history-snapshot-undo-redo", title: "스냅샷 글" },
    ]);
    assert.deepEqual(links.undo, {
      title: "스냅샷 글",
      href: "/posts/svg-editor/svg-history-snapshot-undo-redo",
    });
  });

  it("drops the link when the post is missing (deleted or unpublished)", () => {
    const links = resolveHintPosts([]);
    assert.equal(links.select, undefined);
    assert.equal(links.idle, undefined);
  });
});
