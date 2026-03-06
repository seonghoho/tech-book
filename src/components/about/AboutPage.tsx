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
const aboutRailSummary =
  "SVG·Three.js 기반 인터랙션과 서비스 UI를 설계·구현하는 프론트엔드 엔지니어입니다.";

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
          summary={aboutRailSummary}
          sections={[...aboutSectionLinks]}
          links={aboutProfile.contacts}
        />

        <div className="space-y-20 sm:space-y-24">
          <section id="overview" className="scroll-mt-28 space-y-8">
            <SectionHeader
              eyebrow="Overview"
              title="복잡한 상호작용을 구현하면서도, 읽히는 구조를 남기는 프론트엔드 엔지니어입니다"
              description="사용자에게는 자연스럽고, 팀에게는 다루기 쉬운 화면을 만드는 것이 목표입니다. 특히 좌표 기반 인터랙션과 시각화가 필요한 제품에서 강점을 발휘합니다."
            />

            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <article className="rounded-[30px] border border-[color:var(--color-border)] p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
                    <Image
                      src="/images/Profile.JPG"
                      alt="최성호 프로필 사진"
                      fill
                      className="object-cover"
                      sizes="80px"
                      priority
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-[color:var(--color-text-primary)]">
                      {aboutProfile.title}
                    </div>
                    <div className="text-sm text-[color:var(--color-text-secondary)]">
                      코드넛 · Frontend Engineer
                    </div>
                    <div className="text-sm text-[color:var(--color-text-muted)]">
                      SVG / Three.js / React / Vue
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
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
              </article>

              <article className="rounded-[30px] border border-[color:var(--color-border)] p-5 sm:p-6">
                <p className="eyebrow-label">Focus</p>
                <p className="mt-4 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
                  {aboutProfile.summary}
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-muted)]">
                  {aboutProfile.focus}
                </p>
              </article>
            </div>

            <div className="space-y-5 text-[15px] leading-8 text-[color:var(--color-text-secondary)]">
              <p>
                에듀테크 스타트업 코드넛에서 SVG·Three.js 기반 수학교구
                캔버스를 개발하며, 화면 안에서 발생하는 복합 상호작용을
                책임 분리와 모듈화 관점으로 설계하고 있습니다.
              </p>
              <p>
                단순히 기능을 구현하는 데서 끝나지 않고, 신규 교구 추가와
                서비스 UI 통합, 협업 과정에서의 변경 대응까지 고려한
                프론트엔드 구조를 만드는 데 집중하고 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
              title="프로젝트를 볼 때는 구현 난도보다 문제를 푼 방식이 보이게 정리했습니다"
              description="대표 프로젝트는 맥락과 기여를 충분히 보여주고, 나머지 프로젝트는 빠르게 비교할 수 있는 구조로 구성했습니다."
            />

            {featuredProject ? (
              <article className="rounded-[32px] border border-[color:var(--color-border)] p-5 transition duration-300 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center">
                  <div className="space-y-5">
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

                    <dl className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Period
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.period}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Team
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.team}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          Role
                        </dt>
                        <dd className="mt-2 text-sm text-[color:var(--color-text-primary)]">
                          {featuredProject.role}
                        </dd>
                      </div>
                    </dl>

                    <ul className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                      {featuredProject.cardPoints.slice(0, 4).map((point) => (
                        <li key={point} className="flex gap-3">
                          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

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
                        className="button-secondary"
                      >
                        상세 보기
                      </Link>
                      {featuredProject.links[0] ? (
                        <a
                          href={featuredProject.links[0].href}
                          target={featuredProject.links[0].external ? "_blank" : undefined}
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

                  <ProjectVisual preview={featuredProject.preview} priority />
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
                  <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
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

              <aside className="rounded-[28px] border border-[color:var(--color-border)] px-5 py-5 xl:col-span-2">
                <p className="eyebrow-label">Contact</p>
                <h3 className="mt-3 text-xl font-semibold text-[color:var(--color-text-primary)]">
                  채용 담당자나 협업 상대가 빠르게 확인할 수 있도록 구성했습니다
                </h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  프로젝트별 상세 페이지에서 문제 맥락, 구현 방식, 결과를 더
                  자세히 확인할 수 있습니다. 필요한 경우 GitHub와 이메일로
                  바로 연결할 수 있습니다.
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
              </aside>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
