import { aboutProjects } from "@/lib/aboutData";
import LandingHero from "@/components/landing/LandingHero";
import LandingLatestPostsSection from "@/components/landing/LandingLatestPostsSection";
import LandingProjectsSection from "@/components/landing/LandingProjectsSection";
import LandingTopicsSection from "@/components/landing/LandingTopicsSection";
import type { PostMeta } from "@/types/post";

type Props = {
  // 색인 대상 글 전체, 최신순. 글 수·주제별 묶음을 계산하려고 전체를 받는다.
  posts: PostMeta[];
};

export default function LandingPage({ posts }: Props) {
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-14 pb-6 sm:gap-16">
        <LandingHero posts={posts} />
        <LandingLatestPostsSection posts={posts.slice(0, 5)} />
        <LandingTopicsSection posts={posts} />
        <LandingProjectsSection projects={selectedProjects} />
      </div>
    </div>
  );
}
