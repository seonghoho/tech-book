"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLandingSectionHeight } from "./useLandingSectionHeight";

gsap.registerPlugin(ScrollTrigger);

type TopicItem = {
  title: string;
  description: string;
  href: string;
  count: number;
};

type TopicPalette = {
  accent: string;
  surface: string;
  border: string;
  glow: string;
  ring: string;
};

const ACTIVE_CARD_Y = -16;
const ACTIVE_CARD_SCALE = 1.022;
const TOPIC_PIN_SEGMENT_PX = 180;
const TOPIC_IDLE_PROGRESS = 0.12;

const topicPalettes: TopicPalette[] = [
  {
    accent: "#0f766e",
    surface: "rgba(15, 118, 110, 0.09)",
    border: "rgba(15, 118, 110, 0.28)",
    glow: "rgba(15, 118, 110, 0.15)",
    ring: "rgba(15, 118, 110, 0.18)",
  },
  {
    accent: "#b45309",
    surface: "rgba(217, 119, 6, 0.09)",
    border: "rgba(217, 119, 6, 0.28)",
    glow: "rgba(217, 119, 6, 0.15)",
    ring: "rgba(217, 119, 6, 0.18)",
  },
  {
    accent: "#2563eb",
    surface: "rgba(37, 99, 235, 0.09)",
    border: "rgba(37, 99, 235, 0.28)",
    glow: "rgba(37, 99, 235, 0.15)",
    ring: "rgba(37, 99, 235, 0.18)",
  },
  {
    accent: "rgb(245, 105, 105)",
    surface: "rgba(245, 105, 105, 0.09)",
    border: "rgba(245, 105, 105, 0.28)",
    glow: "rgba(245, 105, 105, 0.15)",
    ring: "rgba(245, 105, 105, 0.18)",
  },
];

export default function LandingTopicBrowseSection({ topics }: { topics: TopicItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { availableHeight, isReady } = useLandingSectionHeight();

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

    if (!cards.length || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.set(cards, { clearProps: "opacity,visibility,transform" });
    setActiveIndex(0);
  }, [topics.length]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

    if (!section || !panel || !cards.length || !isReady) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const syncActiveCard = (progress: number) => {
        if (progress < TOPIC_IDLE_PROGRESS) {
          setActiveIndex((prev) => (prev === -1 ? prev : -1));
          return;
        }

        const clampedProgress = gsap.utils.clamp(
          0,
          0.9999,
          (progress - TOPIC_IDLE_PROGRESS) / (1 - TOPIC_IDLE_PROGRESS),
        );
        const nextIndex = Math.min(cards.length - 1, Math.floor(clampedProgress * cards.length));

        setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
      };

      const header = document.querySelector("header");
      const stickyOffset =
        header instanceof HTMLElement ? header.getBoundingClientRect().height + 12 : 72;
      const scrollDistance = Math.max(
        availableHeight * 0.5 + cards.length * TOPIC_PIN_SEGMENT_PX,
        cards.length * TOPIC_PIN_SEGMENT_PX,
      );

      gsap.fromTo(
        cards,
        { y: 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        },
      );

      ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${stickyOffset}`,
        end: () => `+=${scrollDistance}`,
        pin: panel,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => syncActiveCard(progress),
        onRefresh: (self) => syncActiveCard(self.progress),
      });

      syncActiveCard(0);
    }, sectionRef);

    return () => context.revert();
  }, [availableHeight, isReady, topics.length]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

    if (!cards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    cards.forEach((card, index) => {
      const title = card.querySelector("[data-topic-title]");
      const description = card.querySelector("[data-topic-description]");
      const count = card.querySelector("[data-topic-count]");
      const marker = card.querySelector("[data-topic-marker]");
      const kicker = card.querySelector("[data-topic-kicker]");
      const isActive = index === activeIndex;
      const secondaryTargets = [description, count].filter(Boolean);
      const accentTargets = [marker, kicker].filter(Boolean);

      gsap.to(card, {
        y: isActive ? ACTIVE_CARD_Y : 0,
        scale: isActive ? ACTIVE_CARD_SCALE : 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });

      gsap.to(title, {
        x: isActive ? 10 : 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });

      if (secondaryTargets.length) {
        gsap.to(secondaryTargets, {
          x: isActive ? 4 : 0,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (accentTargets.length) {
        gsap.to(accentTargets, {
          x: isActive ? 6 : 0,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="relative">
      <div
        ref={panelRef}
        className="surface-panel-strong grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
        style={{ height: availableHeight }}
      >
        <div className="border-b border-[color:var(--color-border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="space-y-3">
            <p className="eyebrow-label">Topics</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-3xl">
              주제별로 둘러보기
            </h2>
            <p className="body-copy max-w-2xl">
              어떤 기록을 남기는지 한 번에 읽히도록 주요 주제를 정리했습니다.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 items-start overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
          <div className="w-full space-y-2">
            {topics.map((topic, index) => {
              const palette = topicPalettes[index % topicPalettes.length];
              const isActive = index === activeIndex;

              return (
                <article
                  key={topic.title}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="opacity-0"
                >
                  <Link
                    href={topic.href}
                    className="group relative block overflow-hidden rounded-[28px] border transition-[background-color,border-color,box-shadow] duration-300"
                    style={{
                      backgroundColor: isActive ? palette.surface : "transparent",
                      borderColor: isActive ? palette.border : "var(--color-border)",
                      boxShadow: isActive ? `0 32px 56px ${palette.glow}` : "none",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: `linear-gradient(120deg, ${palette.surface} 0%, rgba(255,255,255,0) 78%)`,
                      }}
                    />

                    <div className="relative grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 sm:py-4">
                      <div className="min-w-0">
                        <div
                          data-topic-kicker
                          className="mb-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em]"
                          style={{
                            color: isActive ? palette.accent : "var(--color-text-muted)",
                          }}
                        >
                          <span
                            data-topic-marker
                            className="inline-flex h-2.5 w-2.5 rounded-full transition-shadow duration-300"
                            style={{
                              backgroundColor: palette.accent,
                              boxShadow: isActive ? `0 0 0 8px ${palette.ring}` : "none",
                            }}
                          />
                          Topic {String(index + 1).padStart(2, "0")}
                        </div>

                        <h3
                          data-topic-title
                          className="text-lg font-semibold text-[color:var(--color-text-primary)] transition-colors duration-300 sm:text-[1.35rem]"
                          style={{
                            color: isActive ? palette.accent : "var(--color-text-primary)",
                          }}
                        >
                          {topic.title}
                        </h3>

                        <p
                          data-topic-description
                          className="mt-1.5 max-w-2xl text-sm leading-6 transition-colors duration-300"
                          style={{
                            color: isActive
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {topic.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                        <span
                          data-topic-count
                          className="inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors duration-300"
                          style={{
                            borderColor: isActive ? palette.border : "var(--color-border)",
                            backgroundColor: isActive ? palette.accent : "var(--color-surface)",
                            color: isActive ? "#ffffff" : "var(--color-text-muted)",
                          }}
                        >
                          {String(topic.count).padStart(2, "0")} posts
                        </span>

                        <span
                          className="text-xs font-semibold uppercase tracking-[0.22em] transition-colors duration-300"
                          style={{
                            color: isActive ? palette.accent : "var(--color-text-muted)",
                          }}
                        >
                          Browse
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
