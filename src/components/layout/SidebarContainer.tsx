"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { PostMeta } from "@/types/post";
import { categoryMap } from "@/lib/categoryMap";
import { gameCategoryMap } from "@/lib/gameCategoryMap";

type Props = {
  postData: Record<string, PostMeta[]>;
  gameData: Record<string, PostMeta[]>;
  variant?: "rail" | "mobile-subnav";
};

const isWritingPath = (pathname: string) =>
  pathname === "/posts" ||
  pathname.startsWith("/posts/") ||
  pathname.startsWith("/categories/") ||
  pathname.startsWith("/tags/") ||
  pathname.startsWith("/search");

export default function SidebarContainer({ postData, gameData, variant = "rail" }: Props) {
  const pathname = usePathname();
  const isGamePath = pathname.startsWith("/games") || pathname.startsWith("/play");

  if (variant === "mobile-subnav") {
    if (!isWritingPath(pathname)) {
      return null;
    }

    return (
      <div className="pb-4 pt-4 lg:hidden">
        <Sidebar data={postData} categoryMap={categoryMap} scope="posts" variant="mobile-subnav" />
      </div>
    );
  }

  const data = isGamePath ? gameData : postData;
  const currentCategoryMap = isGamePath ? gameCategoryMap : categoryMap;

  return <Sidebar data={data} categoryMap={currentCategoryMap} variant={variant} />;
}
