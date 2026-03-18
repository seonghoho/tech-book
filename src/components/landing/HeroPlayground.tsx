import type { CSSProperties } from "react";
import { Syne } from "next/font/google";
import { homeHeroPoster } from "@/lib/homeContent";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const lightDotsStyle: CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(0, 0, 0, 0.04) 0.7px, transparent 0.8px)",
  backgroundSize: "18px 18px",
};

const darkDotsStyle: CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.06) 0.7px, transparent 0.8px)",
  backgroundSize: "18px 18px",
};

const maskWordStyle: CSSProperties = {
  fill: "#000000",
  fontSize: "278px",
  letterSpacing: "-0.12em",
  textTransform: "uppercase",
};

const maskWordGhostStyle: CSSProperties = {
  fill: "rgba(55, 144, 228, 0.1)",
  stroke: "rgba(55, 144, 228, 0.24)",
  strokeWidth: "2px",
  paintOrder: "stroke fill",
  fontSize: "278px",
  letterSpacing: "-0.12em",
  textTransform: "uppercase",
};

const maskWordGhostDarkStyle: CSSProperties = {
  fill: "rgba(121, 182, 255, 0.08)",
  stroke: "rgba(121, 182, 255, 0.2)",
};

function PosterCross({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute z-[1] h-10 w-10 text-[#dadada] opacity-[0.84] dark:text-[#f2ede4] max-[920px]:h-[74px] max-[920px]:w-[74px] ${className}`}
      aria-hidden="true"
    >
      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current"></span>
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current"></span>
    </span>
  );
}

export default function HeroPlayground() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] dark:hidden"
        style={lightDotsStyle}
        aria-hidden="true"
      ></div>
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden opacity-[0.12] dark:block"
        style={darkDotsStyle}
        aria-hidden="true"
      ></div>

      <PosterCross className="left-[22px] top-7 max-[920px]:left-3 max-[920px]:top-5" />
      <PosterCross className="right-[22px] top-7 max-[920px]:right-3 max-[920px]:top-5" />

      <div className="relative z-[2] flex min-h-[680px] flex-col px-10 pb-[34px] pt-14 max-[1080px]:min-h-[620px] max-[920px]:min-h-0 max-[920px]:px-6 max-[920px]:pb-6 max-[920px]:pt-11 max-[640px]:px-[18px] max-[640px]:pb-5 max-[640px]:pt-[38px]">
        <div
          className="mt-auto w-full pt-12 max-[920px]:pt-7"
          data-reveal-item
          role="img"
          aria-label={homeHeroPoster.imageAlt}
        >
          <svg
            className="block h-auto w-full"
            viewBox="0 0 1180 760"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <clipPath id="archive-word-clip" clipPathUnits="userSpaceOnUse">
                <text x="24" y="232" className={syne.className} style={maskWordStyle}>
                  {homeHeroPoster.word}
                </text>
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

            <text
              x="24"
              y="232"
              className={`dark:hidden ${syne.className}`}
              style={maskWordGhostStyle}
            >
              {homeHeroPoster.word}
            </text>
            <text
              x="24"
              y="232"
              className={`hidden dark:block ${syne.className}`}
              style={{ ...maskWordGhostStyle, ...maskWordGhostDarkStyle }}
            >
              {homeHeroPoster.word}
            </text>

            <image
              href={homeHeroPoster.imageSrc}
              x="0"
              y="194"
              width="1180"
              height="566"
              preserveAspectRatio="xMidYMid slice"
              opacity="0.96"
            />

            <rect x="0" y="194" width="1180" height="566" fill="url(#poster-photo-fade)" />

            <image
              href={homeHeroPoster.imageSrc}
              x="0"
              y="116"
              width="1180"
              height="644"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#archive-word-clip)"
            />

            <rect
              x="0"
              y="116"
              width="1180"
              height="644"
              fill="url(#archive-word-overlay)"
              opacity="0.18"
              clipPath="url(#archive-word-clip)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
