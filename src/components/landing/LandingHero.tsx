import Link from "next/link";
import EditorHero from "@/components/landing/editor-hero/EditorHero";
import { resolveHintPosts } from "@/components/landing/editor-hero/editorHints";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

// "2026-10-13" → "10.13"
function toMonthDay(date: string) {
  const [, month, day] = date.split("-");
  return month && day ? `${month}.${day.slice(0, 2)}` : date;
}

export default function LandingHero({ posts }: Props) {
  const latestPosts = posts.slice(0, 3);
  const hintPosts = resolveHintPosts(posts);

  return (
    <section className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pt-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[color:var(--color-text-muted)]">
          프론트엔드 · SVG · 인터랙션
        </p>
        <h1 className="mt-3.5 text-[clamp(30px,3.6vw,42px)] font-semibold leading-[1.22] tracking-[-0.045em] text-[color:var(--color-text-primary)] [text-wrap:balance] [word-break:keep-all]">
          에디터를 만들며 부딪힌 문제를{" "}
          <span className="font-semibold text-[color:var(--color-text-muted)]">
            코드와 함께 기록합니다
          </span>
        </h1>
        <p className="mt-4 max-w-[34em] text-base leading-8 text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          SVG 에디터와 Three.js 3D 교구, 인터랙션 UI를 개발하면서 겪은 문제와 해결 과정을 정리하는
          Seonghoho의 기술 블로그입니다. 함께 놓인 캔버스는 글에서 다룬 선택, 좌표 변환, 리사이즈,
          undo/redo를 직접 만져 볼 수 있게 줄여 만든 에디터입니다.
        </p>

        {latestPosts.length ? (
          <nav aria-label="최근 글" className="mt-7 border-t border-[color:var(--color-border)]">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 border-b border-[color:var(--color-border)] py-3 text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
              >
                <time
                  dateTime={post.date}
                  className="pt-0.5 text-xs tabular-nums text-[color:var(--color-text-muted)]"
                >
                  {toMonthDay(post.date)}
                </time>
                <span className="text-[15px] font-semibold leading-6 tracking-[-0.01em] [word-break:keep-all]">
                  {post.title}
                </span>
              </Link>
            ))}
          </nav>
        ) : null}

        <Link href="/posts" className="accent-link mt-4 inline-flex gap-1.5 text-sm font-semibold">
          전체 글 보기
        </Link>
      </div>

      <EditorHero hintPosts={hintPosts} />
    </section>
  );
}
