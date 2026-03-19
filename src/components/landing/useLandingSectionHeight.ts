"use client";

import { useLayoutEffect, useState } from "react";

const HEADER_HEIGHT = 64;
const MOBILE_PAGE_SHELL_PADDING_Y = 32;
const SM_PAGE_SHELL_PADDING_Y = 40;
const SM_BREAKPOINT = 640;
const DEFAULT_AVAILABLE_HEIGHT = 720;

function getShellPaddingY(viewportWidth: number) {
  return viewportWidth >= SM_BREAKPOINT ? SM_PAGE_SHELL_PADDING_Y : MOBILE_PAGE_SHELL_PADDING_Y;
}

function measureAvailableHeight() {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const viewportWidth = window.innerWidth;
  const shellPaddingY = getShellPaddingY(viewportWidth);

  return Math.max(viewportHeight - HEADER_HEIGHT - shellPaddingY * 2, 0);
}

export function useLandingSectionHeight() {
  const [availableHeight, setAvailableHeight] = useState(DEFAULT_AVAILABLE_HEIGHT);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const syncHeight = () => {
      setAvailableHeight(measureAvailableHeight());
      setIsReady(true);
    };

    syncHeight();

    window.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("resize", syncHeight);

    return () => {
      window.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
    };
  }, []);

  return { availableHeight, isReady };
}
