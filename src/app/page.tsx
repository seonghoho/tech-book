import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";

const LandingPage = dynamic(() => import("@/components/landing/LandingPage"), {
  ssr: true,
});

export const metadata: Metadata = buildPageMetadata({
  title: "TechBook: 기술 블로그",
  description:
    "WebGL, 제품형 프론트엔드를 다루는 인터랙티브 포트폴리오 · 블로그",
  path: "/",
});

export default function Home() {
  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="flex-1">
      <LandingPage posts={posts} />
    </main>
  );
}
