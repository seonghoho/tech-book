import Image from "next/image";
import Link from "next/link";
import { PostNavCard } from "./PostNavCard";
import { PostNav } from "@/types/post";

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
  categoryLabel?: string;
};

type Props = {
  title: string;
  date: string;
  description: string;
  contentHtml: string;
  prevPost?: PostNav | null;
  nextPost?: PostNav | null;
  projectInfo?: ProjectInfo | null;
  relatedLinks?: RelatedLink[];
};

export default function PostContent({
  title,
  date,
  description,
  contentHtml,
  prevPost,
  nextPost,
  projectInfo,
  relatedLinks,
}: Props) {
  return (
    <article className="prose dark:prose-invert w-full">
      <div className="max-w-full lg:max-w-screen-lg w-full lg:px-8 px-1 mx-auto">
        <div className="sm:text-3xl font-semibold text-2xl pb-4">{title}</div>
        <div className="flex sm:flex-row flex-col sm:items-center justify-between pb-4 gap-2">
          <div className="flex items-center sm:text-lg text-base text-gray-500 dark:text-gray-400">
            {description}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {date}
          </div>
        </div>
        <div className="w-full pb-4 border-t-2 border-t-[#d9d9d9]" />

        {projectInfo ? (
          <div className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-zinc-900/60 p-4 sm:p-6 grid gap-6 md:grid-cols-2">
            <div className="relative h-56 md:h-full w-full overflow-hidden rounded-xl">
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
              <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                {projectInfo.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {projectInfo.techStack.map((stack) => (
                  <span
                    key={stack}
                    className="px-3 py-1 text-sm rounded-full bg-white text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                  >
                    {stack}
                  </span>
                ))}
              </div>
              {projectInfo.highlights?.length ? (
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                  {projectInfo.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {projectInfo.playUrl ? (
                <Link
                  href={projectInfo.playUrl}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition"
                >
                  프로젝트 데모 플레이
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {relatedLinks && relatedLinks.length > 0 ? (
          <div className="mt-10 border border-gray-200 dark:border-gray-800 rounded-xl bg-white/70 dark:bg-zinc-900/70">
            <div className="px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800">
              더 이어서 읽어보기
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {relatedLinks.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  className="group rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-zinc-900/60 p-3 hover:border-indigo-400 hover:shadow-sm transition"
                >
                  {link.categoryLabel ? (
                    <div className="text-xs uppercase tracking-wide text-indigo-500 mb-1">
                      {link.categoryLabel}
                    </div>
                  ) : null}
                  <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-500">
                    {link.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-row gap-4 py-8">
          {prevPost ? (
            <PostNavCard post={prevPost} direction="prev" />
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <PostNavCard post={nextPost} direction="next" />
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </article>
  );
}
