import Image from "next/image";
import Link from "next/link";
import AuthorBox from "./AuthorBox";
import GiscusComments from "./GiscusComments";
import { PostNavCard } from "./PostNavCard";
import PostCodeCopyEnhancer from "./PostCodeCopyEnhancer";
import { PostNav } from "@/types/post";
import { categoryMap } from "@/lib/categoryMap";
import { formatDate } from "@/lib/formatDate";

type ProjectInfo = {
  summary: string;
  image: string;
  techStack: string[];
  highlights?: string[];
  playUrl?: string;
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
  relatedLinks?: unknown[];
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
}: Props) {
  return (
    <article className="page-shell w-full">
      <PostCodeCopyEnhancer />
      <div className="mx-auto w-full max-w-[86ch]">
        <nav
          aria-label="breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-muted)]"
        >
          <Link href="/posts" className="accent-link">
            Posts
          </Link>
          {category ? (
            <>
              <span>/</span>
              <Link href={`/categories/${category}`} className="accent-link">
                {categoryMap[category] ?? category}
              </Link>
            </>
          ) : null}
        </nav>

        <header className="surface-panel p-5 sm:p-7 lg:p-8">
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-[1.8rem] font-semibold leading-tight text-[color:var(--color-text-primary)] sm:text-[2.25rem] lg:text-[2.55rem]">
                {title}
              </h1>
              {description ? <p className="body-copy">{description}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {category ? (
                <Link href={`/categories/${category}`} className="tag-chip">
                  {categoryMap[category] ?? category}
                </Link>
              ) : null}
              {tags?.map((tag) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="tag-chip">
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-4 text-sm text-[color:var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4">
                <span>{formatDate(date)}</span>
                {readingTime ? <span>{readingTime}분 읽기</span> : null}
              </div>
              <div className="flex flex-wrap gap-4">
                {updated ? <span>마지막 수정: {formatDate(updated)}</span> : null}
              </div>
            </div>
          </div>
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
          className="post-body prose mt-8 max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:leading-tight prose-h1:text-[1.85rem] prose-h2:mt-12 prose-h2:text-[1.45rem] prose-h3:mt-9 prose-h3:text-[1.18rem] prose-p:my-5 prose-p:text-[15px] prose-p:leading-8 prose-a:font-medium prose-blockquote:my-8 prose-blockquote:px-5 prose-blockquote:py-4 prose-li:my-1.5 prose-li:text-[15px] prose-li:leading-8 prose-ul:my-5 prose-ol:my-5 sm:mt-10 sm:prose-h1:text-[2.2rem] sm:prose-h2:text-[1.7rem] sm:prose-h3:text-[1.3rem] sm:prose-p:text-base sm:prose-p:leading-8 sm:prose-li:text-base"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <AuthorBox />

        <GiscusComments />

        <div className="grid gap-3 py-8 sm:grid-cols-2 sm:gap-4 sm:py-10">
          {prevPost ? <PostNavCard post={prevPost} direction="prev" /> : <div />}
          {nextPost ? <PostNavCard post={nextPost} direction="next" /> : <div />}
        </div>
      </div>
    </article>
  );
}
