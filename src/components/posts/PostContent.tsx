import Image from "next/image";
import Link from "next/link";
import AuthorBox from "./AuthorBox";
import GiscusComments from "./GiscusComments";
import { PostNavCard } from "./PostNavCard";
import PostCodeCopyEnhancer from "./PostCodeCopyEnhancer";
import { POST_BODY_CLASS_NAME } from "./postBodyClassName";
import { PostNav } from "@/types/post";
import { categoryMap } from "@/lib/categoryMap";
import { formatDotDate } from "@/lib/formatDate";

type ProjectInfo = {
  summary: string;
  image: string;
  techStack: string[];
  highlights?: string[];
  playUrl?: string;
};

type RelatedLink = {
  title: string;
  url: string;
  categoryLabel: string;
};

type Props = {
  title: string;
  date: string;
  updated?: string;
  readingTime?: number;
  description?: string;
  tags?: string[];
  category?: string;
  contentHtml: string;
  prevPost?: PostNav | null;
  nextPost?: PostNav | null;
  projectInfo?: ProjectInfo | null;
  relatedLinks?: RelatedLink[];
};

export default function PostContent({
  title,
  date,
  updated,
  readingTime,
  description,
  tags,
  category,
  contentHtml,
  prevPost,
  nextPost,
  projectInfo,
  relatedLinks,
}: Props) {
  return (
    <article className="page-shell w-full">
      <PostCodeCopyEnhancer />
      <div className="mx-auto w-full max-w-[86ch]">
        <nav
          aria-label="breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1.5 text-[13px] text-[color:var(--color-text-muted)]"
        >
          <Link href="/posts" className="transition-colors hover:text-[color:var(--color-accent)]">
            글
          </Link>
          {category ? (
            <>
              <span aria-hidden="true">/</span>
              <Link
                href={`/categories/${category}`}
                className="transition-colors hover:text-[color:var(--color-accent)]"
              >
                {categoryMap[category] ?? category}
              </Link>
            </>
          ) : null}
        </nav>

        <header className="border-b border-[color:var(--color-border)] pb-6">
          <h1 className="text-[1.75rem] font-bold leading-snug tracking-[-0.02em] text-[color:var(--color-text-primary)] [word-break:keep-all] sm:text-[2.125rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-[color:var(--color-text-secondary)] [word-break:keep-all]">
              {description}
            </p>
          ) : null}
          <p className="mt-4 text-[13px] tabular-nums text-[color:var(--color-text-muted)]">
            <time dateTime={date}>{formatDotDate(date)}</time>
            {readingTime ? <span> · {readingTime}분</span> : null}
            {updated && updated !== date ? (
              <span>
                {" "}
                · 수정 <time dateTime={updated}>{formatDotDate(updated)}</time>
              </span>
            ) : null}
          </p>
          {tags?.length ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[color:var(--color-text-muted)]">
              {tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="transition-colors hover:text-[color:var(--color-accent)]"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {projectInfo ? (
          <div className="surface-panel mt-8 grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
            <div className="relative h-56 w-full overflow-hidden rounded-xl md:h-full">
              <Image
                src={projectInfo.image}
                alt={`${title} 썸네일`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-4">
              <p className="body-copy">{projectInfo.summary}</p>
              <div className="flex flex-wrap gap-2">
                {projectInfo.techStack.map((stack) => (
                  <span key={stack} className="tag-chip text-xs sm:text-sm">
                    {stack}
                  </span>
                ))}
              </div>
              {projectInfo.highlights?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-sm text-[color:var(--color-text-secondary)]">
                  {projectInfo.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {projectInfo.playUrl ? (
                <Link href={projectInfo.playUrl} className="button-primary">
                  프로젝트 데모 플레이
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={`${POST_BODY_CLASS_NAME} mt-8 sm:mt-10`}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <AuthorBox />

        {relatedLinks?.length ? (
          <nav aria-labelledby="post-related-title" className="mt-10">
            <h2
              id="post-related-title"
              className="text-sm font-semibold text-[color:var(--color-text-primary)]"
            >
              함께 읽을 글
            </h2>
            <ul className="mt-2 border-t border-[color:var(--color-border)]">
              {relatedLinks.map((link) => (
                <li key={link.url} className="border-b border-[color:var(--color-border)]">
                  <Link
                    href={link.url}
                    className="flex items-baseline justify-between gap-4 py-3 text-[15px] text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out hover:text-[color:var(--color-accent)]"
                  >
                    <span className="[word-break:keep-all]">{link.title}</span>
                    <span className="shrink-0 text-xs text-[color:var(--color-text-muted)]">
                      {link.categoryLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {prevPost || nextPost ? (
          <nav
            aria-label="이전 글과 다음 글"
            className="mt-10 grid border-y border-[color:var(--color-border)] sm:grid-cols-2"
          >
            {prevPost ? <PostNavCard post={prevPost} direction="prev" /> : <div />}
            {nextPost ? <PostNavCard post={nextPost} direction="next" /> : <div />}
          </nav>
        ) : null}

        <GiscusComments />
      </div>
    </article>
  );
}
