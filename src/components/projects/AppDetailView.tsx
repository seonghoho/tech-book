import Image from "next/image";
import Link from "next/link";
import type { PersonalApp } from "@/lib/appsData";
import ProjectKindBadge from "./ProjectKindBadge";

type AppDetailViewProps = {
  app: PersonalApp;
};

export default function AppDetailView({ app }: AppDetailViewProps) {
  const { detail } = app;
  const portraitShots = detail.gallery.filter((shot) => shot.orientation === "portrait");
  const landscapeShots = detail.gallery.filter((shot) => shot.orientation === "landscape");

  return (
    <article className="page-shell mx-auto max-w-[1040px] space-y-12">
      <Link href="/projects" className="nav-link inline-flex text-sm">
        ← Projects
      </Link>

      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <ProjectKindBadge kind="app" />
            {app.inProgress ? <ProjectKindBadge kind="wip" /> : null}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-5xl">
              {app.title}
            </h1>
            <p className="muted-copy">{app.statusLabel}</p>
          </div>
          <p className="body-copy max-w-[60ch] [word-break:keep-all]">{detail.intro}</p>
          {app.links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {app.links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={index === 0 ? "button-primary" : "button-secondary !px-5 !py-3"}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div
          className={`surface-panel relative overflow-hidden ${
            app.thumbnail.fit === "contain"
              ? "mx-auto aspect-[452/656] w-full max-w-[320px] bg-[color:var(--color-surface-muted)]"
              : "aspect-[1200/630]"
          }`}
        >
          <Image
            src={app.thumbnail.src}
            alt={app.thumbnail.alt}
            fill
            priority
            sizes="(min-width: 1024px) 440px, 100vw"
            className={app.thumbnail.fit === "contain" ? "object-contain" : "object-cover"}
          />
        </div>
      </header>

      <div className="max-w-[72ch] space-y-10">
        {detail.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="section-title">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="body-copy [word-break:keep-all]">
                {paragraph}
              </p>
            ))}
            {section.points ? (
              <ul className="body-copy list-disc space-y-1 pl-5 [word-break:keep-all]">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {detail.gallery.length > 0 ? (
        <section className="space-y-5">
          <h2 className="section-title">화면</h2>
          {landscapeShots.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {landscapeShots.map((shot) => (
                <div
                  key={shot.src}
                  className="surface-subtle relative aspect-video overflow-hidden"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
          {portraitShots.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {portraitShots.map((shot) => (
                <div
                  key={shot.src}
                  className="surface-subtle relative aspect-[9/16] overflow-hidden"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
