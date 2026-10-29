"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type CategoryTab = {
  // "" 는 전체
  value: string;
  label: string;
  count: number;
  href: string;
};

type Props = {
  tabs: CategoryTab[];
  activeValue: string;
};

// 글 목록 위 카테고리 탭. 글 쪽 페이지에서 범위를 고르는 유일한 수단이라 /posts와 /categories가 함께 쓴다.
export default function CategoryTabs({ tabs, activeValue }: Props) {
  const navRef = useRef<HTMLElement>(null);

  // 모바일에서는 탭이 가로 스크롤이라 뒤쪽 카테고리를 고르면 선택된 탭이 화면 밖에 남는다.
  // 페이지 세로 위치는 건드리지 않도록 scrollIntoView 대신 nav의 scrollLeft만 맞춘다.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [activeValue]);

  return (
    <nav
      ref={navRef}
      aria-label="카테고리"
      className="relative -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-5 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;

        return (
          <Link
            key={tab.value || "all"}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-200 ease-out ${
              isActive
                ? "bg-[color:var(--color-text-primary)] font-semibold text-[color:var(--color-bg)]"
                : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text-primary)]"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1 tabular-nums ${isActive ? "opacity-70" : "text-[color:var(--color-text-muted)]"}`}
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
