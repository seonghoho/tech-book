export type ProjectFilter = "all" | "apps" | "team";

export function parseProjectFilter(value: string | null | undefined): ProjectFilter {
  return value === "apps" || value === "team" ? value : "all";
}
