import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const run = (changedFiles: string) =>
  spawnSync("bash", ["scripts/vercel-ignore-build.sh"], {
    env: { ...process.env, CHANGED_FILES: changedFiles },
  }).status;

const SKIP = 0;
const BUILD = 1;

describe("vercel ignore build step", () => {
  it("skips builds for draft and image-only commits", () => {
    assert.equal(run("src/content/drafts/svg-editor/a.md"), SKIP);
    assert.equal(
      run("src/content/drafts/svg-editor/a.md\npublic/images/posts/svg-editor/a/img-1.webp"),
      SKIP,
    );
  });

  it("builds when published content or code changes", () => {
    assert.equal(run("src/content/posts/svg-editor/a.md"), BUILD);
    assert.equal(run("src/content/drafts/a/b.md\nsrc/app/page.tsx"), BUILD);
    assert.equal(run("public/images/projects/x.png"), BUILD);
  });

  it("builds on empty diffs such as manual redeploys", () => {
    assert.equal(run(""), BUILD);
  });
});
