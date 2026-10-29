import Link from "next/link";
import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { filterIndexablePosts } from "@/lib/contentVisibility";
import { notFound } from "next/navigation";
import ArchivePager from "@/components/posts/ArchivePager";
import PostListItem from "@/components/posts/PostListItem";

const POSTS_PER_PAGE = 10;

// ISR: 태그별 목록은 정적 생성 + 주기적 재검증.
export const dynamic = "force-static";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  const tags = new Set(
    filterIndexablePosts(getAllPosts("posts")).flatMap((post) => post.tags ?? []),
  );
  return Array.from(tags).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagName = decodeURIComponent(tag);
  return buildPageMetadata({
    title: `#${tagName} 태그`,
    description: `#${tagName} 관련 기술 포스트 모음입니다.`,
    path: `/tags/${encodeURIComponent(tagName)}`,
    robots: {
      index: false,
      follow: true,
    },
  });
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tagName = decodeURIComponent(tag);
  const posts = filterIndexablePosts(getAllPosts("posts"))
    .filter((post) => post.tags?.includes(tagName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 글이 없는 태그는 빈 목록(200) 대신 404로 응답한다.
  if (posts.length === 0) notFound();

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1"));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const buildHref = (page: number) =>
    `/tags/${encodeURIComponent(tagName)}${page > 1 ? `?page=${page}` : ""}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Posts", item: "/posts" },
      { name: `#${tagName}`, item: `/tags/${encodeURIComponent(tagName)}` },
    ],
  });

  return (
    <div className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <div className="mx-auto max-w-[820px]">
        <Link href="/posts" className="accent-link text-[13px] font-semibold">
          전체 글
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
            #{tagName}
          </h1>
          <span className="text-[15px] font-medium tabular-nums text-[color:var(--color-text-muted)]">
            {posts.length}편
          </span>
        </div>

        <ol className="mt-5 border-t border-[color:var(--color-border)]">
          {pagePosts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </ol>

        <ArchivePager currentPage={safePage} totalPages={totalPages} getHref={buildHref} />
      </div>
    </div>
  );
}
