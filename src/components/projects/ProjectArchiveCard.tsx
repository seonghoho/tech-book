import type { CSSProperties } from "react";
import Link from "next/link";
import type { AboutProject } from "@/lib/aboutData";
import { hexToRgba } from "@/lib/color";
import ProjectPoster from "./ProjectPoster";

function getProjectYear(period: string) {
  return period.slice(0, 4);
}

type ProjectArchiveCardProps = {
  project: AboutProject;
  sizes: string;
  priority?: boolean;
  className?: string;
  accentColor?: string;
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
  accentColor,
  posterClassName,
  titleClassName,
  metaClassName,
  revealItem = false,
}: ProjectArchiveCardProps) {
  const isAccentPanel = Boolean(accentColor);
  const accentPanelStyle: CSSProperties | undefined = accentColor
    ? {
        backgroundImage: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.16)} 0%, ${hexToRgba(
          accentColor,
          0.04,
        )} 58%, transparent 100%)`,
        borderColor: hexToRgba(accentColor, 0.22),
        boxShadow: `0 22px 50px ${hexToRgba(accentColor, 0.1)}`,
      }
    : undefined;
  const yearBadgeStyle: CSSProperties | undefined = accentColor
    ? {
        backgroundColor: hexToRgba(accentColor, 0.16),
        color: accentColor,
      }
    : undefined;
  const statusBadgeStyle: CSSProperties | undefined = accentColor
    ? {
        borderColor: hexToRgba(accentColor, 0.2),
        backgroundColor: hexToRgba(accentColor, 0.08),
        color: accentColor,
      }
    : undefined;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={joinClasses(
        "group block",
        isAccentPanel
          ? "rounded-[30px] border p-4 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_28px_70px_rgba(2,8,23,0.34)] sm:p-5"
          : undefined,
        className,
      )}
      style={accentPanelStyle}
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
            isAccentPanel
              ? "flex flex-wrap items-center gap-2 text-[15px] leading-7 text-[color:var(--color-text-secondary)]"
              : "text-[15px] leading-7 text-[color:var(--color-text-secondary)]",
            metaClassName,
          )}
        >
          <span
            className={joinClasses(
              isAccentPanel ? "inline-flex rounded-full px-3 py-1 text-sm font-semibold" : "font-semibold",
            )}
            style={yearBadgeStyle}
          >
            {getProjectYear(project.period)}
          </span>
          <span
            className={joinClasses(
              isAccentPanel
                ? "inline-flex rounded-full border px-3 py-1 text-sm font-medium"
                : "ml-2 text-[color:var(--color-text-muted)]",
            )}
            style={statusBadgeStyle}
          >
            {project.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
