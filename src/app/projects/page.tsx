import type { Metadata } from "next";
import ProjectsPage from "@/components/projects/ProjectsPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects",
  description: "프론트엔드 엔지니어 최성호가 직접 만든 앱과 팀 프로젝트 목록입니다.",
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
