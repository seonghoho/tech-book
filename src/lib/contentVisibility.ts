const NON_INDEXABLE_POST_CATEGORIES = new Set(["mordern-js-deep-dive"]);

export function getPostCategoryFromSlug(slug: string) {
  return slug.split("/")[0] ?? "";
}

export function isIndexablePostSlug(slug: string) {
  const category = getPostCategoryFromSlug(slug);
  return !NON_INDEXABLE_POST_CATEGORIES.has(category);
}

export function filterIndexablePosts<T extends { slug: string }>(posts: T[]) {
  return posts.filter((post) => isIndexablePostSlug(post.slug));
}

export function filterIndexablePostGroups<T extends { slug: string }>(groups: Record<string, T[]>) {
  return Object.fromEntries(
    Object.entries(groups)
      .map(([category, posts]) => [category, filterIndexablePosts(posts)] as const)
      .filter(([, posts]) => posts.length > 0),
  );
}

export function getPostRobots(slug: string) {
  return isIndexablePostSlug(slug)
    ? undefined
    : {
        index: false,
        follow: true,
      };
}
