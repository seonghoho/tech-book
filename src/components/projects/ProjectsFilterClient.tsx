"use client";

import { useEffect, useState, type ReactNode } from "react";
import { parseProjectFilter, type ProjectFilter } from "@/lib/projectFilter";

type ProjectsFilterClientProps = {
  apps: ReactNode[];
  team: ReactNode[];
};

function readFilterFromUrl() {
  return parseProjectFilter(new URLSearchParams(window.location.search).get("filter"));
}

export default function ProjectsFilterClient({ apps, team }: ProjectsFilterClientProps) {
  // force-static 페이지라 서버는 쿼리를 모른다. 첫 렌더는 항상 "all"로 맞춰 하이드레이션을 일치시키고,
  // 쿼리는 마운트 후에 읽는다.
  const [filter, setFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    setFilter(readFilterFromUrl());
    const handlePopState = () => setFilter(readFilterFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelect = (next: ProjectFilter) => {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", next);
    }
    window.history.replaceState(window.history.state, "", url);
  };

  const chips: { value: ProjectFilter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "apps", label: `개인 앱 ${apps.length}` },
    { value: "team", label: `팀 프로젝트 ${team.length}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const isActive = chip.value === filter;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelect(chip.value)}
              className={`tag-chip cursor-pointer !px-4 !py-1.5 !text-sm transition duration-200 ease-out ${
                isActive
                  ? "!border-[color:var(--color-text-primary)] !bg-[color:var(--color-text-primary)] !text-[color:var(--color-surface)]"
                  : "hover:!border-[color:var(--color-border-strong)] hover:!text-[color:var(--color-text-primary)]"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filter !== "team" ? apps : null}
        {filter !== "apps" ? team : null}
      </div>
    </div>
  );
}
