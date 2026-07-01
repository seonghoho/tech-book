export const SITE_CONFIG = {
  name: "seonghoho",
  title: "seonghoho - 프론트엔드 개발 기록",
  description:
    "SVG, Three.js, 프론트엔드 인터랙션, 웹 개발 실무 문제 해결 과정을 기록하는 포트폴리오와 글 아카이브입니다.",
  url: "https://seonghoho.com",
  author: {
    name: "최성호",
    englishName: "Choi Seongho",
    url: "https://seonghoho.com/about",
    bio: "프론트엔드 엔지니어. SVG, Three.js, 인터랙션 UI, 에디터 구조를 다룹니다.",
  },
  locale: "ko_KR",
} as const;

export function getSiteUrl() {
  return SITE_CONFIG.url;
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  return `${SITE_CONFIG.url}${normalizedPath}`;
}
