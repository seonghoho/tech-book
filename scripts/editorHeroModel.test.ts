import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HISTORY_LIMIT,
  MIN_SIZE,
  createHistory,
  drawLength,
  handlePoint,
  initialShapes,
  moveShape,
  pushHistory,
  redo,
  replaceShape,
  resizeShape,
  rotatePoint,
  rotateShape,
  shapeCenter,
  undo,
  type Handle,
  type Point,
  type Shape,
} from "../src/components/landing/editor-hero/editorModel.ts";

const box = (over: Partial<Shape> = {}): Shape => ({
  id: "box",
  kind: "rect",
  x: 100,
  y: 100,
  w: 120,
  h: 80,
  r: 0,
  ...over,
});

// 핸들 반대쪽(고정) 모서리의 화면 좌표.
const OPPOSITE: Record<Handle, (s: Shape) => Point> = {
  nw: (s) => ({ x: s.x + s.w, y: s.y + s.h }),
  ne: (s) => ({ x: s.x, y: s.y + s.h }),
  se: (s) => ({ x: s.x, y: s.y }),
  sw: (s) => ({ x: s.x + s.w, y: s.y }),
};
const fixedWorld = (s: Shape, handle: Handle) =>
  rotatePoint(OPPOSITE[handle](s), shapeCenter(s), s.r);

const assertClose = (actual: Point, expected: Point) => {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-6, `x ${actual.x} ≠ ${expected.x}`);
  assert.ok(Math.abs(actual.y - expected.y) < 1e-6, `y ${actual.y} ≠ ${expected.y}`);
};

describe("initialShapes", () => {
  it("matches the approved mockup layout", () => {
    assert.deepEqual(
      initialShapes().map(({ kind, x, y, w, h, r }) => [kind, x, y, w, h, r]),
      [
        ["ellipse", 70, 70, 150, 150, 0],
        ["triangle", 330, 60, 170, 150, 0],
        ["line", 80, 290, 210, 90, 0],
        ["rect", 350, 270, 170, 110, -6],
      ],
    );
  });

  it("returns a fresh array each call", () => {
    const a = initialShapes();
    a[0].x = 999;
    assert.equal(initialShapes()[0].x, 70);
  });
});

describe("moveShape", () => {
  it("moves by the pointer delta inside the stage", () => {
    const moved = moveShape(box(), 30, -20);
    assert.equal(moved.x, 130);
    assert.equal(moved.y, 80);
  });

  it("keeps the center inside the stage so the shape can be grabbed again", () => {
    const moved = moveShape(box(), 5000, -5000);
    assert.deepEqual(shapeCenter(moved), { x: 600, y: 0 });
    const back = moveShape(box(), -5000, 5000);
    assert.deepEqual(shapeCenter(back), { x: 0, y: 450 });
  });
});

describe("resizeShape", () => {
  for (const r of [0, 90, -6]) {
    for (const handle of ["nw", "ne", "se", "sw"] as Handle[]) {
      it(`keeps the opposite corner fixed on screen (r=${r}, ${handle})`, () => {
        const orig = box({ r });
        const next = resizeShape(orig, handle, { x: 420, y: 390 });
        assertClose(fixedWorld(next, handle), fixedWorld(orig, handle));
      });
    }
  }

  it("grows to the pointer distance in local coordinates", () => {
    const next = resizeShape(box(), "se", { x: 300, y: 260 });
    assert.equal(next.x, 100);
    assert.equal(next.y, 100);
    assert.equal(next.w, 200);
    assert.equal(next.h, 160);
  });

  it("never shrinks below the minimum size", () => {
    const next = resizeShape(box(), "se", { x: 101, y: 101 });
    assert.equal(next.w, MIN_SIZE);
    assert.equal(next.h, MIN_SIZE);
  });

  it("does not flip when the pointer crosses the fixed corner", () => {
    const orig = box();
    const next = resizeShape(orig, "se", { x: 40, y: 60 });
    assert.equal(next.w, MIN_SIZE + 20);
    assert.equal(next.h, MIN_SIZE);
    assertClose(fixedWorld(next, "se"), fixedWorld(orig, "se"));
  });

  it("keeps the aspect ratio for ellipses", () => {
    const orig = box({ kind: "ellipse", w: 150, h: 100 });
    const next = resizeShape(orig, "se", { x: 400, y: 210 });
    assert.ok(Math.abs(next.w / next.h - 1.5) < 1e-9);
  });

  it("keeps the aspect ratio when keepRatio is set (Shift)", () => {
    const next = resizeShape(box(), "se", { x: 400, y: 200 }, { keepRatio: true });
    assert.ok(Math.abs(next.w / next.h - 1.5) < 1e-9);
  });
});

