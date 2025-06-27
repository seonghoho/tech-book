import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
// components
import ThemeInitializer from "@/components/ThemeInitializer";
import ClientHeaderWithSidebar from "@/components/ClientHeaderWithSidebar";
import Sidebar from "@/components/Sidebar";
import SidebarServer from "@/components/Sidebar.server";
import Loading from "@/app/posts/[...slug]/loading";
// function
import { getPostsByCategory } from "@/lib/getPostsByCategory";

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
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postsByCategory = getPostsByCategory();
  return (
    <html lang="ko" className="h-full">
      <Analytics />
      <SpeedInsights />
      <body className="flex flex-col w-full h-full bg-white dark:bg-dark text-dark dark:text-bright">
        <ThemeInitializer />
        <ClientHeaderWithSidebar Sidebar={<SidebarServer />} />

        <div className="flex w-full h-full lg:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="hidden lg:block w-0 lg:w-64 shrink-0 border-r border-border sticky-section">
            <Sidebar data={postsByCategory} />
          </aside>

          <main className="w-full lg:w-[calc(100%-256px)] h-[calc(100vh-65px)]">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
