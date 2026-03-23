import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";

// ISR: 최신 글/카테고리 집계를 주기적으로 갱신하기 위해 정적 생성 + 재검증.
export const dynamic = "force-static";
export const revalidate = 180;

export const metadata: Metadata = buildPageMetadata({
  title: "Seonghoho 기술 블로그",
  absoluteTitle: "Seonghoho 기술 블로그",
  description:
    "프론트엔드, Three.js, SVG 등 실전 개발 문제를 다루는 기술 블로그.",
  path: "/",
});

export default function Home() {
  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const recentPosts = posts.slice(0, 10);

  return <LandingPage recentPosts={recentPosts} />;
}
