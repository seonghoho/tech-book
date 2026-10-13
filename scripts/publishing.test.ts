import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPublished, normalizeDateString, todayInKst } from "../src/lib/publishing.ts";

describe("publishing policy", () => {
  it("uses the KST calendar date", () => {
    // 2026-10-13 15:30 UTC = 2026-10-14 00:30 KST
    assert.equal(todayInKst(new Date("2026-10-13T15:30:00Z")), "2026-10-14");
    assert.equal(todayInKst(new Date("2026-10-13T14:59:00Z")), "2026-10-13");
  });

  it("hides drafts regardless of date", () => {
    assert.equal(isPublished({ date: "2020-01-01", draft: true }), false);
  });

  it("hides scheduled posts until their KST publish date", () => {
    const beforeMidnight = new Date("2026-10-13T14:59:00Z");
    const afterMidnight = new Date("2026-10-13T15:01:00Z");
    assert.equal(isPublished({ date: "2026-10-14" }, beforeMidnight), false);
    assert.equal(isPublished({ date: "2026-10-14" }, afterMidnight), true);
  });

  it("accepts Date objects from unquoted frontmatter and missing dates", () => {
    assert.equal(normalizeDateString(new Date("2026-05-13T00:00:00Z")), "2026-05-13");
    assert.equal(isPublished({}), true);
  });
});
