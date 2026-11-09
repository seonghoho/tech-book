import Image from "next/image";
import Link from "next/link";
import type { PersonalApp } from "@/lib/appsData";
import ProjectKindBadge from "./ProjectKindBadge";

type PersonalAppCardProps = {
  app: PersonalApp;
  priority?: boolean;
};

export default function PersonalAppCard({ app, priority = false }: PersonalAppCardProps) {
  const isContain = app.thumbnail.fit === "contain";

  return (
    <article className="surface-panel flex h-full flex-col overflow-hidden">
      <div
        className={`relative aspect-[1200/630] ${
          isContain ? "bg-[color:var(--color-surface-muted)]" : ""
        }`}
      >
        <Image
          src={app.thumbnail.src}
          alt={app.thumbnail.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={isContain ? "object-contain py-3" : "object-cover"}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <ProjectKindBadge kind="app" />
          {app.inProgress ? <ProjectKindBadge kind="wip" /> : null}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
            <Link
              href={`/projects/${app.slug}`}
              className="transition duration-200 ease-out hover:text-[color:var(--color-accent)]"
            >
              {app.title}
            </Link>
          </h2>
          <p className="muted-copy">{app.statusLabel}</p>
        </div>

        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {app.summary}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {app.links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={index === 0 ? "button-primary !px-4 !py-2" : "button-secondary"}
            >
              {link.label}
            </a>
          ))}
          <Link href={`/projects/${app.slug}`} className="button-secondary">
            자세히 보기
          </Link>
        </div>
      </div>
    </article>
  );
}
