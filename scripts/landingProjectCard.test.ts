import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatProjectMeta, projectGlyphKind } from "../src/components/landing/projectCard.ts";

describe("formatProjectMeta", () => {
  it("joins the period and team with an en dash range", () => {
    assert.equal(
      formatProjectMeta("2024.08 - 2026.02", "4명 · FE 3 / BE 1"),
      "2024.08–2026.02 · 4명 · FE 3 / BE 1",
    );
  });

  it("leaves periods without a spaced hyphen as they are", () => {
    assert.equal(formatProjectMeta("2025.03", "1명"), "2025.03 · 1명");
  });

  it("drops the separator when the team is empty", () => {
    assert.equal(formatProjectMeta("2024.02 - 2024.04", ""), "2024.02–2024.04");
  });
});

describe("projectGlyphKind", () => {
  it("maps known projects to their drawings", () => {
    assert.equal(projectGlyphKind("mathcanvas"), "canvas");
    assert.equal(projectGlyphKind("nowdoboss"), "route");
    assert.equal(projectGlyphKind("mancity"), "pitch");
  });

  it("falls back to the default drawing for unknown slugs", () => {
    assert.equal(projectGlyphKind("pawsitive"), "default");
    assert.equal(projectGlyphKind("constructor"), "default");
    assert.equal(projectGlyphKind("toString"), "default");
  });
});
