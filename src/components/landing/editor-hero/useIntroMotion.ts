import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { initialShapes, type Point } from "./editorModel";

export type IntroState = {
  drawing: boolean;
  ghost: Point | null;
  demoSelected: boolean;
  demoOffset: Point;
};

const STORAGE_KEY = "editor-hero-intro-played";
const DRAW_MS = 1500;
const DEMO_DELAY_MS = 1700;
const DEMO_MS = 1800;
const DRAW_STAGGER_MS = 120;
const GHOST_START: Point = { x: 560, y: 420 };
const DRAG_BY: Point = { x: -40, y: 24 };
const IDLE: IntroState = {
  drawing: false,
  ghost: null,
  demoSelected: false,
  demoOffset: { x: 0, y: 0 },
};

function hasPlayed() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markPlayed() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 저장이 막힌 환경이면 매번 재생한다.
  }
}

const easeOut = (k: number) => 1 - (1 - k) ** 3;
const lerp = (a: Point, b: Point, k: number): Point => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
});

export function useIntroMotion(
  stageRef: RefObject<HTMLElement | null>,
  svgRef: RefObject<SVGSVGElement | null>,
) {
  const [intro, setIntro] = useState<IntroState>(IDLE);
  const stoppedRef = useRef(false);
  const cleanupRef = useRef<() => void>(() => {});

  // 사용자가 포인터나 키보드로 먼저 조작하면 즉시 멈추고 정지 상태로 돌린다.
  const stopIntro = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    cleanupRef.current();
    setIntro(IDLE);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (
      !stage ||
      stoppedRef.current ||
      hasPlayed() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      stoppedRef.current = true;
      return;
    }

    const timers: number[] = [];
    let raf = 0;

    const start = () => {
      markPlayed();
      svgRef.current?.querySelectorAll<SVGGeometryElement>("[data-shape-id]").forEach((node, i) => {
        node.style.setProperty("--len", String(Math.ceil(node.getTotalLength())));
        node.style.setProperty("--d", `${i * DRAW_STAGGER_MS}ms`);
      });
      setIntro({ ...IDLE, drawing: true });
      timers.push(window.setTimeout(() => setIntro((s) => ({ ...s, drawing: false })), DRAW_MS));

      timers.push(
        window.setTimeout(() => {
          const triangle = initialShapes().find((s) => s.kind === "triangle");
          if (!triangle) return;
          const grab = { x: triangle.x + triangle.w / 2, y: triangle.y + triangle.h * 0.6 };
          const t0 = performance.now();

          const step = (now: number) => {
            const k = (now - t0) / DEMO_MS;
            if (k >= 0.9) {
              stoppedRef.current = true;
              setIntro(IDLE);
              return;
            }
            if (k < 0.45) {
              setIntro({ ...IDLE, ghost: lerp(GHOST_START, grab, easeOut(k / 0.45)) });
            } else if (k < 0.5) {
              setIntro({ ...IDLE, ghost: grab, demoSelected: true });
            } else {
              const q = easeOut((k - 0.5) / 0.4);
              const offset = { x: DRAG_BY.x * q, y: DRAG_BY.y * q };
              setIntro({
                ...IDLE,
                ghost: { x: grab.x + offset.x, y: grab.y + offset.y },
                demoSelected: true,
                demoOffset: offset,
              });
            }
            raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }, DEMO_DELAY_MS),
      );
    };

    // 모바일에서는 스테이지가 첫 화면 아래에 있으니 처음 보일 때 시작한다.
    const observer = new IntersectionObserver(
      (entries) => {
        if (stoppedRef.current || !entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      },
      { threshold: 0.4 },
    );
    observer.observe(stage);

    cleanupRef.current = () => {
      observer.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
    };
    return () => cleanupRef.current();
  }, [stageRef, svgRef]);

  return { intro, stopIntro };
}
