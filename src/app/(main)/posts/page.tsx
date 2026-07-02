import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";
import PostListItem from "@/components/posts/PostListItem";
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

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const hasSearchParams = Boolean(
    resolvedSearchParams?.query ||
    resolvedSearchParams?.tag ||
    resolvedSearchParams?.category ||
    (resolvedSearchParams?.page && resolvedSearchParams.page !== "1"),
  );

  return buildPageMetadata({
    title: "Posts",
    description:
      "프론트엔드, JavaScript, Three.js 등 다양한 기술 주제에 대한 포스트를 확인해보세요.",
    path: "/posts",
    robots: hasSearchParams
      ? {
          index: false,
          follow: true,
        }
      : undefined,
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

  return (
    <main id="posts-top" className="page-shell scroll-m-24">
      <PostsArchiveScrollToTop />
      <div className="page-stack">
        <div className="space-y-3">
          <p className="eyebrow-label">Writing</p>
          <h1 className="section-title">작성 글 목록</h1>
          <p className="body-copy">총 {totalItems}개의 글이 검색되었습니다.</p>
        </div>

        <div className="surface-panel space-y-4 p-4 sm:p-5">
          <form
            action="/posts"
            method="get"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              name="query"
              defaultValue={query}
              placeholder="키워드 검색"
              className="input-shell w-full min-w-0 flex-1"
            />
            {selectedCategory ? (
              <input type="hidden" name="category" value={selectedCategory} />
            ) : null}
            {selectedTag ? <input type="hidden" name="tag" value={selectedTag} /> : null}
            <button
              type="submit"
              className="button-primary posts-search-button w-full shrink-0 sm:w-auto"
            >
              검색
            </button>
          </form>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="글 카테고리 필터">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab.value;

              return (
                <Link
                  key={tab.value || "all"}
                  href={buildHref({ category: tab.value, page: "1" })}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-transparent bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                      : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-accent)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{tab.label}</span>
                  <span className="text-[color:var(--color-text-muted)]">{tab.count}</span>
                </Link>
              );
            })}
          </nav>

          {hasActiveFilters ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {selectedCategory ? (
                <Link
                  href={buildHref({ category: "", page: "1" })}
                  className="tag-chip max-w-full whitespace-normal break-all text-left"
                >
                  카테고리: {categoryMap[selectedCategory] ?? selectedCategory} ×
                </Link>
              ) : null}
              {selectedTag ? (
                <Link
                  href={buildHref({ tag: "", page: "1" })}
                  className="tag-chip max-w-full whitespace-normal break-all text-left"
                >
                  태그: {selectedTag} ×
                </Link>
              ) : null}
              {query ? (
                <Link
                  href={buildHref({ query: "", page: "1" })}
                  className="tag-chip max-w-full whitespace-normal break-all text-left"
                >
                  검색어: {query} ×
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          {pagePosts.length > 0 ? (
            pagePosts.map((post) => (
              <PostListItem
                key={post.slug}
                post={post}
                getCategoryHref={(category) => buildHref({ category, page: "1" })}
                getTagHref={(tag) => buildHref({ tag, page: "1" })}
              />
            ))
          ) : (
            <div className="surface-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
              조건에 맞는 글이 없습니다.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildHref({ page: String(Math.max(1, safePage - 1)) })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              safePage === 1
                ? "pointer-events-none border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-accent)]"
            }`}
          >
            이전
          </Link>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <Link
              key={page}
              href={buildHref({ page: String(page) })}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                page === safePage
                  ? "border-transparent bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]"
              }`}
            >
              {page}
            </Link>
          ))}
          <Link
            href={buildHref({ page: String(Math.min(totalPages, safePage + 1)) })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              safePage === totalPages
                ? "pointer-events-none border-[color:var(--color-border)] text-[color:var(--color-text-muted)]"
                : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-accent)]"
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </main>
  );
}
