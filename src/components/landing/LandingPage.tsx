import Link from "next/link";
import {
  aboutProfile,
  aboutProjects,
  experienceTimeline,
  strengthHighlights,
} from "@/lib/aboutData";
import { formatDate } from "@/lib/formatDate";
import { PostMeta } from "@/types/post";
import ProjectVisual from "@/components/about/ProjectVisual";

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
const secondaryProjects = aboutProjects.slice(1, 4);
const homeSectionLinks = [
  { id: "featured-proof", label: "대표 프로젝트" },
  { id: "hire-signal", label: "강점" },
  { id: "selected-work", label: "다른 프로젝트" },
  { id: "writing", label: "글" },
  { id: "contact", label: "연락" },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="eyebrow-label">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl body-copy">{description}</p>
    </div>
  );
}

export default function LandingPage({
  recentPosts,
  featuredPosts,
  categories,
  tags,
}: Props) {
  const highlightedPosts =
    (featuredPosts.length ? featuredPosts : recentPosts).slice(0, 2);
  const currentExperience = experienceTimeline[0];
  const previousExperience = experienceTimeline[1];

  return (
    <div className="page-shell">
      <div className="space-y-16 sm:space-y-20">
        <section className="relative overflow-hidden rounded-[44px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.14),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(88,201,185,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.10),transparent_42%)]" />

          <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:items-start">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="eyebrow-label">Choi Seongho · Frontend Engineer</p>
                  <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">
                    코드넛 · 2024.08 - 현재
                  </p>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.07em] text-[color:var(--color-text-primary)] sm:text-6xl lg:text-[4.8rem]">
                    SVG 에디터와
                    <span className="block text-[color:var(--color-accent)]">
                      Three.js 시각 도구를 실무에 올리는 프론트엔드 엔지니어
                    </span>
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-[color:var(--color-text-secondary)] sm:text-lg">
                    코드넛에서 MathCanvas를 개발하며 46종 중 20종의 디지털
                    교구를 직접 설계·구현했습니다. 복잡한 사용자 상호작용을
                    구조화하고, 서비스 UI와 연결하며, 유지보수 가능한
                    프론트엔드 아키텍처로 정리하는 역할에 강점이 있습니다.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {aboutProfile.metrics.slice(0, 3).map((metric) => (
                  <article
                    key={metric.label}
                    className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 px-4 py-4"
                  >
                    <div className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                      {metric.value}
                    </div>
                    <div className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                      {metric.label}
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/about/projects/${featuredProject.slug}`}
                  className="button-primary"
                >
                  대표 프로젝트 보기
                </Link>
                <Link href="/about" className="button-secondary">
                  About 보기
                </Link>
                <a href="mailto:chltjdgh3@naver.com" className="button-secondary">
                  이메일 보내기
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {homeSectionLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="inline-flex items-center rounded-full border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-text-primary)]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <article className="rounded-[34px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow-label">Current Focus</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {featuredProject.tagline}
                    </p>
                  </div>
                  <span className="tag-chip whitespace-nowrap">
                    {featuredProject.period}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Role
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.role}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Team
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.team}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Domain
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      에듀테크 · 인터랙션 캔버스
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                  {featuredProject.cardPoints.slice(0, 3).map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="featured-proof" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Featured Proof"
            title="MathCanvas는 지금 가장 강하게 보여줄 수 있는 실무 프로젝트입니다"
            description="복합 인터랙션, 클래스 기반 설계, SVG와 Three.js를 함께 다룬 실무 경험이 가장 압축적으로 드러나는 프로젝트라 홈에서도 가장 먼저 보여줍니다."
          />

          <article className="rounded-[36px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.95fr)] xl:items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="eyebrow-label">{featuredProject.eyebrow}</p>
                    {featuredProject.achievement ? (
                      <span className="tag-chip">{featuredProject.achievement}</span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                      {featuredProject.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
                      {featuredProject.tagline}
                    </p>
                  </div>
                  <p className="body-copy">{featuredProject.summary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Period
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.period}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Team
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.team}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Role
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {featuredProject.role}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5">
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      무엇을 만들었는가
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                      {featuredProject.keyContributions.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5">
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      왜 강한 증거인가
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                      {featuredProject.technicalHighlights.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {featuredProject.techStack.slice(0, 7).map((stack) => (
                    <span key={stack} className="tag-chip">
                      {stack}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/about/projects/${featuredProject.slug}`}
                    className="button-primary"
                  >
                    MathCanvas 상세 보기
                  </Link>
                  <Link href="/about" className="button-secondary">
                    전체 About 보기
                  </Link>
                </div>
              </div>

              <ProjectVisual preview={featuredProject.preview} priority />
            </div>
          </article>
        </section>

        <section id="hire-signal" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Why Me"
            title="채용 관점에서 빠르게 확인할 수 있는 강점과 실무 맥락"
            description="도구를 많이 아는지보다, 실제 제품에서 어떤 종류의 문제를 풀어왔는지가 더 중요하다고 봅니다. 그래서 강점과 경험을 함께 보여줍니다."
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="grid gap-4 md:grid-cols-2">
              {strengthHighlights.slice(0, 4).map((item) => (
                <article
                  key={item.title}
                  className="rounded-[30px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-accent)]">
                    {item.title}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {item.description}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-muted)]">
                    {item.bullets.join(" / ")}
                  </p>
                </article>
              ))}
            </div>

            <aside className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 sm:p-6">
              <p className="eyebrow-label">Experience Snapshot</p>
              <div className="mt-5 space-y-5">
                <article className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                        {currentExperience.company}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[color:var(--color-text-secondary)]">
                        {currentExperience.title}
                      </p>
                    </div>
                    <span className="text-sm text-[color:var(--color-text-muted)]">
                      {currentExperience.period}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {currentExperience.summary}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                    {currentExperience.highlights.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-[24px] border border-[color:var(--color-border)] px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                        {previousExperience.company}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                        {previousExperience.title}
                      </p>
                    </div>
                    <span className="text-sm text-[color:var(--color-text-muted)]">
                      {previousExperience.period}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {previousExperience.highlights.slice(0, 2).join(" / ")}
                  </p>
                </article>
              </div>
            </aside>
          </div>
        </section>

        <section id="selected-work" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Other Projects"
            title="도메인이 달라도, 프론트엔드 접근 방식은 일관됩니다"
            description="지도 기반 상호작용, 실시간 커뮤니케이션, 커뮤니티 기능처럼 서로 다른 프로젝트에서도 구조화, 재사용성, 사용자 흐름 설계를 중심으로 작업했습니다."
          />

          <div className="divide-y divide-[color:var(--color-border)] rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            {secondaryProjects.map((project) => (
              <article
                key={project.slug}
                className="group px-5 py-5 transition duration-300 first:rounded-t-[32px] last:rounded-b-[32px] hover:bg-[color:var(--color-surface-elevated)] sm:px-6"
              >
                <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
                  <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                    <div>{project.period}</div>
                    <div>{project.role}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
                        {project.title}
                      </h3>
                      {project.achievement ? (
                        <span className="tag-chip">{project.achievement}</span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {project.summary}
                    </p>
                    <p className="text-sm leading-7 text-[color:var(--color-text-muted)]">
                      {project.cardPoints.slice(0, 2).join(" / ")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 5).map((stack) => (
                        <span key={stack} className="tag-chip">
                          {stack}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/about/projects/${project.slug}`}
                      className="accent-link inline-flex text-sm font-semibold"
                    >
                      프로젝트 상세 보기
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="writing" className="scroll-mt-28 space-y-8">
          <SectionHeader
            eyebrow="Writing"
            title="기술 글은 보조 증거로 두고, 읽기 쉬운 형태로 압축했습니다"
            description="실무 문제 해결 과정을 정리한 글이 몇 편 있습니다. 홈에서는 깊이보다 방향만 보여주고, 자세한 탐색은 아카이브로 넘기는 편이 더 적절합니다."
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="divide-y divide-[color:var(--color-border)] rounded-[30px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              {highlightedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group px-5 py-5 transition duration-300 first:rounded-t-[30px] last:rounded-b-[30px] hover:bg-[color:var(--color-surface-elevated)] sm:px-6"
                >
                  <div className="grid gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                      <div>{formatDate(post.date)}</div>
                      {post.readingTime ? <div>{post.readingTime}분 읽기</div> : null}
                    </div>
                    <div className="space-y-3">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-block text-lg font-semibold text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]"
                      >
                        {post.title}
                      </Link>
                      {post.description ? (
                        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                          {post.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-[30px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-5 py-5">
              <p className="eyebrow-label">Topics</p>
              <div className="mt-4 flex flex-wrap gap-2">
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
              <div className="mt-5">
                <Link href="/posts" className="accent-link text-sm font-semibold">
                  전체 글 아카이브 보기
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section id="contact" className="scroll-mt-28">
          <article className="relative overflow-hidden rounded-[40px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-8 shadow-[var(--shadow-soft)] sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,118,110,0.10),transparent_48%,rgba(15,23,42,0.06))] dark:bg-[linear-gradient(135deg,rgba(88,201,185,0.12),transparent_48%,rgba(148,163,184,0.08))]" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <p className="eyebrow-label">Contact</p>
                <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-4xl">
                  인터랙션 설계와 제품 구현을 함께 볼 수 있는 프론트엔드 역할을 찾고 있습니다.
                </h2>
                <p className="max-w-2xl body-copy">
                  SVG 기반 편집기, Three.js 시각화, 서비스 UI 통합, 구조적인
                  상태 설계가 필요한 팀이라면 더 잘 맞을 가능성이 높습니다.
                  이력과 상세 프로젝트는 About에서 이어서 확인할 수 있습니다.
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
        </section>
      </div>
    </div>
  );
}
