import type { CSSProperties } from "react";
import Link from "next/link";
import ProjectGlyph from "@/components/landing/ProjectGlyph";
import { formatProjectMeta } from "@/components/landing/projectCard";
import type { AboutProject } from "@/lib/aboutData";

type Props = {
  project: AboutProject;
};

export default function LandingProjectCard({ project }: Props) {
  // 고유색은 데이터라 className 대신 CSS 변수로 넘긴다. 실제 색 적용은 globals.css의 project-accent-* 가 맡는다.
  const accentStyle = { "--project-color": project.posterColor } as CSSProperties;

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={accentStyle}
      className="surface-panel group flex min-w-0 flex-col overflow-hidden transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
    >
      <div className="project-glyph-grid flex h-[72px] items-center justify-center border-b border-[color:var(--color-border)]">
        <ProjectGlyph slug={project.slug} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs text-[color:var(--color-text-muted)]">
          {formatProjectMeta(project.period, project.team)}
        </p>
        <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out group-hover:text-[color:var(--color-accent)]">
          <span aria-hidden="true" className="project-accent-dot h-2 w-2 shrink-0 rounded-full" />
          {project.title}
        </h3>
        <p className="mt-1.5 text-sm leading-7 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {project.tagline}
        </p>
        <ul className="mt-3 space-y-1 text-sm leading-6 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {project.cardPoints.slice(0, 2).map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true" className="text-[color:var(--color-text-muted)]">
                —
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        {project.tags.length ? (
          <p className="mt-auto pt-4 font-mono text-xs text-[color:var(--color-text-muted)]">
            {project.tags.slice(0, 3).join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
