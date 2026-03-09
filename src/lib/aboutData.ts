export type AboutLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type AboutMetric = {
  value: string;
  label: string;
  description: string;
};

export type StrengthItem = {
  title: string;
  description: string;
  bullets: string[];
};

export type SkillGroup = {
  title: string;
  summary: string;
  items: string[];
};

export type ExperienceItem = {
  company: string;
  title: string;
  period: string;
  summary: string;
  highlights: string[];
};

export type GrowthNote = {
  title: string;
  description: string;
};

export type ProjectPreview =
  | {
      kind: "image";
      src: string;
      alt: string;
      caption?: string;
      aspect?: "wide" | "landscape" | "square";
    }
  | {
      kind: "placeholder";
      label: string;
      title: string;
      caption: string;
      tone: "emerald" | "amber" | "sky" | "rose";
      layout?: "flow" | "dashboard" | "split" | "stack";
      points: string[];
      aspect?: "wide" | "landscape" | "square";
    };

export type AboutProject = {
  slug: string;
  title: string;
  eyebrow: string;
  tagline: string;
  period: string;
  duration?: string;
  team: string;
  role: string;
  achievement?: string;
  summary: string;
  overview: string;
  context: string;
  cardPoints: string[];
  keyContributions: string[];
  technicalHighlights: string[];
  techStack: string[];
  outcomes: string[];
  links: AboutLink[];
  preview: ProjectPreview;
  gallery: ProjectPreview[];
  featured?: boolean;
};

export const aboutSectionLinks = [
  { id: "overview", label: "개요" },
  { id: "experience", label: "경험" },
  { id: "projects", label: "프로젝트" },
  { id: "strengths", label: "강점" },
  { id: "stack", label: "기술 스택" },
  { id: "collaboration", label: "협업" },
] as const;

export const aboutProfile = {
  name: "최성호",
  title: "프론트엔드 엔지니어",
  tagline: "SVG 기반 에디터와 3D 시각 도구를 설계·구현하는 프론트엔드 엔지니어",
  quote: "꾸준함을 무기로, 몰입하며 성장하는 개발자",
  railSummary:
    "SVG·Three.js 기반 인터랙션과 서비스 UI를 설계·구현하는 프론트엔드 엔지니어입니다.",
  companyLabel: "플랜티엠 · Frontend Engineer",
  stackLabel: "Vue / React / SVG / Three.js",
  overviewTitle:
    "복잡한 상호작용을 구현하면서도, 읽히는 구조를 남기는 프론트엔드 엔지니어입니다",
  overviewDescription:
    "사용자에게는 자연스럽고, 팀에게는 다루기 쉬운 화면을 만드는 것이 목표입니다. 특히 좌표 기반 인터랙션과 시각화가 필요한 제품에서 강점을 발휘합니다.",
  summary:
    "2026년 3월부터 플랜티엠에서 프론트엔드 엔지니어로 근무하고 있습니다. 이전에는 코드넛에서 SVG·Three.js 기반 수학교구 캔버스를 개발하며 복잡한 사용자 상호작용을 구조화하는 일에 집중했고, React·Vue 기반 팀 프로젝트에서도 실전 문제 해결 경험을 쌓았습니다.",
  focus:
    "사용자 경험과 유지보수성을 함께 보는 설계, 그리고 인터랙션이 많은 화면에서도 흔들리지 않는 구조를 만드는 데 강점이 있습니다.",
  contacts: [
    {
      label: "GitHub",
      href: "https://github.com/seonghoho",
      external: true,
    },
    {
      label: "Email",
      href: "mailto:chltjdgh3@naver.com",
    },
    {
      label: "MathCanvas",
      href: "https://mathcanvas.vivasam.com/",
      external: true,
    },
  ] satisfies AboutLink[],
  metrics: [
    {
      value: "20 / 46",
      label: "직접 설계·구현한 디지털 교구",
      description: "코드넛 재직 당시 담당한 SVG 기반 수학교구 수량",
    },
    {
      value: "4개",
      label: "대표 프로젝트",
      description: "에듀테크·지도·실시간 소통·커뮤니티 도메인 경험",
    },
    {
      value: "React · Vue",
      label: "서비스 UI 구축 경험",
      description: "프로덕션 화면과 인터랙션 중심 기능을 모두 구현",
    },
    {
      value: "3회",
      label: "팀 프로젝트 일정 리드",
      description: "SSAFY 과정에서 스크럼 마스터 역할 수행",
    },
  ] satisfies AboutMetric[],
};

