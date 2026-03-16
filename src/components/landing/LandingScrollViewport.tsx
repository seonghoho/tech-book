"use client";

import { useEffect, useRef, type ReactNode } from "react";

type LandingScrollViewportProps = {
  children: ReactNode;
  stepRatio?: number;
  lockDurationMs?: number;
  topOffsetPx?: number;
};

function getStickyHeaderHeight() {
  const header = document.querySelector("header");
  return header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
}

function hasScrollableAncestor(target: EventTarget | null) {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== document.body) {
    const styles = window.getComputedStyle(element);
    const canScrollY =
      /(auto|scroll|overlay)/.test(styles.overflowY) && element.scrollHeight > element.clientHeight;

    if (canScrollY) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

function getSectionScrollTops(topOffsetPx: number) {
  const headerHeight = getStickyHeaderHeight();

  return Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-section]"))
    .map((section) => {
      const top = window.scrollY + section.getBoundingClientRect().top - headerHeight - topOffsetPx;
      return Math.max(0, Math.round(top));
    })
    .filter((top, index, array) => array.indexOf(top) === index)
    .sort((a, b) => a - b);
}

function getCurrentSectionIndex(sectionScrollTops: number[], currentScrollTop: number) {
  const tolerance = 12;

  for (let index = sectionScrollTops.length - 1; index >= 0; index -= 1) {
    if (currentScrollTop >= sectionScrollTops[index] - tolerance) {
      return index;
    }
  }

  return 0;
}

export default function LandingScrollViewport({
  children,
  stepRatio = 1,
  lockDurationMs = 850,
  topOffsetPx = 40,
}: LandingScrollViewportProps) {
  const isLockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);
  const earliestUnlockAtRef = useRef(0);
  const lastWheelAtRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
      return;
    }

    const clearUnlockTimer = () => {
      if (unlockTimerRef.current !== null) {
        window.clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
    };

    const queueUnlockCheck = () => {
      clearUnlockTimer();

      const now = performance.now();
      const quietWindowMs = 180;
      const waitForEarliestUnlock = Math.max(0, earliestUnlockAtRef.current - now);
      const waitForQuietWindow = Math.max(0, quietWindowMs - (now - lastWheelAtRef.current));
      const nextDelay = Math.max(waitForEarliestUnlock, waitForQuietWindow, 16);

      unlockTimerRef.current = window.setTimeout(() => {
        const currentTime = performance.now();
        const canUnlockByTime = currentTime >= earliestUnlockAtRef.current;
        const canUnlockByQuietWindow = currentTime - lastWheelAtRef.current >= quietWindowMs;

        if (canUnlockByTime && canUnlockByQuietWindow) {
          isLockedRef.current = false;
          unlockTimerRef.current = null;
          return;
        }

        queueUnlockCheck();
      }, nextDelay);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < 10) {
        return;
      }

      if (hasScrollableAncestor(event.target)) {
        return;
      }

      event.preventDefault();

      lastWheelAtRef.current = performance.now();

      if (isLockedRef.current) {
        queueUnlockCheck();
        return;
      }

      const direction = event.deltaY > 0 ? 1 : -1;
      const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
      const currentScrollTop = Math.round(window.scrollY);
      const sectionScrollTops = getSectionScrollTops(topOffsetPx);

      let nextScrollTop = currentScrollTop;

      if (sectionScrollTops.length > 0) {
        const currentIndex = getCurrentSectionIndex(sectionScrollTops, currentScrollTop);
        const nextIndex = Math.max(
          0,
          Math.min(sectionScrollTops.length - 1, currentIndex + direction)
        );

        nextScrollTop = sectionScrollTops[nextIndex];
      } else {
        const headerHeight = getStickyHeaderHeight();
        const viewportStep = Math.max(window.innerHeight - headerHeight + topOffsetPx, 0);
        const step = viewportStep * stepRatio;
        nextScrollTop = Math.max(
          0,
          Math.min(maxScrollTop, currentScrollTop + direction * step)
        );
      }

      nextScrollTop = Math.max(0, Math.min(maxScrollTop, nextScrollTop));

      if (nextScrollTop === currentScrollTop) {
        return;
      }

      isLockedRef.current = true;
      earliestUnlockAtRef.current = performance.now() + lockDurationMs;
      queueUnlockCheck();

      window.scrollTo({
        top: nextScrollTop,
        behavior: "smooth",
      });
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      clearUnlockTimer();
      isLockedRef.current = false;
      window.removeEventListener("wheel", onWheel);
    };
  }, [lockDurationMs, stepRatio, topOffsetPx]);

  return <>{children}</>;
}
