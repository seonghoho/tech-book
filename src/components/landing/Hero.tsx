"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSpring, animated, useTrail } from "@react-spring/web";

const Dice = dynamic(() => import("@/components/landing/Dice"), {
  ssr: false,
});

type HeroProps = {
  stats: {
    posts: number;
    games: number;
  };
  featuredLinks?: { title: string; href: string; label: string }[];
};

const calc = (x: number, y: number, rect: DOMRect) => [
  -(y - rect.top - rect.height / 2) / 30,
  (x - rect.left - rect.width / 2) / 30,
  1.03,
];

const trans = (x: number, y: number, s: number) =>
  `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

const Hero = ({ stats, featuredLinks = [] }: HeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const [shouldRenderDice, setShouldRenderDice] = useState(false);
  const [{ xys }, api] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 4, tension: 320, friction: 32 },
  }));

  useEffect(() => {
    if (!ref.current || shouldRenderDice) return;
    const observer = new IntersectionObserver(
      ([entry]) => {






        
        if (entry.isIntersecting) {
          setShouldRenderDice(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldRenderDice]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      api.start({ xys: calc(e.clientX, e.clientY, rect) });
    }
  };

  const handleMouseLeave = () => {
    api.start({ xys: [0, 0, 1] });
  };

  const trailItems = [
    <span
      key="badge"
      className="inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-zinc-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-gray-200/80 dark:ring-gray-800"
    >
      Interactive · Product-minded
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
    </span>,
    <h1
      key="title"
      className="text-3xl sm:text-3xl lg:text-4xl font-bold leading-s tracking-tight text-gray-900 dark:text-white"
    >
      인터랙티브한 학습 도구와 서비스를
      <br />
      동시에 만드는 개발자, 최성호입니다.
    </h1>,
    <p
      key="desc"
      className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-2xl"
    >
      수학 교구 에디터, 영어 단어 학습 서비스, 여행 보드게임 등 살아있는 웹을
      만듭니다. 복잡한 사용자 인터랙션과 상태를 다루며, 요구사항 정의부터 일정
      관리, 외주 커뮤니케이션까지 제품 흐름을 경험했습니다.
    </p>,
  ];

  const trail = useTrail(trailItems.length, {
    from: { opacity: 0, transform: "translateY(16px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 120,
  });

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-gradient-to-br from-[#f1f5ff] via-white to-[#f6fff7] dark:from-[#0c0f1a] dark:via-[#0b0e16] dark:to-[#0b1414] py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.12),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.12),transparent_25%)]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            {trail.map((style, index) => (
              <animated.div key={index} style={style}>
                {trailItems[index]}
              </animated.div>
            ))}

            <div className="flex flex-wrap gap-3">
              {[
                "SVG Math Editor",
                "Three.js / Pixi.js",
                "EdTech · 단어 학습 서비스",
                "프로젝트 리드 & 커뮤니케이션",
                "Vue3.js · Pinia",
                "Next.js · FSD · SCSS",
              ].map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-gray-200/80 bg-white/70 px-3 py-1 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/posts"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-black shadow-md shadow-indigo-200 transition hover:translate-y-[-2px] hover:shadow-xl dark:bg-white dark:text-gray-900"
              >
                최신 글 보기
              </Link>
              <Link
                href="/games"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100"
              >
                게임 프로젝트 살펴보기
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatBlock
                label="게시글"
                value={`${stats.posts}+`}
                hint="JS/FE/UX"
              />
              <StatBlock
                label="게임 로그"
                value={`${stats.games}+`}
                hint="Pixi.js"
              />
              {/* <StatBlock
                label="SEO 준비"
                value="OG · JSON-LD"
                hint="공유 최적화"
              /> */}
            </div>

            {featuredLinks.length ? (
              <div className="mt-2 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  최근 업데이트
                </div>
                <div className="flex flex-wrap gap-3">
                  {featuredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group inline-flex items-center gap-2 rounded-lg border border-gray-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
                    >
                      <span className="text-xs uppercase tracking-wide text-indigo-500">
                        {link.label}
                      </span>
                      <span className="truncate max-w-[220px] group-hover:underline">
                        {link.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <animated.div
              style={{ transform: xys.to(trans) }}
              className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 p-4 shadow-xl shadow-indigo-100/40 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-400/10" />
              <div className="absolute inset-3 rounded-2xl border border-dashed border-gray-200/70 dark:border-gray-800" />
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#0b1223] to-[#0b1e1b] dark:from-[#0b132b] dark:via-[#0d111b] dark:to-[#0b1f1b] overflow-hidden">
                {shouldRenderDice ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800" />
                    }
                  >
                    <Dice />
                  </Suspense>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
                )}
              </div>
              <div className="relative mt-4 grid gap-3 rounded-2xl bg-gray-50/70 p-4 text-sm text-gray-700 shadow-sm backdrop-blur dark:bg-gray-800/70 dark:text-gray-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Web Vitals: LCP · CLS · TBT 점검
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  OG/Twitter, 구조화 데이터 자동 삽입
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  인터랙티브 컴포넌트는 지연 로드
                </div>
              </div>
            </animated.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatBlock = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) => {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70">
      <div className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{hint}</div>
    </div>
  );
};

export default Hero;
