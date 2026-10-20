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
      <h2 className="text-xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
        주제
      </h2>
      <nav aria-label="주제" className="mt-4 flex flex-wrap gap-1.5">
        {categories.map(([slug, count]) => (
          <Link
            key={slug}
            href={`/posts?category=${encodeURIComponent(slug)}`}
            className="rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-sm text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            {categoryMap[slug] ?? slug}
            <span className="ml-1.5 tabular-nums text-[color:var(--color-text-muted)]">
              {count}
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
