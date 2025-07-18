import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
// components
import ThemeInitializer from "@/components/ThemeInitializer";
import ClientHeaderWithSidebar from "@/components/ClientHeaderWithSidebar";
import SidebarContainer from "@/components/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import Loading from "@/app/posts/[...slug]/loading";

export const metadata = {
  title: "TechBook - 기술 블로그",
  description: "프론트엔드와 웹 기술을 정리한 기술 블로그입니다.",
  keywords: ["Next.js", "React", "Frontend", "기술 블로그", "Tech Blog"],
  authors: [
    { name: "Choi Seongho", url: "https://tech-book-lime.vercel.app/" },
  ],
  openGraph: {
    title: "TechBook",
    description: "프론트엔드와 웹 기술을 정리한 기술 블로그입니다.",
    url: "https://tech-book-lime.vercel.app/",
    siteName: "TechBook",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechBook",
    description: "프론트엔드와 웹 기술을 정리한 기술 블로그입니다.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://tech-book-lime.vercel.app"),
  verification: {
    google: "rcy_pt8MaVt2F6XAtMBTNX_w5pRzOZ0KykSGdw71p-U",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postData = getPostsByCategory("post");
  const gameData = getPostsByCategory("game");

  return (
    <html lang="ko">
      <Analytics />
      <SpeedInsights />
      <body className="flex flex-col w-full min-h-screen bg-white dark:bg-[#0F0F0F] text-dark dark:text-bright">
        <ThemeInitializer />
        <ClientHeaderWithSidebar Sidebar={<SidebarContainer postData={postData} gameData={gameData} />} />

        <div className="flex w-full flex-1 lg:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="hidden lg:block w-0 lg:w-64 shrink-0 border-r border-border sticky-section">
            <SidebarContainer postData={postData} gameData={gameData} />
          </aside>

          <main className="w-full lg:w-[calc(100%-256px)]">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
