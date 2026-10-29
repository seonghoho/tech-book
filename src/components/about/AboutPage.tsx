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
const overviewStrengths = strengthHighlights.slice(0, 3);

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
            <section id="overview" className="scroll-mt-[136px] space-y-10 lg:scroll-mt-28">
              <article className="surface-panel-strong mx-auto w-full max-w-[1040px] overflow-hidden p-5 sm:p-6 lg:p-7">
                <div className="grid gap-6">
                  {/* <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
                  <Image
                    src="/images/Profile.JPG"
                    alt="최성호 프로필 사진"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1600px) 420px, 100vw"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-[60px] w-[60px] overflow-hidden rounded-[18px] border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                        <Image
                          src="/images/Profile.JPG"
                          alt=""
                          fill
                          className="object-cover object-[center_24%]"
                          sizes="60px"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-white/70">
                          현재
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {aboutProfile.companyLabel}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white">
                          {aboutProfile.stackLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}

                  <div className="flex h-full w-full flex-col justify-between">
                    <div className="space-y-6">
                      {/* 이름과 소개는 왼쪽 레일(h1)에 있어 카드에서는 반복하지 않고, 사진 옆에 사실 정보만 둔다. */}
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                        <div className="relative mx-auto h-[180px] w-[180px] shrink-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.18)] sm:mx-0 sm:h-[200px] sm:w-[200px]">
                          <Image
                            src="/images/Profile.JPG"
                            alt={`${aboutProfile.name} 프로필 사진`}
                            fill
                            className="object-cover object-[center_24%]"
                            sizes="200px"
                          />
                        </div>
                        <dl className="min-w-0 flex-1 divide-y divide-[color:var(--color-border)] border-y border-[color:var(--color-border)]">
                          {overviewFacts.map((fact) => (
                            <div
                              key={fact.label}
                              className="flex items-baseline justify-between gap-4 py-3"
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

                    <div className="mt-6">
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        주로 하는 일
                      </p>
                      <div className="mt-4 grid gap-4">
                        {overviewStrengths.map((item) => (
                          <div key={item.title} className="group flex items-start gap-3">
                            <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-accent)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.35]" />
                            <div>
                              <p className="text-sm font-semibold text-[color:var(--color-text-primary)] transition-colors duration-200 group-hover:text-[color:var(--color-accent)] group-focus-visible:text-[color:var(--color-accent)]">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-muted)]">
                                {item.bullets[0]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="mx-auto grid w-full max-w-[1040px] gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.9fr)]">
                <div className="space-y-5">
                  <SectionHeader
                    title={aboutProfile.overviewTitle}
                    description={aboutProfile.overviewDescription}
                  />
                  <div className="about-card p-5 sm:p-6">
                    <p className="eyebrow-label">소개</p>
                    <p className="mt-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                      {aboutProfile.summary}
                    </p>
                  </div>
                </div>

                <aside className="about-card p-5 sm:p-6">
                  <p className="eyebrow-label">대표 성과</p>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {aboutProfile.focus}
                  </p>
                  {/* 강점 항목은 위 프로필 카드의 "주로 하는 일"에 설명과 함께 있어 여기서는 다시 나열하지 않는다. */}
                </aside>
              </div>

              <div className="mx-auto grid w-full max-w-[1040px] gap-3 sm:grid-cols-2">
                {aboutProfile.metrics.map((metric) => (
                  <article key={metric.label} className="about-card-interactive px-5 py-4">
                    <div className="text-xl font-semibold text-[color:var(--color-text-primary)]">
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
