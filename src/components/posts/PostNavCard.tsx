import { PostNav } from "@/types/post";

export function PostNavCard({
  post,
  direction,
}: {
  post: PostNav;
  direction: "prev" | "next";
}) {
  return (
    <a
      href={post.url}
      className="surface-panel flex w-full flex-col p-5 transition duration-200 hover:-translate-y-0.5"
      style={{ alignItems: direction === "prev" ? "flex-start" : "flex-end" }}
    >
      <span className="mb-1 text-xs text-[color:var(--color-text-muted)]">
        {direction === "prev" ? "이전 글" : "다음 글"}
      </span>
      <span className="line-clamp-2 text-left font-semibold text-[color:var(--color-text-primary)]">
        {post.title}
      </span>
    </a>
  );
}
