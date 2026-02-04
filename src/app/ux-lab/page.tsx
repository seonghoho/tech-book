import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import UXLabClient from "@/components/ux-lab/UXLabClient";

export const metadata: Metadata = buildPageMetadata({
  title: "UX Lab",
  description: "Three.js와 GSAP를 활용한 인터랙티브 실험실을 둘러보세요.",
  path: "/ux-lab",
});

// SSG: 실험실 페이지는 정적 생성하고 클라이언트에서 렌더링.
export const dynamic = "force-static";

export default function UXLabPage() {
  return <UXLabClient />;
}
