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
      className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/80 dark:text-gray-100 dark:ring-gray-800"
    >
      Product Studio · Frontend
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
    </span>,
    <h1
      key="title"
      className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white"
    >
      디자인과 데이터 흐름을 통째로 다루는
      <br />
      프론트엔드 개발자
    </h1>,
    <p
      key="desc"
      className="text-lg sm:text-xl text-slate-700 dark:text-gray-200 max-w-2xl"
    >
      학습 도구, 실시간 대시보드, 게임화된 경험을 설계하며 사용자 행동을
      관찰하고 개선합니다. 인터랙션, 접근성, 퍼포먼스를 함께 가져가는 제품 제작
      방식을 선호합니다.
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
      className="relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-white to-[#f3fbff] dark:from-[#0b1020] dark:via-[#0a0e18] dark:to-[#0a1514] py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_92%_8%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_35%)]" />
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
                {
                  title: "SVG Math Editor",
                  toneClass: "bg-gradient-to-r from-indigo-400 to-indigo-500",
                },
                {
                  title: "실시간 대시보드",
                  toneClass: "bg-gradient-to-r from-emerald-400 to-emerald-500",
                },
                {
                  title: "AI 튜터 플래너",
                  toneClass: "bg-gradient-to-r from-violet-400 to-violet-500",
                },
                {
                  title: "게임형 콘텐츠 CMS",
                  toneClass: "bg-gradient-to-r from-blue-400 to-blue-500",
                },
                {
                  title: "여행 보드게임",
                  toneClass: "bg-gradient-to-r from-amber-400 to-amber-500",
                },
                {
                  title: "학습 실험실",
                  toneClass: "bg-gradient-to-r from-cyan-400 to-cyan-500",
                },
              ].map((item) => (
                <span
                  key={item.title}
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:-translate-y-0.5 dark:bg-gray-900/70 dark:text-gray-100 dark:ring-gray-800"
                >
                  <span className={`h-2 w-2 rounded-full ${item.toneClass}`} />
                  {item.title}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:translate-y-[-2px] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950"
              >
                프로젝트 둘러보기
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200/70 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
              >
                인터랙티브 데모 보기
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  End-to-end product
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  리서치·IA·와이어프레임부터 프론트엔드 아키텍처, 성능/접근성
                  튜닝까지 일관된 흐름으로 만듭니다.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-gray-200">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Interactive delivery
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  WebGL, 애니메이션, 실시간 데이터, 실험적인 UI를 안정적으로
                  제공하는 것을 즐깁니다.
                </p>
              </div>
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
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-4 shadow-xl shadow-indigo-100/50 backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/70 dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 via-white/30 to-emerald-300/10 dark:from-indigo-500/10 dark:via-gray-900/60 dark:to-emerald-400/10" />
              <div className="absolute inset-3 rounded-2xl border border-dashed border-gray-200/80 dark:border-gray-800" />
              <div className="relative aspect-square rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(52,211,153,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(52,211,153,0.18),transparent_38%)]">
                {shouldRenderDice ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center bg-white/60 dark:bg-gray-800" />
                    }
                  >
                    <Dice />
                  </Suspense>
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-white/80 via-white to-indigo-50/70 dark:from-gray-900 dark:via-gray-800 dark:to-gray-800" />
                )}
              </div>
              <div className="relative mt-4 grid gap-2 rounded-2xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:text-gray-100 dark:ring-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    품질 체크리스트
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
                    LIVE READY
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-200">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Web Vitals (LCP · CLS · INP) 점검 및 경량화
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  OG/Twitter, 구조화 데이터 자동 삽입
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-gray-200">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  인터랙티브 컴포넌트는 지연 로드 및 분리
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
