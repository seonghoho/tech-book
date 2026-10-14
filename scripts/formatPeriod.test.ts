import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatPeriod } from "../src/lib/formatPeriod.ts";

describe("formatPeriod", () => {
  it("joins two dates with a tight en dash", () => {
    assert.equal(formatPeriod("2024.08 - 2026.02"), "2024.08–2026.02");
  });

  it("keeps spaces around the dash when one side is text", () => {
    assert.equal(formatPeriod("2026.03 - 재직 중"), "2026.03 – 재직 중");
  });

  it("leaves single dates and unspaced hyphens alone", () => {
    assert.equal(formatPeriod("2026.03"), "2026.03");
    assert.equal(formatPeriod("2024.08-2026.02"), "2024.08-2026.02");
  });
});
