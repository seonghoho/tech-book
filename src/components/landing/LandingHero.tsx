import Link from "next/link";
import { formatDotDate } from "@/lib/formatDate";
import type { PostMeta } from "@/types/post";

type Props = {
  posts: PostMeta[];
};

// 홈 첫 화면. 장식 없이 소개 문장과 블로그 규모만 보여 주고, 바로 아래 글 목록으로 넘긴다.
export default function LandingHero({ posts }: Props) {
  const categoryCount = new Set(posts.map((post) => post.category).filter(Boolean)).size;
  const latestDate = posts[0]?.date;

  const stats = [
    { label: "글", value: `${posts.length}편` },
    { label: "주제", value: `${categoryCount}개` },
    ...(latestDate ? [{ label: "마지막 글", value: formatDotDate(latestDate) }] : []),
  ];

  return (
    <section className="pt-4 sm:pt-10 lg:pt-14">
      <p className="text-sm font-medium text-[color:var(--color-text-muted)]">
        Seonghoho · Frontend Engineer
      </p>
      {/* 데스크톱은 두 절을 한 줄씩 끊어 색 경계와 줄 경계를 맞추고, 좁은 화면은 어절 단위로 자연스럽게 감싼다. */}
      <h1 className="mt-4 text-[clamp(30px,4.6vw,50px)] font-semibold leading-[1.2] tracking-[-0.045em] text-[color:var(--color-text-primary)] [word-break:keep-all]">
        <span className="sm:block">웹 서비스를 만들며 부딪힌 문제를</span>{" "}
        <span className="text-[color:var(--color-text-muted)] sm:block">
          다시 꺼내 볼 수 있게 기록합니다
        </span>
      </h1>
      <p className="mt-5 max-w-[42em] text-base leading-8 text-[color:var(--color-text-secondary)] [text-wrap:pretty] [word-break:keep-all]">
        <span className="sm:block">SVG 에디터와 Three.js 교구부터 테스트, 웹 성능까지.</span>{" "}
        <span className="sm:block">웹 서비스와 앱을 만들며 겪은 문제와 해결 과정을 정리합니다.</span>
      </p>

      <div className="mt-8 flex flex-col gap-6 border-t border-[color:var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <dl className="flex gap-8 sm:gap-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-[color:var(--color-text-muted)]">{stat.label}</dt>
              <dd className="mt-1 text-[15px] font-semibold tabular-nums text-[color:var(--color-text-primary)]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2">
          <Link href="/posts" className="button-primary">
            전체 글 보기
          </Link>
          <Link href="/about" className="button-secondary">
            소개
          </Link>
        </div>
      </div>
    </section>
  );
}
