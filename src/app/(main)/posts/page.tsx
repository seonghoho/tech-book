import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";
import PostListItem from "@/components/posts/PostListItem";

const POSTS_PER_PAGE = 10;

// ISR: 목록/필터 데이터를 주기적으로 갱신하면서 정적 페이지를 유지.
export const dynamic = "force-static";
export const revalidate = 180;

export const metadata: Metadata = buildPageMetadata({
  title: "Posts",
  description:
    "프론트엔드, JavaScript, Three.js 등 다양한 기술 주제에 대한 포스트를 확인해보세요.",
  path: "/posts",
});

type SearchParams = {
  query?: string;
  tag?: string;
  category?: string;
  page?: string;
};

interface PageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = (resolvedSearchParams?.query ?? "").trim();
  const selectedTag = resolvedSearchParams?.tag ?? "";
  const selectedCategory = resolvedSearchParams?.category ?? "";
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1"));

  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = posts.filter((post) => {
    const matchesCategory = selectedCategory
      ? post.category === selectedCategory
      : true;
    const matchesTag = selectedTag
      ? post.tags?.includes(selectedTag)
      : true;
    const matchesQuery = query
      ? `${post.title} ${post.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      : true;
    return matchesCategory && matchesTag && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

  const buildHref = (overrides: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const nextQuery = overrides?.query ?? query;
    const nextTag = overrides?.tag ?? selectedTag;
    const nextCategory = overrides?.category ?? selectedCategory;
    const nextPage = overrides?.page ?? String(safePage);

    if (nextQuery) params.set("query", nextQuery);
    if (nextTag) params.set("tag", nextTag);
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage && nextPage !== "1") params.set("page", nextPage);

    const qs = params.toString();
    return `/posts${qs ? `?${qs}` : ""}`;
  };
  const hasActiveFilters = Boolean(selectedCategory || selectedTag || query);

  return (
    <main className="page-shell">
      <div className="page-stack">
        <div className="space-y-3">
          <p className="eyebrow-label">Writing</p>
          <h1 className="section-title">기술 문서 목록</h1>
          <p className="body-copy">
            총 {filtered.length}개의 글이 검색되었습니다.
          </p>
        </div>

        <div className="surface-panel space-y-4 p-4 sm:p-5">
          <form action="/posts" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              name="query"
              defaultValue={query}
              placeholder="키워드 검색"
              className="input-shell min-w-0 w-full flex-1"
            />
            {selectedCategory ? (
              <input type="hidden" name="category" value={selectedCategory} />
            ) : null}
            {selectedTag ? (
              <input type="hidden" name="tag" value={selectedTag} />
            ) : null}
            <button type="submit" className="button-primary w-full shrink-0 sm:w-auto">
              검색
            </button>
          </form>

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
          {pagePosts.map((post) => (
            <PostListItem
              key={post.slug}
              post={post}
              getCategoryHref={(category) => buildHref({ category, page: "1" })}
              getTagHref={(tag) => buildHref({ tag, page: "1" })}
            />
          ))}
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
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
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
            )
          )}
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
