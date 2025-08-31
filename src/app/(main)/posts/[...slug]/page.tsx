import PostIndex from "@/components/posts/PostIndex";
import { extractHeadings } from "@/lib/getPostContent";
import { getPostData } from "@/lib/getPostData";

import { getPostsByCategory } from "@/lib/getPostsByCategory";
import dynamic from "next/dynamic";

const PostContent = dynamic(() => import("@/components/posts/PostContent"), {
  ssr: true, 
});

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export function generateStaticParams(): { slug: string[] }[] {
  const postsByCategory = getPostsByCategory("posts");
  const allPosts = Object.values(postsByCategory).flat();

  return allPosts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const slugString = slug.join("/");
  const post = await getPostData("posts", slugString);

  const excerpt = post.rawMarkdown.substring(0, 150).replace(/\n/g, " ");

  return {
    title: post.title,
    description: post.description ?? excerpt,
    openGraph: {
      title: post.title,
      description: post.description ?? excerpt,
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

  const postsByCategory = getPostsByCategory("posts");
  const allPosts = Object.values(postsByCategory).flat();

  const post = await getPostData("posts", slugString);
  const headings = extractHeadings(post.rawMarkdown);

  const currentIndex = allPosts.findIndex((p) => p.slug === slugString);

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tech-book-lime.vercel.app/posts/${slugString}`,
    },
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    author: {
      "@type": "Person",
      name: "Choi Seongho",
    },
    publisher: {
      "@type": "Organization",
      name: "TechBook",
      logo: {
        "@type": "ImageObject",
        url: "https://tech-book-lime.vercel.app/og-image.png",
      },
    },
  };

  return (
    <div className="flex w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
