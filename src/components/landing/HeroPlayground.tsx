"use client";

import { useState, type CSSProperties } from "react";
import { Archivo_Black } from "next/font/google";
import { homeHeroMainImages, homeHeroPoster } from "@/lib/homeContent";
import { useArchivePosterLayout } from "./useArchivePosterLayout";
import { useLandingSectionHeight } from "./useLandingSectionHeight";
import { useHeroImageDeck } from "./useHeroImageDeck";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
});

const baseMaskWordStyle: CSSProperties = {
  fill: "#000000",
  fontWeight: "400",
  textTransform: "uppercase",
};

export default function HeroPlayground() {
  const [isRefreshPressed, setIsRefreshPressed] = useState(false);
  const [refreshIconRotation, setRefreshIconRotation] = useState(0);
  const { availableHeight, isReady: isHeightReady } = useLandingSectionHeight();
  const {
    containerRef,
    layout: archiveLayout,
    isReady: isLayoutReady,
  } = useArchivePosterLayout(availableHeight);
  const { currentImageSrc, advanceImage, isRefreshDisabled } = useHeroImageDeck(
    homeHeroMainImages,
    homeHeroPoster.imageSrc,
  );
  const isHeroReady = isHeightReady && isLayoutReady;
  const maskWordStyle: CSSProperties = {
    ...baseMaskWordStyle,
    fontSize: archiveLayout.fontSize,
    letterSpacing: `${archiveLayout.letterSpacingEm}em`,
  };
  const archiveViewBox = `0 0 ${archiveLayout.viewBoxWidth} ${archiveLayout.viewBoxHeight}`;
  const refreshButtonClasses = [
    "absolute bottom-8 right-8 z-[3] inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[#171717]",
    "shadow-[0_12px_30px_rgba(36,28,18,0.12)] transition-[transform,background-color,box-shadow,opacity] duration-200 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "dark:border-white/10 dark:bg-white/50 dark:text-[#f2ede4] dark:shadow-[0_12px_30px_rgba(0,0,0,0.24)]",
    "max-[920px]:bottom-5 max-[920px]:right-5",
    isRefreshPressed
      ? "translate-y-[2px] scale-[0.94] bg-white shadow-[0_8px_18px_rgba(36,28,18,0.18)] dark:bg-white/35 dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
      : "hover:-translate-y-[1px] hover:bg-white dark:hover:bg-white/60",
  ].join(" ");

  const handleAdvanceImage = () => {
    if (isRefreshDisabled) {
      return;
    }

    setRefreshIconRotation((currentRotation) => currentRotation + 360);
    advanceImage();
  };

  const handleRefreshPointerDown = () => {
    if (isRefreshDisabled) {
      return;
    }

    setIsRefreshPressed(true);
  };

  const handleRefreshPointerRelease = () => {
    setIsRefreshPressed(false);
  };

  return (
    <section className="relative isolate overflow-hidden" style={{ height: availableHeight }}>
      <button
        type="button"
        onClick={handleAdvanceImage}
        onPointerDown={handleRefreshPointerDown}
        onPointerUp={handleRefreshPointerRelease}
        onPointerLeave={handleRefreshPointerRelease}
        onPointerCancel={handleRefreshPointerRelease}
        onBlur={handleRefreshPointerRelease}
        disabled={isRefreshDisabled}
        className={refreshButtonClasses}
        aria-label="메인 이미지 새로고침"
      >
        <span
          className="text-lg leading-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `rotate(${refreshIconRotation}deg)` }}
          aria-hidden="true"
        >
          ↻
        </span>
      </button>

      <div className="relative z-[2] flex h-full flex-col">
        <div
          ref={containerRef}
          className="h-full w-full"
          style={{ visibility: isHeroReady ? "visible" : "hidden" }}
          data-reveal-item
          role="img"
          aria-label={homeHeroPoster.imageAlt}
        >
          <svg
            className="block h-full w-full"
            viewBox={archiveViewBox}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <clipPath id="archive-word-clip" clipPathUnits="userSpaceOnUse">
                <text
                  x={archiveLayout.wordX}
                  y={archiveLayout.wordY}
                  textLength={archiveLayout.wordTextLength}
                  lengthAdjust="spacingAndGlyphs"
                  className={archivoBlack.className}
                  style={maskWordStyle}
                >
                  {homeHeroPoster.word}
                </text>
              </clipPath>

              <clipPath id="archive-union-clip" clipPathUnits="userSpaceOnUse">
                <text
                  x={archiveLayout.wordX}
                  y={archiveLayout.wordY}
                  textLength={archiveLayout.wordTextLength}
                  lengthAdjust="spacingAndGlyphs"
                  className={archivoBlack.className}
                  style={maskWordStyle}
                >
                  {homeHeroPoster.word}
                </text>
                <rect
                  x={0}
                  y={archiveLayout.paneY}
                  width={archiveLayout.viewBoxWidth}
                  height={archiveLayout.paneHeight}
                />
              </clipPath>

              <clipPath id="archive-pane-clip" clipPathUnits="userSpaceOnUse">
                <rect
                  x={0}
                  y={archiveLayout.paneY}
                  width={archiveLayout.viewBoxWidth}
                  height={archiveLayout.paneHeight}
                />
              </clipPath>

              <linearGradient id="archive-word-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
              </linearGradient>

              <linearGradient id="poster-photo-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
              </linearGradient>
            </defs>

            <image
              href={currentImageSrc}
              x={0}
              y={archiveLayout.imageY}
              width={archiveLayout.viewBoxWidth}
              height={archiveLayout.imageHeight}
              preserveAspectRatio="xMidYMid slice"
              opacity="0.96"
              clipPath="url(#archive-union-clip)"
            />

            <rect
              x={0}
              y={archiveLayout.imageY}
              width={archiveLayout.viewBoxWidth}
              height={archiveLayout.imageHeight}
              fill="url(#poster-photo-fade)"
              opacity="0.2"
              clipPath="url(#archive-pane-clip)"
            />

            <image
              href={currentImageSrc}
              x={0}
              y={archiveLayout.imageY}
              width={archiveLayout.viewBoxWidth}
              height={archiveLayout.imageHeight}
              preserveAspectRatio="xMidYMid slice"
              opacity="1"
              clipPath="url(#archive-word-clip)"
            />

            <rect
              x={0}
              y={archiveLayout.imageY}
              width={archiveLayout.viewBoxWidth}
              height={archiveLayout.imageHeight}
              fill="url(#archive-word-overlay)"
              opacity="0.14"
              clipPath="url(#archive-word-clip)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
