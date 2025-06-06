import PostContent from "@/components/PostContent";
import PostIndex from "@/components/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/posts";
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export async function generateStaticParams() {
  const postsByCategory = getPostsByCategory();
  const allPosts = Object.values(postsByCategory).flat();

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

type PageProps = {
  params: { slug: string[] };
};

export default async function PostPage(props: PageProps) {
  const slugArray = await props.params.slug;

  if (!slugArray) throw new Error("Slug is missing.");

  const slug = slugArray.join("/");
  const post = await getPostData(slug);
  // 원본 마크다운에서 heading 추출
  const headings = extractHeadings(post.rawMarkdown);
  return (
    <div className="flex h-full">
      <main className="flex-1 overflow-y-auto border-border xl:border-r py-6 lg:px-6">
        <PostContent
          title={post.title}
          date={post.date}
          contentHtml={post.contentHtml}
        />
      </main>
      <aside className="hidden xl:flex xl:flex-col w-64 gap-6 bg-white dark:bg-zinc-900 sticky-section">
        <h2 className="text-xl font-bold px-6">목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
