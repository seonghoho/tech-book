import Link from "next/link";
import { PostNavCard } from "./PostNavCard";
import { PostNav } from "@/types/post";

type Props = {
  title: string;
  date: string;
  description: string;
  contentHtml: string;
  prevPost?: PostNav | null;
  nextPost?: PostNav | null;
  slugString?: string | null;
};

export default function PostContent({
  title,
  date,
  description,
  contentHtml,
  prevPost,
  nextPost,
  slugString,
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
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        {slugString ? (
          <Link href={`/play/${slugString}`}>
            <div className="flex flex-col border-2 border-[#d9d9d9] rounded-lg p-4 mt-4 w-full hover:shadow-sm hover:border-green-500 transition-all bg-gray-50 text-[1.4rem] dark:bg-[#1a1a1a]">
              게임하러 가기
            </div>
          </Link>
        ) : (
          ""
        )}
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
