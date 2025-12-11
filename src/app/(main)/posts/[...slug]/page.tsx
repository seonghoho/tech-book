import PostIndex from "@/components/posts/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";
import { absoluteUrl } from "@/lib/site";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import { buildArticleJsonLd, buildPageMetadata } from "@/lib/seo";
import dynamic from "next/dynamic";

const PostContent = dynamic(() => import("@/components/posts/PostContent"), {
  ssr: true,
});

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
  const ogImage = absoluteUrl(`/og/${slugString}`);

  return buildPageMetadata({
    title: `${post.title} — 성호의 TechBook`,
    description: summary,
    path: `/posts/${slugString}`,
    type: "article",
    images: [{ url: ogImage, width: 1200, height: 630 }],
    publishedTime: new Date(post.date).toISOString(),
    modifiedTime: new Date(post.date).toISOString(),
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
    image: absoluteUrl(`/og/${slugString}`),
  });

  return (
    <div className="flex w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex flex-1 overflow-y-auto scrollbar-hide xl:border-border xl:border-r py-6">
        <PostContent
          title={post.title}
          date={post.date}
          description={post.description}
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
