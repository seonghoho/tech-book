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
        <header className="space-y-3">
          <p className="eyebrow-label">Frontend Engineering Notes</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-4xl">
            Seonghoho 기술 블로그
          </h1>
          <p className="body-copy max-w-[640px]">
            SVG 에디터, Three.js 3D 교구, 인터랙션 UI를 만들며 부딪힌 문제와 해결 과정을 직접
            기록합니다. 재현 코드와 디버깅 순서, 설계 판단의 근거를 함께 남깁니다.
          </p>
        </header>

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
