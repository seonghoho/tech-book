import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import Loading from "@/app/(main)/posts/[...slug]/loading";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const postData = getPostsByCategory("posts");
  const gameData = getPostsByCategory("games");

  return (
    <div className="stable-screen-min flex w-full flex-col">
      <SidebarContainer postData={postData} gameData={gameData} variant="mobile-subnav" />
      <div className="flex w-full flex-1 gap-6 2xl:gap-8">
        <aside className="sticky-section hidden shrink-0 border-r border-[color:var(--color-border)] pr-6 lg:block lg:w-64">
          <SidebarContainer postData={postData} gameData={gameData} />
        </aside>

        <main className="min-w-0 flex-1">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
