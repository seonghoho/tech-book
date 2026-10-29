import type { Metadata } from "next";
import AdsenseScript from "@/components/common/AdsenseScript";
import LandingPage from "@/components/landing/LandingPage";
import { buildBlogJsonLd, buildPageMetadata, toKstIsoDate } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { filterIndexablePosts } from "@/lib/contentVisibility";

// ISR: 최신 글/카테고리 집계를 주기적으로 갱신하기 위해 정적 생성 + 재검증.
export const dynamic = "force-static";
export const revalidate = 180;

const HOME_DESCRIPTION =
  "프론트엔드 엔지니어 최성호가 SVG 에디터, Three.js, 테스트, 웹 성능 등 실제 프로젝트에서 겪은 문제와 해결 과정을 정리하는 기술 블로그.";

export const metadata: Metadata = buildPageMetadata({
  title: "Seonghoho 기술 블로그",
  absoluteTitle: "Seonghoho 기술 블로그",
  description: HOME_DESCRIPTION,
  path: "/",
});

export default function Home() {
  const posts = filterIndexablePosts(getAllPosts("posts")).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const blogJsonLd = buildBlogJsonLd({
    description: HOME_DESCRIPTION,
    posts: posts.slice(0, 10).map((post) => ({
      title: post.title,
      path: `/posts/${post.slug}`,
      datePublished: toKstIsoDate(post.date),
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <AdsenseScript />
      <LandingPage posts={posts} />
    </>
  );
}
