import Link from "next/link";
import { PostNav } from "@/types/post";

export function PostNavCard({ post, direction }: { post: PostNav; direction: "prev" | "next" }) {
  const isNext = direction === "next";

  return (
    <Link
      href={post.url}
      rel={isNext ? "next" : "prev"}
      className={`group flex flex-col gap-1 py-4 ${
        isNext
          ? "border-t border-[color:var(--color-border)] sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:text-right"
          : "sm:pr-6"
      }`}
    >
      <span className="text-xs text-[color:var(--color-text-muted)]">
        {isNext ? "다음 글" : "이전 글"}
      </span>
      <span className="line-clamp-2 text-[15px] font-semibold text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out [word-break:keep-all] group-hover:text-[color:var(--color-accent)]">
        {post.title}
      </span>
    </Link>
  );
}
