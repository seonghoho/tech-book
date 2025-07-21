"use client";

import { categoryMap as defaultCategoryMap } from "@/lib/categoryMap";
import { gameCategoryMap as defaultGameCategoryMap } from "@/lib/gameCategoryMap";
import Link from "next/link";
import { PostMeta } from "@/types/post";

interface PostsListProps {
  postsByCategory: Record<string, PostMeta[]>;
  type: "posts" | "games";
}

export default function PostsList({ postsByCategory, type }: PostsListProps) {
  const categoryMap =
    type === "posts" ? defaultCategoryMap : defaultGameCategoryMap;
  const routeName = type;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">
        {type === "posts" ? `기술` : `게임`} 문서 목록
      </h1>
      {Object.entries(postsByCategory).map(([category, posts]) => (
        <div key={category} className="mb-4 border border-[#e9e9e9] rounded">
          <div
            className={`w-full text-left px-4 py-2 ${
              type === "posts" ? "bg-green-100" : "bg-blue-100"
            } dark:bg-zinc-800 font-semibold rounded-t`}
          >
            {categoryMap[category] ?? category}
          </div>
          {category && (
            <ul className="pl-6 pr-4 py-2 space-y-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/${routeName}/${post.slug}`}>
                    <div className="flex justify-between text-gray-800 dark:text-gray-200 hover:underline cursor-pointer">
                      {post.title}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({post.date})
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
