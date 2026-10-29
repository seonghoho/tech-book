import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import { formatDotDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";

type Props = {
  // 최신순 정렬된 색인 대상 글 전체
  posts: PostMeta[];
};

const POSTS_PER_TOPIC = 3;

// 주제별 최근 글 몇 편씩. 글 수가 많은 주제를 먼저 둔다.
export default function LandingTopicsSection({ posts }: Props) {
  const groups = new Map<string, PostMeta[]>();
  for (const post of posts) {
    if (!post.category) continue;
    groups.set(post.category, [...(groups.get(post.category) ?? []), post]);
  }
  const topics = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  if (!topics.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <h2 className="text-xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
        주제별 글
      </h2>
      <div className="mt-6 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map(([slug, topicPosts]) => (
          <section key={slug} aria-labelledby={`topic-${slug}`}>
            <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-border-strong)] pb-2.5">
              <h3
                id={`topic-${slug}`}
                className="text-[15px] font-semibold text-[color:var(--color-text-primary)]"
              >
                <Link
                  href={`/categories/${slug}`}
                  className="transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
                >
                  {categoryMap[slug] ?? slug}
                </Link>
              </h3>
              <span className="text-xs tabular-nums text-[color:var(--color-text-muted)]">
                {topicPosts.length}편
              </span>
            </div>
            <ul>
              {topicPosts.slice(0, POSTS_PER_TOPIC).map((post) => (
                <li key={post.slug} className="border-b border-[color:var(--color-border)]">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline justify-between gap-4 py-2.5 text-sm text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
                  >
                    <span className="line-clamp-1 [word-break:keep-all]">{post.title}</span>
                    <time
                      dateTime={post.date}
                      className="shrink-0 text-xs tabular-nums text-[color:var(--color-text-muted)]"
                    >
                      {formatDotDate(post.date)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
            {topicPosts.length > POSTS_PER_TOPIC ? (
              <Link
                href={`/categories/${slug}`}
                className="accent-link mt-2.5 inline-block text-xs font-semibold"
              >
                {topicPosts.length - POSTS_PER_TOPIC}편 더 보기
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
