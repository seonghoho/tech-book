import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const gameData = getPostsByCategory("games");

  return (
    <div className="stable-screen-min flex w-full flex-col">
      <div className="flex w-full flex-1 gap-6 2xl:gap-8">
        <SidebarContainer gameData={gameData} />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
