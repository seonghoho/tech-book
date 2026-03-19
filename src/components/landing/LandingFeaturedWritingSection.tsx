"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRightIcon } from "@/assets/svg";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";
import { useLandingSectionHeight } from "./useLandingSectionHeight";

gsap.registerPlugin(ScrollTrigger);

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

function getStickyHeaderHeight() {
  const header = document.querySelector("header");
  return header instanceof HTMLElement ? header.getBoundingClientRect().height + 12 : 72;
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
          compact ? "max-w-[18ch]" : undefined,
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

export default function LandingFeaturedWritingSection({
  posts,
}: LandingFeaturedWritingSectionProps) {
  const mobileSectionRef = useRef<HTMLElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileViewportRef = useRef<HTMLDivElement>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const { availableHeight, isReady } = useLandingSectionHeight();
  const featuredPosts = posts.slice(0, 4);

  useLayoutEffect(() => {
    const section = mobileSectionRef.current;
    const panel = mobilePanelRef.current;
    const viewport = mobileViewportRef.current;
    const track = mobileTrackRef.current;

    if (!section || !panel || !viewport || !track || !isReady || featuredPosts.length <= 1) {
      return;
    }

    const mediaMatcher = gsap.matchMedia();

    mediaMatcher.add("(max-width: 1023px)", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(track, { clearProps: "transform" });
        return;
      }

      gsap.set(track, { x: 0 });

      const scrollDistance = Math.max(track.scrollWidth - viewport.clientWidth, 0);

      if (scrollDistance <= 8) {
        return;
      }

      gsap.to(track, {
        x: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${getStickyHeaderHeight()}`,
          end: () => `+=${scrollDistance}`,
          scrub: 1,
          pin: panel,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => mediaMatcher.revert();
  }, [availableHeight, featuredPosts.length, isReady]);

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

      <section ref={mobileSectionRef} className="relative lg:hidden">
        <div
          ref={mobilePanelRef}
          className="surface-panel-strong grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
          style={{ height: availableHeight }}
        >
          <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Featured Writing</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
                먼저 읽어볼 글
              </h2>
              <p className="body-copy max-w-2xl">
                최근 게시글을 한 장씩 넘기며 읽고, 마지막에는 전체 글 목록으로 이동할 수 있습니다.
              </p>
            </div>
          </div>

          <div
            ref={mobileViewportRef}
            className="flex min-h-0 items-center overflow-hidden px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6"
          >
            <div
              ref={mobileTrackRef}
              className="grid w-full auto-cols-[100%] grid-flow-col gap-4 will-change-transform"
            >
              {featuredPosts.map((post) => (
                <FeaturedPostCard key={post.slug} post={post} compact className="h-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
