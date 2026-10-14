import { aboutProjects } from "@/lib/aboutData";
import LandingCategoriesSection from "@/components/landing/LandingCategoriesSection";
import LandingHero from "@/components/landing/LandingHero";
import LandingLatestPostsSection from "@/components/landing/LandingLatestPostsSection";
import LandingProjectsSection from "@/components/landing/LandingProjectsSection";
import type { PostMeta } from "@/types/post";

type Props = {
  // 색인 대상 글 전체, 최신순. 히어로 힌트 링크와 카테고리 수를 계산하려고 전체를 받는다.
  posts: PostMeta[];
};

export default function LandingPage({ posts }: Props) {
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-12 pb-6 sm:gap-14 lg:gap-16">
        <LandingHero posts={posts} />
        <LandingLatestPostsSection posts={posts.slice(0, 4)} />
        <LandingCategoriesSection posts={posts} />
        <LandingProjectsSection
          projects={selectedProjects}
          sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, (min-width: 640px) 44vw, 88vw"
        />
      </div>
    </div>
  );
}
