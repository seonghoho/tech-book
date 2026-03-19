"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingSectionHeight } from "./useLandingSectionHeight";

gsap.registerPlugin(ScrollTrigger);

type LandingPinnedRailSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  panelClassName?: string;
  viewportClassName?: string;
  trackClassName?: string;
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getStickyHeaderHeight() {
  const header = document.querySelector("header");
  return header instanceof HTMLElement ? header.getBoundingClientRect().height + 4 : 64;
}

export default function LandingPinnedRailSection({
  eyebrow,
  title,
  description,
  children,
  panelClassName,
  viewportClassName,
  trackClassName,
}: LandingPinnedRailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { availableHeight, isReady } = useLandingSectionHeight();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !panel || !viewport || !track || !isReady) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(track, { clearProps: "transform" });
      return;
    }

    const context = gsap.context(() => {
      const scrollDistance = Math.max(track.scrollWidth - viewport.clientWidth, 0);

      gsap.set(track, { x: 0 });

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
  }, [availableHeight, isReady]);

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
          className={joinClasses(
            "flex min-h-0 items-center overflow-hidden px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6",
            viewportClassName,
          )}
        >
          <div
            ref={trackRef}
            className={joinClasses(
              "flex min-w-max items-stretch gap-6 will-change-transform",
              trackClassName,
            )}
            data-reveal-item
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
