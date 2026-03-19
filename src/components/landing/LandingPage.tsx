import { aboutProjects } from "@/lib/aboutData";
import AnimatedSection from "@/components/landing/AnimatedSection";
import LandingFeaturedWritingSection from "@/components/landing/LandingFeaturedWritingSection";
import LandingProjectsSection from "@/components/landing/LandingProjectsSection";
import HeroPlayground from "@/components/landing/HeroPlayground";
// import LandingTopicBrowseSection from "@/components/landing/LandingTopicBrowseSection";
// import { homeTopicBlueprints } from "@/lib/homeContent";
import type { PostMeta } from "@/types/post";

type CategorySummary = {
  slug: string;
  label: string;
  count: number;
};

type TagSummary = {
  name: string;
  count: number;
};

type Props = {
  recentPosts: PostMeta[];
  featuredPosts: PostMeta[];
  categories: CategorySummary[];
  tags: TagSummary[];
};

// type HomeTopicItem = {
//   title: string;
//   description: string;
//   href: string;
//   count: number;
// };

// function buildTopicItems(categories: CategorySummary[], tags: TagSummary[]): HomeTopicItem[] {
//   const categoryCountMap = new Map(categories.map((item) => [item.slug, item.count]));
//   const tagCountMap = new Map(tags.map((item) => [item.name, item.count]));

//   return homeTopicBlueprints.map((topic) => {
//     const sourceCount =
//       topic.countSource?.type === "category"
//         ? categoryCountMap.get(topic.countSource.key)
//         : topic.countSource?.type === "tag"
//           ? tagCountMap.get(topic.countSource.key)
//           : undefined;

//     return {
//       title: topic.title,
//       description: topic.description,
//       href: topic.href,
//       count: sourceCount ?? topic.fallbackCount,
//     };
//   });
// }

export default function LandingPage({ recentPosts }: Props) {
  const featuredWriting = recentPosts.slice(0, 4);
  // const topicItems = buildTopicItems(categories, tags);
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-14 pb-6 sm:gap-16 lg:gap-20">
        <AnimatedSection>
          <section>
            <HeroPlayground />
          </section>
        </AnimatedSection>

        {featuredWriting.length ? <LandingFeaturedWritingSection posts={featuredWriting} /> : null}

        {/* <div>
          <LandingTopicBrowseSection topics={topicItems} />
        </div> */}

        <LandingProjectsSection
          projects={selectedProjects}
          sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, 44vw"
        />
      </div>
    </div>
  );
}
