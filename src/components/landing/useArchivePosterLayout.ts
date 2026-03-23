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
const DEFAULT_CONTAINER_HEIGHT = 720;
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

const DEFAULT_CONTAINER_SIZE = {
  width: TABLET_KEYFRAME.width,
  height: DEFAULT_CONTAINER_HEIGHT,
};

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
  containerHeight: number,
): ArchivePosterLayout {
  const safeContainerWidth =
    containerWidth > 0 ? containerWidth : DEFAULT_CONTAINER_SIZE.width;
  const safeContainerHeight =
    containerHeight > 0 ? containerHeight : DEFAULT_CONTAINER_SIZE.height;
  const viewBoxHeight = VIEWBOX_WIDTH * (safeContainerHeight / safeContainerWidth);
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
  height: number,
): ArchivePosterLayout {
  if (width <= MOBILE_KEYFRAME.width) {
    return toLayout(MOBILE_KEYFRAME, width, height);
  }

  if (width < TABLET_KEYFRAME.width) {
    return toLayout(
      interpolateKeyframes(MOBILE_KEYFRAME, TABLET_KEYFRAME, width),
      width,
      height,
    );
  }

  if (width < DESKTOP_KEYFRAME.width) {
    return toLayout(
      interpolateKeyframes(TABLET_KEYFRAME, DESKTOP_KEYFRAME, width),
      width,
      height,
    );
  }

  return toLayout(DESKTOP_KEYFRAME, width, height);
}

export function resolveArchivePosterLayout(width: number, height: number): ArchivePosterLayout {
  return resolveArchivePosterLayoutWithHeight(width, height);
}

export function useArchivePosterLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(DEFAULT_CONTAINER_SIZE);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const syncSize = (nextWidth?: number, nextHeight?: number) => {
      const rect = node.getBoundingClientRect();
      const measuredWidth = nextWidth ?? rect.width;
      const measuredHeight = nextHeight ?? rect.height;

      if (measuredWidth > 0 && measuredHeight > 0) {
        setContainerSize((currentSize) => {
          if (
            currentSize.width === measuredWidth &&
            currentSize.height === measuredHeight
          ) {
            return currentSize;
          }

          return {
            width: measuredWidth,
            height: measuredHeight,
          };
        });
      }
    };

    syncSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        syncSize(entry.contentRect.width, entry.contentRect.height);
      });

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }

    const handleWindowResize = () => {
      syncSize();
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return {
    containerRef,
    layout: resolveArchivePosterLayout(containerSize.width, containerSize.height),
  };
}
