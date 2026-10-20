import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import { formatDotDate } from "@/lib/formatDate";
import { PostMeta } from "@/types/post";

type PostListItemProps = {
  post: PostMeta;
  getCategoryHref?: (category: string) => string;
  // 목록이 페이지의 주 내용이면 h2, 홈처럼 섹션 제목(h2) 아래에 놓이면 h3
  headingLevel?: "h2" | "h3";
};

// 목록 한 줄. 카드 대신 아래 줄로 구분하고, 날짜는 데스크톱에서 제목 오른쪽, 모바일에서 메타 줄로 옮긴다.
export default function PostListItem({
  post,
  getCategoryHref,
  headingLevel = "h2",
}: PostListItemProps) {
  const date = formatDotDate(post.date);
  const Heading = headingLevel;

  return (
    <li className="border-b border-[color:var(--color-border)] py-4">
      <article>
        <div className="flex items-baseline justify-between gap-4">
          <Heading className="text-base font-semibold leading-normal tracking-[-0.01em] text-[color:var(--color-text-primary)] [word-break:keep-all]">
            <Link
              href={`/posts/${post.slug}`}
              className="transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
            >
              {post.title}
            </Link>
          </Heading>
          <time
            dateTime={post.date}
            className="hidden shrink-0 text-[13px] tabular-nums text-[color:var(--color-text-muted)] sm:block"
          >
            {date}
          </time>
        </div>
        {post.description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[color:var(--color-text-secondary)] [word-break:keep-all] sm:line-clamp-1">
            {post.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-xs text-[color:var(--color-text-muted)]">
          {post.category ? (
            <Link
              href={
                getCategoryHref ? getCategoryHref(post.category) : `/categories/${post.category}`
              }
              className="transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
            >
              {categoryMap[post.category] ?? post.category}
            </Link>
          ) : null}
          <span className="tabular-nums sm:hidden">
            {post.category ? " · " : ""}
            {date}
          </span>
          {post.readingTime ? <span> · {post.readingTime}분</span> : null}
        </p>
      </article>
    </li>
  );
}
