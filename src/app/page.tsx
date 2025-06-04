import { getAllPosts } from "@/lib/getAllPosts";
import Link from "next/link";

export default async function Home() {
  const posts = getAllPosts(); // 동기 함수이면 이대로 사용 가능

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">📚 블로그 글 목록</h1>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>
              <div className="text-blue-600 hover:underline cursor-pointer">
                {post.title}{" "}
                <span className="text-sm text-gray-500">({post.date})</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
