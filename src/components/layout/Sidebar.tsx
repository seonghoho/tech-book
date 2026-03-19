"use client";

import Link from "next/link";
import { PostMeta } from "@/types/post";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/assets/svg";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  data: Record<string, PostMeta[]>;
  categoryMap: Record<string, string>;
  variant?: "rail" | "mobile-subnav";
  scope?: "auto" | "posts" | "games";
};

const getMatchedCategory = (
  data: Record<string, PostMeta[]>,
  pathname: string,
  routeName: "posts" | "games",
) =>
  Object.entries(data).find(([, posts]) =>
    posts.some((post) => pathname === `/${routeName}/${post.slug}`),
  )?.[0] ?? null;

const getPreferredOpenCategory = ({
  data,
  pathname,
  routeName,
  searchCategory,
}: {
  data: Record<string, PostMeta[]>;
  pathname: string;
  routeName: "posts" | "games";
  searchCategory: string | null;
}) => {
  if (routeName === "posts") {
    if (pathname.startsWith("/categories/")) {
      const category = decodeURIComponent(pathname.replace("/categories/", "").split("/")[0] ?? "");

      if (category && data[category]) {
        return category;
      }
    }

    if (pathname === "/posts" && searchCategory && data[searchCategory]) {
      return searchCategory;
    }
  }

  return getMatchedCategory(data, pathname, routeName) ?? Object.keys(data)[0] ?? null;
};

export default function Sidebar({ data, categoryMap, variant = "rail", scope = "auto" }: Props) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isGameScope =
    scope === "games" ||
    (scope === "auto" && (pathname.startsWith("/games") || pathname.startsWith("/play")));
  const routeName = isGameScope ? "games" : "posts";
  const isMobileSubnav = variant === "mobile-subnav";
  const searchCategory = searchParams.get("category");

  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  const refs = useRef<Record<string, HTMLUListElement>>({});

  useEffect(() => {
    setOpenCategory(
      getPreferredOpenCategory({
        data,
        pathname,
        routeName,
        searchCategory,
      }),
    );
  }, [data, pathname, routeName, searchCategory]);

  const introEyebrow = isMobileSubnav ? "Writing" : isGameScope ? "Games" : "Browse";
  const introCopy = isMobileSubnav
    ? "카테고리 단위로 기술 문서를 빠르게 탐색할 수 있습니다."
    : isGameScope
      ? "카테고리별 게임 로그를 빠르게 탐색할 수 있습니다."
      : "기술 문서와 카테고리를 탐색할 수 있습니다.";

  return (
    <div className={isMobileSubnav ? "surface-subtle space-y-3 px-4 py-4" : "space-y-3"}>
      <div className={isMobileSubnav ? "space-y-1" : "space-y-1 px-2"}>
        <p className="eyebrow-label">{introEyebrow}</p>
        <p className="muted-copy">{introCopy}</p>
      </div>
      {Object.entries(data).map(([category, posts]) => {
        const isOpen = openCategory === category;
        return (
          <div key={category} className="text-[14px]">
            <button
              type="button"
              className={`flex w-full items-center justify-between text-left font-medium text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-text-primary)] ${
                isMobileSubnav ? "rounded-xl px-3 py-2.5" : "rounded-2xl px-3 py-3"
              }`}
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
                height: isOpen ? `${refs.current[category]?.offsetHeight || 0}px` : "0px",
              }}
            >
              <ul
                ref={(el: HTMLUListElement | null) => {
                  if (el) refs.current[category] = el;
                }}
                className={`space-y-1 border-l border-[color:var(--color-border)] ${
                  isMobileSubnav ? "ml-3 mt-2 pl-3" : "ml-4 mt-1 pl-3"
                }`}
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