describe("rotateShape", () => {
  // box() 중심은 (160, 140)
  it("treats 12 o'clock as 0°", () => {
    assert.equal(rotateShape(box(), { x: 160, y: 0 }).r, 0);
  });

  it("returns 90° at 3 o'clock and -90° at 9 o'clock", () => {
    assert.equal(rotateShape(box(), { x: 400, y: 140 }).r, 90);
    assert.equal(rotateShape(box(), { x: 0, y: 140 }).r, -90);
  });

  it("rounds to whole degrees", () => {
    assert.ok(Number.isInteger(rotateShape(box(), { x: 233, y: 17 }).r));
  });
});

describe("history", () => {
  const moved = (h: ReturnType<typeof createHistory>) =>
    replaceShape(h.present, moveShape(h.present[0], 10, 0));

  it("does not record an interaction that changed nothing", () => {
    const h = createHistory();
    assert.equal(pushHistory(h, h.present), h);
  });

  it("records the snapshot before the change and clears redo", () => {
    let h = createHistory();
    const before = h.present;
    h = { ...h, present: moved(h), future: [initialShapes()] };
    h = pushHistory(h, before);
    assert.equal(h.past.length, 1);
    assert.equal(h.past[0], before);
    assert.equal(h.future.length, 0);
  });

  it("keeps at most HISTORY_LIMIT snapshots", () => {
    let h = createHistory();
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) {
      const before = h.present;
      h = pushHistory({ ...h, present: moved(h) }, before);
    }
    assert.equal(h.past.length, HISTORY_LIMIT);
  });

  it("undoes and redoes, and a new change after undo clears the future", () => {
    let h = createHistory();
    const start = h.present;
    h = pushHistory({ ...h, present: moved(h) }, start);
    const afterMove = h.present;

    h = undo(h);
    assert.equal(h.present, start);
    assert.equal(h.future.length, 1);

    h = redo(h);
    assert.equal(h.present, afterMove);

    h = undo(h);
    const before = h.present;
    h = pushHistory({ ...h, present: moved(h) }, before);
    assert.equal(h.future.length, 0);
  });

  it("undo and redo on empty stacks return the same history", () => {
    const h = createHistory();
    assert.equal(undo(h), h);
    assert.equal(redo(h), h);
  });
});

describe("handlePoint", () => {
  for (const r of [0, 90, -6]) {
    for (const handle of ["nw", "ne", "se", "sw"] as Handle[]) {
      it(`resizing to the handle's own corner changes nothing (r=${r}, ${handle})`, () => {
        const orig = box({ r });
        const next = resizeShape(orig, handle, handlePoint(orig, handle));
        assertClose({ x: next.x, y: next.y }, { x: orig.x, y: orig.y });
        assert.ok(Math.abs(next.w - orig.w) < 1e-6 && Math.abs(next.h - orig.h) < 1e-6);
      });
    }
  }
});

describe("drawLength", () => {
  it("stretches the dash when the stage is shown larger than the viewBox", () => {
    assert.equal(drawLength(400, 1.16), 464);
  });

  it("never shortens the dash below the path length on small screens", () => {
    assert.equal(drawLength(400, 0.57), 400);
  });
});
