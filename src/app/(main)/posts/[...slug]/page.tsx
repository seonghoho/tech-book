import PostIndex from "@/components/posts/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";
import { absoluteUrl } from "@/lib/site";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import nextDynamic from "next/dynamic";
import { categoryMap } from "@/lib/categoryMap";

const PostContent = nextDynamic(() => import("@/components/posts/PostContent"), {
  ssr: true,
});

// SSG + ISR: 글 상세는 정적 생성하되 업데이트에 대비해 재검증.
export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const createExcerpt = (raw: string) =>
  raw
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 150);

export function generateStaticParams(): { slug: string[] }[] {
  const postsByCategory = getPostsByCategory("posts");
  const allPosts = Object.values(postsByCategory).flat();

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const post = await getPostData("posts", slugString);

  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const ogImage = absoluteUrl(
    `/og/${slugString}?title=${encodeURIComponent(post.title)}`
  );
  const imageUrl = post.image ? absoluteUrl(post.image) : ogImage;
  const modifiedTime = post.updated ?? post.date;

  return buildPageMetadata({
    title: `${post.title} — 성호의 TechBook`,
    description: summary,
    path: `/posts/${slugString}`,
    type: "article",
    images: [{ url: imageUrl, width: 1200, height: 630 }],
    publishedTime: new Date(post.date).toISOString(),
    modifiedTime: new Date(modifiedTime).toISOString(),
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");

  if (!slugString) throw new Error("Slug is missing.");

  const postsByCategory = getPostsByCategory("posts");
  const allPosts = Object.values(postsByCategory).flat();

  const post = await getPostData("posts", slugString);
  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const headings = extractHeadings(post.rawMarkdown);

  const currentIndex = allPosts.findIndex((p) => p.slug === slugString);
  const [category] = slugString.split("/");
  const relatedCandidates =
    postsByCategory[category]?.filter((p) => p.slug !== slugString) ?? [];
  const relatedLinks = [
    ...relatedCandidates.slice(0, 3).map((p) => ({
      title: p.title,
      url: `/posts/${p.slug}`,
      categoryLabel: "관련 글",
    })),
    {
      title: "게임 프로젝트도 살펴보기",
      url: "/games",
      categoryLabel: "Projects",
    },
  ];

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const jsonLd = buildArticleJsonLd({
    title: post.title,
    description: summary,
    path: `/posts/${slugString}`,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.updated ?? post.date).toISOString(),
    image: post.image
      ? absoluteUrl(post.image)
      : absoluteUrl(`/og/${slugString}?title=${encodeURIComponent(post.title)}`),
    tags: post.tags,
    category: categoryMap[category] ?? category,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Posts", item: "/posts" },
      { name: categoryMap[category] ?? category, item: `/categories/${category}` },
      { name: post.title, item: `/posts/${slugString}` },
    ],
  });

  return (
    <div className="flex w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbJsonLd]),
        }}
      />
      <main className="flex flex-1 overflow-y-auto scrollbar-hide xl:border-border xl:border-r py-6">
        <PostContent
          title={post.title}
          date={post.date}
          updated={post.updated}
          readingTime={post.readingTime}
          description={summary}
          tags={post.tags}
          category={category}
          contentHtml={post.contentHtml}
          prevPost={
            prevPost
              ? { title: prevPost.title, url: `/posts/${prevPost.slug}` }
              : null
          }
          nextPost={
            nextPost
              ? { title: nextPost.title, url: `/posts/${nextPost.slug}` }
              : null
          }
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
