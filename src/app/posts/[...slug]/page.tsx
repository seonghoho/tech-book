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

export default async function PostPage({ params }: PageProps) {
  const slug = params.slug?.join("/");
  if (!slug) {
    throw new Error("Slug is missing or invalid.");
  }

  const post = await getPostData(slug);
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
      <aside className="hidden xl:flex xl:flex-col w-64 gap-6 sticky-section">
        <h2 className="text-xl font-bold px-6">목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
