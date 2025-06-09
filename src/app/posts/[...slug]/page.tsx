import PostContent from "@/components/PostContent";
import PostIndex from "@/components/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/posts";
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export function generateStaticParams(): { slug: string[] }[] {
  const postsByCategory = getPostsByCategory();
  const allPosts = Object.values(postsByCategory).flat();

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

interface PageProps {
  params: Promise<{ slug: string[] }>; // 비동기 타입
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");

  if (!slugString) throw new Error("Slug is missing.");

  const post = await getPostData(slugString);
  const headings = extractHeadings(post.rawMarkdown);

  return (
    <div className="flex w-full h-full">
      <main className="flex flex-1 overflow-y-auto scrollbar-hide xl:border-border xl:border-r py-6">
        <PostContent
          title={post.title}
          date={post.date}
          contentHtml={post.contentHtml}
        />
      </main>
      <aside className="hidden xl:flex xl:flex-col w-64 gap-6 sticky-section">
        <h2 className="text-xl font-bold px-6">목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
