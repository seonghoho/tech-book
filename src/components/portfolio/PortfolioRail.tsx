import type { ReactNode } from "react";
import SectionScrollNav, { type SectionScrollNavItem } from "./SectionScrollNav";

type RailLink = {
  label: string;
  href: string;
  external?: boolean;
};

type RailMetric = {
  value: string;
  label: string;
};

type PortfolioRailProps = {
  eyebrow?: string;
  name: string;
  title: string;
  summary: string;
  secondaryText?: string;
  sections: SectionScrollNavItem[];
  links: RailLink[];
  metrics?: RailMetric[];
  supplemental?: ReactNode;
};

export default function PortfolioRail({
  eyebrow,
  name,
  title,
  summary,
  secondaryText,
  sections,
  links,
  metrics = [],
  supplemental,
}: PortfolioRailProps) {
  return (
    <aside className="min-w-0 space-y-8 lg:sticky lg:top-[108px] lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
      <div className="space-y-6">
        <div className="space-y-4">
          {eyebrow ? <p className="eyebrow-label">{eyebrow}</p> : null}
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-5xl">
              {name}
            </h1>
            <p className="max-w-sm text-lg font-medium leading-8 text-[color:var(--color-text-secondary)] sm:text-xl">
              {title}
            </p>
          </div>
          <p className="body-copy max-w-md">{summary}</p>
          {secondaryText ? <p className="muted-copy max-w-md">{secondaryText}</p> : null}
        </div>

        <div className="hidden lg:block">
          <SectionScrollNav items={sections} ariaLabel="페이지 섹션 이동" />
        </div>

        {supplemental ? <div className="lg:pt-4">{supplemental}</div> : null}
      </div>

      <div className="space-y-5">
        {metrics.length ? (
          <dl className="overflow-hidden rounded-[28px] border border-[color:var(--color-border)]">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-1 border-b border-[color:var(--color-border)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="text-sm text-[color:var(--color-text-muted)]">{metric.label}</dt>
                <dd className="text-base font-semibold text-[color:var(--color-text-primary)]">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
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

        <div className="lg:hidden">
          <SectionScrollNav items={sections} ariaLabel="페이지 섹션 이동" />
        </div>
      </div>
    </aside>
  );
}
