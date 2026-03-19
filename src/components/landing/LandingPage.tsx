import type { CSSProperties } from "react";
import Link from "next/link";
import { aboutProjects } from "@/lib/aboutData";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import ProjectArchiveGrid from "@/components/projects/ProjectArchiveGrid";
import AnimatedSection from "@/components/landing/AnimatedSection";
import HeroPlayground from "@/components/landing/HeroPlayground";
import LandingPinnedFeaturedGridSection from "@/components/landing/LandingPinnedFeaturedGridSection";
import { homeTopicBlueprints } from "@/lib/homeContent";
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

type HomeTopicItem = {
  title: string;
  description: string;
  href: string;
  count: number;
};

const twoLineClampStyle: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

function getPostLabel(post: PostMeta) {
  if (!post.category) {
    return "Writing";
  }

  return categoryMap[post.category] ?? post.category;
}

function getPostDescription(post: PostMeta) {
  return (
    post.description ??
    "문제 정의, 구현 맥락, 그리고 실제 해결 과정을 중심으로 정리한 기술 글입니다."
  );
}

function buildTopicItems(categories: CategorySummary[], tags: TagSummary[]): HomeTopicItem[] {
  const categoryCountMap = new Map(categories.map((item) => [item.slug, item.count]));
  const tagCountMap = new Map(tags.map((item) => [item.name, item.count]));

  return homeTopicBlueprints.map((topic) => {
    const sourceCount =
      topic.countSource?.type === "category"
        ? categoryCountMap.get(topic.countSource.key)
        : topic.countSource?.type === "tag"
          ? tagCountMap.get(topic.countSource.key)
          : undefined;

    return {
      title: topic.title,
      description: topic.description,
      href: topic.href,
      count: sourceCount ?? topic.fallbackCount,
    };
  });
}

function FeaturedPostItem({ post }: { post: PostMeta }) {
  return (
    <article className="surface-panel flex h-full min-w-0 flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
        <span className="eyebrow-label">{getPostLabel(post)}</span>
        <span>{formatDate(post.date)}</span>
        {post.readingTime ? <span>{post.readingTime}분 읽기</span> : null}
      </div>

      <Link
        href={`/posts/${post.slug}`}
        className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold text-[color:var(--color-text-primary)] transition hover:text-[color:var(--color-accent)]"
      >
        {post.title}
      </Link>

      <p
        className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]"
        style={twoLineClampStyle}
      >
        {getPostDescription(post)}
      </p>

      {post.tags?.length ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-chip">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function TopicItem({ topic }: { topic: HomeTopicItem }) {
  return (
    <Link
      href={topic.href}
      className="group grid gap-3 px-5 py-5 transition duration-200 hover:bg-[color:var(--color-surface)] sm:grid-cols-[minmax(0,1fr)_100px] sm:items-start sm:px-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] transition group-hover:text-[color:var(--color-accent)]">
          {topic.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
          {topic.description}
        </p>
      </div>

      <div className="text-sm font-medium text-[color:var(--color-text-muted)] sm:text-right">
        {String(topic.count).padStart(2, "0")} posts
      </div>
    </Link>
  );
}

export default function LandingPage({ recentPosts, featuredPosts, categories, tags }: Props) {
  const featuredWriting = (featuredPosts.length ? featuredPosts : recentPosts).slice(0, 6);
  const topicItems = buildTopicItems(categories, tags);
  const selectedProjects = aboutProjects.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-14 pb-6 sm:gap-16 lg:gap-20">
        <AnimatedSection>
          <section>
            <HeroPlayground />
          </section>
        </AnimatedSection>

        {featuredWriting.length ? (
          <LandingPinnedFeaturedGridSection
            eyebrow="Featured Writing"
            title="먼저 읽어볼 글"
            description="실무 구현 과정에서 마주친 문제를 중심으로 읽기 좋은 글부터 배치했습니다."
          >
            {featuredWriting.map((post) => (
              <FeaturedPostItem key={post.slug} post={post} />
            ))}
          </LandingPinnedFeaturedGridSection>
        ) : null}

        {/* <AnimatedSection> */}
        <section className="surface-panel-strong overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3" data-reveal-item>
              <p className="eyebrow-label">Topics</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                주제별로 둘러보기
              </h2>
              <p className="body-copy max-w-2xl">
                어떤 기록을 남기는지 한 번에 읽히도록 주요 주제를 정리했습니다.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[color:var(--color-border)]" data-reveal-item>
            {topicItems.map((topic) => (
              <TopicItem key={topic.title} topic={topic} />
            ))}
          </div>
        </section>
        {/* </AnimatedSection> */}

        <AnimatedSection>
          <section className="surface-panel-strong overflow-hidden">
            <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
              <div className="space-y-3" data-reveal-item>
                <p className="eyebrow-label">Projects</p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                  프로젝트 둘러보기
                </h2>
                <p className="body-copy max-w-2xl">
                  진행한 프로젝트 내용을 자세히 확인해볼 수 있습니다.
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6" data-reveal-item>
              <ProjectArchiveGrid
                projects={selectedProjects}
                sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, 44vw"
                gridClassName="grid-cols-2 lg:grid-cols-5"
                priorityCount={1}
              />
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}
