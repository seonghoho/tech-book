import Link from "next/link";
import PostListItem from "@/components/posts/PostListItem";
import type { PostMeta } from "@/types/post";

type Props = {
  // 히어로에 나온 최신 3편 다음 글들
  posts: PostMeta[];
};

export default function LandingLatestPostsSection({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
          지난 글
        </h2>
        <Link href="/posts" className="accent-link text-sm font-semibold">
          전체 글 보기
        </Link>
      </div>
      <ol className="mt-4 border-t border-[color:var(--color-border)]">
        {posts.map((post) => (
          <PostListItem key={post.slug} post={post} headingLevel="h3" />
        ))}
      </ol>
    </section>
  );
}
