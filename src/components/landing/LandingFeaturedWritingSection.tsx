import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/assets/svg";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";

type LandingFeaturedWritingSectionProps = {
  posts: PostMeta[];
};

type FeaturedPostCardProps = {
  post: PostMeta;
  compact?: boolean;
  className?: string;
};

const descriptionClampStyle: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

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

function FeaturedPostCard({ post, compact = false, className }: FeaturedPostCardProps) {
  return (
    <article
      className={joinClasses(
        "surface-panel flex h-full min-w-0 flex-col border border-[color:var(--color-border)] p-5 sm:p-6",
        compact ? "rounded-[26px]" : undefined,
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
        <span className="eyebrow-label">{getPostLabel(post)}</span>
        <span>{formatDate(post.date)}</span>
        {post.readingTime ? <span>{post.readingTime}분 읽기</span> : null}
      </div>

      <Link
        href={`/posts/${post.slug}`}
        className={joinClasses(
          "mt-3 block text-[1.18rem] font-semibold leading-[1.35] tracking-[-0.04em] text-[color:var(--color-text-primary)] transition hover:text-[color:var(--color-accent)] sm:text-[1.35rem]",
          compact ? "sm:max-w-[18ch]" : undefined,
        )}
      >
        {post.title}
      </Link>

      <p
        className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]"
        style={descriptionClampStyle}
      >
        {getPostDescription(post)}
      </p>

      {post.tags?.length ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {post.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-chip">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function FeaturedWritingCtaButton() {
  return (
    <div className="flex h-full items-center justify-center">
      <Link
        href="/posts"
        aria-label="전체 글 보러가기"
        className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-accent)] hover:bg-[rgba(37,99,235,0.08)] hover:text-[color:var(--color-accent)]"
      >
        <ChevronRightIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function FeaturedWritingCtaFooter() {
  return (
    <div className="flex justify-start border-t border-[color:var(--color-border)] pt-5 sm:pt-6">
      <Link
        href="/posts"
        className="button-secondary group w-full gap-2 px-5 py-3 sm:w-auto"
      >
        전체 글 보러가기
        <ChevronRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default function LandingFeaturedWritingSection({
  posts,
}: LandingFeaturedWritingSectionProps) {
  const featuredPosts = posts.slice(0, 4);

  if (!featuredPosts.length) {
    return null;
  }

  return (
    <>
      <section className="hidden lg:block">
        <div className="surface-panel-strong overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Featured Writing</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                먼저 읽어볼 글
              </h2>
              <p className="body-copy max-w-2xl">
                최근에 정리한 글 4개를 먼저 배치하고, 전체 아카이브로 바로 이어질 수 있게
                구성했습니다.
              </p>
            </div>
          </div>

          <div className="grid gap-6 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(96px,148px)] xl:grid-cols-[minmax(0,1fr)_minmax(120px,180px)]">
            <div className="grid auto-rows-fr gap-6 sm:grid-cols-2">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.slug} post={post} />
              ))}
            </div>

            <FeaturedWritingCtaButton />
          </div>
        </div>
      </section>

      <section className="lg:hidden">
        <div className="surface-panel-strong overflow-hidden">
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Featured Writing</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                먼저 읽어볼 글
              </h2>
              <p className="body-copy max-w-2xl">
                최근 게시글 4개를 먼저 살펴보고, 전체 글 목록으로 자연스럽게 이어질 수 있게
                구성했습니다.
              </p>
            </div>
          </div>

          <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="grid gap-4 sm:auto-rows-fr sm:grid-cols-2 sm:gap-6">
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.slug} post={post} compact className="h-full" />
              ))}
            </div>

            <div className="mt-5 sm:mt-6">
              <FeaturedWritingCtaFooter />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
