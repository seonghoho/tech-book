// import PostContent from "@/components/PostContent";
import PostIndex from "@/components/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";

import { getPostsByCategory } from "@/lib/getPostsByCategory";
import dynamic from "next/dynamic";

const PostContent = dynamic(() => import("@/components/PostContent"), {
  ssr: true, // optional
});

interface PageProps {
  params: Promise<{ slug: string[] }>; // 비동기 타입
}

export function generateStaticParams(): { slug: string[] }[] {
  const postsByCategory = getPostsByCategory();
  const allPosts = Object.values(postsByCategory).flat();

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const post = await getPostData(slugString);

  return {
    title: post.title,
    description:
      post.description ?? `${post.title}에 대한 기술 블로그 포스트입니다.`,
    openGraph: {
      title: post.title,
      description: post.description ?? `${post.title} 관련 정보`,
      url: `https://tech-book-lime.vercel.app/posts/${slugString}`,
      siteName: "TechBook",
      images: [
        {
          url: `https://tech-book-lime.vercel.app/og/${slugString}`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "ko_KR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description ?? `${post.title} 관련 정보`,
      images: ["/og-image.png"],
    },
    metadataBase: new URL("https://tech-book-lime.vercel.app"),
    alternates: {
      canonical: `https://tech-book-lime.vercel.app/posts/${slugString}`,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");

  if (!slugString) throw new Error("Slug is missing.");

  // 모든 포스트 리스트 가져오기
  const postsByCategory = getPostsByCategory();
  const allPosts = Object.values(postsByCategory).flat();

  // 현재 포스트 정보
  const post = await getPostData(slugString);
  const headings = extractHeadings(post.rawMarkdown);

  // 현재 포스트의 index 찾기
  const currentIndex = allPosts.findIndex((p) => p.slug === slugString);

  // 이전/다음 포스트 정보 구하기
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <div className="flex w-full h-full">
      <main className="flex flex-1 overflow-y-auto scrollbar-hide xl:border-border xl:border-r py-6">
        <PostContent
          title={post.title}
          date={post.date}
          description={post.description}
          contentHtml={post.contentHtml}
          prevPost={
            prevPost
              ? { title: prevPost.title, url: `/posts/${prevPost.slug}` }
              : null
          }
          nextPost={
            nextPost
              ? { title: nextPost.title, url: `/posts/${nextPost.slug}` }
              : null
          }
        />
      </main>
      <aside className="hidden xl:flex xl:flex-col w-64 gap-6 sticky-section">
        <h2 className="text-xl font-bold px-6">목차</h2>
        <PostIndex headings={headings} />
      </aside>
    </div>
  );
}
