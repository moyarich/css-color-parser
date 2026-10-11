import type { ComponentType } from "react";
import type { Toc } from "@stefanprobst/rehype-extract-toc";

export interface ExampleFrontmatter {
  id: string;
  label: string;
  group: string;
  toc?: boolean;
  eyebrow: string;
  title: string;
  description: string;
  hidden?: boolean;
}

export interface PlaygroundEntry extends ExampleFrontmatter {
  path: string;
  navPath: readonly string[];
  Component: ComponentType;
  tableOfContents: Toc;
}

interface ExampleModule {
  default: ComponentType;
  tableOfContents: Toc;
  frontmatter: ExampleFrontmatter;
}

const modules = import.meta.glob<ExampleModule>("./examples/**/page.mdx", {
  base: "../../../",
  eager: true,
});

const acronyms = new Set([
  "api",
  "css",
  "hsl",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "rgb",
  "utf",
]);

function folderLabel(segment: string) {
  const words = segment.replace(/^\d+-/, "").split("-");

  return words
    .map((word, index) => {
      if (acronyms.has(word.toLowerCase())) return word.toUpperCase();
      return index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word.toLowerCase();
    })
    .join(" ");
}

function getNavPath(path: string, label: string) {
  const segments = path
    .replace(/^\.\/examples\//, "")
    .replace(/\/page\.mdx$/, "")
    .split("/");

  const ancestors = segments.slice(1, -1).map(folderLabel);

  return [...ancestors, label];
}

export const examples: readonly PlaygroundEntry[] = Object.entries(modules)
  .filter(([, module]) => !module.frontmatter.hidden)
  .sort(([leftPath], [rightPath]) =>
    leftPath.localeCompare(rightPath, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  )
  .map(([path, module]) => ({
    ...module.frontmatter,
    path,
    navPath: getNavPath(path, module.frontmatter.label),
    Component: module.default,
    tableOfContents: module.tableOfContents,
  }));
