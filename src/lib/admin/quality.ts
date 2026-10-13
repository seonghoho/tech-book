// 발행 전 품질 체크. docs/seo-publishing.md 체크리스트와 AdSense 제안서 기준을 따른다.
// 발행을 막지 않고 경고만 한다.

export type QualityCheck = {
  id: string;
  ok: boolean;
  message: string;
};

export const MIN_PROSE_LENGTH = 1500;

// 코드 블록·인라인 코드·마크다운 기호·공백을 뺀 글자 수
export function proseLength(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[#>*_`\-[\]|\s]/g, "").length;
}

export function runQualityChecks(input: {
  title: string;
  description?: string;
  image?: string;
  body: string;
}): QualityCheck[] {
  const length = proseLength(input.body);
  const descriptionLength = input.description?.trim().length ?? 0;
  const internalLinks = (input.body.match(/\]\(\/(posts|projects)\//g) ?? []).length;
  const imagesWithoutAlt = (input.body.match(/!\[\s*\]\(/g) ?? []).length;

  return [
    {
      id: "title",
      ok: input.title.trim().length >= 10,
      message: "제목이 검색 의도를 드러낼 만큼 구체적인가 (10자 이상)",
    },
    {
      id: "length",
      ok: length >= MIN_PROSE_LENGTH,
      message: `본문(코드 제외) ${length.toLocaleString()}자 / 권장 ${MIN_PROSE_LENGTH.toLocaleString()}자 이상`,
    },
    {
      id: "description",
      ok: descriptionLength >= 80 && descriptionLength <= 160,
      message: `description ${descriptionLength}자 / 권장 80~160자`,
    },
    {
      id: "cover",
      ok: Boolean(input.image),
      message: "대표 이미지가 지정되었는가",
    },
    {
      id: "internal-link",
      ok: internalLinks >= 1,
      message: `관련 글/프로젝트 내부 링크 ${internalLinks}개 / 권장 1개 이상`,
    },
    {
      id: "alt",
      ok: imagesWithoutAlt === 0,
      message:
        imagesWithoutAlt === 0
          ? "모든 이미지에 alt 텍스트가 있음"
          : `alt 텍스트가 없는 이미지 ${imagesWithoutAlt}개`,
    },
  ];
}
