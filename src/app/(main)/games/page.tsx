import { getPostsByCategory } from "@/lib/getPostsByCategory";
import PostsList from "@/components/layout/PostsList";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Games | TechBook",
  description:
    "JavaScript와 Canvas, WebGL을 사용하여 만든 간단한 웹 게임들을 플레이해보세요.",
  path: "/games",
});

// ISR: 게임 로그 목록은 정적 생성 + 주기적 재검증.
export const dynamic = "force-static";
export const revalidate = 300;

// import GameCardList from "@/components/layout/GameCardList";

export default function GamesPage() {
  const postsByCategory = getPostsByCategory("games");

  return (
    <main className="flex flex-col h-3/4 sm:p-8 py-8">
      <div className="flex-1">
        <PostsList postsByCategory={postsByCategory} type="games" />
      </div>
      {/* <div className="flex-1">
        <GameCardList />
      </div> */}
    </main>
  );
}
