import Link from "next/link";
import LandingProjectCard from "@/components/landing/LandingProjectCard";
import type { AboutProject } from "@/lib/aboutData";

type Props = {
  projects: AboutProject[];
};

export default function LandingProjectsSection({ projects }: Props) {
  if (!projects.length) return null;

  return (
    <section className="border-t border-[color:var(--color-border)] pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow-label">Projects</p>
          <h2 className="section-title mt-2">프로젝트</h2>
        </div>
        <Link href="/projects" className="accent-link text-sm font-semibold">
          전체 프로젝트 →
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <LandingProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
