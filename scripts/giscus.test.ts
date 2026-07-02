import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getGiscusTheme, giscusConfig } from "../src/lib/giscus.ts";

describe("giscus config", () => {
  it("uses the configured GitHub Discussions repository", () => {
    assert.equal(giscusConfig.repo, "seonghoho/tech-book");
    assert.equal(giscusConfig.repoId, "R_kgDOO16MuA");
    assert.equal(giscusConfig.category, "General");
    assert.equal(giscusConfig.categoryId, "DIC_kwDOO16MuM4DAVZF");
  });

  it("maps comment threads by pathname with Korean UI", () => {
    assert.equal(giscusConfig.mapping, "pathname");
    assert.equal(giscusConfig.lang, "ko");
    assert.equal(giscusConfig.lightTheme, "noborder_light");
    assert.equal(giscusConfig.darkTheme, "noborder_dark");
  });

  it("selects a noborder theme for the current site mode", () => {
    assert.equal(getGiscusTheme(false), "noborder_light");
    assert.equal(getGiscusTheme(true), "noborder_dark");
  });

  it("loads the comment widget close to the comment section", () => {
    assert.equal(giscusConfig.loadRootMargin, "600px 0px");
  });
});
