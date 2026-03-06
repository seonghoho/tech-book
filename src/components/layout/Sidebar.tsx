"use client";

import Link from "next/link";
import { PostMeta } from "@/types/post";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/assets/svg";
import { usePathname } from "next/navigation";

type Props = {
  data: Record<string, PostMeta[]>;
  categoryMap: Record<string, string>;
};
export default function Sidebar({ data, categoryMap }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const isGamePath =
    pathname.startsWith("/games") || pathname.startsWith("/play");

  const routeName = isGamePath ? "games" : "posts";

  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  const refs = useRef<Record<string, HTMLUListElement>>({});

  useEffect(() => {
    const matchedCategory = Object.entries(data).find(([, posts]) =>
      posts.some((post) => pathname === `/${routeName}/${post.slug}`)
    )?.[0];

    setOpenCategory(matchedCategory ?? Object.keys(data)[0] ?? null);
  }, [data, pathname, routeName]);

  return (
    <div className="space-y-3">
      <div className="space-y-1 px-2">
        <p className="eyebrow-label">{isGamePath ? "Games" : "Browse"}</p>
        <p className="muted-copy">
          {isGamePath
            ? "카테고리별 게임 로그를 빠르게 탐색할 수 있습니다."
            : "기술 문서와 카테고리를 탐색할 수 있습니다."}
        </p>
      </div>
      {Object.entries(data).map(([category, posts]) => {
        const isOpen = openCategory === category;
        return (
          <div key={category} className="text-[14px]">
            <button
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left font-medium text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-text-primary)]"
              onClick={() => toggleCategory(category)}
            >
              <span>{categoryMap[category] ?? category}</span>
              {isOpen ? (
                <ChevronDownIcon className="h-4 w-4 text-[color:var(--color-text-muted)]" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-[color:var(--color-text-muted)]" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height: isOpen
                  ? `${refs.current[category]?.offsetHeight || 0}px`
                  : "0px",
              }}
            >
              <ul
                ref={(el: HTMLUListElement | null) => {
                  if (el) refs.current[category] = el;
                }}
                className="ml-4 mt-1 space-y-1 border-l border-[color:var(--color-border)] pl-3"
              >
                {posts.map((post) => (
                  <li key={post.slug} className="w-full">
                    <Link href={`/${routeName}/${post.slug}`}>
                      <div
                        className={`group cursor-pointer rounded-r-2xl py-2 transition ${
                          pathname === `/${routeName}/${post.slug}`
                            ? routeName === "games"
                              ? "bg-sky-500/10"
                              : "bg-[color:var(--color-accent-soft)]"
                            : "hover:bg-[color:var(--color-surface-elevated)]"
                        }`}
                      >
                        <span
                          className={`block max-w-[92%] truncate pl-4 text-sm transition ${
                            pathname === `/${routeName}/${post.slug}`
                              ? routeName === "games"
                                ? "font-semibold text-sky-600 dark:text-sky-300"
                                : "font-semibold text-[color:var(--color-accent)]"
                              : "text-[color:var(--color-text-secondary)] group-hover:text-[color:var(--color-text-primary)]"
                          }`}
                        >
                          {post.title}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
