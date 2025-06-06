import "./globals.css";
import Sidebar from "../components/Sidebar";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col h-screen bg-white dark:bg-black text-black dark:text-white">
        <Header />

        {/* 모바일 드로어용 Sidebar */}
        <aside
          id="sidebar-drawer"
          className="lg:hidden fixed top-14 left-0 w-3/4 h-full z-40 bg-white dark:bg-black border-r p-4 hidden"
        >
          <Sidebar />
        </aside>

        {/* 전체 콘텐츠 레이아웃 */}
        <div className="flex flex-1 h-auto max-w-screen-2xl mx-auto w-full px-4 sm:px-6 md:px-8">
          {/* 고정형 Sidebar (lg 이상에서만 보임) */}
          <aside className="hidden lg:block w-64 shrink-0 border-r border-border p-4">
            <Sidebar />
          </aside>

          {/* 본문 영역 */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
