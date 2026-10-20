// aboutData의 status 값은 배지 색 계산에도 쓰여 영어로 두고, 화면에는 한국어로 보여 준다.
const PROJECT_STATUS_LABELS: Record<string, string> = {
  Active: "운영 중",
  Completed: "완료",
  Published: "공개",
};

export function formatProjectStatus(status: string): string {
  return PROJECT_STATUS_LABELS[status] ?? status;
}
