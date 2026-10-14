import Link from "next/link";
import { categoryMap } from "@/lib/categoryMap";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

export default function LandingCategoriesSection({ posts }: Props) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  const categories = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  if (!categories.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <p className="eyebrow-label">Categories</p>
      <h2 className="section-title mt-2">주제별로 보기</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map(([slug, count]) => (
          <Link
            key={slug}
            href={`/posts?category=${encodeURIComponent(slug)}`}
            className="tag-chip gap-1.5 px-3.5 py-2 text-sm transition-colors duration-200 ease-out hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            {categoryMap[slug] ?? slug}
            <span className="text-[color:var(--color-text-muted)]">{count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
