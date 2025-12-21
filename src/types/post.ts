export type PostNav = {
  title: string;
  url: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
  updated?: string;
  readingTime?: number;
  featured?: boolean;
  image?: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
  updated?: string;
  readingTime?: number;
  featured?: boolean;
  image?: string;
};
