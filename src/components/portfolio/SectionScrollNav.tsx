"use client";

import { useEffect, useState } from "react";

export type SectionScrollNavItem = {
  id: string;
  label: string;
};

type SectionScrollNavProps = {
  items: SectionScrollNavItem[];
  ariaLabel: string;
};

export default function SectionScrollNav({
  items,
  ariaLabel,
}: SectionScrollNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

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
      }
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
