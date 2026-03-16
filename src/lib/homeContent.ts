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

export const homeHeroContent = {
  eyebrow: "Frontend Engineer · Interaction Systems · Technical Writing",
  headline: "복잡한 인터랙션을 구현하고, 과정을 글로 남깁니다.",
  description:
    "SVG, Three.js, Vue/React 기반 프론트엔드 구현 경험을 바탕으로 실무에서 부딪힌 문제, 구조 설계, 렌더링 이슈, 인터랙션 구현 과정을 기록합니다.",
  primaryAction: {
    label: "글 읽기",
    href: "/posts",
  },
  secondaryAction: {
    label: "소개 보기",
    href: "/about",
  },
} as const;

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
    title: "Vue / Nuxt in Practice",
    description: "서비스 화면 설계와 상태 구조에 관한 실전 메모입니다.",
    href: "/posts",
    fallbackCount: 4,
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
  {
    title: "Career Notes",
    description: "실무 적응, 문제 해결 방식, 개발자로서의 관찰을 남깁니다.",
    href: "/posts",
    fallbackCount: 2,
  },
];
