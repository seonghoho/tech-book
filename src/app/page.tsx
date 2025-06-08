import { getPostsByCategory } from "@/lib/getPostsByCategory";
import { categoryMap } from "@/lib/categoryMap";
import Link from "next/link";

export default function Home() {
  const postsByCategory = getPostsByCategory();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">글 목록</h1>
      {Object.entries(postsByCategory).map(([category, posts]) => (
        <div key={category} className="mb-4 border rounded">
          <div className="w-full text-left px-4 py-2 bg-green-100 dark:bg-zinc-800 font-semibold rounded-t">
            {categoryMap[category] ?? category}
          </div>
          {category && (
            <ul className="pl-6 pr-4 py-2 space-y-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`}>
                    <div className="flex justify-between text-gray hover:underline cursor-pointer">
                      {post.title}{" "}
                      <span className="text-sm text-gray-500">
                        ({post.date})
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </main>
  );
}
