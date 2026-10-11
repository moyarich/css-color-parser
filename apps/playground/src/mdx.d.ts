declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const frontmatter: import("./pages-config").ExampleFrontmatter;

  export const tableOfContents: import("@stefanprobst/rehype-extract-toc").Toc;

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
