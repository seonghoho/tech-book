// 홈 프로젝트 카드의 표시용 순수 함수. 테스트가 바로 불러오므로 import는 상대 경로 .ts로만 한다.
import { formatPeriod } from "../../lib/formatPeriod.ts";

// "2024.08 - 2026.02", "4명 · FE 3 / BE 1" → "2024.08–2026.02 · 4명 · FE 3 / BE 1"
export function formatProjectMeta(period: string, team: string): string {
  return [formatPeriod(period), team]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}
