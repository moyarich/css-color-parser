import { Children, isValidElement, type ReactNode } from "react";
import { CodeExample, type CodeExampleFile } from "../CodeExample/CodeExample";

interface CodeTabProps {
  title: string;
  language?: string;
  code: string;
}

export function CodeTab({ code }: CodeTabProps) {
  return (
    <pre>
      <code>{code}</code>
    </pre>
  );
}

export function CodeGroup({
  files,
  children,
  label = "Code examples",
}: {
  files?: readonly CodeExampleFile[];
  children?: ReactNode;
  label?: string;
}) {
  const tabs =
    files ??
    Children.toArray(children).map((child) => {
      if (!isValidElement<CodeTabProps>(child) || child.type !== CodeTab) {
        throw new Error("CodeGroup children must be CodeTab components.");
      }
      return {
        name: child.props.title,
        value: child.props.code,
        language:
          (
            {
              ts: "typescript",
              tsx: "typescript",
              js: "javascript",
              jsx: "javascript",
              sh: "shell",
              bash: "shell",
            } as Record<string, string>
          )[child.props.language ?? ""] ?? child.props.language,
      };
    });
  if (!tabs.length) return null;
  return (
    <section className="code-group" aria-label={label}>
      <CodeExample files={tabs} ariaLabel={label} />
    </section>
  );
}
