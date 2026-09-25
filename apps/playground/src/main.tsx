import { MDXProvider } from "@mdx-js/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { mdxComponents } from "./mdx-components";
import Page from "./pages.mdx";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MDXProvider components={mdxComponents}>
      <Page />
    </MDXProvider>
  </StrictMode>,
);
