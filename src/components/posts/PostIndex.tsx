"use client";

import React, { useEffect, useMemo, useState } from "react";

type Heading = {
  text: string;
  depth: number;
  id: string;
};

export default function PostIndex({ headings }: { headings: Heading[] }) {
  // 목차는 h2와 h3만 보여 준다. 더 깊은 제목까지 넣으면 옆 칸이 본문보다 길어진다.
  const items = useMemo(() => headings.filter((h) => h.depth <= 3), [headings]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
          }))
          .sort((a, b) => a.top - b.top);

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].id);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px", // 트리거 포인트를 조절
        threshold: 0,
      }
    );

    items.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <ul className="border-l border-[color:var(--color-border)]">
      {items.map((h, idx) => {
        const isActive = activeId === h.id;

        return (
          <li key={`${h.id}-${h.depth}-${idx}`}>
            <a
              href={`#${h.id}`}
              aria-current={isActive ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1 pr-1 leading-snug [word-break:keep-all] transition-colors duration-200 ease-out hover:text-[color:var(--color-text-primary)] focus-visible:text-[color:var(--color-accent)] focus-visible:outline-none ${
                h.depth === 3 ? "pl-6 text-[12px]" : "pl-3 text-[13px]"
              } ${
                isActive
                  ? "border-[color:var(--color-accent)] font-medium text-[color:var(--color-accent)]"
                  : "border-transparent text-[color:var(--color-text-muted)]"
              }`}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
