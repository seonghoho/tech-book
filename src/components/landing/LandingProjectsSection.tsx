"use client";

import type { AboutProject } from "@/lib/aboutData";
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
          className="min-w-0"
          posterClassName="!grayscale-0"
        />
      ))}
    </>
  );
}

export default function LandingProjectsSection({ projects, sizes }: LandingProjectsSectionProps) {
  return (
    <>
      <section className="hidden lg:block">
        <div className="surface-panel-strong overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Projects</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                프로젝트 둘러보기
              </h2>
              <p className="body-copy max-w-2xl">
                대표 프로젝트 3개를 한 화면에서 바로 확인할 수 있도록 정적으로 배치했습니다.
              </p>
            </div>
          </div>

          {/* Temporarily disable sticky/pinned GSAP choreography and render posters in full color. */}
          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="grid w-full grid-cols-4 gap-8">
              <StaticProjectGrid projects={projects} sizes={sizes} />
            </div>
          </div>
        </div>
      </section>

      <section className="lg:hidden">
        <div className="surface-panel-strong overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Projects</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                프로젝트 둘러보기
              </h2>
              <p className="body-copy max-w-2xl">
                진행한 프로젝트 내용을 자세히 확인해볼 수 있습니다.
              </p>
            </div>
          </div>

          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10">
              <StaticProjectGrid projects={projects} sizes={sizes} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
