import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
// components
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import ThemeInitializer from "@/components/common/ThemeInitializer";
import Footer from "@/components/common/Footer";
import ClientHeaderWithSidebar from "@/components/layout/ClientHeaderWithSidebar";
import SidebarContainer from "@/components/layout/SidebarContainer";
import { getPostsByCategory } from "@/lib/getPostsByCategory";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { siteDefaults } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: siteDefaults.title,
    template: "%s | TechBook",
  },
  description: siteDefaults.description,
  keywords: siteDefaults.keywords,
  authors: [{ name: "Choi Seongho", url: absoluteUrl("/") }],
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    title: siteDefaults.title,
    description: siteDefaults.description,
    url: absoluteUrl("/"),
    siteName: siteDefaults.siteName,
    images: [
      {
        url: absoluteUrl(siteDefaults.defaultImage),
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteDefaults.siteName,
    description: siteDefaults.description,
    images: [absoluteUrl(siteDefaults.defaultImage)],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: getSiteUrl(),
    name: siteDefaults.siteName,
    description: siteDefaults.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/posts?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="ko">
      <body className="flex flex-col w-full min-h-screen bg-white dark:bg-[#0F0F0F] text-dark dark:text-bright">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
        >
          본문으로 바로가기
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeInitializer />
        <ClientHeaderWithSidebar
          Sidebar={<SidebarContainer postData={postData} gameData={gameData} />}
        />
        <main
          id="main-content"
          className="w-full flex-1 lg:max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8"
        >
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
