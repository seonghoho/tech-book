type Props = {
  title: string;
  date: string;
  contentHtml: string;
};

export default function PostContent({ title, date, contentHtml }: Props) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>{title}</h1>
      <p className="prose text-sm text-gray-500">{date}</p>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
