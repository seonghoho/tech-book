import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import ProjectVisual from "./ProjectVisual";

type ProjectCardProps = {
  project: AboutProject;
  featured?: boolean;
};

export default function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const cardPoints = featured
    ? project.cardPoints.slice(0, 3)
    : project.cardPoints.slice(0, 2);

  return (
    <article
      className={`surface-panel group overflow-hidden transition duration-300 hover:-translate-y-1 ${
        featured ? "p-4 sm:p-6" : "p-4"
      }`}
    >
      <div
        className={`grid gap-6 ${
          featured ? "lg:grid-cols-[1.08fr_0.92fr] lg:items-center" : ""
        }`}
      >
        <ProjectVisual
          preview={project.preview}
          priority={project.featured}
          variant={featured ? "feature" : "card"}
          className={featured ? "" : "min-h-[220px]"}
        />

        <div className="flex h-full flex-col">
          <div className="eyebrow-label flex flex-wrap items-center gap-2">
            <span>{project.eyebrow}</span>
            {project.achievement ? (
              <span className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-[11px] tracking-[0.14em] text-[color:var(--color-accent)]">
                {project.achievement}
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                {project.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
                {project.tagline}
              </p>
            </div>
            <p className="body-copy">{project.summary}</p>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="surface-subtle px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                기간
              </dt>
              <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                {project.period}
              </dd>
            </div>
            <div className="surface-subtle px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                팀 구성
              </dt>
              <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                {project.team}
              </dd>
            </div>
            <div className="surface-subtle px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                역할
              </dt>
              <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                {project.role}
              </dd>
            </div>
          </dl>

          <ul className="mt-5 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
            {cardPoints.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.techStack.slice(0, featured ? 6 : 4).map((stack) => (
              <span key={stack} className="tag-chip">
                {stack}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <Link href={`/about/projects/${project.slug}`} className="button-secondary">
              상세 보기
              <span aria-hidden>{">"}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
