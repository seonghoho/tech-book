import Image from "next/image";
import Link from "next/link";
import {
  aboutProfile,
  aboutProjects,
  aboutSectionLinks,
  experienceTimeline,
  growthNotes,
  skillGroups,
  strengthHighlights,
} from "@/lib/aboutData";
import PortfolioRail from "@/components/portfolio/PortfolioRail";
import SectionScrollNav from "@/components/portfolio/SectionScrollNav";
import { formatPeriod } from "@/lib/formatPeriod";

// const featuredProject = aboutProjects.find((project) => project.featured) ?? aboutProjects[0];
const projectArchivePreview = aboutProjects.slice(0, 4);
const overviewFacts = [
  { label: "현재", value: aboutProfile.companyLabel },
  { label: "스택", value: aboutProfile.stackLabel },
  { label: "주력", value: "인터랙션 · 시각화 · 서비스 UI" },
];

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
        {title}
      </h2>
      <p className="body-copy max-w-2xl">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] xl:gap-20">
        <PortfolioRail
          name={aboutProfile.name}
          title={aboutProfile.tagline}
          sections={[...aboutSectionLinks]}
          links={aboutProfile.contacts}
        />

        <div className="min-w-0">
          {/* 좁은 화면에서는 레일이 맨 위에서 끝나 버려, 섹션 탭을 본문 열에 두고 본문이 끝날 때까지 헤더 아래 고정한다. */}
          <SectionScrollNav
            items={[...aboutSectionLinks]}
            ariaLabel="페이지 섹션 이동"
            variant="bar"
          />
          <div className="mt-8 space-y-20 sm:space-y-24 lg:mt-0">
            {/* 개요: 섹션 제목 → 소개와 사실 정보(사진 옆) → 숫자로 보는 성과. 이름·한 줄 소개는 레일(h1)에,
                하는 일은 아래 "강점" 섹션에 있어 여기서는 반복하지 않는다. */}
            <section id="overview" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader
                title={aboutProfile.overviewTitle}
                description={aboutProfile.overviewDescription}
              />

              <article className="about-card p-5 sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                  <div className="relative mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-[20px] border border-[color:var(--color-border)] sm:mx-0">
                    <Image
                      src="/images/Profile.JPG"
                      alt={`${aboutProfile.name} 프로필 사진`}
                      fill
                      className="object-cover object-[center_24%]"
                      sizes="160px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-8 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
                      {aboutProfile.summary}
                    </p>
                    <dl className="mt-5 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
                      {overviewFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-baseline justify-between gap-4 py-2.5"
                        >
                          <dt className="shrink-0 text-[13px] text-[color:var(--color-text-muted)]">
                            {fact.label}
                          </dt>
                          <dd className="text-right text-sm font-medium leading-6 text-[color:var(--color-text-primary)] [word-break:keep-all]">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </article>

              <div className="grid gap-3 sm:grid-cols-2">
                {aboutProfile.metrics.map((metric) => (
                  <article key={metric.label} className="about-card-interactive px-5 py-4">
                    <div className="text-xl font-semibold tabular-nums text-[color:var(--color-text-primary)]">
                      {metric.value}
                    </div>
                    <div className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                      {metric.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                      {metric.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section id="experience" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader title="경력" description="회사와 교육 과정에서 맡은 일입니다." />

              <div className="about-card divide-y divide-[color:var(--color-border)] overflow-hidden">
                {experienceTimeline.map((item) => (
                  <article
                    key={item.company}
                    className="px-5 py-5 transition duration-300 hover:bg-[color:var(--color-surface-tint)] sm:px-6"
                  >
                    <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                        <p className="text-xs tabular-nums text-[color:var(--color-text-muted)]">
                          {formatPeriod(item.period)}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                            {item.company}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-[color:var(--color-text-secondary)]">
                            {item.title}
                          </p>
                        </div>
                        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                          {item.summary}
                        </p>
                        {item.highlights.length ? (
                          <ul className="grid gap-2 xl:grid-cols-2">
                            {item.highlights.map((highlight) => (
                              <li
                                key={highlight}
                                className="flex gap-2 text-sm leading-6 text-[color:var(--color-text-secondary)]"
                              >
                                <span
                                  aria-hidden="true"
                                  className="text-[color:var(--color-text-muted)]"
                                >
                                  —
                                </span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="projects" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader title="프로젝트" description="회사, 팀, 개인 프로젝트입니다." />

              <article className="surface-panel-strong p-5 sm:p-6 lg:p-7">
                <div className="grid gap-6">
                  {/* <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
                      프로젝트 목록과 상세 페이지
                    </h3>
                    <p className="body-copy max-w-2xl">
                      상단 탭의 <span className="font-semibold">Projects</span>
                      에서 전체 프로젝트를 연도 기준 목록형으로 볼 수 있고, 각
                      프로젝트를 누르면 문제 정의, 역할, 구현 포인트, 결과를
                      상세하게 확인할 수 있습니다.
                    </p>
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-3">
                    <div className="surface-subtle px-4 py-4">
                      <dt className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                        프로젝트
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                        {aboutProjects.length}개
                      </dd>
                    </div>
                    <div className="surface-subtle px-4 py-4">
                      <dt className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                        대표
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                        {featuredProject?.title ?? "대표 프로젝트"}
                      </dd>
                    </div>
                    <div className="surface-subtle px-4 py-4">
                      <dt className="text-[11px] font-semibold text-[color:var(--color-text-muted)]">
                        구성
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                        Archive + Detail
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-3">
                    <Link href="/projects" className="button-primary">
                      프로젝트 전체 보기
                    </Link>
                    {featuredProject ? (
                      <Link
                        href={`/projects/${featuredProject.slug}`}
                        className="button-secondary"
                      >
                        대표 프로젝트 바로 보기
                      </Link>
                    ) : null}
                  </div>
                </div> */}

                  <div className="divide-y divide-[color:var(--color-border)]">
                    {projectArchivePreview.map((project) => (
                      <Link
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        className="group block px-1 py-4 transition-colors duration-200 ease-out hover:bg-[color:var(--color-surface-tint)] focus-visible:bg-[color:var(--color-surface-tint)] sm:px-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs tabular-nums text-[color:var(--color-text-muted)]">
                              {formatPeriod(project.period)}
                            </p>
                            <h4 className="mt-2 text-lg font-semibold text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out group-hover:text-[color:var(--color-accent)]">
                              {project.title}
                            </h4>
                            <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                              {project.tagline}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-[color:var(--color-accent)]">
                            View <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            <section id="strengths" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader
                title="강점"
                description="구현이 어려웠던 화면에서 어떻게 처리했는지 적었습니다."
              />

              <div className="about-card divide-y divide-[color:var(--color-border)] overflow-hidden">
                {strengthHighlights.map((item) => (
                  <article
                    key={item.title}
                    className="px-5 py-5 transition duration-300 hover:bg-[color:var(--color-surface-tint)] sm:px-6"
                  >
                    <div className="grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)]">
                      <div className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {item.title}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                          {item.description}
                        </p>
                        <ul className="space-y-1 text-sm leading-7 text-[color:var(--color-text-muted)]">
                          {item.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="stack" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader
                title="기술 스택"
                description="서비스 UI, 그래픽 인터랙션, 상태 구조, 협업 도구로 나눴습니다."
              />

              <div className="about-card divide-y divide-[color:var(--color-border)] overflow-hidden">
                {skillGroups.map((group) => (
                  <article
                    key={group.title}
                    className="px-5 py-5 transition duration-300 hover:bg-[color:var(--color-surface-tint)] sm:px-6"
                  >
                    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                          {group.title}
                        </h3>
                        <p className="text-sm leading-7 text-[color:var(--color-text-muted)]">
                          {group.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span key={item} className="tag-chip">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="collaboration" className="scroll-mt-[136px] space-y-8 lg:scroll-mt-28">
              <SectionHeader
                title="협업"
                description="외주사, 디자이너와 주간 회의로 요구사항과 우선순위를 정리했습니다."
              />

              <div className="grid gap-4 xl:grid-cols-2">
                {growthNotes.map((note) => (
                  <article key={note.title} className="about-card-interactive px-5 py-5">
                    <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                      {note.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {note.description}
                    </p>
                  </article>
                ))}

                {/* <aside className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5 xl:col-span-2">
                <h3 className="mt-3 text-xl font-semibold text-[color:var(--color-text-primary)]">
                  연락처
                </h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  프로젝트별 상세 페이지에서 문제 맥락, 구현 방식, 결과를 더
                  자세히 확인할 수 있습니다. 필요한 경우 GitHub와 이메일로 바로
                  연결할 수 있습니다.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {aboutProfile.contacts.map((contact) => (
                    <a
                      key={contact.label}
                      href={contact.href}
                      target={contact.external ? "_blank" : undefined}
                      rel={contact.external ? "noopener noreferrer" : undefined}
                      className="button-secondary"
                    >
                      {contact.label}
                    </a>
                  ))}
                </div>
              </aside> */}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
