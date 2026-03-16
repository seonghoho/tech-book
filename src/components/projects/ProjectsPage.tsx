import { aboutProjects } from "@/lib/aboutData";
import ProjectArchiveGrid from "./ProjectArchiveGrid";

export default function ProjectsPage() {
  return (
    <div className="page-shell">
      <section className="space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow-label">Selected Work</p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-5xl">
            Projects
          </h1>
          <p className="body-copy max-w-2xl">진행한 프로젝트 아카이브입니다.</p>
        </div>

        <ProjectArchiveGrid
          projects={aboutProjects}
          sizes="200px"
          showFootnote
        />
      </section>
    </div>
  );
}
