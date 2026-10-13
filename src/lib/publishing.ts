// 글 공개 여부 판정. draft 이거나 발행일(KST 기준)이 오늘보다 미래면 노출하지 않는다.
// 예약 발행은 이 필터 + 매일 재배포(cron)로 동작한다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function todayInKst(now: Date = new Date()) {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// gray-matter는 따옴표 없는 날짜를 Date 객체로 파싱하므로 둘 다 받는다.
export function normalizeDateString(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}

export function isPublished(data: { date?: unknown; draft?: unknown }, now: Date = new Date()) {
  if (data.draft === true) return false;
  const date = normalizeDateString(data.date);
  if (!date) return true;
  return date <= todayInKst(now);
}
