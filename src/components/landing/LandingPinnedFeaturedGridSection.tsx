"use client";

import {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingSectionHeight } from "./useLandingSectionHeight";

gsap.registerPlugin(ScrollTrigger);

type LandingPinnedFeaturedGridSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  panelClassName?: string;
};

type LayoutMode = "stacked" | "horizontal";

const STACKED_COLUMNS = 2;
const HORIZONTAL_ROWS = 2;
const GRID_GAP_PX = 24;
const STACKED_CARD_MIN_WIDTH = 280;
const STACKED_CARD_MIN_HEIGHT = 190;
const HORIZONTAL_CARD_WIDTH = 340;

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getStickyHeaderHeight() {
  const header = document.querySelector("header");
  return header instanceof HTMLElement ? header.getBoundingClientRect().height + 40 : 64;
}

export default function LandingPinnedFeaturedGridSection({
  eyebrow,
  title,
  description,
  children,
  panelClassName,
}: LandingPinnedFeaturedGridSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { availableHeight, isReady } = useLandingSectionHeight();
  const itemCount = Children.count(children);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("horizontal");
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || !isReady) {
      return;
    }

    const syncLayoutMode = (nextWidth?: number, nextHeight?: number) => {
      const viewportWidth = nextWidth ?? viewport.clientWidth;
      const viewportHeight = nextHeight ?? viewport.clientHeight;

      if (!viewportWidth || !viewportHeight) {
        return;
      }

      const rows = Math.ceil(itemCount / STACKED_COLUMNS);
      const stackedCardWidth = (viewportWidth - GRID_GAP_PX) / STACKED_COLUMNS;
      const requiredStackedHeight =
        rows * STACKED_CARD_MIN_HEIGHT + Math.max(rows - 1, 0) * GRID_GAP_PX;
      const canUseStackedLayout =
        stackedCardWidth >= STACKED_CARD_MIN_WIDTH && viewportHeight >= requiredStackedHeight;

      setLayoutMode(canUseStackedLayout ? "stacked" : "horizontal");
      setIsLayoutReady(true);
    };

    syncLayoutMode();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        syncLayoutMode(entry.contentRect.width, entry.contentRect.height);
      });

      observer.observe(viewport);

      return () => observer.disconnect();
    }

    const handleResize = () => {
      syncLayoutMode();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [availableHeight, isReady, itemCount]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !panel || !viewport || !track || !isReady || !isLayoutReady) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(track, { clearProps: "transform" });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(track, { x: 0, clearProps: "transform" });

      if (layoutMode !== "horizontal") {
        return;
      }

      const scrollDistance = Math.max(track.scrollWidth - viewport.clientWidth + 40, 0);

      if (scrollDistance <= 8) {
        return;
      }

      gsap.to(track, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getStickyHeaderHeight()}`,
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: panel,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, [availableHeight, isLayoutReady, isReady, layoutMode]);

  const stackedRows = Math.ceil(itemCount / STACKED_COLUMNS);
  const trackStyle: CSSProperties =
    layoutMode === "stacked"
      ? {
          gridTemplateColumns: `repeat(${STACKED_COLUMNS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${stackedRows}, minmax(0, 1fr))`,
          minWidth: "100%",
        }
      : {
          gridAutoFlow: "column",
          gridTemplateRows: `repeat(${HORIZONTAL_ROWS}, minmax(0, 1fr))`,
          gridAutoColumns: `${HORIZONTAL_CARD_WIDTH}px`,
          minWidth: "max-content",
        };

  return (
    <section ref={sectionRef} className="relative">
      <div
        ref={panelRef}
        className={joinClasses(
          "surface-panel-strong grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden",
          panelClassName,
        )}
        style={{ height: availableHeight }}
      >
        <div className="shrink-0 border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="space-y-3" data-reveal-item>
            <p className="eyebrow-label">{eyebrow}</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
              {title}
            </h2>
            <p className="body-copy max-w-2xl">{description}</p>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="flex min-h-0 items-center overflow-hidden px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6"
        >
          <div
            ref={trackRef}
            className="grid items-stretch gap-6 will-change-transform"
            style={{
              ...trackStyle,
              visibility: isLayoutReady ? "visible" : "hidden",
            }}
            data-reveal-item
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
