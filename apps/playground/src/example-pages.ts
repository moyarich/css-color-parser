import type { ComponentType } from "react";

export interface ExampleFrontmatter {
  id: string;
  label: string;
  group: string;
  parent?: string;
  toc?: boolean;
  eyebrow: string;
  title: string;
  description: string;
  hidden?: boolean;
}

interface ExampleModule {
  default: ComponentType;
  frontmatter: ExampleFrontmatter;
}

const modules = import.meta.glob<ExampleModule>("./examples/**/page.mdx", {
  eager: true,
});

export const examples = Object.entries(modules)
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
    Component: module.default,
  }));
