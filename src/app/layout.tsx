import "./globals.css";
import Sidebar from "../components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex flex-col h-screen">
        <header className="w-full h-14 bg-gray-900 text-white flex items-center px-6 border-b">
          <h1 className="text-lg font-bold">🧠 TECH BOOK</h1>
        </header>
        <div className="flex flex-1 h-auto">
          <aside className="w-1/5 border-r overflow-y-auto p-4">
            <Sidebar />
          </aside>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
