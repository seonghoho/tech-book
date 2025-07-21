"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { PostMeta } from "@/types/post";
import { categoryMap } from "@/lib/categoryMap";
import { gameCategoryMap } from "@/lib/gameCategoryMap";

type Props = {
  postData: Record<string, PostMeta[]>;
  gameData: Record<string, PostMeta[]>;
};

export default function SidebarContainer({ postData, gameData }: Props) {
  const pathname = usePathname();
  const isPostPath = pathname.startsWith("/posts");

  const data = isPostPath ? postData : gameData;
  const currentCategoryMap = isPostPath ? categoryMap : gameCategoryMap;

  return <Sidebar data={data} categoryMap={currentCategoryMap} />;
}
