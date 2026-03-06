import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import { PostMeta } from "@/types/post";

type PostListItemProps = {
  post: PostMeta;
  getCategoryHref?: (category: string) => string;
  getTagHref?: (tag: string) => string;
};

export default function PostListItem({
  post,
  getCategoryHref,
  getTagHref,
}: PostListItemProps) {
  return (
    <article className="surface-panel p-5 transition duration-200 hover:-translate-y-0.5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Link
            href={`/posts/${post.slug}`}
            className="text-lg font-semibold text-[color:var(--color-text-primary)] transition hover:text-[color:var(--color-accent)]"
          >
            {post.title}
          </Link>
          {post.description ? (
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              {post.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs">
            {post.category ? (
              <Link
                href={getCategoryHref ? getCategoryHref(post.category) : `/categories/${post.category}`}
                className="tag-chip"
              >
                {categoryMap[post.category] ?? post.category}
              </Link>
            ) : null}
            {post.tags?.map((tag) => (
              <Link
                key={tag}
                href={getTagHref ? getTagHref(tag) : `/tags/${encodeURIComponent(tag)}`}
                className="text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-accent)]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-xs text-[color:var(--color-text-muted)] sm:text-right">
          <div>{formatDate(post.date)}</div>
          {post.readingTime ? <div>{post.readingTime}분 읽기</div> : null}
        </div>
      </div>
    </article>
  );
}
