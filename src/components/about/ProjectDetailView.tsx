import Image from "next/image";
import Link from "next/link";
import type { AboutProject, ProjectPreview } from "@/lib/aboutData";
import ProjectPoster from "@/components/projects/ProjectPoster";

type ProjectDetailViewProps = {
  project: AboutProject;
  previousProject: AboutProject | null;
  nextProject: AboutProject | null;
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[color:var(--color-border)] pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function GalleryItem({ preview }: { preview: ProjectPreview }) {
  if (preview.kind === "image") {
    return (
      <figure className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
          <Image
            src={preview.src}
            alt={preview.alt}
            fill
            sizes="(min-width: 1200px) 360px, (min-width: 768px) 40vw, 100vw"
            className="object-cover object-center"
          />
        </div>
        {preview.caption ? (
          <figcaption className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
            {preview.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className="space-y-3">
      <div className="flex aspect-[4/3] items-center justify-center rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
            {preview.label}
          </p>
          <p className="text-xl font-semibold text-[color:var(--color-text-primary)]">
            {preview.title}
          </p>
        </div>
      </div>
      <figcaption className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
        {preview.caption}
      </figcaption>
    </figure>
  );
}

function ProjectPager({
  project,
  align = "left",
}: {
  project: AboutProject;
  align?: "left" | "right";
}) {
  const alignmentClass = align === "right" ? "md:text-right" : "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`block border-t border-[color:var(--color-border)] pt-7 transition ${alignmentClass}`}
    >
      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
        {align === "right" ? `Older »` : `« Newer`}
      </p>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-accent)]">
        {project.title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
        {project.tagline}
      </p>
    </Link>
  );
}

export default function ProjectDetailView({
  project,
  previousProject,
  nextProject,
}: ProjectDetailViewProps) {
  const [primaryLink, ...otherLinks] = project.links;

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-[1120px]">
        <Link href="/projects" className="button-secondary">
          ← Projects로 돌아가기
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-[220px]">
            <ProjectPoster
              title={project.title}
              mainColor={project.posterColor}
              textColor={project.posterTextColor}
              logoSrc={project.posterLogoSrc}
              logoAlt={project.posterLogoAlt}
              priority
              sizes="(min-width: 1024px) 220px, 45vw"
              className="aspect-square w-full"
            />
          </div>

          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-5xl">
              {project.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[15px] leading-7 text-[color:var(--color-text-secondary)] sm:text-lg">
              <span>{project.period}</span>
              <span aria-hidden>•</span>
              <span>{project.status}</span>
              {project.tags.map((tag) => (
                <span key={tag} className="text-[color:var(--color-accent)]">
                  #{tag}
                </span>
              ))}
            </div>

            {primaryLink ? (
              <div className="mt-8">
                <a
                  href={primaryLink.href}
                  target={primaryLink.external ? "_blank" : undefined}
                  rel={primaryLink.external ? "noopener noreferrer" : undefined}
                  className="accent-link text-xl font-semibold underline underline-offset-4"
                >
                  {primaryLink.label} →
                </a>
              </div>
            ) : null}

            <div className="mt-10 max-w-4xl space-y-7 text-[15px] leading-9 text-[color:var(--color-text-secondary)] sm:text-[1.05rem]">
              {project.narrative.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-12 xl:grid-cols-[200px_minmax(0,1fr)]">
          <aside className="space-y-10">
            <DetailSection title="Project facts">
              <dl className="space-y-4 text-sm leading-7">
                <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
                  <dt className="text-[color:var(--color-text-muted)]">Role</dt>
                  <dd className="text-right text-[color:var(--color-text-primary)]">
                    {project.role}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
                  <dt className="text-[color:var(--color-text-muted)]">Team</dt>
                  <dd className="text-right text-[color:var(--color-text-primary)]">
                    {project.team}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-4">
                  <dt className="text-[color:var(--color-text-muted)]">Duration</dt>
                  <dd className="text-right text-[color:var(--color-text-primary)]">
                    {project.duration ?? project.period}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[color:var(--color-text-muted)]">Status</dt>
                  <dd className="text-right text-[color:var(--color-text-primary)]">
                    {project.status}
                  </dd>
                </div>
              </dl>
            </DetailSection>

            <DetailSection title="Stack">
              <div className="flex flex-wrap gap-2 text-sm">
                {project.techStack.map((stack) => (
                  <span key={stack} className="tag-chip">
                    {stack}
                  </span>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Outcomes">
              <ul className="space-y-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {project.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3">
                    <span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            {otherLinks.length ? (
              <DetailSection title="More links">
                <div className="space-y-4 text-sm leading-7">
                  {otherLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="accent-link block underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </DetailSection>
            ) : null}
          </aside>
          <div className="space-y-10">
            <DetailSection title="What I worked on">
              <ul className="space-y-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                {project.keyContributions.map((contribution) => (
                  <li key={contribution} className="flex gap-3">
                    <span className="mt-[13px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                    <span>{contribution}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Technical highlights">
              <ul className="space-y-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                {project.technicalHighlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-[13px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="Screens">
              <div className="grid gap-6 md:grid-cols-2">
                {project.gallery.map((item, index) => (
                  <GalleryItem key={`${project.slug}-gallery-${index}`} preview={item} />
                ))}
              </div>
            </DetailSection>
          </div>
        </section>

        {previousProject || nextProject ? (
          <section className="mt-16 grid gap-8 md:grid-cols-2">
            {previousProject ? <ProjectPager project={previousProject} align="left" /> : <div />}
            {nextProject ? <ProjectPager project={nextProject} align="right" /> : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
