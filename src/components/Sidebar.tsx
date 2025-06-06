import Link from "next/link";
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export default function Sidebar() {
  const postsByCategory = getPostsByCategory();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">카테고리별 글</h2>
      {Object.entries(postsByCategory).map(([category, posts]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-2">{category}</h3>
          <ul className="space-y-1 pl-2 border-l border-border">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`}>
                  <span className="hover:underline text-gray cursor-pointer">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
