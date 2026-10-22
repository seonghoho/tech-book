import AdsenseScript from "@/components/common/AdsenseScript";
import PostIndex from "@/components/posts/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";
import { absoluteUrl } from "@/lib/site";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  siteDefaults,
  toKstIsoDate,
} from "@/lib/seo";
import {
  filterIndexablePosts,
  getPostRobots,
  isIndexablePostSlug,
} from "@/lib/contentVisibility";
import nextDynamic from "next/dynamic";
import { categoryMap } from "@/lib/categoryMap";
import { notFound } from "next/navigation";

const PostContent = nextDynamic(() => import("@/components/posts/PostContent"), {
  ssr: true,
});

// SSG + ISR: 글 상세는 정적 생성하되 업데이트에 대비해 재검증.
export const dynamic = "force-static";
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const createExcerpt = (raw: string) => raw.replace(/\n+/g, " ").trim().slice(0, 150);

// 이 경로와 (main) 레이아웃에는 loading.tsx·Suspense를 두지 않는다. 경계가 있으면 응답이
// 200으로 먼저 나간 뒤 notFound()가 불려, 없는 글(초안·예약 글 포함)이 404 대신
// "찾을 수 없음" 화면 + 200(소프트 404)으로 나간다.
const getPostOrNotFound = async (slugString: string) => {
  try {
    return await getPostData("posts", slugString);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Post not found for slug:")) {
      notFound();
    }

    throw error;
  }
};

export function generateStaticParams(): { slug: string[] }[] {
  const postsByCategory = getPostsByCategory("posts");
  const allPosts = filterIndexablePosts(Object.values(postsByCategory).flat()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const post = await getPostOrNotFound(slugString);

  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const ogImage = absoluteUrl(`/og/${slugString}?title=${encodeURIComponent(post.title)}`);
  const shouldUseDynamicOg = !post.image || post.image === siteDefaults.defaultImage;
  const imageUrl = shouldUseDynamicOg ? ogImage : absoluteUrl(post.image);
  const modifiedTime = post.updated ?? post.date;

  return buildPageMetadata({
    title: post.title,
    description: summary,
    path: `/posts/${slugString}`,
    type: "article",
    robots: getPostRobots(slugString),
    images: shouldUseDynamicOg
      ? [{ url: imageUrl, width: 1200, height: 630 }]
      : [{ url: imageUrl }],
    publishedTime: toKstIsoDate(post.date),
    modifiedTime: toKstIsoDate(modifiedTime),
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");

  if (!slugString) throw new Error("Slug is missing.");

  const postsByCategory = getPostsByCategory("posts");
  const allPosts = Object.values(postsByCategory).flat();

  const post = await getPostOrNotFound(slugString);
  const summary = post.description ?? createExcerpt(post.rawMarkdown);
  const shouldUseDynamicOg = !post.image || post.image === siteDefaults.defaultImage;
  const resolvedImageUrl = shouldUseDynamicOg
    ? absoluteUrl(`/og/${slugString}?title=${encodeURIComponent(post.title)}`)
    : absoluteUrl(post.image);
  const headings = extractHeadings(post.rawMarkdown, { excludeDepths: [1] });

  const currentIndex = allPosts.findIndex((p) => p.slug === slugString);
  const [category] = slugString.split("/");
  const sameCategoryPosts = allPosts.filter(
    (candidate) => candidate.category === category && candidate.slug !== slugString,
  );
  const sameTagPosts = allPosts.filter(
    (candidate) =>
      candidate.slug !== slugString &&
      candidate.category !== category &&
      candidate.tags?.some((tag) => post.tags?.includes(tag)),
  );
  const latestPosts = allPosts.filter((candidate) => candidate.slug !== slugString);
  const relatedCandidates = [...sameCategoryPosts, ...sameTagPosts, ...latestPosts].filter(
    (candidate, index, candidates) =>
      candidates.findIndex((entry) => entry.slug === candidate.slug) === index,
  );
  const projectLink =
    category === "svg-editor"
      ? {
          title: "MathCanvas 프로젝트 살펴보기",
          url: "/projects/mathcanvas",
          categoryLabel: "프로젝트",
        }
      : {
          title: "프로젝트 아카이브 살펴보기",
          url: "/projects",
          categoryLabel: "프로젝트",
        };
  const relatedLinks = [
    ...relatedCandidates.slice(0, 3).map((p) => ({
      title: p.title,
      url: `/posts/${p.slug}`,
      categoryLabel: categoryMap[p.category ?? ""] ?? p.category ?? "",
    })),
    projectLink,
  ];

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const jsonLd = buildArticleJsonLd({
    title: post.title,
    description: summary,
    path: `/posts/${slugString}`,
    datePublished: toKstIsoDate(post.date),
    dateModified: toKstIsoDate(post.updated ?? post.date),
    image: resolvedImageUrl,
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
    <div className="w-full 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_15rem] 2xl:gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumbJsonLd]),
        }}
      />
      {isIndexablePostSlug(slugString) ? <AdsenseScript /> : null}
      <div className="min-w-0 py-6 2xl:pr-6">
        <PostContent
          title={post.title}
          date={post.date}
          updated={post.updated}
          readingTime={post.readingTime}
          description={summary}
          tags={post.tags}
          category={category}
          contentHtml={post.contentHtml}
          prevPost={prevPost ? { title: prevPost.title, url: `/posts/${prevPost.slug}` } : null}
          nextPost={nextPost ? { title: nextPost.title, url: `/posts/${nextPost.slug}` } : null}
          relatedLinks={relatedLinks}
          headings={headings}
        />
      </div>
      {headings.length ? (
        <nav
          aria-label="목차"
          className="sticky-section hidden shrink-0 2xl:block 2xl:w-60 2xl:self-start"
        >
          <p className="pb-3 text-xs font-semibold text-[color:var(--color-text-primary)]">목차</p>
          <PostIndex headings={headings} />
        </nav>
      ) : null}
    </div>
  );
}
