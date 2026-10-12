/** Navigation visibility is authored in page YAML frontmatter. */
export type NavigationVisibility = "visible" | "hidden" | "disabled";

export function isRoutable(navigation?: NavigationVisibility): boolean {
  return navigation !== "disabled";
}

export function isInNavigation(navigation?: NavigationVisibility): boolean {
  return navigation !== "hidden" && navigation !== "disabled";
}

export function defaultVisiblePage<T extends { navigation?: NavigationVisibility }>(
  pages: readonly T[],
): T | undefined {
  return pages.find((page) => isInNavigation(page.navigation)) ?? pages[0];
}
