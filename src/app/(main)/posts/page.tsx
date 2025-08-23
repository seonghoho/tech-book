import { getPostsByCategory } from "@/lib/getPostsByCategory";
import PostsList from "@/components/layout/PostsList";

export const metadata = {
  title: "Posts | TechBook",
  description: "프론트엔드, JavaScript, Three.js 등 다양한 기술 주제에 대한 포스트를 확인해보세요.",
};

export default function PostsPage() {
  const postsByCategory = getPostsByCategory('posts');

  return (
    <main className="sm:p-8 py-8">
      <PostsList postsByCategory={postsByCategory} type="posts" />
    </main>
  );
}
