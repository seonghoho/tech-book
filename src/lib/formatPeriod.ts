// 기간 표기를 사이트 전체에서 같게 맞춘다. 다른 모듈을 import 하지 않는다(테스트가 바로 불러온다).
// "2024.08 - 2026.02" → "2024.08–2026.02", "2026.03 - 재직 중" → "2026.03 – 재직 중"
export function formatPeriod(period: string): string {
  // 앞뒤·하이픈 주변 공백이 여러 칸이어도 같은 결과가 나오게 한다. 공백 없는 하이픈은 그대로 둔다.
  const parts = period.trim().split(/\s+-\s+/);
  if (parts.length !== 2) return period.trim();
  const [start, end] = parts;
  const isDate = (value: string) => /^\d/.test(value) && /\d$/.test(value);
  return isDate(start) && isDate(end) ? `${start}–${end}` : `${start} – ${end}`;
}
