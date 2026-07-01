import type { Metadata } from "next";
import { absoluteUrl, SITE_CONFIG } from "./site";

export const siteDefaults = {
  siteName: SITE_CONFIG.name,
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: ["JavaScript", "Three.js", "SVG", "Frontend", "프론트엔드", "기술 블로그", "Tech Blog"],
  defaultImage: "/og-image.png",
};

type BuildMetadataOptions = {
  title: string;
  absoluteTitle?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  images?: { url: string; width?: number; height?: number }[];
  publishedTime?: string;
  modifiedTime?: string;
  robots?: Metadata["robots"];
};

export function buildPageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  type = "website",
  images,
  publishedTime,
  modifiedTime,
  robots,
}: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const resolvedTitle = absoluteTitle ?? title;
  const imageList = images ?? [
    {
      url: absoluteUrl(siteDefaults.defaultImage),
      width: 1200,
      height: 630,
    },
  ];

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords: siteDefaults.keywords,
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.name,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteDefaults.siteName,
      images: imageList,
      locale: SITE_CONFIG.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: imageList.map((img) => img.url),
    },
    robots,
    ...(type === "article"
      ? {
          openGraph: {
            title: resolvedTitle,
            description,
            url,
            siteName: siteDefaults.siteName,
            images: imageList,
            locale: SITE_CONFIG.locale,
            type: "article",
            publishedTime,
            modifiedTime,
            authors: [SITE_CONFIG.author.name],
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
  tags,
  category,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  tags?: string[];
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path),
    },
    url: absoluteUrl(path),
    headline: title,
    description,
    image: absoluteUrl(image),
    datePublished,
    dateModified: dateModified ?? datePublished,
    keywords: tags?.length ? tags : undefined,
    articleSection: category,
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };
}

export function buildBreadcrumbJsonLd({ items }: { items: { name: string; item: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.item.startsWith("/") ? entry.item : `/${entry.item}`),
    })),
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
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };
}
