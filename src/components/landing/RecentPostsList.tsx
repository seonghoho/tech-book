"use client";

import Link from "next/link";
import { Post } from "@/types/post";

interface RecentPostsListProps {
  posts: Post[];
}

export default function RecentPostsList({ posts }: RecentPostsListProps) {
  return (
    <div className="space-y-4 ">
      {posts.map((post) => (
        <Link key={post.slug} href={`/posts/${post.slug}`}>
          <div className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 my-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {post.date}
              </p>
            </div>
            {post.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {post.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
