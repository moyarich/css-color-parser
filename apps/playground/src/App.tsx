import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "./mdx-components";
import Page from "./pages.mdx";

export function App() {
  return (
    <MDXProvider components={mdxComponents}>
      <Page />
    </MDXProvider>
  );
}
