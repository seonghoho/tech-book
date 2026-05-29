import type { AboutProject } from "@/lib/aboutData";
import { hexToRgba } from "@/lib/color";
import ProjectArchiveCard from "@/components/projects/ProjectArchiveCard";

type LandingProjectsSectionProps = {
  projects: AboutProject[];
  sizes: string;
};

function StaticProjectGrid({ projects, sizes }: LandingProjectsSectionProps) {
  return (
    <>
      {projects.map((project, index) => (
        <ProjectArchiveCard
          key={project.slug}
          project={project}
          priority={index === 0}
          sizes={sizes}
          accentColor={project.posterColor}
          className="min-w-0"
          posterClassName="!grayscale-0 border-white/40 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
        />
      ))}
    </>
  );
}

export default function LandingProjectsSection({ projects, sizes }: LandingProjectsSectionProps) {
  const projectGlowClasses = [
    "-left-12 top-4 h-36 w-36 sm:-left-16 sm:top-6 sm:h-56 sm:w-56",
    "right-[-3rem] top-20 h-40 w-40 sm:right-8 sm:top-10 sm:h-64 sm:w-64",
    "left-1/3 bottom-[-3rem] h-40 w-40 sm:bottom-0 sm:h-56 sm:w-56",
  ];

  return (
    <section>
      <div className="surface-panel-strong relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {projects.slice(0, 3).map((project, index) => (
            <div
              key={project.slug}
              className={`absolute rounded-full blur-3xl ${projectGlowClasses[index]}`}
              style={{ backgroundColor: hexToRgba(project.posterColor, 0.16) }}
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_30%,transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_32%,transparent_100%)]" />
        </div>

        <div className="relative border-b border-[color:var(--color-border)] px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="space-y-3">
            <p className="eyebrow-label">Projects</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
              프로젝트 둘러보기
            </h2>
            <p className="body-copy max-w-2xl">
              대표 프로젝트를 한 화면에서 확인하고, 각 상세 페이지에서 구현 맥락과 결과를 살펴볼 수
              있습니다.
            </p>
          </div>
        </div>

        <div className="relative px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3">
            <StaticProjectGrid projects={projects} sizes={sizes} />
          </div>
        </div>
      </div>
    </section>
  );
}
