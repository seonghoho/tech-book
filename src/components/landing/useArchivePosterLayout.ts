"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type ArchivePosterLayout = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  wordX: number;
  wordY: number;
  wordTextLength: number;
  paneY: number;
  paneHeight: number;
  imageY: number;
  imageHeight: number;
  fontSize: number;
  letterSpacingEm: number;
};

export type ArchivePosterKeyframe = {
  width: number;
  fontSize: number;
  letterSpacingEm: number;
};

const VIEWBOX_WIDTH = 1180;
const DEFAULT_AVAILABLE_HEIGHT = 720;
const WORD_TOP_PADDING_RATIO = 0;
const WORD_ASCENT_RATIO = 0.78;
const WORD_DESCENT_RATIO = 0;
const WORD_PANE_GAP_RATIO = 0;
const WORD_TOTAL_HEIGHT_RATIO =
  WORD_TOP_PADDING_RATIO + WORD_ASCENT_RATIO + WORD_DESCENT_RATIO + WORD_PANE_GAP_RATIO;

const MOBILE_KEYFRAME: ArchivePosterKeyframe = {
  width: 390,
  fontSize: 238,
  letterSpacingEm: -0.07,
};

const TABLET_KEYFRAME: ArchivePosterKeyframe = {
  width: 820,
  fontSize: 254,
  letterSpacingEm: -0.078,
};

const DESKTOP_KEYFRAME: ArchivePosterKeyframe = {
  width: 1280,
  fontSize: 278,
  letterSpacingEm: -0.085,
};

const DEFAULT_LAYOUT_WIDTH = TABLET_KEYFRAME.width;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function interpolateKeyframes(
  start: ArchivePosterKeyframe,
  end: ArchivePosterKeyframe,
  width: number,
): ArchivePosterKeyframe {
  const progress = clamp((width - start.width) / (end.width - start.width), 0, 1);

  return {
    width,
    fontSize: lerp(start.fontSize, end.fontSize, progress),
    letterSpacingEm: lerp(start.letterSpacingEm, end.letterSpacingEm, progress),
  };
}

function toLayout(
  keyframe: ArchivePosterKeyframe,
  containerWidth: number,
  availableHeight?: number,
): ArchivePosterLayout {
  const safeContainerWidth = containerWidth > 0 ? containerWidth : DEFAULT_LAYOUT_WIDTH;
  const safeAvailableHeight =
    availableHeight && availableHeight > 0 ? availableHeight : DEFAULT_AVAILABLE_HEIGHT;
  const viewBoxHeight = VIEWBOX_WIDTH * (safeAvailableHeight / safeContainerWidth);
  const maxFontSizeForText = viewBoxHeight / WORD_TOTAL_HEIGHT_RATIO;
  const fontSize = Math.min(keyframe.fontSize, maxFontSizeForText);
  const wordY = fontSize * (WORD_TOP_PADDING_RATIO + WORD_ASCENT_RATIO);
  const paneY =
    fontSize *
    (WORD_TOP_PADDING_RATIO + WORD_ASCENT_RATIO + WORD_DESCENT_RATIO + WORD_PANE_GAP_RATIO);
  const paneHeight = Math.max(viewBoxHeight - paneY, 0);

  return {
    viewBoxWidth: VIEWBOX_WIDTH,
    viewBoxHeight,
    wordX: 0,
    wordY,
    wordTextLength: VIEWBOX_WIDTH,
    paneY,
    paneHeight,
    imageY: 0,
    imageHeight: viewBoxHeight,
    fontSize,
    letterSpacingEm: keyframe.letterSpacingEm,
  };
}

export function resolveArchivePosterLayoutWithHeight(
  width: number,
  availableHeight?: number,
): ArchivePosterLayout {
  if (width <= MOBILE_KEYFRAME.width) {
    return toLayout(MOBILE_KEYFRAME, width, availableHeight);
  }

  if (width < TABLET_KEYFRAME.width) {
    return toLayout(
      interpolateKeyframes(MOBILE_KEYFRAME, TABLET_KEYFRAME, width),
      width,
      availableHeight,
    );
  }

  if (width < DESKTOP_KEYFRAME.width) {
    return toLayout(
      interpolateKeyframes(TABLET_KEYFRAME, DESKTOP_KEYFRAME, width),
      width,
      availableHeight,
    );
  }

  return toLayout(DESKTOP_KEYFRAME, width, availableHeight);
}

export function resolveArchivePosterLayout(width: number): ArchivePosterLayout {
  return resolveArchivePosterLayoutWithHeight(width);
}

export function useArchivePosterLayout(availableHeight?: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(DEFAULT_LAYOUT_WIDTH);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const syncWidth = (nextWidth?: number) => {
      const measuredWidth = nextWidth ?? node.getBoundingClientRect().width;

      if (measuredWidth > 0) {
        setContainerWidth(measuredWidth);
        setIsReady(true);
      }
    };

    syncWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        syncWidth(entry.contentRect.width);
      });

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }

    const handleWindowResize = () => {
      syncWidth();
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return {
    containerRef,
    layout: resolveArchivePosterLayoutWithHeight(containerWidth, availableHeight),
    isReady,
  };
}
