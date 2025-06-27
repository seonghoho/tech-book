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
      className={`flex flex-col border-2 border-[#d9d9d9] rounded-lg p-4 w-full hover:shadow-md hover:shadow-emerald-100 transition-all bg-gray-50 dark:bg-[#1a1a1a]`}
      style={{ alignItems: direction === "prev" ? "flex-start" : "flex-end" }}
    >
      <span className="text-xs text-gray-400 mb-1">
        {direction === "prev" ? "이전 글" : "다음 글"}
      </span>
      <span className="font-semibold text-gray-700 dark:text-gray-200 line-clamp-2 text-left">
        {post.title}
      </span>
    </a>
  );
}