export const strengthHighlights: StrengthItem[] = [
  {
    title: "복합 인터랙션 구조화",
    description:
      "SVG 한 화면 안에서 좌표 계산, drag·rotate·snap, PointerEvent·KeyboardEvent 흐름을 교구별 규칙에 맞게 설계했습니다.",
    bullets: [
      "하나의 SVG 영역에서 다양한 교구 상호작용을 안정적으로 제어",
      "교구 특성에 맞는 이벤트 분기와 커스텀 이벤트 구조 설계",
    ],
  },
  {
    title: "3D 시각화 구현",
    description:
      "Three.js로 공간좌표, 쌓기나무, 입체도형을 구현하며 조작감과 가독성을 함께 챙겼습니다.",
    bullets: [
      "Raycaster, OrbitControls, DragControls 기반 상호작용 구현",
      "depth buffer와 renderOrder 조정으로 시각적 충돌 최소화",
    ],
  },
  {
    title: "유지보수 가능한 프론트엔드 설계",
    description:
      "클래스 기반 모듈 구조와 타입 중심 상태 설계로 신규 기능 추가 비용을 낮추는 데 집중했습니다.",
    bullets: [
      "DigitalMathElement 중심 상속 구조 설계",
      "Atomic Design Pattern, Storybook, 상태 관리 패턴 활용",
    ],
  },
  {
    title: "협업과 제품 커뮤니케이션",
    description:
      "외주사, 디자이너, 개발자와 주간 단위로 요구사항을 정리하고 우선순위를 조율해 개발 흐름을 맞췄습니다.",
    bullets: [
      "실시간 피드백 반영과 일정 조율 경험",
      "팀 프로젝트에서 스크럼 마스터로 일정 리드",
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Core Frontend",
    summary: "서비스 UI와 인터랙션 중심 화면을 모두 다루는 기본 체력",
    items: [
      "TypeScript",
      "JavaScript",
      "React.js",
      "Next.js",
      "Vue.js",
      "Nuxt.js",
      "Gatsby",
      "HTML/CSS",
    ],
  },
  {
    title: "Interaction & Graphics",
    summary: "좌표 기반 상호작용과 시각화 구현에 강한 도구들",
    items: [
      "SVG",
      "Three.js",
      "PointerEvent",
      "KeyboardEvent",
      "Raycaster",
      "DragControls",
      "OrbitControls",
    ],
  },
  {
    title: "State & Architecture",
    summary: "복잡한 흐름을 유지보수 가능한 구조로 묶는 패턴",
    items: [
      "Pinia",
      "Zustand",
      "Jotai",
      "React Query",
      "Atomic Design Pattern",
      "Storybook",
      "Class-based Modules",
    ],
  },
  {
    title: "Collaboration & Tooling",
    summary: "협업 효율과 코드 품질을 함께 관리하는 운영 도구",
    items: [
      "Git",
      "GitLab",
      "Bitbucket",
      "Styled Components",
      "Tailwind CSS",
      "ESLint",
      "Prettier",
    ],
  },
];

export const experienceTimeline: ExperienceItem[] = [
  {
    company: "플랜티엠",
    title: "프론트엔드 엔지니어",
    period: "2026.03 - 재직 중",
    summary:
      "2026년 3월부터 플랜티엠에서 프론트엔드 엔지니어로 근무하고 있습니다.",
    highlights: ["2026년 3월 플랜티엠 합류", "프론트엔드 엔지니어로 근무 중"],
  },
  {
    company: "코드넛",
    title: "프론트엔드 엔지니어",
    period: "2024.08 - 2026.02",
    summary:
      "SVG·Three.js 기반 수학교구 캔버스를 개발하며 프론트엔드 아키텍처 설계부터 인터랙션 구현, 렌더링 최적화, 서비스 UI 통합까지 담당했습니다.",
    highlights: [
      "총 46종 중 20종의 디지털 교구를 직접 설계·구현",
      "클래스 기반 객체 구조로 확장성과 유지보수성 개선",
      "주간 협업 회의를 통해 요구사항 정리와 우선순위 조율 수행",
      "실제 수업 현장을 고려한 2D·3D 인터랙션 품질 확보",
    ],
  },
  {
    company: "삼성 청년 SW 아카데미",
    title: "교육 과정 수료",
    period: "2023.07 - 2024.06",
    summary:
      "Python, Django, SQL, HTML/CSS, Vue3 등 기본기를 다진 뒤 공통·특화·자율 프로젝트를 수행하며 프론트엔드와 협업 역량을 빠르게 끌어올렸습니다.",
    highlights: [
      "세 차례 팀 프로젝트에서 일정 리드 역할 수행",
      "WebRTC, AI 영상 분석, 빅데이터 기반 서비스 프로젝트 경험",
      "페어 프로그래밍과 코드 리뷰 중심 협업 방식 체득",
      "프로젝트 결과물로 우수상 성과 확보",
    ],
  },
];

export const growthNotes: GrowthNote[] = [
  {
    title: "문제를 구조로 바꾸는 방식",
    description:
      "기능이 복잡할수록 먼저 이벤트 흐름과 책임 경계를 정리합니다. 인터랙션 구현, 상태 저장소, 컴포넌트 구조를 함께 설계해 변경 비용을 낮추는 편입니다.",
  },
  {
    title: "빠르게 익히고 실전에 연결",
    description:
      "새로운 기술을 마주하면 빠르게 학습하고 실제 문제에 적용해 검증합니다. SVG, Three.js, React, Vue를 오가며 사용자 경험과 유지보수성을 동시에 고려합니다.",
  },
];

export const aboutProjects: AboutProject[] = [
  {
    slug: "mathcanvas",
    title: "MathCanvas",
    eyebrow: "대표 프로젝트",
    tagline: "SVG와 Three.js로 수학교구를 디지털화한 인터랙션 캔버스",
    period: "2024.08 - 2026.02",
    duration: "1년 7개월",
    team: "4명 · 프론트엔드 3 / 백엔드 1",
    role: "프론트엔드 엔지니어",
    summary:
      "SVG 및 Three.js 기반으로 다양한 수학교구를 디지털화해 캔버스에서 배치·조작하고, 링크와 QR 코드로 수업에 공유할 수 있는 서비스입니다.",
    overview:
      "MathCanvas는 교사가 수학교구를 직접 배치하고 조작해 수업 자료를 만들고, 학생과 쉽게 공유할 수 있도록 설계된 캔버스 서비스입니다.",
    context:
      "쌓기나무, 평면도형, 공간좌표처럼 난도가 높은 교구를 2D와 3D 상호작용으로 자연스럽게 다뤄야 했고, 교구마다 다른 조작 규칙을 안정적으로 관리할 구조가 필요했습니다.",
    cardPoints: [
      "46종 중 20종 교구 직접 설계·구현",
      "SVG 기반 복합 인터랙션과 클래스 모듈 구조 설계",
      "Three.js 3D 교구 및 Vue 서비스 UI 통합",
    ],
    keyContributions: [
      "46종 중 20종의 SVG 기반 수학교구를 직접 설계·구현하고, 마우스·터치 기반 drag, rotate, place 로직을 교구 특성에 맞게 세분화했습니다.",
      "하나의 SVG 태그 내부에서 DOM 요소를 제어하고 PointerEvent, KeyboardEvent 흐름을 통합해 복합 상호작용을 안정적으로 관리했습니다.",
      "DigitalMathElement 상위 클래스를 중심으로 클래스 기반 모듈 구조를 설계해 신규 교구 추가 시 수정 범위를 최소화했습니다.",
      "생성된 교구 객체를 store에 등록해 전체 목록, 선택 상태, 편집 흐름을 추적하고 Vue 기반 서비스 화면과 자연스럽게 연결했습니다.",
    ],
    technicalHighlights: [
      "Three.js로 쌓기나무, 공간좌표계, 입체도형을 구현하고 BoxGeometry, Raycaster, OrbitControls, DragControls를 활용했습니다.",
      "depth buffer 설정과 renderOrder를 조정해 3D 블록이 겹치는 상황에서도 내부 숫자와 축 정보가 가려지지 않도록 처리했습니다.",
      "Vue.js로 메인 화면, 프로젝트 목록, 사용자 흐름을 설계하고 SVG 편집 영역과 서비스 UI의 상태 흐름을 통합했습니다.",
    ],
    techStack: [
      "Vue.js",
      "Pinia",
      "Three.js",
      "SVG",
      "TypeScript",
      "JavaScript",
      "ESLint",
      "Prettier",
    ],
    outcomes: [
      "46종 중 20종의 수학교구를 직접 설계·구현",
      "실제 수업 현장을 고려한 2D·3D 인터랙션 품질 확보",
      "클래스 기반 구조로 신규 교구 확장성과 유지보수성 강화",
    ],
    links: [
      {
        label: "서비스 보기",
        href: "https://mathcanvas.vivasam.com/",
        external: true,
      },
      {
        label: "관련 기사",
        href: "https://www.straightnews.co.kr/news/articleView.html?idxno=277042",
        external: true,
      },
    ],
    preview: {
      kind: "image",
      src: "/images/portfolio/mathcanvas1.png",
      alt: "MathCanvas 교구 편집 화면",
      caption: "SVG 기반 교구 편집과 조작 흐름을 구현한 대표 화면",
      aspect: "wide",
    },
    gallery: [
      {
        kind: "image",
        src: "/images/portfolio/mathcanvas1.png",
        alt: "MathCanvas 교구 편집 화면",
        caption: "교구를 배치하고 조작할 수 있는 메인 편집 캔버스 화면",
        aspect: "landscape",
      },
      {
        kind: "image",
        src: "/images/portfolio/mathcanvas2.png",
        alt: "MathCanvas 3D 교구 시각화 화면",
        caption: "Three.js 기반 3D 교구와 좌표 시각화를 연결한 구현 화면",
        aspect: "landscape",
      },
      {
        kind: "image",
        src: "/images/portfolio/mathcanvas-admin.png",
        alt: "MathCanvas 관리자 화면",
        caption: "콘텐츠와 운영 흐름까지 포함해 서비스 UI를 연결한 관리자 화면",
        aspect: "landscape",
      },
    ],
    featured: true,
  },
  {
    slug: "nowdoboss",
    title: "NowDoBoss",
    eyebrow: "서비스 프로젝트",
    tagline: "상권 분석부터 채팅·알림까지 연결한 창업 지원 플랫폼",
    period: "2024.04 - 2024.05",
    duration: "6주",
    team: "6명 · 프론트엔드 3 / 백엔드 3",
    role: "프론트엔드 엔지니어",
    achievement: "SSAFY 자율 프로젝트 경진대회 우수상",
    summary:
      "빅데이터 기반 상권 분석, 창업 비용 시뮬레이션, 커뮤니티·채팅·FCM 알림을 한 서비스에서 제공하는 창업 지원 플랫폼입니다.",
    overview:
      "예비 창업자가 상권을 분석하고 비용을 가늠하며 다른 사용자와 정보를 교환할 수 있도록 설계한 통합형 웹 서비스입니다.",
    context:
      "창업 실패의 주요 원인으로 상권 분석과 준비 부족이 언급되는 문제를 해결하기 위해, 지도 기반 추천과 실시간 소통 기능을 하나의 흐름으로 묶는 것이 핵심이었습니다.",
    cardPoints: [
      "카카오맵 기반 상권 추천 흐름 개발",
      "커뮤니티·채팅·FCM 푸시 알림 구현",
      "인터랙티브 메인 화면과 반응형 웹사이트 구축",
    ],
    keyContributions: [
      "카카오맵 기반 상권 추천 서비스와 지역 선택 로직을 개발하고, 화면 좌표를 서버로 전달해 추천 구역을 폴리곤으로 시각화했습니다.",
      "위치 선택, 드롭다운, 실시간 키워드 검색을 함께 사용해 추천받을 상권을 더 쉽게 고를 수 있도록 UX를 개선했습니다.",
      "커뮤니티 목록·상세·댓글 CRUD와 REST API 연결을 구현하고, Sock.js와 Stomp.js를 활용해 WebSocket 기반 채팅 기능을 개발했습니다.",
      "입장한 채팅방에 새 글이 등록되면 알림을 받을 수 있도록 FCM 푸시 알림 흐름을 연결했습니다.",
    ],
    technicalHighlights: [
      "Intersection Observer를 사용해 인터랙티브한 메인 페이지를 구현했습니다.",
      "Styled Components 기반 컴포넌트 구조로 반응형 UI를 정리하고, 모든 화면 크기에서 사용할 수 있는 웹 경험을 구축했습니다.",
      "지도 선택, 커뮤니티, 채팅, 알림까지 서로 다른 흐름을 하나의 제품 경험으로 연결하는 데 집중했습니다.",
    ],
    techStack: [
      "React.js",
      "TypeScript",
      "Zustand",
      "React Query",
      "Styled Components",
      "Sock.js",
      "Stomp.js",
      "FCM",
      "Chart.js",
    ],
    outcomes: [
      "지도 기반 상권 추천과 실시간 커뮤니티 흐름을 하나의 서비스로 통합",
      "채팅과 푸시 알림 기능으로 사용자 소통 경험 강화",
      "SSAFY 자율 프로젝트 경진대회 우수상 수상",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/seonghoho/NowDoBoss",
        external: true,
      },
    ],
    preview: {
      kind: "image",
      src: "/images/portfolio/nowdoboss-1.jpg",
      alt: "NowDoBoss 메인 화면",
      caption: "상권 분석과 창업 지원 흐름을 한 화면에서 풀어낸 메인 화면",
      aspect: "wide",
    },
    gallery: [
      {
        kind: "image",
        src: "/images/portfolio/nowdoboss-1.jpg",
        alt: "NowDoBoss 상권 추천 화면",
        caption: "카카오맵 기반으로 추천 상권과 주요 정보를 탐색하는 화면",
        aspect: "landscape",
      },
      {
        kind: "image",
        src: "/images/portfolio/nowdoboss-2.jpg",
        alt: "NowDoBoss 비용 시뮬레이션 화면",
        caption:
          "창업 비용과 상권 데이터를 함께 비교할 수 있는 시뮬레이션 화면",
        aspect: "landscape",
      },
      {
        kind: "image",
        src: "/images/portfolio/nowdoboss-3.jpg",
        alt: "NowDoBoss 커뮤니티 및 채팅 화면",
        caption: "커뮤니티, 채팅, 알림 흐름을 연결한 실시간 사용자 경험 화면",
        aspect: "landscape",
      },
    ],
  },
  {
    slug: "mancity",
    title: "Mancity",
    eyebrow: "분석 서비스",
    tagline: "드론 경기 영상을 분석해 기록과 하이라이트를 제공한 풋살 서비스",
    period: "2024.02 - 2024.04",
    duration: "6주",
    team: "5명 · 프론트엔드 2 / 백엔드 3",
    role: "프론트엔드 엔지니어",
    achievement: "SSAFY 특화 프로젝트 경진대회 우수상",
    summary:
      "드론 경기 영상을 분석해 경기 기록, 하이라이트, 전술보드를 제공하는 풋살 경기 분석 서비스입니다.",
    overview:
      "고가의 분석 프로그램이나 개인 코치 없이도 아마추어가 경기 영상을 기반으로 자신의 경기를 확인하고 분석받을 수 있도록 만든 서비스입니다.",
    context:
      "경기 등록부터 다시보기, 전술보드, 커뮤니티성 연결까지 한 제품 안에서 풀어야 했고, 다양한 화면에서 재사용 가능한 UI 구조가 필요했습니다.",
    cardPoints: [
      "Atomic Design Pattern과 Storybook 기반 UI 체계화",
      "매치 상세·등록·수정 및 전술보드 구현",
      "회원 API와 팔로우 흐름 개발",
    ],
    keyContributions: [
      "Atomic Design Pattern과 Storybook을 활용해 컴포넌트를 Atom, Molecule, Organism, Template, Page 단계로 나누고 재사용성을 강화했습니다.",
      "Tailwind를 사용해 색상과 크기만 조정해도 재사용 가능한 UI 구조를 만들고, Storybook으로 활용 범위를 빠르게 검증했습니다.",
      "매치 목록, 상세, 등록, 수정 화면과 경기 다시보기, 하이라이트, 경기 통계가 포함된 상세 페이지를 구현했습니다.",
      "Draggable과 Zustand를 활용해 전술보드 기능을 구현하고, 마이페이지와 회원 관련 API, 팔로우·팔로잉 흐름도 담당했습니다.",
    ],
    technicalHighlights: [
      "PWA, React Query, Zustand를 조합해 인터랙티브한 화면과 상태 흐름을 정리했습니다.",
      "다양한 경기 데이터를 한 화면에서 다루기 위해 상세 정보, 영상, 전술보드의 정보 밀도를 균형 있게 구성했습니다.",
      "프론트엔드 컴포넌트 체계를 먼저 다진 뒤 기능 화면을 확장하는 방식으로 개발 속도와 유지보수성을 함께 챙겼습니다.",
    ],
    techStack: [
      "React.js",
      "TypeScript",
      "Zustand",
      "Tailwind CSS",
      "React Query",
      "Storybook",
      "PWA",
      "Vite",
    ],
    outcomes: [
      "Atomic Design Pattern 기반으로 재사용 가능한 UI 구조 확보",
      "전술보드와 매치 상세 흐름을 포함한 분석 서비스 화면 구현",
      "SSAFY 특화 프로젝트 경진대회 우수상 수상",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/seonghoho/Mancity",
        external: true,
      },
    ],
    preview: {
      kind: "image",
      src: "/images/portfolio/mancity.png",
      alt: "Mancity 풋살 분석 서비스 화면",
      caption:
        "경기 데이터, 하이라이트, 전술 흐름을 한 화면에 담은 분석 서비스",
      aspect: "wide",
    },
    gallery: [
      {
        kind: "image",
        src: "/images/portfolio/mancity.png",
        alt: "Mancity 풋살 분석 서비스 화면",
        caption:
          "재사용 가능한 UI 구조 위에서 경기 분석 경험을 구현한 대표 화면",
        aspect: "landscape",
      },
    ],
  },
  {
    slug: "pawsitive",
    title: "pawsitive",
    eyebrow: "커뮤니티 서비스",
    tagline: "입양자와 보호소를 연결한 맞춤형 유기견 입양 지원 서비스",
    period: "2024.01 - 2024.02",
    duration: "6주",
    team: "6명 · 프론트엔드 4 / 백엔드 2",
    role: "프론트엔드 엔지니어",
    achievement: "SSAFY 공통 프로젝트 경진대회 우수상",
    summary:
      "앱과 웹을 통해 유기견 보호소와 입양 희망자를 연결하고, 추천·커뮤니티·사후관리 흐름을 제공하는 입양 지원 서비스입니다.",
    overview:
      "보호소에는 입양자와의 연결 창구를, 입양 희망자에게는 맞춤형 추천과 입양 이후 흐름까지 지원하는 서비스를 목표로 했습니다.",
    context:
      "입양 희망자와 보호소의 목적이 다르기 때문에 같은 서비스 안에서도 역할별로 다른 경험을 설계해야 했고, 커뮤니티와 입양 설문, 데이터 조회 흐름이 자연스럽게 이어져야 했습니다.",
    cardPoints: [
      "역할별 사용자 흐름 분기와 5단계 입양 경험 설계",
      "카카오맵 기반 위치 커뮤니티 구현",
      "React Query·Jotai를 활용한 설문·데이터 흐름 관리",
    ],
    keyContributions: [
      "입양 희망자와 보호소를 역할별로 분기 처리하고, 입양 희망자에게는 5단계 맞춤형 흐름을 제공해 사용자 경험을 최적화했습니다.",
      "카카오맵 API를 활용해 위치 기반 커뮤니티를 구현하고, 카테고리와 위치 기준으로 게시글을 탐색할 수 있도록 만들었습니다.",
      "유기견 등록 및 조회 API를 React Query로 연결해 중복 호출을 줄이고 캐싱 흐름을 정리했습니다.",
      "Jotai를 사용해 20개 문항의 입양 설문 상태를 관리하고, 긴 입력 흐름을 비교적 단순한 구조로 유지했습니다.",
    ],
    technicalHighlights: [
      "역할별 분기 UI와 서비스 흐름을 분리해 서로 다른 사용자의 목적을 한 제품 안에서 설계했습니다.",
      "PWA 기반 구성으로 모바일 맥락에서도 사용할 수 있는 흐름을 고려했습니다.",
      "커뮤니티, 설문, 데이터 조회를 끊기지 않는 사용자 여정으로 연결하는 데 집중했습니다.",
    ],
    techStack: [
      "React.js",
      "TypeScript",
      "Jotai",
      "React Query",
      "Styled Components",
      "PWA",
      "Vite",
    ],
    outcomes: [
      "역할별 사용자 경험 분리로 입양 흐름의 명확성 강화",
      "위치 기반 커뮤니티와 설문 흐름을 결합한 사용자 여정 구성",
      "SSAFY 공통 프로젝트 경진대회 우수상 수상",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/seonghoho/Pawsitive",
        external: true,
      },
    ],
    preview: {
      kind: "image",
      src: "/images/portfolio/pawsitive.png",
      alt: "Pawsitive 입양 지원 서비스 화면",
      caption:
        "입양 추천, 커뮤니티, 설문 흐름을 연결한 반려견 입양 지원 서비스",
      aspect: "wide",
    },
    gallery: [
      {
        kind: "image",
        src: "/images/portfolio/pawsitive.png",
        alt: "Pawsitive 입양 지원 서비스 화면",
        caption:
          "역할별 사용자 경험과 데이터 흐름을 한 제품 안에서 정리한 화면",
        aspect: "landscape",
      },
    ],
  },
];

export function getAboutProjectBySlug(slug: string) {
  return aboutProjects.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = aboutProjects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: aboutProjects[index - 1] ?? null,
    next: aboutProjects[index + 1] ?? null,
  };
}
