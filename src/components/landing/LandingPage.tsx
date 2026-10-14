import { aboutProjects } from "@/lib/aboutData";
import LandingFeaturedWritingSection from "@/components/landing/LandingFeaturedWritingSection";
import LandingProjectsSection from "@/components/landing/LandingProjectsSection";
import HeroPlayground from "@/components/landing/HeroPlayground";
import type { PostMeta } from "@/types/post";

type Props = {
  recentPosts: PostMeta[];
};

export default function LandingPage({ recentPosts }: Props) {
  const featuredWriting = recentPosts.slice(0, 4);
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-14 pb-6 sm:gap-16 lg:gap-20">
        {/* 히어로가 이미지 중심이라 문서 제목(H1)은 화면에서 숨기고 검색엔진·스크린리더용으로만 둔다. */}
        <h1 className="sr-only">Seonghoho 기술 블로그</h1>

        <section>
          <HeroPlayground />
        </section>

        {featuredWriting.length ? <LandingFeaturedWritingSection posts={featuredWriting} /> : null}

        <LandingProjectsSection
          projects={selectedProjects}
          sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, (min-width: 640px) 44vw, 88vw"
        />
      </div>
    </div>
  );
}
