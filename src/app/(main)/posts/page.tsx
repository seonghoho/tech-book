import { getPostsByCategory } from "@/lib/getPostsByCategory";
import PostsList from "@/components/layout/PostsList";

export default function PostsPage() {
  const postsByCategory = getPostsByCategory('posts');

  return (
    <main className="sm:p-8 py-8">
      <PostsList postsByCategory={postsByCategory} type="posts" />
    </main>
  );
}
