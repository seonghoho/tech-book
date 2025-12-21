import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";

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

const formatDate = (date: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
};

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

  return (
    <main className="sm:p-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">기술 문서 목록</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            총 {filtered.length}개의 글이 검색되었습니다.
          </p>
        </div>

        <form
          action="/search"
          method="get"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            name="query"
            defaultValue={query}
            placeholder="키워드 검색"
            className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {selectedCategory ? (
            <input type="hidden" name="category" value={selectedCategory} />
          ) : null}
          {selectedTag ? (
            <input type="hidden" name="tag" value={selectedTag} />
          ) : null}
          <button
            type="submit"
            className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            검색
          </button>
        </form>

        <div className="flex flex-wrap gap-2 text-xs">
          {selectedCategory ? (
            <Link
              href={buildHref({ category: "", page: "1" })}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700"
            >
              카테고리: {categoryMap[selectedCategory] ?? selectedCategory} ×
            </Link>
          ) : null}
          {selectedTag ? (
            <Link
              href={buildHref({ tag: "", page: "1" })}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700"
            >
              태그: {selectedTag} ×
            </Link>
          ) : null}
          {query ? (
            <Link
              href={buildHref({ query: "", page: "1" })}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-semibold text-slate-700"
            >
              검색어: {query} ×
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4">
          {pagePosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-lg font-semibold text-slate-900 hover:text-emerald-700 dark:text-white"
                  >
                    {post.title}
                  </Link>
                  {post.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {post.description}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {post.category ? (
                      <Link
                        href={buildHref({ category: post.category, page: "1" })}
                        className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {categoryMap[post.category] ?? post.category}
                      </Link>
                    ) : null}
                    {post.tags?.map((tag) => (
                      <Link
                        key={tag}
                        href={buildHref({ tag, page: "1" })}
                        className="text-slate-500 hover:text-emerald-600 dark:text-slate-400"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                  <div>{formatDate(post.date)}</div>
                  {post.readingTime ? (
                    <div>{post.readingTime}분 읽기</div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildHref({ page: String(Math.max(1, safePage - 1)) })}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              safePage === 1
                ? "pointer-events-none border-slate-200 text-slate-400"
                : "border-slate-300 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
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
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-emerald-300"
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
                ? "pointer-events-none border-slate-200 text-slate-400"
                : "border-slate-300 text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            다음
          </Link>
        </div>
      </div>
    </main>
  );
}
