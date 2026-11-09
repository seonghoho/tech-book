type ProjectKindBadgeProps = {
  kind: "app" | "team" | "wip";
};

const badgeStyles: Record<ProjectKindBadgeProps["kind"], { label: string; className: string }> = {
  app: {
    label: "개인 앱",
    className: "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
  },
  team: {
    label: "팀 프로젝트",
    className: "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]",
  },
  wip: {
    label: "개발 중",
    className: "bg-[color:var(--color-wip-bg)] text-[color:var(--color-wip-text)]",
  },
};

export default function ProjectKindBadge({ kind }: ProjectKindBadgeProps) {
  const { label, className } = badgeStyles[kind];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
