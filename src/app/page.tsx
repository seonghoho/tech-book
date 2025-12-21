import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";

// ISR: 최신 글/카테고리 집계를 주기적으로 갱신하기 위해 정적 생성 + 재검증.
export const dynamic = "force-static";
export const revalidate = 180;

export const metadata: Metadata = buildPageMetadata({
  title: "TechBook 기술 블로그",
  description:
    "프론트엔드, Three.js, SVG 등 실전 개발 문제를 다루는 기술 블로그.",
  path: "/",
});

export default function Home() {
  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 6);
  const fallbackFeatured =
    featuredPosts.length >= 3 ? featuredPosts : posts.slice(0, 3);
  const recentPosts = posts.slice(0, 10);
  const categoryCounts = posts.reduce<Record<string, number>>((acc, post) => {
    if (post.category) {
      acc[post.category] = (acc[post.category] ?? 0) + 1;
    }
    return acc;
  }, {});
  const categories = Object.entries(categoryCounts)
    .map(([slug, count]) => ({
      slug,
      count,
      label: categoryMap[slug] ?? slug,
    }))
    .sort((a, b) => b.count - a.count);
  const tagCounts = posts.reduce<Record<string, number>>((acc, post) => {
    post.tags?.forEach((tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
    });
    return acc;
  }, {});
  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <LandingPage
      recentPosts={recentPosts}
      featuredPosts={fallbackFeatured}
      categories={categories}
      tags={tags}
    />
  );
}
