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
          <h2 className="text-xl font-bold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
            프로젝트
          </h2>
          <p className="muted-copy mt-2 [word-break:keep-all]">
            회사와 팀 프로젝트에서 맡은 역할과 결과입니다. 구현 과정은 각 프로젝트 페이지에
            정리했습니다.
          </p>
        </div>
        <Link href="/projects" className="accent-link text-sm font-semibold">
          전체 프로젝트 보기
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
