"use client";

import React, { useEffect, useState } from "react";

type Heading = {
  text: string;
  depth: number;
  id: string;
};

export default function PostIndex({ headings }: { headings: Heading[] }) {
  const indentClassMap: Record<number, string> = {
    2: "ml-0",
    3: "ml-4",
    4: "ml-8",
    5: "ml-12",
    6: "ml-16",
  };

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

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div>
      <ul className="space-y-1 text-sm px-6">
        {headings.map((h, idx) => (
          <li
            key={`${h.id}-${h.depth}-${idx}`}
            className={indentClassMap[h.depth] || "ml-0"}
          >
            <a
              href={`#${h.id}`}
              className={`hover:underline text-gray-800 dark:text-gray-200 truncate block w-[110%] ${
                activeId === h.id ? "text-blue-500 font-bold" : ""
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
