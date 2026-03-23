export type HomeTopicBlueprint = {
  title: string;
  description: string;
  href: string;
  countSource?: {
    type: "category" | "tag";
    key: string;
  };
  fallbackCount: number;
};

export type HomeHeroFocusItem = {
  title: string;
  description: string;
  href: string;
  meta: string;
};

export type HomeHeroShortcut = {
  label: string;
  description: string;
  href: string;
};

export const homeHeroPoster = {
  word: "ARCHIVE",
  imageSrc: "/images/projects/nowdoboss/cover-og.jpg",
  imageAlt: "Muted urban placeholder image clipped inside the archive title.",
} as const;

export const homeHeroMainImages = [
  "/images/hero/hero-me-2.webp",
  "/images/hero/hero-jeju-2.webp",
  "/images/hero/hero-cafe-1.webp",
  "/images/hero/hero-sea-1.webp",
  "/images/hero/hero-sky-1.webp",
  "/images/hero/hero-tree-1.webp",
] as const;

export const homeAboutSiteCopy =
  "해당 블로그는 구현 경험, 기술 글, 프로젝트 기록을 작성한 기술 아카이브입니다. 실무에서 마주친 프론트엔드 문제와 그 해결 과정을 차분하게 남기는 것을 목표로 합니다.";

export const homeTopicBlueprints: HomeTopicBlueprint[] = [
  {
    title: "SVG Editor Devlog",
    description: "편집기 인터랙션, 좌표 계산, 핸들링 구조를 기록합니다.",
    href: "/categories/svg-editor",
    countSource: { type: "category", key: "svg-editor" },
    fallbackCount: 6,
  },
  {
    title: "Three.js Interaction",
    description: "카메라, 좌표축, Raycaster, 렌더링 이슈를 다룹니다.",
    href: "/tags/Three.js",
    countSource: { type: "tag", key: "Three.js" },
    fallbackCount: 5,
  },
  {
    title: "Frontend Architecture",
    description: "컴포넌트 구조, 상태 경계, 유지보수성에 집중합니다.",
    href: "/tags/Architecture",
    countSource: { type: "tag", key: "Architecture" },
    fallbackCount: 3,
  },
  {
    title: "Performance & Rendering",
    description: "렌더링 병목, WebGL 문제, 화면 최적화 이슈를 정리합니다.",
    href: "/tags/Rendering",
    countSource: { type: "tag", key: "Rendering" },
    fallbackCount: 4,
  },
];
