"use client";

import { useEffect, useRef, useState } from "react";

export type SectionScrollNavItem = {
  id: string;
  label: string;
};

type SectionScrollNavProps = {
  items: SectionScrollNavItem[];
  ariaLabel: string;
  // rail: 데스크톱 왼쪽 레일 안의 세로 목록. bar: 좁은 화면(lg 미만)에서 헤더 아래 붙는 가로 탭.
  // bar는 부모 높이 안에서만 붙어 있으므로 감싸는 요소 없이 본문 열에 바로 둔다.
  variant?: "rail" | "bar";
};

export default function SectionScrollNav({
  items,
  ariaLabel,
  variant = "rail",
}: SectionScrollNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  // 가로 탭은 375px에서 여섯 항목이 다 들어가지 않아, 스크롤로 섹션이 바뀌면 활성 탭을 가운데로 옮긴다.
  // 페이지 세로 위치가 흔들리지 않게 scrollIntoView 대신 목록의 scrollLeft만 바꾼다.
  useEffect(() => {
    if (variant !== "bar") return;
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[aria-current]");
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeId, variant]);

  useEffect(() => {
    if (!items.length) return;

    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && items.some((item) => item.id === hash)) {
        setActiveId(hash);
      }
    };

    handleHash();

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0.1, 0.3, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", handleHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHash);
    };
  }, [items]);

  if (!items.length) {
    return null;
  }

  if (variant === "bar") {
    return (
      <nav
        aria-label={ariaLabel}
        className="bg-[color:var(--color-bg)]/92 sticky top-[65px] z-20 -mx-4 border-b border-[color:var(--color-border)] backdrop-blur-xl sm:-mx-6 lg:hidden"
      >
        <ul
          ref={listRef}
          className="relative flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex h-9 items-center rounded-md px-3 text-[13px] transition-colors duration-200 ease-out ${
                    isActive
                      ? "bg-[color:var(--color-text-primary)] font-semibold text-[color:var(--color-bg)]"
                      : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text-primary)]"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className="pt-2">
      <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`group inline-flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition lg:rounded-none lg:px-0 ${
                  isActive
                    ? "text-[color:var(--color-text-primary)]"
                    : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                }`}
              >
                <span
                  className={`hidden h-px transition lg:block ${
                    isActive
                      ? "w-12 bg-[color:var(--color-accent)]"
                      : "w-8 bg-[color:var(--color-border)] group-hover:w-12 group-hover:bg-[color:var(--color-accent)]"
                  }`}
                />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
