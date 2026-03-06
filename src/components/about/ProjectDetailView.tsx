import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import ProjectVisual from "./ProjectVisual";

type ProjectDetailViewProps = {
  project: AboutProject;
  previousProject: AboutProject | null;
  nextProject: AboutProject | null;
};

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-panel p-6 sm:p-7">
      <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ProjectDetailView({
  project,
  previousProject,
  nextProject,
}: ProjectDetailViewProps) {
  return (
    <div className="page-shell">
      <div className="mb-6">
        <Link href="/about#projects" className="button-secondary">
          <span aria-hidden>←</span>
          About로 돌아가기
        </Link>
      </div>

      <section className="surface-panel-strong overflow-hidden p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <div className="eyebrow-label flex flex-wrap items-center gap-2">
              <span>{project.eyebrow}</span>
              {project.achievement ? (
                <span className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-[11px] tracking-[0.14em] text-[color:var(--color-accent)]">
                  {project.achievement}
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-5xl">
                {project.title}
              </h1>
              <p className="text-lg font-medium text-[color:var(--color-text-secondary)]">
                {project.tagline}
              </p>
              <p className="max-w-3xl body-copy">{project.summary}</p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="surface-subtle px-4 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  기간
                </dt>
                <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                  {project.period}
                </dd>
              </div>
              <div className="surface-subtle px-4 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  팀 구성
                </dt>
                <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                  {project.team}
                </dd>
              </div>
              <div className="surface-subtle px-4 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  역할
                </dt>
                <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                  {project.role}
                </dd>
              </div>
              <div className="surface-subtle px-4 py-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  기간 성격
                </dt>
                <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                  {project.duration ?? "프로젝트"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="button-secondary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <ProjectVisual preview={project.preview} priority />
        </div>
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <DetailSection title="프로젝트 개요">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  서비스 개요
                </h3>
                <p className="mt-3 body-copy">
                  {project.overview}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                  문제 맥락
                </h3>
                <p className="mt-3 body-copy">
                  {project.context}
                </p>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="주요 기여">
            <ul className="space-y-3">
              {project.keyContributions.map((contribution) => (
                <li key={contribution} className="surface-subtle px-4 py-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {contribution}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="기술적 포인트">
            <ul className="space-y-3">
              {project.technicalHighlights.map((highlight) => (
                <li key={highlight} className="surface-subtle px-4 py-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {highlight}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="관련 화면">
            <div className="grid gap-4 md:grid-cols-2">
              {project.gallery.map((item) => (
                <ProjectVisual key={item.caption} preview={item} />
              ))}
            </div>
          </DetailSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <DetailSection title="핵심 결과">
            <ul className="space-y-3 text-sm text-[color:var(--color-text-secondary)]">
              {project.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="기술 스택">
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((stack) => (
                <span key={stack} className="tag-chip text-sm">
                  {stack}
                </span>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="바로가기">
            <div className="space-y-3">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="surface-subtle flex items-center justify-between px-4 py-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:-translate-y-0.5"
                >
                  <span>{link.label}</span>
                  <span aria-hidden>{">"}</span>
                </a>
              ))}
            </div>
          </DetailSection>
        </aside>
      </div>

      {previousProject || nextProject ? (
        <section className="surface-panel mt-10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow-label">이어서 보기</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--color-text-primary)]">
                다른 프로젝트도 이어서 볼 수 있습니다
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {previousProject ? (
              <Link
                href={`/about/projects/${previousProject.slug}`}
                className="surface-subtle p-5 transition hover:-translate-y-0.5"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                  이전 프로젝트
                </div>
                <div className="mt-2 text-lg font-semibold text-[color:var(--color-text-primary)]">
                  {previousProject.title}
                </div>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                  {previousProject.tagline}
                </p>
              </Link>
            ) : null}
            {nextProject ? (
              <Link
                href={`/about/projects/${nextProject.slug}`}
                className="surface-subtle p-5 transition hover:-translate-y-0.5"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                  다음 프로젝트
                </div>
                <div className="mt-2 text-lg font-semibold text-[color:var(--color-text-primary)]">
                  {nextProject.title}
                </div>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                  {nextProject.tagline}
                </p>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
