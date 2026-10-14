// 기간 표기를 사이트 전체에서 같게 맞춘다. 다른 모듈을 import 하지 않는다(테스트가 바로 불러온다).
// "2024.08 - 2026.02" → "2024.08–2026.02", "2026.03 - 재직 중" → "2026.03 – 재직 중"
export function formatPeriod(period: string): string {
  const parts = period.split(" - ");
  if (parts.length !== 2) return period;
  const [start, end] = parts;
  const isDate = (value: string) => /^\d/.test(value) && /\d$/.test(value);
  return isDate(start) && isDate(end) ? `${start}–${end}` : `${start} – ${end}`;
}
