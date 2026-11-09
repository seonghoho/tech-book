import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailView from "@/components/about/ProjectDetailView";
import AppDetailView from "@/components/projects/AppDetailView";
import { aboutProjects, getAboutProjectBySlug, getAdjacentProjects } from "@/lib/aboutData";
import { getPersonalAppBySlug, personalApps } from "@/lib/appsData";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getAboutProjectBySlug(slug);
  const app = getPersonalAppBySlug(slug);

  if (app) {
    return buildPageMetadata({
      title: `${app.title} — 직접 만든 앱`,
      description: app.summary,
      path: `/projects/${app.slug}`,
      images: [{ url: absoluteUrl(app.thumbnail.src) }],
    });
  }

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
    images:
      project.preview.kind === "image" ? [{ url: absoluteUrl(project.preview.src) }] : undefined,
  });
}

// 팀 프로젝트와 개인 앱이 같은 /projects/{slug} 주소 체계를 쓴다. 슬러그는 서로 겹치지 않는다.
export function generateStaticParams() {
  return [...aboutProjects, ...personalApps].map((item) => ({ slug: item.slug }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const app = getPersonalAppBySlug(slug);
  const project = getAboutProjectBySlug(slug);
  const title = app?.title ?? project?.title;

  if (!title) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Projects", item: "/projects" },
      { name: title, item: `/projects/${slug}` },
    ],
  });

  return (
    <div className="stable-screen-min w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {app ? (
        <AppDetailView app={app} />
      ) : project ? (
        <ProjectDetailView project={project} {...getAdjacentProjectProps(slug)} />
      ) : null}
    </div>
  );
}

function getAdjacentProjectProps(slug: string) {
  const { previous, next } = getAdjacentProjects(slug);
  return { previousProject: previous, nextProject: next };
}
