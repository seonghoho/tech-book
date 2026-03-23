import type { Metadata } from "next";
import ProjectsPage from "@/components/projects/ProjectsPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects",
  description:
    "프론트엔드 엔지니어 최성호가 진행한 프로젝트를 목록형 아카이브와 상세 페이지로 정리한 페이지입니다.",
  path: "/projects",
});

export const dynamic = "force-static";

export default function ProjectsArchivePage() {
  return (
    <div className="stable-screen-min w-full">
      <ProjectsPage />
    </div>
  );
}
