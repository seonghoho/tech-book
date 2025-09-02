export type PostNav = {
  title: string;
  url: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};
