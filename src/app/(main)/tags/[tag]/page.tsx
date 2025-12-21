import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts, getAllTags } from "@/lib/getAllPosts";
import { categoryMap } from "@/lib/categoryMap";

const POSTS_PER_PAGE = 10;

// ISR: 태그별 목록은 정적 생성 + 주기적 재검증.
export const dynamic = "force-static";
export const revalidate = 300;

interface PageProps {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return getAllTags("posts").map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagName = decodeURIComponent(tag);
  return buildPageMetadata({
    title: `#${tagName} 태그`,
    description: `#${tagName} 관련 기술 포스트 모음입니다.`,
    path: `/tags/${encodeURIComponent(tagName)}`,
  });
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

export default async function TagPage({ params, searchParams }: PageProps) {
  const { tag } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tagName = decodeURIComponent(tag);
  const posts = getAllPosts("posts")
    .filter((post) => post.tags?.includes(tagName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page ?? "1"));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

  const buildHref = (page: number) =>
    `/tags/${encodeURIComponent(tagName)}${page > 1 ? `?page=${page}` : ""}`;

  return (
    <main className="sm:p-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Link
            href="/posts"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-600"
          >
            전체 글로 돌아가기
          </Link>
          <h1 className="text-2xl font-semibold">#{tagName}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {posts.length}개의 글이 있습니다.
          </p>
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
                        href={`/categories/${post.category}`}
                        className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {categoryMap[post.category] ?? post.category}
                      </Link>
                    ) : null}
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
            href={buildHref(Math.max(1, safePage - 1))}
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
                href={buildHref(page)}
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
            href={buildHref(Math.min(totalPages, safePage + 1))}
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
