import PostContent from "@/components/PostContent";
import PostIndex from "@/components/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/posts";
import { getAllPosts } from "@/lib/getAllPosts";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type PageProps = {
  params: { slug: string };
};

export default async function PostPage(props: PageProps) {
  const { slug } = await props.params;

  if (!slug) throw new Error("Slug is missing.");

  const post = await getPostData(slug);
  // 원본 마크다운에서 heading 추출
  const headings = extractHeadings(post.rawMarkdown);
  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <PostContent
          title={post.title}
          date={post.date}
          contentHtml={post.contentHtml}
        />
      </main>
      <aside className="w-1/5 border-l p-4">
        <h2 className="text-xl font-bold mb-4">🧭 목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
