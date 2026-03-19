"use client";

import type { AboutProject } from "@/lib/aboutData";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectArchiveCard from "./ProjectArchiveCard";

gsap.registerPlugin(ScrollTrigger);

type ProjectArchiveGridProps = {
  projects: AboutProject[];
  sizes: string;
  gridClassName?: string;
  priorityCount?: number;
  showFootnote?: boolean;
  footnote?: string;
  revealItems?: boolean;
  activatePostersOnView?: boolean;
};

export default function ProjectArchiveGrid({
  projects,
  sizes,
  gridClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  priorityCount = 2,
  showFootnote = false,
  footnote = "프로젝트 데이터는 최신 대표 작업 4개 기준으로 정리되어 있습니다.",
  revealItems = false,
  activatePostersOnView = false,
}: ProjectArchiveGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;

    if (!grid || !activatePostersOnView) {
      return;
    }

    const posters = Array.from(grid.querySelectorAll<HTMLElement>("[data-project-poster='true']"));

    if (!posters.length) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(posters, {
        filter: "grayscale(0) saturate(1) brightness(1)",
        y: 0,
        clearProps: "opacity",
      });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(posters, {
        filter: "grayscale(1) saturate(0.68) brightness(0.92)",
        y: 20,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "top 90%",
          end: () => `+=${Math.max(grid.offsetHeight * 0.7, posters.length * 180)}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      posters.forEach((poster) => {
        timeline.to(
          poster,
          {
            filter: "grayscale(0) saturate(1) brightness(1)",
            y: 0,
            duration: 1,
            ease: "none",
          },
          ">",
        );
      });
    }, gridRef);

    return () => context.revert();
  }, [activatePostersOnView, projects.length]);

  return (
    <div ref={gridRef} className="space-y-10">
      <div className={`grid gap-x-6 gap-y-10 ${gridClassName}`}>
        {projects.map((project, index) => (
          <ProjectArchiveCard
            key={project.slug}
            project={project}
            priority={index < priorityCount}
            sizes={sizes}
            revealItem={revealItems}
          />
        ))}
      </div>

      {showFootnote ? (
        <div className="border-t border-[color:var(--color-border)] pt-6 text-sm leading-7 text-[color:var(--color-text-muted)]">
          {footnote}
        </div>
      ) : null}
    </div>
  );
}
