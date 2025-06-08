type Props = {
  title: string;
  date: string;
  contentHtml: string;
};

export default function PostContent({ title, date, contentHtml }: Props) {
  return (
    <article className="prose dark:prose-invert w-full max-w-none">
      <div className="max-w-full lg:max-w-screen-lg w-full lg:px-8 mx-auto">
        <h1>{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </article>
  );
}
