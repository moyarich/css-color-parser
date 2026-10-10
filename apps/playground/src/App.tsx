import { Component, type ErrorInfo, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "./mdx-components";
import Page from "./pages.mdx";

class PlaygroundErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Playground render failed", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main role="alert" style={{ padding: "2rem" }}>
          <h1>Playground failed to render</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>
        </main>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <PlaygroundErrorBoundary>
      <MDXProvider components={mdxComponents}>
        <Page />
      </MDXProvider>
    </PlaygroundErrorBoundary>
  );
}
