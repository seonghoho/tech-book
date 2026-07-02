import type { AboutProject } from "@/lib/aboutData";
import ProjectArchiveCard from "./ProjectArchiveCard";

type ProjectArchiveGridProps = {
  projects: AboutProject[];
  sizes: string;
  gridClassName?: string;
  priorityCount?: number;
  showFootnote?: boolean;
  footnote?: string;
  revealItems?: boolean;
  activatePostersOnView?: boolean;
  posterClassName?: string;
};

export default function ProjectArchiveGrid({
  projects,
  sizes,
  gridClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  priorityCount = 2,
  showFootnote = false,
  footnote = "서비스, 인터랙션, 3D 시각화, 토이 프로젝트까지 다양한 분야에 도전하며 경험을 쌓고 있습니다.",
  revealItems = false,
  posterClassName,
}: ProjectArchiveGridProps) {
  return (
    <div className="space-y-10">
      <div className={`grid gap-x-6 gap-y-10 ${gridClassName}`}>
        {projects.map((project, index) => (
          <ProjectArchiveCard
            key={project.slug}
            project={project}
            priority={index < priorityCount}
            sizes={sizes}
            posterClassName={posterClassName}
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
