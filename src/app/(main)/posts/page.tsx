import Link from "next/link";
import type { Metadata } from "next";
import { buildCollectionPageJsonLd, buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";
import PostListItem from "@/components/posts/PostListItem";
import ArchivePager from "@/components/posts/ArchivePager";
import CategoryTabs from "@/components/posts/CategoryTabs";
import { SearchIcon } from "@/assets/svg";
import PostsArchiveScrollToTop from "@/components/posts/PostsArchiveScrollToTop";
import { filterIndexablePosts } from "@/lib/contentVisibility";
import {
  buildPostsArchiveHref,
  getPostsArchiveState,
  type PostsArchiveSearchParams,
} from "@/lib/postsArchive";

const POSTS_PER_PAGE = 10;

// 검색/필터/페이지 쿼리별 결과와 robots 메타가 달라져야 하므로 요청 단위로 렌더링한다.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<PostsArchiveSearchParams>;
}

const POSTS_DESCRIPTION = "프론트엔드, SVG 에디터, Three.js, BFF, AI 워크플로우 글 목록입니다.";

// 얇은 목록 페이지가 검색 평가의 중심이 되지 않도록 /posts 첫 페이지만 색인한다(docs/seo-publishing.md).
// 2페이지 이후와 검색어·카테고리·태그 필터 결과는 noindex, follow로 두어 글 링크만 따라가게 한다.
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasSearchParams = Boolean(
    resolvedSearchParams?.query ||
    resolvedSearchParams?.tag ||
    resolvedSearchParams?.category ||
    (resolvedSearchParams?.page && resolvedSearchParams.page !== "1"),
  );

  return buildPageMetadata({
    title: "글 목록",
    description: POSTS_DESCRIPTION,
    path: "/posts",
    robots: hasSearchParams ? { index: false, follow: true } : undefined,
  });
}

export default async function PostsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const posts = filterIndexablePosts(getAllPosts("posts")).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const {
    query,
    selectedTag,
    selectedCategory,
    safePage,
    totalItems,
    totalPages,
    pagePosts,
    categoryTabs,
  } = getPostsArchiveState({
    posts,
    categoryLabels: categoryMap,
    searchParams: resolvedSearchParams,
    postsPerPage: POSTS_PER_PAGE,
  });
  const currentParams: PostsArchiveSearchParams = {
    query,
    tag: selectedTag,
    category: selectedCategory,
    page: String(safePage),
  };
  const buildHref = (overrides: Partial<PostsArchiveSearchParams>) =>
    buildPostsArchiveHref(currentParams, overrides);
  const hasActiveFilters = Boolean(selectedCategory || selectedTag || query);
  const [allTab, ...categoryOnlyTabs] = categoryTabs;
  const sortedTabs = [allTab, ...categoryOnlyTabs.sort((a, b) => b.count - a.count)];
  const filterLabels = [
    query ? `'${query}'` : null,
    selectedCategory ? (categoryMap[selectedCategory] ?? selectedCategory) : null,
    selectedTag ? `#${selectedTag}` : null,
  ].filter(Boolean);
  const collectionJsonLd = buildCollectionPageJsonLd({
    name: "글 목록",
    description: POSTS_DESCRIPTION,
    path: "/posts",
    items: pagePosts.map((post) => ({ name: post.title, path: `/posts/${post.slug}` })),
  });

  return (
    <div id="posts-top" className="page-shell scroll-m-24">
      {hasActiveFilters || safePage > 1 ? null : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      <PostsArchiveScrollToTop />
      <div className="mx-auto max-w-[820px]">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
              글
            </h1>
            <span className="text-[15px] font-medium tabular-nums text-[color:var(--color-text-muted)]">
              {posts.length}편
            </span>
          </div>
          <form action="/posts" method="get" role="search" className="relative w-full sm:w-64">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]"
            />
            <input
              type="search"
              name="query"
              defaultValue={query}
              placeholder="글 검색"
              aria-label="글 검색"
              className="h-[38px] w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-9 pr-3 text-sm text-[color:var(--color-text-primary)] outline-none transition-colors duration-200 ease-out placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-accent)]"
            />
            {selectedCategory ? (
              <input type="hidden" name="category" value={selectedCategory} />
            ) : null}
            {selectedTag ? <input type="hidden" name="tag" value={selectedTag} /> : null}
          </form>
        </div>

        <CategoryTabs
          activeValue={selectedCategory}
          tabs={sortedTabs.map((tab) => ({
            ...tab,
            href: buildHref({ category: tab.value, page: "1" }),
          }))}
        />

        {hasActiveFilters ? (
          <p className="mt-4 text-[13px] text-[color:var(--color-text-secondary)]">
            {filterLabels.join(" · ")} 결과 {totalItems}개
            <Link href="/posts" className="accent-link ml-2">
              지우기
            </Link>
          </p>
        ) : null}

        <ol className="mt-3.5 border-t border-[color:var(--color-border)]">
          {pagePosts.length > 0 ? (
            pagePosts.map((post) => (
              <PostListItem
                key={post.slug}
                post={post}
                getCategoryHref={(category) => buildHref({ category, page: "1" })}
              />
            ))
          ) : (
            <li className="border-b border-[color:var(--color-border)] py-10 text-center text-sm text-[color:var(--color-text-muted)]">
              조건에 맞는 글이 없습니다.{" "}
              <Link href="/posts" className="accent-link">
                전체 글 보기
              </Link>
            </li>
          )}
        </ol>

        <ArchivePager
          currentPage={safePage}
          totalPages={totalPages}
          getHref={(page) => buildHref({ page: String(page) })}
        />
      </div>
    </div>
  );
}
