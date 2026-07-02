import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { aboutProjects } from "../src/lib/aboutData.ts";

describe("about projects", () => {
  it("includes toy projects with archive-ready project data", () => {
    const cherryWish = aboutProjects.find((project) => project.slug === "cherry-wish");
    const tripMarble = aboutProjects.find((project) => project.slug === "tripmarble");

    assert.ok(cherryWish);
    assert.ok(tripMarble);

    assert.equal(cherryWish.eyebrow, "토이 프로젝트");
    assert.equal(tripMarble.eyebrow, "토이 프로젝트");
    assert.equal(tripMarble.period, "2025.05 - 2025.09");
    assert.equal(tripMarble.duration, "5개월");
    assert.equal(tripMarble.team, "3명 · FE 2 / BE 1");
    assert.equal(tripMarble.role, "Web 프론트엔드 담당");
    assert.ok(cherryWish.links.some((link) => link.href === "https://wish.seonghoho.com/"));
    assert.ok(cherryWish.gallery.length > 0);
    assert.ok(tripMarble.gallery.length > 0);

    const tripMarbleGalleryImages = tripMarble.gallery
      .filter((item) => item.kind === "image")
      .map((item) => item.src);

    assert.deepEqual(
      tripMarbleGalleryImages,
      [
        "/images/projects/tripmarble/home-dice.png",
        "/images/projects/tripmarble/cover-og.png",
        "/images/projects/tripmarble/search.png",
        "/images/projects/tripmarble/spots.png",
        "/images/projects/tripmarble/game-detail.png",
      ],
    );
  });
});
