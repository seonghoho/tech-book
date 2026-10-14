// 홈 프로젝트 카드의 표시용 순수 함수. 테스트가 바로 불러오므로 import는 상대 경로 .ts로만 한다.
import { formatPeriod } from "../../lib/formatPeriod.ts";

export type ProjectGlyphKind = "canvas" | "route" | "pitch" | "default";

// Map을 써서 "constructor" 같은 slug가 객체 프로토타입 값을 돌려주지 않게 한다.
const GLYPH_BY_SLUG = new Map<string, ProjectGlyphKind>([
  ["mathcanvas", "canvas"],
  ["nowdoboss", "route"],
  ["mancity", "pitch"],
]);

export function projectGlyphKind(slug: string): ProjectGlyphKind {
  return GLYPH_BY_SLUG.get(slug) ?? "default";
}

// "2024.08 - 2026.02", "4명 · FE 3 / BE 1" → "2024.08–2026.02 · 4명 · FE 3 / BE 1"
export function formatProjectMeta(period: string, team: string): string {
  return [formatPeriod(period), team]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}
