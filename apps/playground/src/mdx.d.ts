declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const frontmatter: {
    id: string;
    label: string;
    group: string;
    eyebrow: string;
    title: string;
    description: string;
    hidden?: boolean;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
