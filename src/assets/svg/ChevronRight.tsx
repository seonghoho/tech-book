import { SVGProps } from "react";

export const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_5_1275)">
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5_1275">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
