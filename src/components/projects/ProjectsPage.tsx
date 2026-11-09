import { aboutProjects } from "@/lib/aboutData";
import { personalApps } from "@/lib/appsData";
import PersonalAppCard from "./PersonalAppCard";
import ProjectsFilterClient from "./ProjectsFilterClient";
import TeamProjectCard from "./TeamProjectCard";

export default function ProjectsPage() {
  const apps = personalApps.map((app, index) => (
    <PersonalAppCard key={app.slug} app={app} priority={index < 2} />
  ));
  const team = aboutProjects.map((project) => (
    <TeamProjectCard key={project.slug} project={project} />
  ));

  return (
    <div className="page-shell">
      <section className="space-y-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-5xl">
            Projects
          </h1>
          <p className="body-copy max-w-2xl">직접 만든 앱과 팀으로 진행한 프로젝트예요.</p>
        </div>

        <ProjectsFilterClient apps={apps} team={team} />
      </section>
    </div>
  );
}
