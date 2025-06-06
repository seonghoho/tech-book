"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/getPostsByCategory";

type Props = {
  data: Record<string, PostMeta[]>;
};

export default function ClientHome({ data }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">📚 글 목록</h1>
      {Object.entries(data).map(([category, posts]) => (
        <div key={category} className="mb-4 border rounded">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-zinc-800 font-semibold"
          >
            {category}
          </button>
          {openCategory === category && (
            <ul className="pl-6 pr-4 py-2 space-y-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`}>
                    <div className="text-gray hover:underline cursor-pointer">
                      {post.title}{" "}
                      <span className="text-sm text-gray-500">
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
    </main>
  );
}
