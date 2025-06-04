import Link from "next/link";
import { getAllPosts } from "@/lib/getAllPosts";

export default function Sidebar() {
  const posts = getAllPosts();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📚 글 목록</h2>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>
              <span className="hover:underline text-blue-600">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
