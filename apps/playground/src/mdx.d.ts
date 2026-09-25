declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const meta: {
    id: string;
    label: string;
    group: string;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
