import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/about/ProjectDetailView";
import { aboutProjects, getAboutProjectBySlug, getAdjacentProjects } from "@/lib/aboutData";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getAboutProjectBySlug(slug);

  if (!project) {
    return buildPageMetadata({
      title: "Project",
      description: "포트폴리오 프로젝트 상세 페이지",
      path: `/projects/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return buildPageMetadata({
    title: `${project.title} 프로젝트`,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export function generateStaticParams() {
  return aboutProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getAboutProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(slug);

  return (
    <div className="min-h-screen w-full">
      <ProjectDetailView project={project} previousProject={previous} nextProject={next} />
    </div>
  );
}
