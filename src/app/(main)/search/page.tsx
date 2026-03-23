import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getAllPosts } from "@/lib/getAllPosts";
import PostListItem from "@/components/posts/PostListItem";

// SSR: 검색어에 따라 결과가 달라져 서버 렌더링.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "검색",
  description: "Seonghoho 기술 블로그 검색 결과 페이지입니다.",
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
    <main className="page-shell">
      <div className="page-stack">
        <div className="space-y-3">
          <p className="eyebrow-label">Search</p>
          <h1 className="section-title">검색 결과</h1>
          <p className="body-copy">
            {query
              ? `"${query}"에 대한 결과 ${filtered.length}건`
              : "검색어를 입력해 주세요."}
          </p>
        </div>

        <div className="surface-panel p-4 sm:p-5">
          <form action="/search" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              name="query"
              defaultValue={query}
              placeholder="키워드 검색"
              className="input-shell min-w-0 w-full flex-1"
            />
            <button type="submit" className="button-primary w-full shrink-0 sm:w-auto">
              검색
            </button>
          </form>
        </div>

        <div className="grid gap-4">
          {filtered.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
