import type { Metadata } from "next";
import { absoluteUrl, SITE_CONFIG } from "./site.ts";

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

// 글 날짜는 frontmatter에 "YYYY-MM-DD"로 적고 한국 시간 기준으로 발행한다.
// new Date("2026-10-22")는 UTC 자정(한국 오전 9시)이 되므로 +09:00을 붙여 넘긴다.
export function toKstIsoDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00+09:00` : new Date(date).toISOString();
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
    inLanguage: "ko-KR",
    keywords: tags?.length ? tags : undefined,
    articleSection: category,
    author: {
      "@type": "Person",
      "@id": authorId,
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
      sameAs: SITE_CONFIG.author.sameAs,
    },
    publisher: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };
}

// 글쓴이 엔터티. AI 답변 엔진이 "누가 쓴 글인가"를 About 페이지와 이어 볼 수 있게 @id를 고정한다.
const authorId = `${SITE_CONFIG.author.url}#person`;

function buildPersonJsonLd() {
  return {
    "@type": "Person",
    "@id": authorId,
    name: SITE_CONFIG.author.name,
    alternateName: SITE_CONFIG.author.englishName,
    url: SITE_CONFIG.author.url,
    jobTitle: "Frontend Engineer",
    description: SITE_CONFIG.author.bio,
    sameAs: SITE_CONFIG.author.sameAs,
  };
}

export function buildProfilePageJsonLd({ path }: { path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(path),
    inLanguage: "ko-KR",
    mainEntity: buildPersonJsonLd(),
  };
}

// 홈: 블로그 자체와 최근 글. 글 상세의 BlogPosting과 같은 글쓴이 @id를 가리킨다.
export function buildBlogJsonLd({
  description,
  posts,
}: {
  description: string;
  posts: { title: string; path: string; datePublished: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: siteDefaults.siteName,
    url: absoluteUrl("/"),
    description,
    inLanguage: "ko-KR",
    author: buildPersonJsonLd(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(post.path),
      datePublished: post.datePublished,
      author: { "@id": authorId },
    })),
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

// 글 목록 페이지용. 현재 페이지에 보이는 글만 ItemList로 담는다.
export function buildCollectionPageJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.name,
        url: absoluteUrl(entry.path),
      })),
    },
  };
}
