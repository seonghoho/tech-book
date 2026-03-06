import { categoryMap as defaultCategoryMap } from "@/lib/categoryMap";
import { gameCategoryMap as defaultGameCategoryMap } from "@/lib/gameCategoryMap";
import Link from "next/link";
import { PostMeta } from "@/types/post";
import { formatDate } from "@/lib/formatDate";

interface PostsListProps {
  postsByCategory: Record<string, PostMeta[]>;
  type: "posts" | "games";
}

export default function PostsList({ postsByCategory, type }: PostsListProps) {
  const categoryMap =
    type === "posts" ? defaultCategoryMap : defaultGameCategoryMap;
  const routeName = type;

  return (
    <section className="page-shell">
      <div className="mb-8 space-y-3">
        <p className="eyebrow-label">{type === "posts" ? "Writing" : "Games"}</p>
        <h1 className="section-title">
        {type === "posts" ? `기술` : `게임`} 문서 목록
        </h1>
        <p className="body-copy">
          카테고리 단위로 정리된 문서를 빠르게 탐색할 수 있습니다.
        </p>
      </div>

      <div className="space-y-5">
        {Object.entries(postsByCategory).map(([category, posts]) => (
          <div key={category} className="surface-panel overflow-hidden">
          <div
            className="w-full px-5 py-4 text-left text-sm font-semibold"
            style={{
              backgroundColor:
                type === "posts"
                  ? "var(--color-accent-soft)"
                  : "rgba(14, 165, 233, 0.12)",
              color:
                type === "posts"
                  ? "var(--color-accent)"
                  : "rgb(3 105 161)",
            }}
          >
            {categoryMap[category] ?? category}
          </div>
          {category && (
            <ul className="space-y-2 px-5 py-4">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/${routeName}/${post.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition hover:bg-[color:var(--color-surface-elevated)]"
                  >
                    <span className="block max-w-[70%] truncate text-sm font-medium text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]">
                        {post.title}
                    </span>
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                      {formatDate(post.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </div>
        ))}
      </div>
    </section>
  );
}
