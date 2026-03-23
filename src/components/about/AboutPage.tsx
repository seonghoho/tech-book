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

// const featuredProject = aboutProjects.find((project) => project.featured) ?? aboutProjects[0];
const projectArchivePreview = aboutProjects.slice(0, 4);
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
      <p className="body-copy max-w-2xl">{description}</p>
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

        <div className="min-w-0 space-y-20 sm:space-y-24">
          <section id="overview" className="scroll-mt-28 space-y-10">
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
                    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                      <div className="relative mx-auto h-[180px] w-[180px] shrink-0 overflow-hidden rounded-[24px] border border-white/20 bg-white/10 shadow-[0_10px_24px_rgba(15,23,42,0.18)] sm:mx-0 sm:h-[200px] sm:w-[200px]">
                        <Image
                          src="/images/Profile.JPG"
                          alt=""
                          fill
                          className="object-cover object-[center_24%]"
                          sizes="200px"
                        />
                      </div>
                      <div className="my-auto flex flex-col space-y-3">
                        <p className="eyebrow-label">Profile</p>
                        <div>
                          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                            {aboutProfile.name } / {aboutProfile.title}
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
                          className="surface-subtle group px-4 py-4 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_22px_46px_rgba(2,8,23,0.28)]"
                        >
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                            {fact.label}
                          </dt>
                          <dd className="mt-2 text-sm font-medium leading-6 text-[color:var(--color-text-primary)] transition-colors duration-200 group-hover:text-[color:var(--color-accent)]">
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
                          className="group flex items-start gap-3 rounded-[22px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_22px_46px_rgba(2,8,23,0.28)]"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-accent)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-[1.35]" />
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)] transition-colors duration-200 group-hover:text-[color:var(--color-accent)]">
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
                  eyebrow="Overview"
                  title={aboutProfile.overviewTitle}
                  description={aboutProfile.overviewDescription}
                />
                <div className="about-card p-5 sm:p-6">
                  <p className="eyebrow-label">Context</p>
                  <p className="mt-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                    {aboutProfile.summary}
                  </p>
                </div>
              </div>

              <aside className="about-card p-5 sm:p-6">
                <p className="eyebrow-label">Focus</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {aboutProfile.focus}
                </p>
                <div className="mt-5 grid gap-3">
                  {overviewStrengths.map((item) => (
                    <div
                      key={item.title}
                      className="surface-subtle px-4 py-3 text-sm font-medium text-[color:var(--color-text-secondary)]"
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
                  className="about-card-interactive px-5 py-4"
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
              title="실무에서 경험을 쌓아왔습니다"
              description="각각의 과정에서 어떤 역할과 역량이 만들어졌는지 정리했습니다."
            />

            <div className="about-card overflow-hidden divide-y divide-[color:var(--color-border)]">
              {experienceTimeline.map((item) => (
                <article
                  key={item.company}
                  className="px-5 py-5 transition duration-300 hover:bg-[color:var(--color-surface-tint)] sm:px-6"
                >
                  <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
                      <div className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--color-accent)]">
                        {item.period}
                      </div>
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
                            className="surface-subtle px-4 py-3 text-sm text-[color:var(--color-text-secondary)]"
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

            <article className="surface-panel-strong p-5 sm:p-6 lg:p-7">
              <div className="grid gap-6">
                {/* <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="eyebrow-label">Project Archive</p>
                    <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
                      목록에서 훑고, 상세에서 깊게 읽는 구조로 바꿨습니다
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
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        Projects
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                        {aboutProjects.length}개
                      </dd>
                    </div>
                    <div className="surface-subtle px-4 py-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        Highlight
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-[color:var(--color-text-primary)]">
                        {featuredProject?.title ?? "대표 프로젝트"}
                      </dd>
                    </div>
                    <div className="surface-subtle px-4 py-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        Structure
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

                <div className="grid gap-3">
                  {projectArchivePreview.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="about-card-interactive block px-4 py-4 sm:px-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                            {project.period}
                          </p>
                          <h4 className="mt-2 text-lg font-semibold text-[color:var(--color-text-primary)]">
                            {project.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                            {project.tagline}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[color:var(--color-accent)]">
                          View
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section id="strengths" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Strengths"
              title="복합 인터랙션과 구조적 설계를 동시에 다룹니다"
              description="특정 라이브러리 숙련도보다, 구현 난도가 높은 화면에서 어떤 판단을 했는지가 더 중요하다고 생각합니다."
            />

            <div className="about-card overflow-hidden divide-y divide-[color:var(--color-border)]">
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

          <section id="stack" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Stack"
              title="문제의 성격에 따라 도구를 선택하고 조합합니다"
              description="서비스 UI, 그래픽 인터랙션, 상태 구조, 협업 도구를 분리해 보면 어떤 영역에서 실전 경험이 쌓였는지 더 분명하게 드러납니다."
            />

            <div className="about-card overflow-hidden divide-y divide-[color:var(--color-border)]">
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
                  className="about-card-interactive px-5 py-5"
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
