import Footer from "@/components/Footer";
import { PostNavCard } from "@/components/PostNavCard";
import { PostNav } from "@/types/post";

type Props = {
  title: string;
  date: string;
  description: string;
  contentHtml: string;
  prevPost?: PostNav | null;
  nextPost?: PostNav | null;
};

export default function PostContent({
  title,
  date,
  description,
  contentHtml,
  prevPost,
  nextPost,
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
        <Footer />
      </div>
    </article>
  );
}
