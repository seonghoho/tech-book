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
import ProjectVisual from "./ProjectVisual";

const featuredProject = aboutProjects.find((project) => project.featured);
const secondaryProjects = aboutProjects.filter((project) => !project.featured);
const overviewFacts = [
  { label: "Current", value: aboutProfile.companyLabel },
  { label: "Stack", value: aboutProfile.stackLabel },
  { label: "Core", value: "인터랙션 · 시각화 · 서비스 UI" },
];
const overviewStrengths = strengthHighlights.slice(0, 3);

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
      <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl body-copy">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="grid gap-16 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:gap-24">
        <PortfolioRail
          eyebrow={aboutProfile.quote}
          name={aboutProfile.name}
          title={aboutProfile.tagline}
          summary={aboutProfile.railSummary}
          sections={[...aboutSectionLinks]}
          links={aboutProfile.contacts}
        />

        <div className="space-y-20 sm:space-y-24">
          <section id="overview" className="scroll-mt-28 space-y-10">
            <article className="surface-panel-strong mx-auto w-full max-w-[1040px] overflow-hidden p-4 sm:p-5 lg:p-6">
              <div className="grid gap-6 min-[1600px]:grid-cols-[minmax(300px,0.86fr)_minmax(0,1.14fr)] min-[1600px]:items-stretch">
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
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                          Current
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
                    <div className="flex flex-row gap-8">
                      <div className="relative h-[200px] w-[200px] overflow-hidden rounded-[18px] border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                        <Image
                          src="/images/Profile.JPG"
                          alt=""
                          fill
                          className="object-cover object-[center_24%]"
                          sizes="200px"
                        />
                      </div>
                      <div className="space-y-3 flex flex-col my-auto">
                        <p className="eyebrow-label">Profile Snapshot</p>
                        <div>
                          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                            {aboutProfile.title}
                          </h3>
                          <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                            {aboutProfile.railSummary}
                          </p>
                        </div>
                      </div>
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-2 min-[1600px]:grid-cols-3">
                      {overviewFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/72 px-4 py-4"
                        >
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                            {fact.label}
                          </dt>
                          <dd className="mt-2 text-sm font-medium leading-6 text-[color:var(--color-text-primary)]">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      What I Focus On
                    </p>
                    <div className="mt-4 grid gap-3">
                      {overviewStrengths.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-3 rounded-[22px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-accent)]" />
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
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

            <div className="mx-auto grid w-full max-w-[1040px] gap-6">
              <div className="space-y-5">
                <SectionHeader
                  eyebrow="Overview"
                  title={aboutProfile.overviewTitle}
                  description={aboutProfile.overviewDescription}
                />
                <div className="rounded-[30px] border border-[color:var(--color-border)] px-5 py-5 sm:px-6">
                  <p className="eyebrow-label">Context</p>
                  <p className="mt-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                    {aboutProfile.summary}
                  </p>
                </div>
              </div>

              <aside className="surface-panel p-5 sm:p-6">
                <p className="eyebrow-label">Focus</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {aboutProfile.focus}
                </p>
                <div className="mt-5 grid gap-3">
                  {overviewStrengths.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-secondary)]"
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className="mx-auto grid w-full max-w-[1040px] gap-3 sm:grid-cols-2">
              {aboutProfile.metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-3xl border border-[color:var(--color-border)] px-5 py-4 transition duration-300 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)]"
                >
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

          <section id="experience" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Experience"
              title="학습보다 실전 맥락에서 강해진 경험을 쌓아왔습니다"
              description="실무와 교육 과정을 분리해서 보여주되, 각각에서 어떤 역할과 역량이 만들어졌는지 바로 읽히도록 정리했습니다."
            />

            <div className="divide-y divide-[color:var(--color-border)] rounded-[30px] border border-[color:var(--color-border)]">
              {experienceTimeline.map((item) => (
                <article
                  key={item.company}
                  className="group px-5 py-5 transition duration-300 first:rounded-t-[30px] last:rounded-b-[30px] hover:bg-[color:var(--color-surface)] sm:px-6"
                >
                  <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                      <div>{item.period}</div>
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
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {item.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="rounded-2xl border border-[color:var(--color-border)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]"
                          >
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="projects" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Projects"
              title="문제를 푼 방식이 보이도록 정리했습니다"
              description="대표 프로젝트와 저의 경험이 된 프로젝트들을 작성했습니다."
            />

            {featuredProject ? (
              <article className="rounded-[32px] border border-[color:var(--color-border)] p-5 transition duration-300 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] sm:p-6">
                <div className="space-y-8">
                  <div className="max-w-3xl space-y-5">
                    <div className="space-y-3">
                      <div className="eyebrow-label flex flex-wrap items-center gap-2">
                        <span>{featuredProject.eyebrow}</span>
                        {featuredProject.achievement ? (
                          <span className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-[11px] tracking-[0.14em] text-[color:var(--color-accent)]">
                            {featuredProject.achievement}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
                          {featuredProject.title}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-[color:var(--color-text-secondary)]">
                          {featuredProject.tagline}
                        </p>
                      </div>
                      <p className="body-copy">{featuredProject.summary}</p>
                    </div>
                  </div>

                  <ProjectVisual
                    preview={featuredProject.preview}
                    priority
                    variant="feature"
                    className="w-full"
                  />

                  <div className="space-y-6">
                    <dl className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 px-4 py-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Period
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.period}
                        </dd>
                      </div>
                      <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 px-4 py-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Team
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.team}
                        </dd>
                      </div>
                      <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 px-4 py-4">
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Role
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.role}
                        </dd>
                      </div>
                    </dl>

                    <ul className="grid gap-3 md:grid-cols-2">
                      {featuredProject.cardPoints.slice(0, 4).map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/55 px-4 py-4 text-sm text-[color:var(--color-text-secondary)]"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-4 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/45 px-4 py-4 sm:px-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Stack
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {featuredProject.techStack
                            .slice(0, 7)
                            .map((stack) => (
                              <span key={stack} className="tag-chip">
                                {stack}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/about/projects/${featuredProject.slug}`}
                          className="button-secondary"
                        >
                          상세 보기
                        </Link>
                        {featuredProject.links[0] ? (
                          <a
                            href={featuredProject.links[0].href}
                            target={
                              featuredProject.links[0].external
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              featuredProject.links[0].external
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="accent-link inline-flex items-center text-sm font-semibold"
                          >
                            {featuredProject.links[0].label}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="divide-y divide-[color:var(--color-border)] rounded-[30px] border border-[color:var(--color-border)]">
              {secondaryProjects.map((project) => (
                <article
                  key={project.slug}
                  className="group px-5 py-5 transition duration-300 first:rounded-t-[30px] last:rounded-b-[30px] hover:bg-[color:var(--color-surface)] sm:px-6"
                >
                  <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                      <div>{project.period}</div>
                      <div>{project.team}</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                          {project.title}
                        </h3>
                        <span className="text-sm text-[color:var(--color-text-muted)]">
                          {project.role}
                        </span>
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

          <section id="strengths" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Strengths"
              title="복합 인터랙션과 구조적 설계를 동시에 다룹니다"
              description="특정 라이브러리 숙련도보다, 구현 난도가 높은 화면에서 어떤 판단을 했는지가 더 중요하다고 생각합니다."
            />

            <div className="space-y-3">
              {strengthHighlights.map((item) => (
                <article
                  key={item.title}
                  className="group rounded-[28px] border border-transparent px-4 py-4 transition duration-300 hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface)]"
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

          <section id="stack" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Stack"
              title="문제의 성격에 따라 도구를 선택하고 조합합니다"
              description="서비스 UI, 그래픽 인터랙션, 상태 구조, 협업 도구를 분리해 보면 어떤 영역에서 실전 경험이 쌓였는지 더 분명하게 드러납니다."
            />

            <div className="space-y-4">
              {skillGroups.map((group) => (
                <article
                  key={group.title}
                  className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5 transition duration-300 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] sm:px-6"
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

          <section id="collaboration" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Collaboration"
              title="요구사항과 구현 디테일 사이를 연결하는 역할을 맡아왔습니다"
              description="협업에서는 우선순위를 정리하고, 구현에서는 구조를 다듬습니다. 그 두 지점을 함께 보는 것이 제 작업 방식의 핵심입니다."
            />

            <div className="grid gap-4 xl:grid-cols-2">
              {growthNotes.map((note) => (
                <article
                  key={note.title}
                  className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5 transition duration-300 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)]"
                >
                  <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
                    {note.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {note.description}
                  </p>
                </article>
              ))}

              {/* <aside className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5 xl:col-span-2">
                <p className="eyebrow-label">Contact</p>
                <h3 className="mt-3 text-xl font-semibold text-[color:var(--color-text-primary)]">
                  채용 담당자나 협업 상대가 빠르게 확인할 수 있도록 구성했습니다
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
  );
}
