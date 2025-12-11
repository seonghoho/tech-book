import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "./site";

export const siteDefaults = {
  siteName: "TechBook",
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
  defaultImage: "/og-image.png",
};

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  images?: { url: string; width?: number; height?: number }[];
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  images,
  publishedTime,
  modifiedTime,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const imageList =
    images ??
    [
      {
        url: absoluteUrl(siteDefaults.defaultImage),
        width: 1200,
        height: 630,
      },
    ];

  return {
    title,
    description,
    keywords: siteDefaults.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteDefaults.siteName,
      images: imageList,
      locale: "ko_KR",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageList.map((img) => img.url),
    },
    metadataBase: new URL(getSiteUrl()),
    ...(type === "article"
      ? {
          openGraph: {
            title,
            description,
            url,
            siteName: siteDefaults.siteName,
            images: imageList,
            locale: "ko_KR",
            type: "article",
            publishedTime,
            modifiedTime,
          },
        }
      : {}),
  };
}

export function buildArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image = absoluteUrl(siteDefaults.defaultImage),
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path),
    },
    headline: title,
    description,
    image,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Person",
      name: "Choi Seongho",
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: siteDefaults.siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteDefaults.defaultImage),
      },
    },
  };
}

export function buildProjectJsonLd({
  title,
  description,
  path,
  image,
  technologies,
}: {
  title: string;
  description: string;
  path: string;
  image: string;
  technologies: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "Game",
    name: title,
    description,
    operatingSystem: "Web",
    image: absoluteUrl(image),
    url: absoluteUrl(path),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareRequirements: technologies.join(", "),
    author: {
      "@type": "Person",
      name: "Choi Seongho",
    },
  };
}
