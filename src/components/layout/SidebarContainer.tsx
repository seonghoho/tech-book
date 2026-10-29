"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { PostMeta } from "@/types/post";
import { gameCategoryMap } from "@/lib/gameCategoryMap";

type Props = {
  gameData: Record<string, PostMeta[]>;
};

// 왼쪽 레일은 게임 쪽에만 둔다. 글 쪽(/posts, /categories, /tags, /search)은 목록 위 카테고리 탭이
// 범위를 고르는 유일한 수단이고, 글 상세는 breadcrumb로 카테고리에 돌아간다. 레일과 탭이 같은
// 카테고리를 서로 다르게(펼치기 vs 거르기) 다루면 어느 쪽이 위계상 위인지 흐려진다.
export default function SidebarContainer({ gameData }: Props) {
  const pathname = usePathname();
  const isGamePath = pathname.startsWith("/games") || pathname.startsWith("/play");

  if (!isGamePath) {
    return null;
  }

  return (
    <aside className="sticky-section hidden shrink-0 border-r border-[color:var(--color-border)] pr-6 lg:block lg:w-64">
      <Sidebar data={gameData} categoryMap={gameCategoryMap} />
    </aside>
  );
}
