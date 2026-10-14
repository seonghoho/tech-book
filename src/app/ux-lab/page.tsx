import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import UXLabClient from "@/components/ux-lab/UXLabClient";

export const metadata: Metadata = buildPageMetadata({
  title: "UX Lab",
  description: "Three.js와 GSAP로 만든 인터랙션 실험 모음입니다.",
  path: "/ux-lab",
  robots: {
    index: false,
    follow: true,
  },
});

// SSG: 실험실 페이지는 정적 생성하고 클라이언트에서 렌더링.
export const dynamic = "force-static";

export default function UXLabPage() {
  return <UXLabClient />;
}
