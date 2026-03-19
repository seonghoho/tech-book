import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import Loading from "@/app/(main)/posts/[...slug]/loading";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const postData = getPostsByCategory("posts");
  const gameData = getPostsByCategory("games");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarContainer postData={postData} gameData={gameData} variant="mobile-subnav" />
      <div className="mx-auto flex w-full max-w-[1360px] flex-1 gap-8 px-4 sm:px-6 lg:px-8">
        <aside className="sticky-section hidden w-0 shrink-0 border-r border-[color:var(--color-border)] pr-6 lg:block lg:w-64">
          <SidebarContainer postData={postData} gameData={gameData} />
        </aside>

        <main className="w-full min-w-0 lg:w-[calc(100%-256px)]">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
