import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

// 글·게임 상세 경로와 (main) 레이아웃에 loading.tsx나 Suspense가 있으면, 응답이 200으로
// 먼저 나간 뒤 notFound()가 불려 없는 주소가 404 대신 200(소프트 404)이 된다.
// 2026-10-21에 초안 주소가 200으로 열리는 것을 보고 확인했다.
describe("not-found boundaries", () => {
  it("post and game detail routes have no loading.tsx", () => {
    assert.equal(existsSync("src/app/(main)/posts/[...slug]/loading.tsx"), false);
    assert.equal(existsSync("src/app/(main)/games/[...slug]/loading.tsx"), false);
  });

  it("the (main) layout does not wrap pages in Suspense", () => {
    const layout = readFileSync("src/app/(main)/layout.tsx", "utf8");
    assert.equal(layout.includes("Suspense"), false);
  });
});
