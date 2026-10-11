import react from "@vitejs/plugin-react";
import extractToc from "@stefanprobst/rehype-extract-toc";
import exportToc from "@stefanprobst/rehype-extract-toc/mdx";
import remarkDirective from "remark-directive";
import remarkCodeGroup from "./src/mdx/remarkCodeGroup";
import remarkGfm from "remark-gfm";
import mdx from "@mdx-js/rollup";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/css-color-parser/",
  esbuild: { jsx: "automatic" },
  plugins: [
    mdx({
      providerImportSource: "@mdx-js/react",
      remarkPlugins: [
        remarkGfm,
        remarkDirective,
        remarkCodeGroup,
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
      ],
      rehypePlugins: [rehypeSlug, extractToc, exportToc],
    }),
    react(),
  ],
});
