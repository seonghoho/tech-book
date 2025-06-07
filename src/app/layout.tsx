import "@/styles/globals.css";
import ClientHeaderWithSidebar from "@/components/ClientHeaderWithSidebar";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="">
      <body className="flex flex-col h-full bg-white dark:bg-black text-black dark:text-white">
        <ClientHeaderWithSidebar Sidebar={<Sidebar />} />

        <div className="flex flex-1 h-full max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <aside className="hidden lg:block w-64 shrink-0 border-r border-border sticky-section">
            <Sidebar />
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
