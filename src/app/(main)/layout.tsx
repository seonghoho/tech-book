import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import Loading from "@/app/(main)/posts/[...slug]/loading";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postData = getPostsByCategory("posts");
  const gameData = getPostsByCategory("games");

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex w-full flex-1 lg:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <aside className="hidden lg:block w-0 lg:w-64 shrink-0 border-r border-border sticky-section">
          <SidebarContainer postData={postData} gameData={gameData} />
        </aside>

        <main className="w-full lg:w-[calc(100%-256px)]">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
