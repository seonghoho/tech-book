import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPostsArchiveHref,
  getPostsArchiveState,
} from "../src/lib/postsArchive.ts";
import type { PostMeta } from "../src/types/post.ts";

const posts = Array.from({ length: 12 }, (_, index): PostMeta => {
  const number = index + 1;
  const category = number <= 6 ? "svg-editor" : "voca-study";

  return {
    slug: `${category}/post-${number}`,
    title: number === 8 ? "동의어 반의어 UI 구성" : `Post ${number}`,
    date: `2026-04-${String(number).padStart(2, "0")}`,
    description: number === 3 ? "Three.js selection flow" : `Description ${number}`,
    tags: number === 10 ? ["quiz", "state"] : ["devlog"],
    category,
    readingTime: 1,
  };
});

const categoryLabels = {
  "svg-editor": "SVG Editor Devlog",
  "voca-study": "Voca Study Devlog",
};

describe("posts archive state", () => {
  it("filters by query, category, and tag before paginating", () => {
    const state = getPostsArchiveState({
      posts,
      categoryLabels,
      searchParams: {
        query: "ui",
        category: "voca-study",
        tag: "devlog",
        page: "2",
      },
      postsPerPage: 10,
    });

    assert.equal(state.totalItems, 1);
    assert.equal(state.safePage, 1);
    assert.deepEqual(
      state.pagePosts.map((post) => post.slug),
      ["voca-study/post-8"],
    );
  });

  it("builds category tabs from available posts with an all option", () => {
    const state = getPostsArchiveState({
      posts,
      categoryLabels,
      searchParams: {},
      postsPerPage: 10,
    });

    assert.deepEqual(state.categoryTabs, [
      { label: "전체", value: "", count: 12 },
      { label: "SVG Editor Devlog", value: "svg-editor", count: 6 },
      { label: "Voca Study Devlog", value: "voca-study", count: 6 },
    ]);
  });

  it("returns the requested page slice and normalizes invalid page values", () => {
    const pageTwo = getPostsArchiveState({
      posts,
      categoryLabels,
      searchParams: { page: "2" },
      postsPerPage: 10,
    });

    assert.equal(pageTwo.safePage, 2);
    assert.deepEqual(
      pageTwo.pagePosts.map((post) => post.slug),
      ["voca-study/post-11", "voca-study/post-12"],
    );

    const invalidPage = getPostsArchiveState({
      posts,
      categoryLabels,
      searchParams: { page: "abc" },
      postsPerPage: 10,
    });

    assert.equal(invalidPage.safePage, 1);
  });
});

describe("posts archive href builder", () => {
  it("preserves active filters while replacing page", () => {
    assert.equal(
      buildPostsArchiveHref(
        {
          query: "three",
          category: "svg-editor",
          tag: "raycaster",
          page: "1",
        },
        { page: "2" },
      ),
      "/posts?query=three&tag=raycaster&category=svg-editor&page=2",
    );
  });

  it("removes empty values and resets omitted page to the first page", () => {
    assert.equal(
      buildPostsArchiveHref(
        {
          query: "three",
          category: "svg-editor",
          tag: "",
          page: "4",
        },
        { query: "", category: "", page: "1" },
      ),
      "/posts",
    );
  });
});
