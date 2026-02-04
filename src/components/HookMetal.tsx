"use client";

import { forwardRef } from "react";

type HookMetalProps = {
  className?: string;
};

const HookMetal = forwardRef<SVGGElement, HookMetalProps>(({ className }, ref) => {
  return (
    <svg
      viewBox="0 0 348 699"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hookBase" x1="40" y1="0" x2="340" y2="680">
          <stop offset="0" stopColor="#f7f7f7" />
          <stop offset="0.35" stopColor="#cfcfcf" />
          <stop offset="0.6" stopColor="#8f8f8f" />
          <stop offset="0.8" stopColor="#dcdcdc" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="hookEdge" x1="0" y1="0" x2="0" y2="699">
          <stop offset="0" stopColor="rgba(0,0,0,0.35)" />
          <stop offset="0.4" stopColor="rgba(0,0,0,0.1)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
        </linearGradient>
        <linearGradient id="sheenSoft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="sheenSharp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.45" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="0.55" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <mask id="hookMask" maskUnits="userSpaceOnUse">
          <rect width="348" height="699" fill="black" />
          <path
            d="M207.17 319L222.473 416.58C192.339 407.006 160.125 407.187 130.415 416.673L146.604 319H207.17Z"
            fill="white"
          />
          <rect x="96" y="236" width="159" height="51" rx="10" fill="white" />
          <path
            d="M50 12H298C318.987 12 336 29.0132 336 50V109C336 162.019 293.019 205 240 205H108C54.9807 205 12 162.019 12 109V50C12 29.0132 29.0132 12 50 12Z"
            fill="white"
          />
          <rect x="96" y="180" width="159" height="51" rx="10" fill="white" />
          <rect x="132" y="129" width="85" height="44" rx="10" fill="white" />
          <rect
            x="255"
            y="384.417"
            width="48"
            height="29"
            rx="6"
            transform="rotate(-20 255 384.417)"
            fill="white"
          />
          <path
            d="M61.8987 618.5C59.6455 618.5 57.6476 617.052 56.9467 614.911C45.9499 581.319 46.213 545.057 57.6958 511.628L59.1782 507.313C59.9617 505.032 62.1072 503.5 64.519 503.5H82.0355C85.687 503.5 88.253 507.095 87.0668 510.548L85.7167 514.478C74.8692 546.057 74.6207 580.313 85.009 612.046C86.0508 615.229 83.6796 618.5 80.331 618.5H61.8987Z"
            fill="white"
          />
          <path
            d="M98.1234 263H254.072L300.28 557.635C310.598 623.426 265.37 685.035 199.509 694.903L186.924 696.788C179.326 697.927 171.635 698.323 163.961 697.971L160.741 697.824C116.536 695.798 77.5511 668.235 60.901 627.236C59.7268 624.345 61.7564 621.159 64.8731 621.001L86.044 619.93C87.4155 619.861 88.7423 620.428 89.6396 621.468L101.253 634.921C114.965 650.807 133.516 661.751 154.052 666.07C175.378 670.556 197.596 667.636 217.039 657.793L220.758 655.91C249.763 641.226 269.872 613.23 274.664 581.075C280.601 541.241 262.021 501.54 227.521 480.76L224.913 479.189C188.756 457.411 142.596 461.918 111.336 490.279L91.2829 508.472C86.5962 512.724 80.4946 515.08 74.1665 515.08L71.53 515.08C64.3337 515.08 58.5 509.246 58.5 502.05L98.1234 263Z"
            fill="white"
          />
        </mask>
      </defs>

      <g mask="url(#hookMask)">
        <rect width="348" height="699" fill="url(#hookBase)" />
        <rect width="348" height="699" fill="url(#hookEdge)" opacity="0.35" />
        <g
          ref={ref}
          style={{
            mixBlendMode: "screen",
            transformOrigin: "50% 50%",
            transformBox: "fill-box",
          }}
        >
          <rect x="-50" y="-50" width="500" height="900" fill="url(#sheenSoft)" />
          <rect x="40" y="0" width="260" height="699" fill="url(#sheenSharp)" />
        </g>
      </g>
    </svg>
  );
});

HookMetal.displayName = "HookMetal";

export default HookMetal;
