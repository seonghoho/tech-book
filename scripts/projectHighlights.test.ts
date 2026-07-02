import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { splitHighlightText } from "../src/lib/projectHighlights.ts";

describe("project highlight text", () => {
  it("splits matched phrases into highlighted text segments", () => {
    assert.deepEqual(
      splitHighlightText("역할별 사용자 흐름과 5단계 맞춤형 흐름을 설계했습니다.", [
        "역할별 사용자 흐름",
        "5단계 맞춤형 흐름",
      ]),
      [
        { text: "역할별 사용자 흐름", highlighted: true },
        { text: "과 ", highlighted: false },
        { text: "5단계 맞춤형 흐름", highlighted: true },
        { text: "을 설계했습니다.", highlighted: false },
      ],
    );
  });

  it("prefers the longest phrase when phrases overlap", () => {
    assert.deepEqual(splitHighlightText("React Query로 데이터 흐름을 정리했습니다.", [
      "React",
      "React Query",
    ]), [
      { text: "React Query", highlighted: true },
      { text: "로 데이터 흐름을 정리했습니다.", highlighted: false },
    ]);
  });

  it("returns plain text when no phrases match", () => {
    assert.deepEqual(splitHighlightText("강조할 문구가 없습니다.", ["Jotai"]), [
      { text: "강조할 문구가 없습니다.", highlighted: false },
    ]);
  });
});
