import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import ProjectPoster from "./ProjectPoster";

function getProjectYear(period: string) {
  return period.slice(0, 4);
}

type ProjectArchiveCardProps = {
  project: AboutProject;
  sizes: string;
  priority?: boolean;
  className?: string;
  posterClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  revealItem?: boolean;
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export default function ProjectArchiveCard({
  project,
  sizes,
  priority = false,
  className,
  posterClassName,
  titleClassName,
  metaClassName,
  revealItem = false,
}: ProjectArchiveCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={joinClasses("group block", className)}
      data-reveal-item={revealItem ? "true" : undefined}
    >
      <ProjectPoster
        title={project.title}
        mainColor={project.posterColor}
        textColor={project.posterTextColor}
        logoSrc={project.posterLogoSrc}
        logoAlt={project.posterLogoAlt}
        priority={priority}
        sizes={sizes}
        className={joinClasses(
          "aspect-square w-full transition duration-300 group-hover:-translate-y-1 group-hover:border-[color:var(--color-border-strong)]",
          posterClassName,
        )}
      />

      <div className="mt-4 space-y-3">
        <h2
          className={joinClasses(
            "max-w-[14ch] text-[clamp(1.2rem,2vw,1.85rem)] font-semibold leading-[1.3] tracking-[-0.05em] text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]",
            titleClassName,
          )}
        >
          {project.title}
        </h2>

        <div
          className={joinClasses(
            "text-[15px] leading-7 text-[color:var(--color-text-secondary)]",
            metaClassName,
          )}
        >
          <span className="font-semibold">{getProjectYear(project.period)}</span>
          <span className="ml-2 text-[color:var(--color-text-muted)]">{project.status}</span>
        </div>
      </div>
    </Link>
  );
}
