import type { Metadata } from "next";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";
import { filterIndexablePosts } from "@/lib/contentVisibility";
import { notFound } from "next/navigation";
import ArchivePager from "@/components/posts/ArchivePager";
import CategoryTabs, { type CategoryTab } from "@/components/posts/CategoryTabs";
import PostListItem from "@/components/posts/PostListItem";

const POSTS_PER_PAGE = 10;

// ISR: 카테고리별 목록은 정적 생성 + 주기적 재검증.
export const dynamic = "force-static";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  const categories = new Set(
    filterIndexablePosts(getAllPosts("posts")).flatMap((post) =>
      post.category ? [post.category] : [],
    ),
  );
  return Array.from(categories).map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = categoryMap[category] ?? category;
  return buildPageMetadata({
    title: `${label} 카테고리`,
    description: `${label} 관련 기술 포스트 모음입니다.`,
    path: `/categories/${category}`,
    robots: {
      index: false,
      follow: true,
    },
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allPosts = filterIndexablePosts(getAllPosts("posts"));
  const posts = allPosts
    .filter((post) => post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 글이 없는 카테고리는 빈 목록(200) 대신 404로 응답한다.
  if (posts.length === 0) notFound();

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1"));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);
  const label = categoryMap[category] ?? category;

  const counts = new Map<string, number>();
  for (const post of allPosts) {
    if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  const tabs: CategoryTab[] = [
    { value: "", label: "전체", count: allPosts.length, href: "/posts" },
    ...[...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        label: categoryMap[value] ?? value,
        count,
        href: `/categories/${value}`,
      })),
  ];

  const buildHref = (page: number) => `/categories/${category}${page > 1 ? `?page=${page}` : ""}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Posts", item: "/posts" },
      { name: label, item: `/categories/${category}` },
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
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
            {label}
          </h1>
          <span className="text-[15px] font-medium tabular-nums text-[color:var(--color-text-muted)]">
            {posts.length}편
          </span>
        </div>

        <CategoryTabs tabs={tabs} activeValue={category} />

        <ol className="mt-3.5 border-t border-[color:var(--color-border)]">
          {pagePosts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </ol>

        <ArchivePager currentPage={safePage} totalPages={totalPages} getHref={buildHref} />
      </div>
    </div>
  );
}
