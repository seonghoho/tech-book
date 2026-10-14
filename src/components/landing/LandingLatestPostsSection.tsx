import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

export default function LandingLatestPostsSection({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <p className="eyebrow-label">Latest Writing</p>
      <h2 className="section-title mt-2">최근 글</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="surface-panel block p-5 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] sm:p-6"
          >
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {(post.category && categoryMap[post.category]) ?? post.category ?? "Writing"} ·{" "}
              {formatDate(post.date)}
            </p>
            <h3 className="mt-2 text-[17px] font-semibold leading-[1.45] tracking-[-0.02em] text-[color:var(--color-text-primary)] [word-break:keep-all]">
              {post.title}
            </h3>
            {post.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
                {post.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
