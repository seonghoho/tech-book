import "@/styles/globals.css";
import { Suspense } from "react";
// components
import ThemeInitializer from "@/components/ThemeInitializer";
import ClientHeaderWithSidebar from "@/components/ClientHeaderWithSidebar";
import Sidebar from "@/components/Sidebar";
import SidebarServer from "@/components/Sidebar.server";
import Loading from "@/app/posts/[...slug]/loading";
// function
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postsByCategory = getPostsByCategory();
  return (
    <html lang="ko" className="h-full">
      <body className="flex flex-col w-full h-full bg-white dark:bg-dark text-dark dark:text-bright">
        <ThemeInitializer />
        <ClientHeaderWithSidebar Sidebar={<SidebarServer />} />

        <div className="flex w-full h-full lg:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="hidden lg:block w-0 lg:w-64 shrink-0 border-r border-border sticky-section">
            <Sidebar data={postsByCategory} />
          </aside>

          <main className="w-full lg:w-[calc(100%-256px)] h-[calc(100vh-65px)]">
            {children}
          </main>
          <Suspense fallback={<Loading />} />
        </div>
      </body>
    </html>
  );
}
