export const giscusConfig = {
  repo: "seonghoho/tech-book",
  repoId: "R_kgDOO16MuA",
  category: "General",
  categoryId: "DIC_kwDOO16MuM4DAVZF",
  mapping: "pathname",
  strict: "0",
  reactionsEnabled: "1",
  emitMetadata: "0",
  inputPosition: "bottom",
  lightTheme: "noborder_light",
  darkTheme: "noborder_dark",
  lang: "ko",
  loadRootMargin: "600px 0px",
} as const;

export const getGiscusTheme = (isDark: boolean) => {
  return isDark ? giscusConfig.darkTheme : giscusConfig.lightTheme;
};
