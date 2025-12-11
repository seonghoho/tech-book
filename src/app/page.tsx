import GameCardList from "@/components/layout/GameCardList";
import Hero from "@/components/landing/Hero";
import RecentPostsList from "@/components/landing/RecentPostsList";
import { getAllPosts } from "@/lib/getAllPosts";
import AnimatedSection from "@/components/landing/AnimatedSection";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "TechBook: 개발자를 위한 기술 블로그",
  description:
    "Modern JavaScript, Three.js, SVG 등 프론트엔드 기술을 깊이 있게 다루는 기술 블로그입니다.",
  path: "/",
});

export default function Home() {
  const posts = getAllPosts("posts").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentPosts = posts.slice(0, 3);
  const gamePosts = getAllPosts("games").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const heroLinks = [
    posts[0]
      ? {
          title: posts[0].title,
          href: `/posts/${posts[0].slug}`,
          label: "Latest post",
        }
      : null,
    gamePosts[0]
      ? {
          title: gamePosts[0].title,
          href: `/games/${gamePosts[0].slug}`,
          label: "Game devlog",
        }
      : null,
  ].filter(Boolean) as { title: string; href: string; label: string }[];

  const keyStrengths = [
    {
      title: "복잡한 인터랙션을 설계하고 구현합니다.",
      detail:
        "SVG·Three.js·Pixi.js로 조작 가능한 화면을 만들고, 드래그·스냅·멀티셀렉트 등 에디터급 인터랙션을 구현합니다.",
      chips: ["SVG/Canvas", "Three.js", "Pixi.js", "Interactive UI"],
    },
    {
      title: "요구사항·일정·외주 커뮤니케이션을 포함한 프로젝트 리드 경험",
      detail:
        "기획/요구사항 정의 → 일정 관리 → 외주사 커뮤니케이션까지 리드하며 4주 안에 MVP를 완성한 경험이 있습니다.",
      chips: ["Project Lead", "Schedule", "Vendor comms", "QA flow"],
    },
    {
      title: "Next.js·FSD·SCSS로 확장 가능한 프론트엔드 구조 설계",
      detail:
        "FSD(Feature-Sliced Design)와 SCSS 모듈을 적용해 페이지가 늘어나도 유지보수 가능한 구조와 스타일 시스템을 만듭니다.",
      chips: ["Next.js", "FSD", "SCSS Modules", "Design tokens"],
    },
    {
      title: "교육 서비스(EdTech) 도메인 경험",
      detail:
        "수학 교구 에디터, 단어 학습 서비스 등 학습과 놀이가 만나는 웹을 여러 번 만들며 도메인 모델과 UX를 다듬었습니다.",
      chips: ["EdTech", "Learning UX", "Domain modeling"],
    },
  ];

  const featuredProjects = [
    {
      title: "Math Canvas",
      tagline:
        "SVG·Three.js 기반으로 40+ 종의 수학교구를 구현한 인터랙티브 매쓰 캔버스 에디터",
      role: "프론트엔드 메인 개발",
      bullets: [
        "드래그·스냅·복수선택·복제 등 에디터급 조작 로직 설계",
        "점/선/도형/좌표/쌓기나무 등 커스텀 교구 시스템 설계",
        "Three.js로 3D 교구와 카메라/축 이동 로직 구현",
        "공통 조작 로직 모듈화로 신규 교구 추가 비용 최소화",
      ],
      tags: ["SVG", "Three.js", "State management", "Editor UX"],
    },
    {
      title: "Vocab360",
      tagline:
        "4주 일정으로 학습→채점→리포트 흐름을 완성한 영어 단어 학습 서비스, 프로젝트 리드",
      role: "FE 리드 · 일정/스코프 관리 · 외주 커뮤니케이션",
      bullets: [
        "입장→학습→채점→리포트 도메인 모델 및 상태 설계",
        "학습 콘텐츠 JSON 스키마 정의 및 파싱/렌더링 로직 구현",
        "외주 API 스펙 변경 대응, 타입/스토어 구조 리팩토링",
        "Notion/이슈 보드로 요구사항·진행 현황 투명하게 관리",
      ],
      tags: ["Project Lead", "Domain design", "Type-safe API", "MVP delivery"],
    },
    {
      title: "TripMarble",
      tagline:
        "Next.js + FSD + SCSS로 여행 보드게임 콘셉트 웹앱을 설계/개발하며 확장성 실험",
      role: "개인 사이드 프로젝트 (설계·개발·UI)",
      bullets: [
        "Next.js 라우팅에 맞춘 지역/보드/이벤트 정보 구조화",
        "FSD 적용으로 features/entities/shared 계층 분리",
        "SCSS 모듈 기반 디자인 토큰(색/타이포/spacing) 정의",
        "턴 진행/플레이어 상태/이벤트를 책임 단위로 분리",
      ],
      tags: ["Next.js", "FSD", "SCSS Modules", "State orchestration"],
    },
    {
      title: "NowDoBoss (서울시 상권분석 서비스)",
      tagline:
        "서비스 콘셉트 기획부터 화면 설계, 프로토타입 제작까지 진행한 브랜딩형 사이드 프로젝트",
      role: "서비스 아이디어 · 타깃 정의 · 플로우 설계 · UI 프로토타입",
      bullets: [
        "페르소나·문제 정의를 먼저 확립하고 핵심 경험을 슬림하게 설계",
        "최소 화면/기능으로도 가치가 전달되도록 플로우 단순화",
        "에듀테크·게임형 UI 경험을 상권 분석 도메인에 확장 적용",
      ],
      tags: ["Service design", "Prototype", "Flow design", "Branding"],
    },
  ];

  return (
    <main className="flex-1 bg-white dark:bg-gray-900">
      <Hero
        stats={{ posts: posts.length, games: gamePosts.length }}
        featuredLinks={heroLinks}
      />
      <div className="py-16 sm:py-24 space-y-24">
        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Key Strengths
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              복잡한 인터랙션부터 일정/커뮤니케이션까지, 제품을 끝까지 밀어붙인
              경험을 선택해 요약했습니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {keyStrengths.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70"
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </div>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.detail}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              실제로 만들고 운영한 프로젝트를 역할과 핵심 포인트 중심으로
              정리했습니다.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredProjects.map((project) => (
              <div
                key={project.title}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    {project.role}
                  </span>
                </div>
                <p className="mt-3 text-gray-700 dark:text-gray-200 leading-relaxed">
                  {project.tagline}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {project.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Featured Posts
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              최근 작성한 기술 글을 요약했습니다.
            </p>
          </div>
          <RecentPostsList posts={recentPosts} />
        </AnimatedSection>

        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Featured Games
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Pixi.js와 Three.js로 만든 인터랙티브 게임 데모와 로그를
              확인하세요.
            </p>
          </div>
          <GameCardList />
        </AnimatedSection>
      </div>
    </main>
  );
}
