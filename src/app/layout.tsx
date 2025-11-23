import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// components
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import ThemeInitializer from "@/components/common/ThemeInitializer";
import Footer from "@/components/common/Footer";
import ClientHeaderWithSidebar from "@/components/layout/ClientHeaderWithSidebar";
import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import { getSiteUrl } from "@/lib/site";

export const metadata = {
  title: "TechBook: 개발자를 위한 기술 블로그",
  description:
    "Modern JavaScript, Three.js, SVG 등 프론트엔드 기술을 깊이 있게 다루는 기술 블로그입니다.",
  keywords: [
    "JavaScript",
    "Three.js",
    "SVG",
    "Frontend",
    "프론트엔드",
    "기술 블로그",
    "Tech Blog",
  ],
  authors: [{ name: "Choi Seongho", url: getSiteUrl() + "/" }],
  openGraph: {
    title: "TechBook: 개발자를 위한 기술 블로그",
    description:
      "Modern JavaScript, Three.js, SVG 등 프론트엔드 기술을 깊이 있게 다루는 기술 블로그입니다.",
    url: getSiteUrl() + "/",
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
  metadataBase: new URL(getSiteUrl()),
  verification: {
    google: "rcy_pt8MaVt2F6XAtMBTNX_w5pRzOZ0KykSGdw71p-U",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const postData = getPostsByCategory("posts");
  const gameData = getPostsByCategory("games");
  return (
    <html lang="ko">
      <body className="flex flex-col w-full min-h-screen bg-white dark:bg-[#0F0F0F] text-dark dark:text-bright">
        <ThemeInitializer />
        <ClientHeaderWithSidebar
          Sidebar={<SidebarContainer postData={postData} gameData={gameData} />}
        />
        <main className="w-full flex-1 lg:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
