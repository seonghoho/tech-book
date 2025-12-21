import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";

// SSR: 검색어에 따라 결과가 달라져 서버 렌더링.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "검색",
  description: "TechBook 검색 결과 페이지입니다.",
  path: "/search",
  robots: {
    index: false,
    follow: true,
  },
});

type SearchParams = {
  query?: string;
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

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = (resolvedSearchParams?.query ?? "").trim();

  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = query
    ? posts.filter((post) =>
        `${post.title} ${post.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : [];

  return (
    <main className="sm:p-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold">검색 결과</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {query
              ? `"${query}"에 대한 결과 ${filtered.length}건`
              : "검색어를 입력해 주세요."}
          </p>
        </div>

        <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row">
          <input
            name="query"
            defaultValue={query}
            placeholder="키워드 검색"
            className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            검색
          </button>
        </form>

        <div className="grid gap-4">
          {filtered.map((post) => (
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
                        href={`/categories/${post.category}`}
                        className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {categoryMap[post.category] ?? post.category}
                      </Link>
                    ) : null}
                    {post.tags?.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
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
      </div>
    </main>
  );
}
