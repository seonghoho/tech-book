import Link from "next/link";
import { PostMeta } from "@/types/post";

const formatDate = (date: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
};

type CategorySummary = {
  slug: string;
  label: string;
  count: number;
};

type TagSummary = {
  name: string;
  count: number;
};

type Props = {
  recentPosts: PostMeta[];
  featuredPosts: PostMeta[];
  categories: CategorySummary[];
  tags: TagSummary[];
};

export default function LandingPage({
  recentPosts,
  featuredPosts,
  categories,
  tags,
}: Props) {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#f9fafb_0,_#f3f4f6_45%,_#eef2ff_100%)] px-6 py-16 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-[radial-gradient(circle_at_top,_#0f172a_0,_#111827_45%,_#0f172a_100%)] sm:px-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
        </div>
        <div className="relative flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">
              TechBook Blog
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              프론트엔드 문제 해결과 학습을 기록합니다.
            </h1>
            <p className="max-w-2xl text-base text-slate-700 dark:text-slate-200">
              현업에서 겪은 트러블슈팅과 Three.js, SVG, TypeScript 등의 학습
              내용을 구조적으로 정리합니다.
            </p>
          </div>

          <form
            action="/search"
            method="get"
            className="flex flex-col gap-3 sm:flex-row"
            role="search"
          >
            <label htmlFor="search" className="sr-only">
              글 검색
            </label>
            <input
              id="search"
              name="query"
              type="search"
              placeholder="키워드로 글을 찾아보세요"
              className="h-12 flex-1 rounded-full border border-slate-200 bg-white px-5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              검색
            </button>
          </form>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  {category.label}
                  <span className="ml-1 text-[10px] text-slate-400">
                    {category.count}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            최신 글
          </h2>
          <Link
            href="/posts"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300"
          >
            전체 보기
          </Link>
        </div>
        <div className="mt-6 grid gap-4">
          {recentPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
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
                  <div className="flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400"
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
      </section>

      {featuredPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            추천 글
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Featured
                </div>
                <div className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-white">
                  {post.title}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {post.description ?? ""}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(post.date)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          카테고리
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {category.label}
              <span className="ml-2 text-xs font-normal text-slate-500">
                {category.count}편
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              업데이트 소식을 받아보세요
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              뉴스레터는 준비 중이며, RSS를 통해 새 글을 받아볼 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link href="/rss" className="hover:text-emerald-600">
              RSS
            </Link>
            <a
              href="https://github.com/seonghoho"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600"
            >
              GitHub
            </a>
            <a
              href="mailto:chltjdgh3@naver.com"
              className="hover:text-emerald-600"
            >
              Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
