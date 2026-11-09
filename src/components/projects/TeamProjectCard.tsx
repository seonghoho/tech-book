import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import { formatPeriod } from "@/lib/formatPeriod";
import { formatProjectStatus } from "@/lib/projectStatus";
import ProjectKindBadge from "./ProjectKindBadge";
import ProjectPoster from "./ProjectPoster";

type TeamProjectCardProps = {
  project: AboutProject;
  priority?: boolean;
};

export default function TeamProjectCard({ project, priority = false }: TeamProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group surface-panel flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
    >
      <div className="relative aspect-[1200/630]">
        <ProjectPoster
          title={project.title}
          mainColor={project.posterColor}
          textColor={project.posterTextColor}
          logoSrc={project.posterLogoSrc}
          logoAlt={project.posterLogoAlt}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="!absolute inset-0 !rounded-none !border-0 !grayscale-0"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <ProjectKindBadge kind="team" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]">
            {project.title}
          </h2>
          <p className="muted-copy tabular-nums">
            {formatPeriod(project.period)} · {formatProjectStatus(project.status)}
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {project.tagline}
        </p>
      </div>
    </Link>
  );
}
