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
// 행 전체를 누를 수 있게 제목 링크의 ::after를 행 크기로 늘린다(stretched link). 링크를 행 전체로
// 감싸면 카테고리 링크가 중첩 <a>가 되고 앵커 텍스트가 설명·메타까지 길어져서 제목 링크 하나를 유지한다.
export default function PostListItem({
  post,
  getCategoryHref,
  headingLevel = "h2",
}: PostListItemProps) {
  const date = formatDotDate(post.date);
  const Heading = headingLevel;

  return (
    <li className="border-b border-[color:var(--color-border)] py-1.5">
      <article className="group relative -mx-3 rounded-[12px] px-3 py-2.5 transition-colors duration-200 ease-out hover:bg-[color:var(--color-surface)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[color:var(--color-accent)]">
        <div className="flex items-baseline justify-between gap-4">
          <Heading className="text-base font-semibold leading-normal tracking-[-0.01em] text-[color:var(--color-text-primary)] [word-break:keep-all]">
            <Link
              href={`/posts/${post.slug}`}
              className="outline-none transition-colors duration-200 ease-out after:absolute after:inset-0 after:rounded-[12px] after:content-[''] group-hover:text-[color:var(--color-accent)]"
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
              className="relative z-10 transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
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
