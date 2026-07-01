import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildArticleJsonLd } from "../src/lib/seo.ts";
import { absoluteUrl, getSiteUrl } from "../src/lib/site.ts";

describe("site SEO configuration", () => {
  it("uses the canonical production domain even when deployment env vars are present", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://tech-book-time.vercel.app";

    try {
      assert.equal(getSiteUrl(), "https://seonghoho.com");
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previous;
      }
    }
  });

  it("builds absolute URLs without duplicate slashes", () => {
    assert.equal(
      absoluteUrl("/posts/svg-editor/use-line"),
      "https://seonghoho.com/posts/svg-editor/use-line",
    );
    assert.equal(
      absoluteUrl("posts/svg-editor/use-line"),
      "https://seonghoho.com/posts/svg-editor/use-line",
    );
    assert.equal(
      absoluteUrl("//posts/svg-editor/use-line"),
      "https://seonghoho.com/posts/svg-editor/use-line",
    );
  });

  it("builds BlogPosting structured data with site author and canonical URLs", () => {
    const jsonLd = buildArticleJsonLd({
      title: "Three.js Raycaster 클릭 영역 넓히기",
      description: "Three.js 라인 클릭 영역을 안정적으로 넓힌 과정을 정리합니다.",
      path: "/posts/svg-editor/three-js-raycaster-hit-area",
      datePublished: "2026-04-01T00:00:00.000Z",
      dateModified: "2026-04-02T00:00:00.000Z",
      image: "/og-image.png",
      tags: ["Three.js", "Raycaster"],
      category: "SVG Editor Devlog",
    }) as Record<string, unknown>;

    assert.equal(jsonLd["@type"], "BlogPosting");
    assert.equal(jsonLd.url, "https://seonghoho.com/posts/svg-editor/three-js-raycaster-hit-area");
    assert.deepEqual(jsonLd.author, {
      "@type": "Person",
      name: "최성호",
      url: "https://seonghoho.com/about",
    });
    assert.equal((jsonLd.publisher as Record<string, unknown>)["@type"], "Person");
    assert.equal(jsonLd.image, "https://seonghoho.com/og-image.png");
    assert.deepEqual(jsonLd.keywords, ["Three.js", "Raycaster"]);
  });
});
