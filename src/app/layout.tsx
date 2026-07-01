import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
// components
import GoogleAdsense from "@/components/common/GoogleAdsense";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import ThemeInitializer from "@/components/common/ThemeInitializer";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import ClientHeaderWithSidebar from "@/components/layout/ClientHeaderWithSidebar";
import { absoluteUrl, SITE_CONFIG } from "@/lib/site";
import { siteDefaults } from "@/lib/seo";
import { ADSENSE_CLIENT_ID } from "@/lib/adsense";

export const metadata: Metadata = {
  title: {
    default: siteDefaults.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: siteDefaults.description,
  keywords: siteDefaults.keywords,
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
  creator: SITE_CONFIG.author.name,
  publisher: SITE_CONFIG.name,
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: "/",
  },
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
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteDefaults.title,
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
  other: {
    "google-adsense-account": ADSENSE_CLIENT_ID,
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE_CONFIG.url,
    name: siteDefaults.siteName,
    description: siteDefaults.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/posts?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="ko" suppressHydrationWarning style={{ colorScheme: "light" }}>
      <head />
      <body className="stable-screen-min flex w-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[color:var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--color-text-primary)] focus:shadow-lg"
        >
          본문으로 바로가기
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeInitializer />
        <Header actions={<ClientHeaderWithSidebar />} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1360px] flex-1 px-4 sm:px-6 lg:px-8"
        >
          {children}
        </main>
        <Footer />
        <GoogleAdsense />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
