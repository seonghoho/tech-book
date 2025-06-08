type Props = {
  title: string;
  date: string;
  contentHtml: string;
};

export default function PostContent({ title, date, contentHtml }: Props) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>{title}</h1>
      <p className="prose text-sm dark:prose-invert">{date}</p>
      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
