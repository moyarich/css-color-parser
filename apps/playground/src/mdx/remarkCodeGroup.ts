import type { Root, RootContent } from "mdast";

interface Node {
  type: string;
  name?: string;
  lang?: string | null;
  meta?: string | null;
  value?: string;
  children?: Node[];
}

export default function remarkCodeGroup() {
  return (tree: Root) => {
    const transform = (node: Node) => {
      if (node.type === "containerDirective" && node.name === "code-group") {
        const children = (node.children ?? []).filter(
          (child) => child.type === "code",
        );
        if (!children.length)
          throw new Error("A code-group must contain at least one code fence.");
        if (children.length !== node.children?.length)
          throw new Error("A code-group may only contain code fences.");
        Object.assign(node, {
          type: "mdxJsxFlowElement",
          name: "CodeGroup",
          attributes: [],
          children: children.map((child, index) => ({
            type: "mdxJsxFlowElement",
            name: "CodeTab",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "title",
                value:
                  child.meta?.match(/\[([^\]]+)\]/)?.[1] ??
                  child.meta ??
                  `Example ${index + 1}`,
              },
              {
                type: "mdxJsxAttribute",
                name: "language",
                value: child.lang ?? "text",
              },
              {
                type: "mdxJsxAttribute",
                name: "code",
                value: child.value ?? "",
              },
            ],
            children: [],
          })),
        });
        return;
      }
      node.children?.forEach(transform);
    };
    tree.children.forEach((node: RootContent) => transform(node as Node));
  };
}
