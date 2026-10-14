"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { CursorArrowIcon, RedoIcon, UndoIcon } from "@/assets/svg";
import {
  STAGE,
  createHistory,
  handlePoint,
  moveShape,
  pushHistory,
  redo,
  replaceShape,
  resizeShape,
  rotateShape,
  shapeCenter,
  undo,
  type Handle,
  type Point,
  type Shape,
} from "./editorModel";
import { editorHints, type HintKind, type HintPostLinks } from "./editorHints";
import { useIntroMotion } from "./useIntroMotion";

type Props = {
  hintPosts: HintPostLinks;
};

type Drag = {
  mode: "move" | "resize" | "rotate";
  handle?: Handle;
  start: Point;
  orig: Shape;
  before: Shape[];
  announced: boolean;
  pointerId: number;
  // 리사이즈: 누른 지점과 핸들 모서리의 차이. 처음 누를 때 모서리가 포인터로 튀지 않게 한다.
  grab: Point;
};

const ARROW_STEP: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};
// 방향키를 이 시간 안에 이어 누르면 히스토리 1개로 묶는다.
const KEY_BURST_MS = 400;
const HANDLE_GAP = 6;
// 375px 화면(축척 약 0.57)에서도 손가락으로 잡히도록 지름 약 25px을 확보한다.
const HIT_RADIUS = 22;

function ShapeNode({ shape }: { shape: Shape }) {
  const c = shapeCenter(shape);
  const common = {
    "data-shape-id": shape.id,
    className:
      shape.kind === "line" ? "editor-hero-shape editor-hero-shape-line" : "editor-hero-shape",
    transform: `rotate(${shape.r} ${c.x} ${c.y})`,
  };

  if (shape.kind === "ellipse") {
    return <ellipse {...common} cx={c.x} cy={c.y} rx={shape.w / 2} ry={shape.h / 2} />;
  }
  if (shape.kind === "rect") {
    return <rect {...common} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={14} />;
  }
  if (shape.kind === "triangle") {
    const points = `${shape.x + shape.w / 2},${shape.y} ${shape.x + shape.w},${shape.y + shape.h} ${shape.x},${shape.y + shape.h}`;
    return <polygon {...common} points={points} />;
  }
  // 선분은 2px 선만 맞아서 잡기 어렵다. 같은 대각선에 투명한 굵은 선을 깔아 히트 영역으로 쓴다.
  const ends = { x1: shape.x, y1: shape.y + shape.h, x2: shape.x + shape.w, y2: shape.y };
  return (
    <>
      <line
        data-shape-id={shape.id}
        className="editor-hero-line-hit"
        transform={common.transform}
        {...ends}
      />
      <line {...common} className={`${common.className} pointer-events-none`} {...ends} />
    </>
  );
}

function SelectionOverlay({ shape }: { shape: Shape }) {
  const c = shapeCenter(shape);
  const g = HANDLE_GAP;
  const corners: Array<[Handle, number, number]> = [
    ["nw", shape.x - g, shape.y - g],
    ["ne", shape.x + shape.w + g, shape.y - g],
    ["se", shape.x + shape.w + g, shape.y + shape.h + g],
    ["sw", shape.x - g, shape.y + shape.h + g],
  ];

  // 선택 박스와 핸들을 도형과 같은 회전으로 감싸서 함께 돌게 한다.
  return (
    <g transform={`rotate(${shape.r} ${c.x} ${c.y})`}>
      <rect
        className="editor-hero-selection"
        x={shape.x - g}
        y={shape.y - g}
        width={shape.w + g * 2}
        height={shape.h + g * 2}
      />
      <line className="editor-hero-stem" x1={c.x} y1={shape.y - g} x2={c.x} y2={shape.y - 32} />
      <circle
        className="editor-hero-hit cursor-grab"
        data-handle="rotate"
        cx={c.x}
        cy={shape.y - 38}
        r={HIT_RADIUS}
      />
      <circle className="editor-hero-handle" cx={c.x} cy={shape.y - 38} r={6} />
      {corners.map(([handle, x, y]) => (
        <g key={handle}>
          <circle
            className={`editor-hero-hit ${handle === "nw" || handle === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize"}`}
            data-handle={handle}
            cx={x}
            cy={y}
            r={HIT_RADIUS}
          />
          <rect className="editor-hero-handle" x={x - 5} y={y - 5} width={10} height={10} rx={2} />
        </g>
      ))}
    </g>
  );
}

function ToolButton({
  label,
  title,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  title: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-[10px] border border-transparent text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out enabled:hover:border-[color:var(--color-border)] disabled:cursor-default disabled:opacity-40 aria-pressed:bg-[color:var(--color-accent-soft)] aria-pressed:text-[color:var(--color-accent)]"
    >
      {children}
    </button>
  );
}

