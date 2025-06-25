import Footer from "@/components/Footer";

type Props = {
  title: string;
  date: string;
  description: string;
  contentHtml: string;
};

export default function PostContent({
  title,
  date,
  description,
  contentHtml,
}: Props) {
  return (
    <article className="prose dark:prose-invert w-full max-w-none">
      <div className="max-w-full lg:max-w-screen-lg w-full lg:px-8 mx-auto">
        <h1>{title}</h1>
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center text-lg text-gray-500 dark:text-gray-400">
            {description}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            {date}
          </div>
        </div>
        <div className="w-full pb-4 border-t-2 border-t-[#d9d9d9]" />
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        <Footer/>
      </div>
    </article>
  );
}
