import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import ProjectPoster from "./ProjectPoster";

function getProjectYear(period: string) {
  return period.slice(0, 4);
}

type ProjectArchiveGridProps = {
  projects: AboutProject[];
  sizes: string;
  gridClassName?: string;
  priorityCount?: number;
  showFootnote?: boolean;
  footnote?: string;
  revealItems?: boolean;
};

export default function ProjectArchiveGrid({
  projects,
  sizes,
  gridClassName = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  priorityCount = 2,
  showFootnote = false,
  footnote = "프로젝트 데이터는 최신 대표 작업 4개 기준으로 정리되어 있습니다.",
  revealItems = false,
}: ProjectArchiveGridProps) {
  return (
    <div className="space-y-10">
      <div className={`grid gap-x-6 gap-y-10 ${gridClassName}`}>
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block"
            data-reveal-item={revealItems ? "true" : undefined}
          >
            <ProjectPoster
              title={project.title}
              mainColor={project.posterColor}
              textColor={project.posterTextColor}
              logoSrc={project.posterLogoSrc}
              logoAlt={project.posterLogoAlt}
              priority={index < priorityCount}
              sizes={sizes}
              className="aspect-square w-full transition duration-300 group-hover:-translate-y-1 group-hover:border-[color:var(--color-border-strong)]"
            />

            <div className="mt-4 space-y-3">
              <h2 className="max-w-[14ch] text-[clamp(1.2rem,2vw,1.85rem)] font-semibold leading-[1.3] tracking-[-0.05em] text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]">
                {project.title}
              </h2>

              <div className="text-[15px] leading-7 text-[color:var(--color-text-secondary)]">
                <span className="font-semibold">{getProjectYear(project.period)}</span>
                <span className="ml-2 text-[color:var(--color-text-muted)]">
                  {project.status}
                </span>
              </div>
            </div>
          </Link>
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
