import type { PostMeta } from "@/types/post";

export type PostsArchiveSearchParams = {
  query?: string;
  tag?: string;
  category?: string;
  page?: string;
};

export type PostsArchiveCategoryTab = {
  label: string;
  value: string;
  count: number;
};

type PostsArchiveStateInput = {
  posts: PostMeta[];
  categoryLabels: Record<string, string>;
  searchParams?: PostsArchiveSearchParams;
  postsPerPage: number;
};

const parsePage = (page: string | undefined) => {
  const parsed = Number(page);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const normalize = (value: string | undefined) => value?.trim() ?? "";

const includesQuery = ({
  post,
  query,
  categoryLabels,
}: {
  post: PostMeta;
  query: string;
  categoryLabels: Record<string, string>;
}) => {
  if (!query) {
    return true;
  }

  const haystack = [
    post.title,
    post.description,
    post.category,
    post.category ? categoryLabels[post.category] : undefined,
    ...(post.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
};

export function getPostsArchiveState({
  posts,
  categoryLabels,
  searchParams,
  postsPerPage,
}: PostsArchiveStateInput) {
  const query = normalize(searchParams?.query);
  const selectedTag = normalize(searchParams?.tag);
  const selectedCategory = normalize(searchParams?.category);
  const currentPage = parsePage(searchParams?.page);

  const categoryCounts = posts.reduce<Record<string, number>>((counts, post) => {
    if (!post.category) {
      return counts;
    }

    counts[post.category] = (counts[post.category] ?? 0) + 1;
    return counts;
  }, {});

  const categoryTabs: PostsArchiveCategoryTab[] = [
    {
      label: "전체",
      value: "",
      count: posts.length,
    },
    ...Object.entries(categoryCounts).map(([category, count]) => ({
      label: categoryLabels[category] ?? category,
      value: category,
      count,
    })),
  ];

  const filtered = posts.filter((post) => {
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    const matchesQuery = includesQuery({ post, query, categoryLabels });

    return matchesCategory && matchesTag && matchesQuery;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / postsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * postsPerPage;
  const pagePosts = filtered.slice(start, start + postsPerPage);

  return {
    query,
    selectedTag,
    selectedCategory,
    currentPage,
    safePage,
    totalItems,
    totalPages,
    filtered,
    pagePosts,
    categoryTabs,
  };
}

export function buildPostsArchiveHref(
  current: PostsArchiveSearchParams,
  overrides: Partial<PostsArchiveSearchParams>,
) {
  const params = new URLSearchParams();
  const nextQuery = normalize(overrides.query ?? current.query);
  const nextTag = normalize(overrides.tag ?? current.tag);
  const nextCategory = normalize(overrides.category ?? current.category);
  const nextPage = normalize(overrides.page ?? current.page);

  if (nextQuery) params.set("query", nextQuery);
  if (nextTag) params.set("tag", nextTag);
  if (nextCategory) params.set("category", nextCategory);
  if (nextPage && nextPage !== "1") params.set("page", nextPage);

  const qs = params.toString();
  return `/posts${qs ? `?${qs}` : ""}`;
}
