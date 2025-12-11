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
  const scrollShowcaseRef = useRef<HTMLElement>(null);
  const [shouldRenderDice, setShouldRenderDice] = useState(false);
  const [{ xys }, api] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 4, tension: 320, friction: 32 },
  }));
  const [scrollSpring, scrollApi] = useSpring(() => ({
    progress: 0,
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

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollShowcaseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const leadIn = viewport * 0.35;
      const start = viewport - rect.top - leadIn;
      const span = rect.height + leadIn;
      const raw = start / span;
      const clamped = Math.min(Math.max(raw, 0), 1);
      scrollApi.start({ progress: clamped });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [scrollApi]);

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
      Interactive Frontend · Product
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
    </span>,
    <h1
      key="title"
      className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 dark:text-white"
    >
      데이터 흐름과 인터랙션을
      <br />
      동시에 설계하는 프론트엔드
    </h1>,
    <p
      key="desc"
      className="text-lg sm:text-xl text-slate-700 dark:text-gray-200 max-w-2xl"
    >
      실시간 데이터, WebGL, 애니메이션을 제품 맥락에 맞춰 녹이고 성능·접근성을
      함께 챙깁니다. 사용자 여정과 개발 흐름을 한 화면에 맞추는 데 집중합니다.
    </p>,
  ];

  const processItems = [
    {
      title: "제품 방향과 여정 정의",
      detail:
        "사용자 시나리오와 화면 흐름을 먼저 고정한 뒤 인터랙션의 역할을 명확히 합니다.",
      toneClass: "from-indigo-400 to-violet-500",
    },
    {
      title: "인터랙션·데이터 구조화",
      detail:
        "Three.js · SVG · 실시간 데이터를 아키텍처와 스토어 설계에 맞춰 모듈화합니다.",
      toneClass: "from-emerald-400 to-cyan-500",
    },
    {
      title: "전달·품질 체크",
      detail:
        "성능 튜닝, 접근성, SEO/메타 자동화까지 포함해 릴리즈 가능한 상태로 만듭니다.",
      toneClass: "from-amber-400 to-orange-500",
    },
  ];

  const trail = useTrail(trailItems.length, {
    from: { opacity: 0, transform: "translateY(16px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 120,
  });

  return (
    <>
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
            <div className="space-y-8 lg:col-span-7">
              {trail.map((style, index) => (
                <animated.div key={index} style={style}>
                  {trailItems[index]}
                </animated.div>
              ))}

              <div className="flex flex-wrap gap-2 text-sm text-slate-700 dark:text-gray-200">
                {[
                  "WebGL / Canvas",
                  "실시간 데이터",
                  "프로토타입 → 프로덕션",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 font-medium shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:-translate-y-0.5 dark:bg-gray-900/70 dark:ring-gray-800"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Drag & Rotate
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700 dark:text-gray-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:ring-gray-800">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  게시글 {stats.posts}+편
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:ring-gray-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  게임 로그 {stats.games}+회
                </span>
              </div>
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
                <div className="relative mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:text-gray-100 dark:ring-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    실시간 WebGL 인터랙션
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
                    LIVE
                  </span>
                </div>
              </animated.div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={scrollShowcaseRef}
        className="relative overflow-hidden bg-gradient-to-br from-white via-[#f7fbff] to-[#eef5ff] py-16 dark:from-[#070b18] dark:via-[#090f1f] dark:to-[#0a1224]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-16 h-40 w-40 rounded-full bg-indigo-300/10 blur-3xl" />
          <div className="absolute bottom-10 right-16 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-screen-xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-8 lg:col-span-7">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:text-gray-200 dark:ring-gray-800">
                Scroll Story
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                스크롤하면 왼쪽 카피는 위로, 오른쪽 비주얼은 고정
              </h2>
              <p className="text-lg text-slate-700 dark:text-gray-200">
                스크롤을 내리면 왼쪽 설명이 아래에서 위로 살짝 밀려 올라오며,
                오른쪽은 고정된 상태로 디테일을 보여줍니다.
              </p>
            </div>

            <animated.div
              style={{
                transform: scrollSpring.progress.to(
                  (p) => `translateY(${32 - p * 56}px)`
                ),
                opacity: scrollSpring.progress.to((p) => 0.6 + p * 0.4),
              }}
              className="space-y-4"
            >
              {processItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70"
                >
                  <span
                    className={`mt-1 h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br ${item.toneClass} text-transparent`}
                  >
                    .
                  </span>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </animated.div>

            <div className="overflow-x-auto pt-2">
              <div className="flex min-w-max items-center gap-3">
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Posts
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {stats.posts}+ 글
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                  <div className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Game logs
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {stats.games}+ 회
                  </div>
                </div>
                {featuredLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex min-w-[220px] flex-1 items-center justify-between gap-2 rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wide text-indigo-500">
                        {link.label}
                      </span>
                      <span className="truncate group-hover:underline">
                        {link.title}
                      </span>
                    </div>
                    <span aria-hidden>↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 shadow-xl shadow-indigo-100/50 backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/70 dark:shadow-none">
                <div className="border-b border-gray-200/80 px-5 py-4 text-sm font-semibold text-slate-900 dark:border-gray-800 dark:text-white">
                  품질 체크리스트 & 전달 보드
                </div>
                <div className="space-y-3 px-5 py-4 text-sm text-slate-700 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    Web Vitals (LCP · CLS · INP) 점검 및 경량화
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    OG/Twitter, 구조화 데이터 자동 삽입
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    인터랙티브 컴포넌트 지연 로드·분리
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    접근성 점검 후 스크린리더 경로 보정
                  </div>
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200/80 bg-white/70 px-4 py-3 text-xs text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
                    오른쪽 보드는 고정, 왼쪽 내용은 스크롤에 맞춰 위로
                    이동합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
