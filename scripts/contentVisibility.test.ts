import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isAdsenseEligiblePath } from "../src/lib/adsense.ts";
import { filterIndexablePosts, isIndexablePostSlug } from "../src/lib/contentVisibility.ts";

describe("content visibility policy", () => {
  it("excludes summary-style Deep Dive posts from indexable publisher content", () => {
    assert.equal(isIndexablePostSlug("mordern-js-deep-dive/04"), false);
    assert.equal(isAdsenseEligiblePath("/posts/mordern-js-deep-dive/04"), false);
  });

  it("keeps original implementation notes eligible as publisher content", () => {
    assert.equal(isIndexablePostSlug("svg-editor/three-js-line-geometry-error"), true);
    assert.equal(isAdsenseEligiblePath("/posts/svg-editor/three-js-line-geometry-error"), true);
  });

  it("does not load AdSense on archive or utility pages", () => {
    assert.equal(isAdsenseEligiblePath("/posts"), false);
    assert.equal(isAdsenseEligiblePath("/projects"), false);
    assert.equal(isAdsenseEligiblePath("/search"), false);
    assert.equal(isAdsenseEligiblePath("/games"), false);
  });

  it("removes non-indexable posts from primary writing surfaces", () => {
    const posts = [
      { slug: "mordern-js-deep-dive/04", title: "04장 변수" },
      { slug: "svg-editor/three-js-line-geometry-error", title: "Three.js LineGeometry 문제 해결" },
    ];

    assert.deepEqual(filterIndexablePosts(posts), [posts[1]]);
  });
});