export default function EditorHero({ hintPosts }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const burstBeforeRef = useRef<Shape[] | null>(null);
  const burstTimerRef = useRef(0);

  const [history, setHistory] = useState(createHistory);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hint, setHint] = useState<{ kind: HintKind; nonce: number }>({ kind: "idle", nonce: 0 });
  const { intro, stopIntro } = useIntroMotion(stageRef, svgRef);

  const announce = useCallback((kind: HintKind) => {
    setHint((current) => ({ kind, nonce: current.nonce + 1 }));
  }, []);

  const flushKeyBurst = useCallback(() => {
    window.clearTimeout(burstTimerRef.current);
    const before = burstBeforeRef.current;
    if (!before) return;
    burstBeforeRef.current = null;
    setHistory((h) => pushHistory(h, before));
  }, []);

  useEffect(() => () => window.clearTimeout(burstTimerRef.current), []);

  // 시연은 상태를 건드리지 않고 화면에 보이는 값만 덮어쓴다. 그래서 히스토리에 남지 않고 끝나면 제자리로 돌아온다.
  const demoMoving = intro.demoOffset.x !== 0 || intro.demoOffset.y !== 0;
  const shapes = demoMoving
    ? history.present.map((s) =>
        s.id === "triangle"
          ? { ...s, x: s.x + intro.demoOffset.x, y: s.y + intro.demoOffset.y }
          : s,
      )
    : history.present;
  const selected =
    shapes.find((s) => s.id === (intro.demoSelected ? "triangle" : selectedId)) ?? null;

  function toSvgPoint(e: PointerEvent<SVGSVGElement>): Point | null {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    // 화면 좌표를 viewBox 좌표로 바꿔야 스테이지 크기가 달라도 커서와 도형이 어긋나지 않는다.
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
  }

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    // 드래그 중에 두 번째 손가락이 닿으면 무시한다. 드래그를 빼앗기면 첫 조작이 히스토리에서 사라진다.
    if (dragRef.current) return;
    stopIntro();
    flushKeyBurst();
    stageRef.current?.focus({ preventScroll: true });
    const p = toSvgPoint(e);
    if (!p) return;

    // 드래그 기준은 화면에 보이는 값(시연 중일 수 있음)이 아니라 실제 상태로 잡는다.
    const current = history.present;
    const currentSelected = current.find((s) => s.id === selectedId) ?? null;
    const target = e.target as Element;
    const handle = target.getAttribute("data-handle");
    const id = target.getAttribute("data-shape-id");
    const base = {
      start: p,
      before: current,
      announced: false,
      pointerId: e.pointerId,
      grab: { x: 0, y: 0 },
    };

    if (handle && currentSelected) {
      if (handle === "rotate") {
        dragRef.current = { ...base, mode: "rotate", orig: currentSelected };
      } else {
        const corner = handlePoint(currentSelected, handle as Handle);
        dragRef.current = {
          ...base,
          mode: "resize",
          handle: handle as Handle,
          orig: currentSelected,
          grab: { x: corner.x - p.x, y: corner.y - p.y },
        };
      }
    } else if (id) {
      const shape = current.find((s) => s.id === id);
      if (!shape) return;
      if (id !== selectedId) announce("select");
      setSelectedId(id);
      dragRef.current = { ...base, mode: "move", orig: shape };
    } else {
      setSelectedId(null);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const p = toSvgPoint(e);
    if (!p) return;

    let next: Shape;
    if (drag.mode === "move") next = moveShape(drag.orig, p.x - drag.start.x, p.y - drag.start.y);
    else if (drag.mode === "rotate") next = rotateShape(drag.orig, p);
    else {
      const corner = { x: p.x + drag.grab.x, y: p.y + drag.grab.y };
      next = resizeShape(drag.orig, drag.handle as Handle, corner, { keepRatio: e.shiftKey });
    }

    if (!drag.announced) {
      drag.announced = true;
      announce(drag.mode);
    }
    setHistory((h) => ({ ...h, present: replaceShape(h.present, next) }));
  }

  // pointerup과 pointercancel 모두 여기서 끝낸다. 변경이 있을 때만 히스토리에 남는다.
  function endDrag(e: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    setHistory((h) => pushHistory(h, drag.before));
  }

  function handleUndo() {
    if (!history.past.length && !burstBeforeRef.current) return;
    flushKeyBurst();
    setHistory((h) => undo(h));
    announce("undo");
  }

  function handleRedo() {
    if (!history.future.length || burstBeforeRef.current) return;
    setHistory((h) => redo(h));
    announce("undo");
  }

  // 프레임 안에 포커스가 있을 때만 받는다. 페이지 전역 ⌘Z는 가로채지 않는다.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const handled =
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") ||
      e.key === "Escape" ||
      e.key in ARROW_STEP;
    if (handled) stopIntro();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
      return;
    }
    if (e.key === "Escape") {
      setSelectedId(null);
      return;
    }

    const step = ARROW_STEP[e.key];
    if (!step || !selectedId) return;
    e.preventDefault();
    const scale = e.shiftKey ? 10 : 1;
    if (!burstBeforeRef.current) {
      burstBeforeRef.current = history.present;
      announce("move");
    }
    setHistory((h) => {
      const shape = h.present.find((s) => s.id === selectedId);
      return shape
        ? {
            ...h,
            present: replaceShape(h.present, moveShape(shape, step.x * scale, step.y * scale)),
          }
        : h;
    });
    window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(flushKeyBurst, KEY_BURST_MS);
  }

  const hintCopy = editorHints[hint.kind];
  const hintPost = hintPosts[hint.kind];
  const strong = "font-medium text-[color:var(--color-text-primary)]";

  return (
    <div
      role="group"
      aria-label="직접 만져 볼 수 있는 미니 SVG 에디터"
      onKeyDown={handleKeyDown}
      className="surface-panel flex min-w-0 flex-col self-start overflow-hidden shadow-[var(--shadow-medium)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3.5 py-2.5">
        <div className="flex shrink-0 gap-1">
          <ToolButton label="선택 도구" title="선택" pressed>
            <CursorArrowIcon />
          </ToolButton>
          <ToolButton
            label="되돌리기"
            title="되돌리기 (⌘Z)"
            disabled={!history.past.length}
            onClick={handleUndo}
          >
            <UndoIcon />
          </ToolButton>
          <ToolButton
            label="다시 실행"
            title="다시 실행 (⇧⌘Z)"
            disabled={!history.future.length}
            onClick={handleRedo}
          >
            <RedoIcon />
          </ToolButton>
        </div>
        <p className="min-w-0 truncate font-mono text-xs text-[color:var(--color-text-muted)]">
          {selected ? (
            <>
              {selected.id} · x <b className={strong}>{Math.round(selected.x)}</b> y{" "}
              <b className={strong}>{Math.round(selected.y)}</b> · {Math.round(selected.w)}×
              {Math.round(selected.h)} · {Math.round(selected.r)}° · history{" "}
              <b className={strong}>{history.past.length}</b>
            </>
          ) : (
            <>
              선택 없음 · history <b className={strong}>{history.past.length}</b>
            </>
          )}
        </p>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        aria-label="에디터 캔버스. 도형을 선택한 뒤 방향키로 옮길 수 있습니다."
        className="relative aspect-[4/3] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--color-accent)]"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          aria-hidden="true"
          className={`absolute inset-0 block h-full w-full ${intro.drawing ? "editor-hero-drawing" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <pattern id="editor-hero-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle className="editor-hero-dot" cx="1" cy="1" r="1" />
            </pattern>
          </defs>
          <rect width={STAGE.width} height={STAGE.height} fill="url(#editor-hero-dots)" />
          <g>
            {shapes.map((shape) => (
              <ShapeNode key={shape.id} shape={shape} />
            ))}
          </g>
          {selected ? <SelectionOverlay shape={selected} /> : null}
        </svg>
        {intro.ghost ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 18 18"
            className="pointer-events-none absolute z-[2] h-[18px] w-[18px]"
            style={{
              left: `${(intro.ghost.x / STAGE.width) * 100}%`,
              top: `${(intro.ghost.y / STAGE.height) * 100}%`,
            }}
          >
            <path className="editor-hero-ghost" d="M2 1l13 7-6 1.6L6.4 16z" />
          </svg>
        ) : null}
      </div>

      <div aria-live="polite" className="border-t border-[color:var(--color-border)]">
        {/* key가 바뀌면 다시 마운트되어 플래시 애니메이션이 매번 처음부터 재생된다. */}
        <div
          key={hint.nonce}
          className={`flex min-h-[48px] flex-col items-start gap-1 px-4 py-3 text-[13px] text-[color:var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${hint.nonce ? "editor-hero-flash" : ""}`}
        >
          <span className="min-w-0 [word-break:keep-all] sm:truncate">{hintCopy.message}</span>
          {hintPost ? (
            <Link
              href={hintPost.href}
              className="accent-link max-w-full truncate font-semibold sm:max-w-[50%]"
            >
              {hintPost.title} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
