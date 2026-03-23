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
        <section>
          <HeroPlayground />
        </section>

        {featuredWriting.length ? <LandingFeaturedWritingSection posts={featuredWriting} /> : null}

        <LandingProjectsSection
          projects={selectedProjects}
          sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, 44vw"
        />
      </div>
    </div>
  );
}
