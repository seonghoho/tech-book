import { getAllPosts } from "@/lib/getAllPosts";
import PostIndex from "@/components/posts/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";
import { absoluteUrl } from "@/lib/site";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProjectJsonLd,
} from "@/lib/seo";
import { games } from "@/lib/gamesData";
import nextDynamic from "next/dynamic";
import { gameCategoryMap } from "@/lib/gameCategoryMap";

const PostContent = nextDynamic(() => import("@/components/posts/PostContent"), {
  ssr: true, // optional
});

// SSG + ISR: 게임 로그 상세는 정적 생성 + 재검증.
export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>; // 비동기 타입
}

const createExcerpt = (raw: string) =>
  raw
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 150);

export async function generateStaticParams() {
  const posts = getAllPosts("games");
  return posts.map((post) => ({ slug: post.slug.split("/") }));
}
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const post = await getPostData("games", slugString);
  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const baseSlug = slugString.split("/")[0];
  const gameMeta = games.find((game) => game.slug === baseSlug);

  const imageUrl = gameMeta
    ? absoluteUrl(gameMeta.image)
    : absoluteUrl(`/og/${slugString}?title=${encodeURIComponent(post.title)}`);

  return buildPageMetadata({
    title: `${post.title} — 성호의 TechBook`,
    description: summary,
    path: `/games/${slugString}`,
    type: "article",
    images: [{ url: imageUrl, width: 1200, height: 630 }],
    publishedTime: new Date(post.date).toISOString(),
    modifiedTime: new Date(post.updated ?? post.date).toISOString(),
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");

  if (!slugString) throw new Error("Slug is missing.");

  const postsByCategory = getPostsByCategory("games");
  const allPosts = Object.values(postsByCategory).flat();

  const post = await getPostData("games", slugString);
  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const headings = extractHeadings(post.rawMarkdown);

  const currentIndex = allPosts.findIndex((p) => p.slug === slugString);
  const [category] = slugString.split("/");
  const relatedCandidates =
    postsByCategory[category]?.filter((p) => p.slug !== slugString) ?? [];
  const relatedLinks = [
    ...relatedCandidates.slice(0, 3).map((p) => ({
      title: p.title,
      url: `/games/${p.slug}`,
      categoryLabel: "다른 게임 로그",
    })),
    {
      title: "기술 블로그 최신 글 보기",
      url: "/posts",
      categoryLabel: "Posts",
    },
  ];

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const baseSlug = slugString.split("/")[0];
  const gameMeta = games.find((game) => game.slug === baseSlug);
  const projectInfo = gameMeta
    ? {
        summary: gameMeta.summary ?? gameMeta.description,
        image: gameMeta.image,
        techStack: gameMeta.techStack,
        highlights: gameMeta.highlights,
        playUrl: `/play/${gameMeta.playSlug}`,
      }
    : null;

  const articleJsonLd = buildArticleJsonLd({
    title: post.title,
    description: summary,
    path: `/games/${slugString}`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.updated ?? post.date).toISOString(),
    image: gameMeta
      ? absoluteUrl(gameMeta.image)
      : absoluteUrl(`/og/${slugString}?title=${encodeURIComponent(post.title)}`),
    tags: post.tags,
    category: gameCategoryMap[category] ?? category,
  });

  const projectJsonLd =
    gameMeta &&
    buildProjectJsonLd({
      title: gameMeta.title,
      description: gameMeta.summary ?? gameMeta.description,
      path: `/play/${gameMeta.playSlug}`,
      image: gameMeta.image,
      technologies: gameMeta.techStack,
    });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Games", item: "/games" },
      { name: post.title, item: `/games/${slugString}` },
    ],
  });

  return (
    <div className="flex w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            projectJsonLd
              ? [articleJsonLd, projectJsonLd, breadcrumbJsonLd]
              : [articleJsonLd, breadcrumbJsonLd]
          ),
        }}
      />
      <main className="flex flex-1 overflow-y-auto scrollbar-hide xl:border-border xl:border-r py-6">
        <PostContent
          title={post.title}
          date={new Date(post.date).toISOString().split("T")[0]}
          updated={post.updated}
          readingTime={post.readingTime}
          description={summary}
          tags={post.tags}
          contentHtml={post.contentHtml}
          prevPost={
            prevPost
              ? { title: prevPost.title, url: `/games/${prevPost.slug}` }
              : null
          }
          nextPost={
            nextPost
              ? { title: nextPost.title, url: `/games/${nextPost.slug}` }
              : null
          }
          projectInfo={projectInfo}
          relatedLinks={relatedLinks}
        />
      </main>
      <aside className="hidden xl:flex xl:flex-col w-64 gap-6 sticky-section">
        <h2 className="text-xl font-bold px-6">목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
