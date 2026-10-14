// 홈 히어로 미니 에디터의 순수 모델. React와 DOM에 의존하지 않는다.
// 모든 도형을 박스(x, y, w, h) + 회전(r, 도) 하나의 모델로 다룬다. 선분도 박스의 대각선이다.

export type ShapeKind = "ellipse" | "triangle" | "line" | "rect";

export type Shape = {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

export type Point = { x: number; y: number };
export type Handle = "nw" | "ne" | "se" | "sw";
export type Bounds = { width: number; height: number };
export type History = { past: Shape[][]; present: Shape[]; future: Shape[][] };

export const STAGE: Bounds = { width: 600, height: 450 };
export const MIN_SIZE = 40;
export const HISTORY_LIMIT = 30;

export function initialShapes(): Shape[] {
  return [
    { id: "circle", kind: "ellipse", x: 70, y: 70, w: 150, h: 150, r: 0 },
    { id: "triangle", kind: "triangle", x: 330, y: 60, w: 170, h: 150, r: 0 },
    { id: "line", kind: "line", x: 80, y: 290, w: 210, h: 90, r: 0 },
    { id: "rect", kind: "rect", x: 350, y: 270, w: 170, h: 110, r: -6 },
  ];
}

export function shapeCenter(s: Shape): Point {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

export function rotatePoint(p: Point, c: Point, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: c.x + (p.x - c.x) * cos - (p.y - c.y) * sin,
    y: c.y + (p.x - c.x) * sin + (p.y - c.y) * cos,
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function moveShape(s: Shape, dx: number, dy: number, bounds: Bounds = STAGE): Shape {
  // 중심점을 스테이지 안으로 제한해 도형이 완전히 밖으로 나가 다시 잡을 수 없게 되는 일을 막는다.
  const cx = clamp(s.x + s.w / 2 + dx, 0, bounds.width);
  const cy = clamp(s.y + s.h / 2 + dy, 0, bounds.height);
  return { ...s, x: cx - s.w / 2, y: cy - s.h / 2 };
}

const OPPOSITE_CORNER: Record<Handle, (s: Shape) => Point> = {
  nw: (s) => ({ x: s.x + s.w, y: s.y + s.h }),
  ne: (s) => ({ x: s.x, y: s.y + s.h }),
  se: (s) => ({ x: s.x, y: s.y }),
  sw: (s) => ({ x: s.x + s.w, y: s.y }),
};

export function resizeShape(
  orig: Shape,
  handle: Handle,
  pointer: Point,
  opts: { keepRatio?: boolean } = {},
): Shape {
  const center = shapeCenter(orig);
  // 회전된 도형도 포인터를 로컬 좌표로 되돌려 계산한다.
  const local = rotatePoint(pointer, center, -orig.r);
  const fixed = OPPOSITE_CORNER[handle](orig);

  let w = Math.max(MIN_SIZE, Math.abs(local.x - fixed.x));
  let h = Math.max(MIN_SIZE, Math.abs(local.y - fixed.y));
  if (opts.keepRatio || orig.kind === "ellipse") {
    const k = Math.max(w / orig.w, h / orig.h);
    w = orig.w * k;
    h = orig.h * k;
  }

  let x = handle.includes("w") ? fixed.x - w : fixed.x;
  let y = handle.includes("n") ? fixed.y - h : fixed.y;

  // 박스가 바뀌면 회전 중심도 바뀐다. 고정 모서리가 화면에서 제자리에 남도록 박스를 평행 이동한다.
  const before = rotatePoint(fixed, center, orig.r);
  const after = rotatePoint(fixed, { x: x + w / 2, y: y + h / 2 }, orig.r);
  x += before.x - after.x;
  y += before.y - after.y;

  return { ...orig, x, y, w, h };
}

const normalizeAngle = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export function rotateShape(orig: Shape, pointer: Point): Shape {
  const c = shapeCenter(orig);
  // atan2는 3시 방향이 0°라서 90°를 더해 12시 방향을 0°로 맞춘다.
  const deg = Math.round((Math.atan2(pointer.y - c.y, pointer.x - c.x) * 180) / Math.PI + 90);
  return { ...orig, r: normalizeAngle(deg) };
}

export function replaceShape(shapes: Shape[], next: Shape): Shape[] {
  return shapes.map((s) => (s.id === next.id ? next : s));
}

export function shapesEqual(a: Shape[], b: Shape[]): boolean {
  return (
    a.length === b.length &&
    a.every((s, i) => {
      const o = b[i];
      return (
        s.id === o.id && s.x === o.x && s.y === o.y && s.w === o.w && s.h === o.h && s.r === o.r
      );
    })
  );
}

export function createHistory(shapes: Shape[] = initialShapes()): History {
  return { past: [], present: shapes, future: [] };
}

// 조작이 끝난 시점에 호출한다. 조작 전 스냅샷(before)과 지금이 같으면 기록하지 않는다.
export function pushHistory(h: History, before: Shape[]): History {
  if (shapesEqual(before, h.present)) return h;
  return { past: [...h.past, before].slice(-HISTORY_LIMIT), present: h.present, future: [] };
}

export function undo(h: History): History {
  if (!h.past.length) return h;
  return {
    past: h.past.slice(0, -1),
    present: h.past[h.past.length - 1],
    future: [...h.future, h.present],
  };
}

export function redo(h: History): History {
  if (!h.future.length) return h;
  return {
    past: [...h.past, h.present].slice(-HISTORY_LIMIT),
    present: h.future[h.future.length - 1],
    future: h.future.slice(0, -1),
  };
}
