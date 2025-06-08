"use client";

import Link from "next/link";
import { PostMeta } from "@/lib/getPostsByCategory";
import { useState, useRef } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/assets/svg";
import { categoryMap } from "@/lib/categoryMap";

type Props = {
  data: Record<string, PostMeta[]>;
};
export default function Sidebar({ data }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  const ref = useRef<HTMLUListElement>(null);

  return (
    <div className="space-y-4">
      {/* <h2 className="text-lg font-bold mb-2">카테고리별 글</h2> */}
      {Object.entries(data).map(([category, posts]) => {
        const isOpen = openCategory === category;
        return (
          <div key={category} className="text-[14px]">
            <button
              className="flex justify-between items-center w-full px-2 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-left font-medium"
              onClick={() => toggleCategory(category)}
            >
              <span>{categoryMap[category] ?? category}</span>
              {isOpen ? (
                <ChevronDownIcon className="w-4 h-4 text-[#0F1B2A] dark:text-white" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-[#0F1B2A] dark:text-white" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height: isOpen
                  ? `${
                      (ref.current?.scrollHeight &&
                        ref.current?.scrollHeight * posts.length) ||
                      0
                    }px`
                  : "0px",
              }}
            >
              <ul
                ref={ref}
                className="mt-1 ml-4 space-y-1 border-l border-border"
              >
                {posts.map((post) => (
                  <Link key={post.slug} href={`/posts/${post.slug}`}>
                    <li className="w-full py-2 cursor-pointer group hover:bg-slate-100 dark:hover:bg-zinc-800">
                      <span className="pl-4 group-hover:underline text-gray">
                        {post.title}
                      </span>
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
