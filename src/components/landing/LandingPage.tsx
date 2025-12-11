"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Dice from "./Dice";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  name: string;
  description: string;
  bullets: string[];
  stack: string[];
};

type LabItem = {
  label: string;
  title: string;
  description: string;
  bullets: string[];
};

type PostMeta = {
  title: string;
  date: string;
  description?: string;
  slug: string;
};

const Hero = ({
  onNavCompactChange,
  anchorIds,
}: {
  onNavCompactChange: (compact: boolean) => void;
  anchorIds: { projects: string; lab: string };
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const diceCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (leftRef.current) {
        gsap.from(leftRef.current.children, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1,
        });
      }
      if (diceCardRef.current) {
        gsap.from(diceCardRef.current, {
          scale: 0.92,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
        });
      }
      if (sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "bottom top",
          onEnter: () => onNavCompactChange(true),
          onLeaveBack: () => onNavCompactChange(false),
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [onNavCompactChange]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-[#f4f8ff] via-white to-[#fef7f2] dark:from-[#0d1224] dark:via-[#0b1020] dark:to-[#0c141c] py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-10 h-64 w-64 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-12 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-screen-xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div ref={leftRef} className="space-y-6 lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/60 dark:text-gray-100 dark:ring-gray-800">
              INTERACTIVE FRONTEND · PRODUCT
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 dark:text-white">
              데이터 흐름과 인터랙션을
              <br />
              함께 설계하는 개발자
            </h1>
            <p className="text-lg text-slate-700 dark:text-gray-200 max-w-2xl leading-relaxed">
              SVG/Canvas·Three.js 기반 에디터, 보드게임 WebApp, 어휘 학습
              서비스까지 인터랙션과 데이터 흐름을 제품 맥락에 맞게 설계하고
              구현합니다. 요구사항 정리부터 프로토타입·전달까지 전체 흐름을
              리드한 경험이 있습니다.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-slate-700 dark:text-gray-200">
              {[
                "SVG / Canvas",
                "Three.js / WebGL",
                "Vue.js",
                "프로덕트형 프론트엔드",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 font-semibold shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:ring-gray-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-rose-400 to-amber-400" />
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`#${anchorIds.projects}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/40 transition hover:translate-y-[-2px] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 dark:bg-white dark:text-slate-950"
              >
                프로젝트 둘러보기
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href={`#${anchorIds.lab}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200/70 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:border-rose-400 hover:text-rose-500 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-100"
              >
                인터랙티브 데모 보기
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div
              ref={diceCardRef}
              className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-4 shadow-xl shadow-rose-100/50 backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 via-white/40 to-sky-300/10 dark:from-rose-400/10 dark:via-gray-900/40 dark:to-sky-300/10" />
              <div className="absolute inset-3 rounded-2xl border border-dashed border-gray-200/80 dark:border-gray-800" />
              <div className="relative aspect-square rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(125,211,252,0.14),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(248,113,113,0.16),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(125,211,252,0.14),transparent_38%)]">
                <Dice />
              </div>
              <div className="relative mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/70 dark:text-gray-100 dark:ring-gray-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Drag to rotate
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ScrollStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const steps = useMemo(
    () => [
      {
        title: "제품 방향과 여정 정의",
        detail: [
          "MathCanvas/TripMarble에서 사용자 시나리오와 핵심 경험 정의",
          "요구사항을 데이터·화면 구조로 변환하여 우선순위 모델링",
          "프로토타입 기반 가설 검증 및 반복 개선",
        ],
        color: "from-rose-100 to-white",
      },
      {
        title: "인터랙션·데이터 구조화",
        detail: [
          "SVG/Three.js 모듈 구조화 및 복잡한 조작 흐름 분리",
          "TripMarble에서 턴·보드·이벤트를 상태 머신 기반으로 설계",
          "Vocab360의 학습→채점→리포트 도메인 모델 정의",
        ],
        color: "from-sky-100 to-white",
      },
      {
        title: "전달·품질 체크",
        detail: [
          "LCP/INP·접근성·포커스 흐름 품질 개선",
          "요구사항·일정·QA 기준 정리 및 전달 산출물 구조화",
          "스토리보드/JSON 스키마/컴포넌트 맵 자동화",
        ],
        color: "from-emerald-100 to-white",
      },
    ],
    []
  );
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const total = steps.length;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom+=150% top",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(
            total - 1,
            Math.floor(self.progress * total + 0.0001)
          );
          setActiveIdx(idx);
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [steps.length]);

  return (
    <section
      ref={sectionRef}
      id="scroll-story"
      className="relative overflow-hidden bg-gradient-to-b from-[#fff7f7] via-[#f6fbff] to-[#f5fff9] dark:from-[#0c131f] dark:via-[#0d1524] dark:to-[#0c191f] py-24"
      style={{
        transition: "background 300ms ease",
      }}
    >
      <div className="mx-auto grid max-w-screen-xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg shadow-rose-100/40 backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/70 dark:shadow-none">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:bg-rose-500/20 dark:text-rose-100">
                How I design interactive products
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                흐름을 고정하고, 인터랙션을 설계하고, 품질을 검수합니다.
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                스크롤에 따라 단계가 전환되고, 오른쪽 보드 내용이
                업데이트됩니다.
              </p>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    idx === activeIdx
                      ? "border-rose-300/70 bg-rose-50/80 shadow-md shadow-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10"
                      : "border-gray-200/70 bg-white/70 dark:border-gray-800/60 dark:bg-gray-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        idx === activeIdx ? "bg-rose-500" : "bg-gray-300"
                      }`}
                    />
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex h-[70vh] min-h-[520px] items-stretch">
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 p-6 shadow-xl shadow-sky-100/40 backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/70">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  steps[activeIdx]?.color ?? "from-white to-white"
                } opacity-60`}
              />
              <div className="relative flex h-full flex-col justify-between gap-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 ring-1 ring-gray-200 backdrop-blur dark:bg-gray-800/70 dark:text-gray-100 dark:ring-gray-700">
                    Process board
                  </span>
                  <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {steps[activeIdx]?.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    단계에 맞춰 필요한 산출물과 체크리스트를 업데이트합니다.
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
                  {steps[activeIdx]?.detail.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-slate-800 dark:text-gray-100"
                    >
                      <span className="mt-2 h-2 w-2 rounded-full bg-gradient-to-r from-rose-400 to-sky-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-dashed border-gray-200/70 bg-white/60 px-4 py-3 text-xs text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                  ScrollTrigger로 pinning되어 스크롤에 따라 단계가 바뀝니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const KeyStrengths = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const items = [
    {
      title: "에디터급 인터랙션 구현 (MathCanvas)",
      detail:
        "드래그·스냅·복수선택·복제 등 40종 이상의 교구 조작 로직을 설계하고 구현했습니다.",
      tags: ["SVG/Canvas", "Three.js", "Editor UX"],
    },
    {
      title: "보드게임 WebApp 설계 (TripMarble)",
      detail:
        "턴 진행·플레이어 상태·보드 이벤트를 상태 머신 기반으로 모델링했습니다.",
      tags: ["Next.js", "FSD", "State machine"],
    },
    {
      title: "학습 플랫폼 도메인 모델링 (Vocab360)",
      detail:
        "4주 MVP 리드—학습·채점·리포트 흐름을 정의하고 API 계약과 구조를 설계했습니다.",
      tags: ["Product Lead", "Domain modeling", "API Design"],
    },
    {
      title: "브랜딩·서비스 흐름 설계 (NowDoBoss)",
      detail:
        "상권 분석 서비스의 핵심 경험을 정의하고 화면 구조/프로토타입을 제작했습니다.",
      tags: ["Service design", "Prototype", "Branding"],
    },
  ];

  // useEffect(() => {
  //   const ctx = gsap.context(() => {
  //     if (!cardsRef.current) return;
  //     gsap.from(cardsRef.current.children, {
  //       y: 24,
  //       opacity: 0,
  //       duration: 0.6,
  //       ease: "power3.out",
  //       stagger: 0.08,
  //       scrollTrigger: {
  //         trigger: cardsRef.current,
  //         start: "top 80%",
  //       },
  //     });
  //   }, cardsRef);
  //   return () => ctx.revert();
  // }, []);

  return (
    <section
      id="key-strengths"
      className="bg-gradient-to-br from-[#f9fbff] via-white to-[#fff7fb] py-24 dark:from-[#0b1020] dark:via-[#0c1424] dark:to-[#0c1018]"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Capability Grid
          </h2>
          <p className="text-lg text-slate-700 dark:text-gray-200">
            인터랙티브 제품을 만들 때 집중하는 역량을 정리했습니다.
          </p>
        </div>
        <div ref={cardsRef} className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-2 hover:border-rose-400/70 hover:bg-slate-900 hover:shadow-2xl hover:shadow-rose-100/50 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:border-rose-400/60"
            >
              <div className="text-xl font-semibold text-slate-900 transition group-hover:text-white dark:text-white">
                {item.title}
              </div>
              <p className="mt-3 text-slate-600 transition group-hover:text-gray-200 dark:text-gray-300">
                {item.detail}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition group-hover:-translate-y-0.5 group-hover:border-white group-hover:bg-white/10 group-hover:text-white dark:border-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedProjects = ({ projects }: { projects: Project[] }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !scrollerRef.current) return;
      const getWidth = () =>
        scrollerRef.current?.scrollWidth ?? window.innerWidth;
      const update = () => {
        if (!sectionRef.current || !scrollerRef.current) return;
        const totalScroll = getWidth() - window.innerWidth + 120;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalScroll + 400}`,
            scrub: true,
            pin: true,
          },
        });
        tl.to(scrollerRef.current, {
          x: () => -(getWidth() - window.innerWidth + 64),
          ease: "none",
        });
        return tl;
      };
      const anim = update();
      const resize = () => {
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", resize);
      return () => {
        anim?.kill?.();
        window.removeEventListener("resize", resize);
      };
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative overflow-hidden bg-gradient-to-br from-[#f7fffc] via-white to-[#f8f5ff] py-24 dark:from-[#0b1616] dark:via-[#0b1020] dark:to-[#0f1226]"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Featured Projects
          </h2>
          <p className="text-lg text-slate-700 dark:text-gray-200">
            주요 프로젝트를 케이스 스터디 형태로 정리했습니다. 가로 스크롤로
            살펴보세요.
          </p>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          ref={scrollerRef}
          className="flex items-stretch gap-6 px-4 pb-6 sm:px-6 lg:px-8"
        >
          {projects.map((project) => (
            <div
              key={project.name}
              className="snap-center shrink-0 basis-[80vw] rounded-3xl border border-gray-200/80 bg-white/80 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur transition hover:shadow-2xl hover:shadow-rose-100/60 dark:border-gray-800 dark:bg-gray-900/70"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {project.name}
                </h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                  Case Study
                </span>
              </div>
              <p className="mt-3 text-slate-700 dark:text-gray-200 leading-relaxed">
                {project.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-gray-300">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-white hover:text-slate-900 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-transparent dark:hover:text-white">
                View case study
                <span aria-hidden>↗</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InteractiveLab = ({ lab }: { lab: LabItem[] }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const ctx = gsap.context(() => {
  //     if (!gridRef.current) return;
  //     gsap.from(gridRef.current.children, {
  //       scale: 0.95,
  //       opacity: 0,
  //       duration: 0.6,
  //       ease: "power3.out",
  //       stagger: 0.08,
  //       scrollTrigger: {
  //         trigger: gridRef.current,
  //         start: "top 80%",
  //       },
  //     });
  //   }, gridRef);
  //   return () => ctx.revert();
  // }, []);

  return (
    <section
      id="lab"
      className="bg-gradient-to-br from-[#f7f8ff] via-white to-[#f9fefb] py-24 dark:from-[#0a0f1d] dark:via-[#0c111f] dark:to-[#0a1516]"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Interactive Lab
          </h2>
          <p className="text-lg text-slate-700 dark:text-gray-200">
            게임/실험 프로젝트를 모은 공간입니다.
          </p>
        </div>
        <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lab.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-2 hover:rotate-[-1deg] hover:border-emerald-400/70 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/70"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                {item.label}
              </div>
              <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {item.title}
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                {item.description}
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-gray-200">
                {item.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-28 rounded-xl bg-gradient-to-br from-emerald-200/50 via-white to-sky-200/50 dark:from-emerald-500/10 dark:via-gray-800 dark:to-sky-500/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DevLogs = ({ posts }: { posts: PostMeta[] }) => {
  const hasPosts = posts && posts.length > 0;
  const latest = hasPosts ? posts[0] : null;
  const rest = hasPosts ? posts.slice(1) : [];
  return (
    <section
      id="posts"
      className="bg-gradient-to-br from-[#fff9f3] via-white to-[#f3fbff] py-24 dark:from-[#0e0f16] dark:via-[#0c111f] dark:to-[#0b1320]"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Dev Logs
          </h2>
          <p className="text-lg text-slate-700 dark:text-gray-200">
            최근 작성한 기술 포스트를 간략히 모았습니다.
          </p>
        </div>
        {hasPosts ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Link
                href={`/posts/${latest?.slug ?? ""}`}
                className="group block h-full rounded-3xl border border-gray-200/70 bg-white/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-2 hover:border-rose-400/70 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900/70"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                  Latest
                </div>
                <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  {latest?.title}
                </div>
                <div className="mt-2 text-sm text-gray-500">{latest?.date}</div>
                <p className="mt-3 text-slate-700 dark:text-gray-200">
                  {latest?.description ?? "포스트 요약이 준비 중입니다."}
                </p>
              </Link>
            </div>
            <div className="space-y-4 lg:col-span-6">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-rose-400/70 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/70"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-white group-hover:underline">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500">{post.date}</div>
                    </div>
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-100">
                      Post
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-gray-300 line-clamp-2">
                    {post.description ?? "소개 문구가 준비 중입니다."}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200/70 bg-white/70 p-6 text-sm text-slate-600 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
            아직 포스트가 없습니다. 마크다운을 추가하면 자동으로 표시됩니다.
          </div>
        )}
      </div>
    </section>
  );
};

const AboutContact = () => {
  return (
    <section id="about" className="bg-gradient-to-br  py-24 text-black">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
              About
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              데이터 흐름과 인터랙션을 함께 설계하는 <br />
              프론트엔드 개발자입니다.
            </h2>
            <p className="text-lg text-gray-200 max-w-[65%]">
              SVG·Canvas·Three.js 기반 에디터, 학습 서비스, 보드게임 WebApp 등
              다양한 도메인에서 제품형 프론트엔드를 설계하고 구현해왔습니다.
              요구사항 정의 → 플로우 설계 → 프로토타입 → 전달까지 엔드투엔드로
              책임지는 방식에 강점이 있습니다.
            </p>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <div className="text-sm font-semibold text-gray-200">Contact</div>
              <div className="mt-3 space-y-2 text-gray-300">
                <div className="flex items-center justify-between gap-3">
                  <span>seonghoho0919@gmail.com</span>
                  <button className="rounded-lg bg-black/10 px-3 py-1 text-xs font-semibold text-black transition hover:translate-y-0.5 hover:shadow-[inset_0_-2px_0_rgba(255,255,255,0.2)]">
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>GitHub / LinkedIn</span>
                  <button className="rounded-lg bg-black/10 px-3 py-1 text-xs font-semibold text-black transition hover:translate-y-0.5 hover:shadow-[inset_0_-2px_0_rgba(255,255,255,0.2)]">
                    Open
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <div className="text-sm font-semibold text-gray-200">
                현재 관심 있는 포지션/프로젝트
              </div>
              <ul className="mt-3 space-y-2 text-gray-300">
                <li>· 인터랙티브 에디터/시뮬레이터</li>
                <li>· 학습 서비스/대시보드</li>
                <li>· 제품형 프론트엔드 리드</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Navigation = ({
  compact,
  anchors,
}: {
  compact: boolean;
  anchors: { about: string; projects: string; lab: string; posts: string };
}) => {
  return (
    <header
      className={`sticky top-[65px] z-30 transition duration-300 ${
        compact
          ? "backdrop-blur-xl bg-white/60 shadow-md"
          : "backdrop-blur-lg bg-white/40"
      } dark:bg-gray-900/60`}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          Interactive Frontend
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-gray-200">
          <Link href={`#${anchors.about}`} className="hover:text-rose-500">
            About
          </Link>
          <Link href={`#${anchors.projects}`} className="hover:text-rose-500">
            Projects
          </Link>
          <Link href={`#${anchors.lab}`} className="hover:text-rose-500">
            Lab
          </Link>
          <Link href={`#${anchors.posts}`} className="hover:text-rose-500">
            Posts
          </Link>
        </nav>
      </div>
    </header>
  );
};

const LandingPage = ({ posts }: { posts: PostMeta[] }) => {
  const [navCompact, setNavCompact] = useState(false);
  const mockProjects: Project[] = [
    {
      name: "MathCanvas",
      description:
        "SVG·Three.js 기반 수학교구 에디터. 40종 이상의 교구를 조작·배치·편집할 수 있는 제품형 인터랙티브 화면.",
      bullets: [
        "드래그·스냅·복수선택·복제 등 에디터급 조작 시스템",
        "Three.js 3D 교구와 상태 관리 구조 분리",
        "대규모 편집 환경을 위한 성능 최적화",
      ],
      stack: ["Next.js", "Three.js", "Zustand", "TypeScript"],
    },
    {
      name: "Vocab360",
      description:
        "4주 MVP 리드—학습→채점→리포트 흐름을 설계하고 도메인 데이터 모델 및 API 계약을 정의한 영어 학습 플랫폼.",
      bullets: [
        "콘텐츠 JSON 스키마 설계 및 파서/렌더러 구현",
        "리포트/스탯 UI 모델링 및 상태 전략 정리",
        "외주 일정/QA 기준 설정 및 커뮤니케이션 리드",
      ],
      stack: ["Next.js", "TypeScript", "API Design", "Product Lead"],
    },
    {
      name: "TripMarble",
      description:
        "Next.js + FSD 기반 여행 보드게임 WebApp. 턴/보드/카드/이벤트를 상태 머신 기반으로 구조화한 인터랙티브 게임.",
      bullets: [
        "FSD 기반 features/entities/shared 구조 설계",
        "턴·이벤트·보드 상태 머신 모델링",
        "디자인 토큰 기반 스타일 시스템 구축",
      ],
      stack: ["Next.js", "FSD", "State orchestration", "SCSS Modules"],
    },
    {
      name: "NowDoBoss",
      description:
        "상권 분석 서비스 프로토타입—핵심 경험 정의, 사용자 플로우 모델링, 초기 브랜딩 및 UX 구조 제작.",
      bullets: [
        "페르소나·핵심 경험 기반 UX 설계",
        "화면 플로우 및 데이터 구조 정의",
        "프로토타입 제작 및 브랜드 톤 적용",
      ],
      stack: ["Service design", "UI/UX", "Prototype"],
    },
  ];

  const mockLab: LabItem[] = [
    {
      label: "Pixi.js · TypeScript",
      title: "Pixel Runner",
      description:
        "Pixi.js 기반 러너 게임 — 충돌 감지, 물리 감쇠, 패럴랙스 스크롤 등 인터랙션 실험용 프로젝트.",
      bullets: ["충돌/감쇠 물리 실험", "패럴랙스 스크롤 레이어링"],
    },
    {
      label: "Three.js · Interaction",
      title: "Orbit Sandbox",
      description:
        "Three.js 기반 오브젝트 배치·회전·궤도 시뮬레이션 실험. 카메라 전환과 인터랙션 흐름 테스트.",
      bullets: ["오브젝트 회전/배치", "궤도 모션 및 카메라 전환"],
    },
    {
      label: "Canvas · UI",
      title: "Graph Playground",
      description:
        "Canvas 기반 노드·엣지 에디터 — 스냅, 그리드 보조선, 드래그/커넥션 조작 테스트.",
      bullets: ["노드/엣지 생성 및 커넥션", "스냅/격자 보조선 구현"],
    },
  ];

  const anchors = {
    about: "about",
    projects: "projects",
    lab: "lab",
    posts: "posts",
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-gray-950 dark:text-white">
      <Navigation compact={navCompact} anchors={anchors} />
      <Hero onNavCompactChange={setNavCompact} anchorIds={anchors} />
      <ScrollStory />
      <KeyStrengths />
      <FeaturedProjects projects={mockProjects} />
      <InteractiveLab lab={mockLab} />
      <DevLogs posts={posts} />
      <AboutContact />
    </div>
  );
};

export default LandingPage;
