"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutProfile, aboutProjects, strengthHighlights } from "@/lib/aboutData";
import type { AboutProject, StrengthItem } from "@/lib/aboutData";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";
import ProjectVisual from "@/components/about/ProjectVisual";

gsap.registerPlugin(ScrollTrigger);

type CategorySummary = {
  slug: string;
  label: string;
  count: number;
};

type TagSummary = {
  name: string;
  count: number;
};

type Props = {
  recentPosts: PostMeta[];
  featuredPosts: PostMeta[];
  categories: CategorySummary[];
  tags: TagSummary[];
};

const featuredProject = aboutProjects[0];
const projectDeck = aboutProjects.slice(0, 4);
const strengthDeck = strengthHighlights.slice(0, 3);
const heroFocusBadges = [
  { label: "SVG Editor", description: "복합 인터랙션 구조화" },
  { label: "Three.js View", description: "조작감과 가독성 설계" },
  { label: "Product UI", description: "서비스 흐름과 상태 연결" },
];
const landingFrameClass = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8";
const HEADER_HEIGHT = 64;
const SECTION_OFFSET = 88;

function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <p className="eyebrow-label">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-4xl">
        {title}
      </h2>
      <p className="body-copy max-w-2xl">{description}</p>
    </div>
  );
}

function ProofList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectShowcaseCard({
  project,
  index,
  mode,
}: {
  project: AboutProject;
  index: number;
  mode: "rail" | "grid";
}) {
  const wrapperClass =
    mode === "rail"
      ? "flex min-h-[68vh] min-w-[86vw] flex-col rounded-[36px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-soft)] sm:min-w-[78vw] sm:p-5 lg:min-w-[46vw]"
      : "surface-panel flex h-full flex-col overflow-hidden p-4";

  return (
    <article className={wrapperClass}>
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow-label">{String(index + 1).padStart(2, "0")}</span>
        <span className="tag-chip whitespace-nowrap">{project.period}</span>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
          {project.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
          {project.tagline}
        </p>
      </div>

      <ProjectVisual preview={project.preview} variant="gallery" className="mt-5 min-h-[280px]" />

      <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-4">
          <ProofList items={project.cardPoints.slice(0, 2)} />
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((stack) => (
              <span key={stack} className="tag-chip">
                {stack}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/about/projects/${project.slug}`}
          className="accent-link inline-flex text-sm font-semibold"
        >
          About에서 자세히 보기
        </Link>
      </div>
    </article>
  );
}

function StrengthCard({ item, index }: { item: StrengthItem; index: number }) {
  return (
    <div className="surface-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow-label">{String(index + 1).padStart(2, "0")}</span>
        <span className="tag-chip">{item.title}</span>
      </div>
      <p className="mt-5 text-xl font-semibold text-[color:var(--color-text-primary)]">
        {item.title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
        {item.description}
      </p>
      <div className="mt-5 grid gap-3">
        {item.bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-sm leading-6 text-[color:var(--color-text-secondary)]"
          >
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ recentPosts, featuredPosts, categories, tags }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLElement>(null);
  const projectsTrackRef = useRef<HTMLDivElement>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);

  const highlightedPosts = (featuredPosts.length ? featuredPosts : recentPosts).slice(0, 2);
  const heroViewportHeight = `calc(100vh - ${HEADER_HEIGHT}px)`;
  const pinnedViewportHeight = `calc(100vh - ${SECTION_OFFSET}px)`;

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setIsEnhanced(desktopQuery.matches && !reduceMotionQuery.matches);
    };

    updateMode();
    desktopQuery.addEventListener("change", updateMode);
    reduceMotionQuery.addEventListener("change", updateMode);

    return () => {
      desktopQuery.removeEventListener("change", updateMode);
      reduceMotionQuery.removeEventListener("change", updateMode);
    };
  }, []);

  useEffect(() => {
    if (!isEnhanced || !rootRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>("[data-landing-hero]");
      const heroBoard = gsap.utils.toArray<HTMLElement>("[data-hero-board]");

      gsap.fromTo(
        heroItems,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
        },
      );

      if (heroBoard[0]) {
        gsap.to(heroBoard[0], {
          y: -10,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      const projectsSection = projectsSectionRef.current;
      const projectsTrack = projectsTrackRef.current;

      if (projectsSection && projectsTrack) {
        const getDistance = () => {
          const trackViewportWidth =
            projectsTrack.parentElement?.clientWidth ?? projectsSection.clientWidth;

          return Math.max(0, projectsTrack.scrollWidth - trackViewportWidth);
        };

        if (getDistance() > 0) {
          gsap.to(projectsTrack, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: projectsSection,
              start: () => `top top+=${SECTION_OFFSET}`,
              end: () => `+=${getDistance() + window.innerHeight * 0.75}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      context.revert();
    };
  }, [isEnhanced]);

  return (
    <div
      ref={rootRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-x-clip bg-[color:var(--color-bg)]"
    >
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(88,201,185,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.10),transparent_42%)]" />

        <div
          className={`${landingFrameClass} relative grid gap-8 pb-10 pt-12 sm:pb-12 sm:pt-16 lg:min-h-[calc(100vh-64px)] lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-center lg:gap-14 lg:pb-14 lg:pt-20`}
          style={{ minHeight: heroViewportHeight }}
        >
          <div data-landing-hero className="max-w-2xl">
            <div className="bg-[color:var(--color-surface)]/70 inline-flex items-center gap-3 rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[color:var(--color-accent)]" />
              <span>2026년 3월부터 플랜티엠에서 프론트엔드 엔지니어로 근무 중</span>
            </div>

            <div className="mt-8 space-y-5">
              <p className="text-[color:var(--color-accent)]/90 text-xs font-semibold uppercase tracking-[0.28em]">
                Frontend Engineer · Interaction Systems
              </p>

              <h1 className="max-w-4xl text-[clamp(2.2rem,4.6vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.08em] text-[color:var(--color-text-primary)]">
                복잡한 인터랙션을
                <span className="mt-2 block text-[color:var(--color-accent)]">
                  명확한 제품 흐름으로 정리합니다
                </span>
              </h1>

              <p className="max-w-xl text-[15px] leading-7 text-[color:var(--color-text-secondary)] sm:text-base sm:leading-8">
                SVG 기반 편집기, Three.js 시각화, 서비스 UI를 하나의 제품 경험으로 연결해 왔습니다.
                인터랙션이 많은 화면도 사용자는 자연스럽게, 팀은 관리하기 쉽게 만드는 데 집중합니다.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/about/projects/${featuredProject.slug}`} className="button-primary">
                대표 프로젝트 보기
              </Link>
              <Link href="/about" className="button-secondary">
                About 보기
              </Link>
              <a href="mailto:chltjdgh3@naver.com" className="button-secondary">
                이메일 보내기
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {heroFocusBadges.map((item) => (
                <span
                  key={item.label}
                  className="bg-[color:var(--color-surface)]/72 inline-flex items-center rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] backdrop-blur-sm"
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="mt-4 text-sm leading-7 text-[color:var(--color-text-muted)]">
              복합 인터랙션 구조화, 3D 조작 경험, 서비스 UI 설계를 한 흐름으로 다룹니다.
            </div>
          </div>

          <div data-landing-hero>
            <div
              data-hero-board
              className="surface-panel-strong relative overflow-hidden rounded-[36px] p-5 sm:p-6 lg:p-7"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(88,201,185,0.16),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0))]" />

              <div className="relative space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="eyebrow-label">Selected Snapshot</p>
                    <p className="max-w-sm text-sm leading-6 text-[color:var(--color-text-secondary)]">
                      대표 프로젝트 하나로 어떤 문제를 풀어왔는지 간단히 보여줍니다.
                    </p>
                  </div>
                  <span className="tag-chip whitespace-nowrap">{featuredProject.period}</span>
                </div>

                <div className="bg-[color:var(--color-surface)]/78 rounded-[30px] border border-[color:var(--color-border)] p-5 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                      {featuredProject.title}
                    </h2>
                    <span className="bg-[color:var(--color-accent)]/10 rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--color-accent)]">
                      {aboutProfile.metrics[0]?.value}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {featuredProject.tagline}
                  </p>

                  <div className="mt-5 space-y-3">
                    {featuredProject.cardPoints.slice(0, 3).map((item, index) => (
                      <div
                        key={item}
                        className="bg-[color:var(--color-surface-elevated)]/82 flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] px-4 py-3"
                      >
                        <span className="bg-[color:var(--color-accent)]/12 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-[color:var(--color-accent)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {aboutProfile.metrics.slice(1, 3).map((metric) => (
                    <div
                      key={metric.label}
                      className="bg-[color:var(--color-surface)]/72 min-w-[11rem] rounded-full border border-[color:var(--color-border)] px-4 py-3 backdrop-blur-sm"
                    >
                      <div className="text-base font-semibold text-[color:var(--color-text-primary)]">
                        {metric.value}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isEnhanced ? (
        <section
          id="projects"
          ref={projectsSectionRef}
          className="relative overflow-hidden border-y border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]"
          style={{
            height: pinnedViewportHeight,
            scrollMarginTop: `${SECTION_OFFSET}px`,
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,118,110,0.06),transparent_24%,transparent_76%,rgba(15,23,42,0.05))] dark:bg-[linear-gradient(180deg,rgba(88,201,185,0.08),transparent_26%,transparent_74%,rgba(148,163,184,0.08))]" />
          <div
            className={`${landingFrameClass} relative flex h-full flex-col py-6 sm:py-8 lg:py-10`}
          >
            <SectionHeader
              eyebrow="Selected Work"
              title="스크롤을 내리면 프로젝트가 가로로 이어집니다"
              description="상세 설명은 About에 두고, 랜딩에서는 도메인과 문제 해결 방식이 한 눈에 들어오도록 압축했습니다."
            />

            <div className="mt-8 overflow-hidden">
              <div ref={projectsTrackRef} className="flex gap-5 will-change-transform">
                {projectDeck.map((project, index) => (
                  <ProjectShowcaseCard
                    key={project.slug}
                    project={project}
                    index={index}
                    mode="rail"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section
          id="projects"
          className="py-14 sm:py-16 lg:py-20"
          style={{ scrollMarginTop: `${SECTION_OFFSET}px` }}
        >
          <div className={landingFrameClass}>
            <SectionHeader
              eyebrow="Selected Work"
              title="대표 프로젝트는 간단하게 훑고, 자세한 내용은 About에서 확인합니다"
              description="모바일과 reduced motion 환경에서는 가로 스크롤 대신 바로 비교할 수 있는 카드 레이아웃으로 보여줍니다."
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {projectDeck.map((project, index) => (
                <ProjectShowcaseCard
                  key={project.slug}
                  project={project}
                  index={index}
                  mode="grid"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="strengths"
        className="py-14 sm:py-16 lg:py-20"
        style={{ scrollMarginTop: `${SECTION_OFFSET}px` }}
      >
        <div className={landingFrameClass}>
          <SectionHeader
            eyebrow="Core Strengths"
            title="핵심 역량은 세 가지 축으로 정리했습니다"
            description="복잡한 화면을 설계하고, 서비스 흐름과 연결하고, 유지보수 가능한 구조로 남기는 것. 이 세 축이 제가 일하는 방식의 중심입니다."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {strengthDeck.map((item, index) => (
              <StrengthCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="writing"
        className="py-14 sm:py-16 lg:py-20"
        style={{ scrollMarginTop: `${SECTION_OFFSET}px` }}
      >
        <div
          className={`${landingFrameClass} grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start`}
        >
          <SectionHeader
            eyebrow="Writing"
            title="문제를 해결하며 배운 것들을 기록합니다"
            description="기술 선택의 이유, 구현 과정에서의 시행착오, 그리고 작업 방식에 대한 생각을 정리합니다."
            className="lg:col-span-2"
          />

          <div className="grid gap-4">
            {highlightedPosts.map((post) => (
              <article key={post.slug} className="surface-panel p-5 sm:p-6">
                <div className="text-sm text-[color:var(--color-text-muted)]">
                  {formatDate(post.date)}
                  {post.readingTime ? ` · ${post.readingTime}분 읽기` : ""}
                </div>
                <Link
                  href={`/posts/${post.slug}`}
                  className="mt-3 inline-block text-xl font-semibold text-[color:var(--color-text-primary)] transition hover:text-[color:var(--color-accent)]"
                >
                  {post.title}
                </Link>
                {post.description ? (
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {post.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <aside className="surface-panel-strong p-5 sm:p-6">
            <p className="eyebrow-label">Topics</p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Categories
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="tag-chip"
                    >
                      {category.label}
                      <span className="ml-2 text-[color:var(--color-text-muted)]">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Keywords
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.slice(0, 4).map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/tags/${encodeURIComponent(tag.name)}`}
                      className="tag-chip"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/posts" className="accent-link text-sm font-semibold">
                전체 글 아카이브 보기
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section
        id="contact"
        className="pb-6 pt-4 sm:pb-8 lg:pb-10"
        style={{ scrollMarginTop: `${SECTION_OFFSET}px` }}
      >
        <div className={landingFrameClass}>
          <article className="relative overflow-hidden rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)] sm:px-6 sm:py-7">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),transparent_48%,rgba(15,23,42,0.06))] dark:bg-[linear-gradient(135deg,rgba(88,201,185,0.12),transparent_48%,rgba(148,163,184,0.08))]" />
            <div className="relative grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-3">
                <p className="eyebrow-label">Contact</p>
                <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-3xl">
                  함께 이야기 나눌 수 있습니다
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  SVG 기반 편집기, Three.js 시각화, 서비스 UI 설계 경험이 필요한 팀이라면 더 잘 맞을
                  가능성이 높습니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="mailto:chltjdgh3@naver.com" className="button-primary">
                  이메일 보내기
                </a>
                <Link href="/about" className="button-secondary">
                  About 보기
                </Link>
                <a
                  href="https://github.com/seonghoho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-secondary"
                >
                  GitHub
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
