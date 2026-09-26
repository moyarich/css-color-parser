import { useState, type ReactNode } from "react";
import { CodeExample } from "./CodeExample";
import { TableOfContents } from "./TableOfContents";

export function ExamplePage({
  eyebrow,
  title,
  description,
  source,
  toc = false,
  preview,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  source: string;
  toc?: boolean;
  preview?: ReactNode;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);
  const previewContent = preview ?? children;
  const details = preview ? children : null;

  return (
    <>
      <div className="example-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="section-description">{description}</p>
      </div>

      {toc && (
        <TableOfContents rootId="selected-example-page" pageKey={title} />
      )}

      {details && <div className="example-details">{details}</div>}

      <div className="example-demo">
        <div className="preview-toolbar">
          <span>
            <span className="live-dot" /> Interactive preview
          </span>
        </div>
        <div className="example-preview">{previewContent}</div>
        <div className={`example-source${showCode ? " is-expanded" : ""}`}>
          <CodeExample value={source} ariaLabel={`${title} source`} />
          {!showCode && <div className="source-fade" aria-hidden="true" />}
          <button
            className="view-code-button"
            type="button"
            aria-expanded={showCode}
            onClick={() => setShowCode((value) => !value)}
          >
            {showCode ? "Hide Code" : "View Code"}
          </button>
        </div>
      </div>
    </>
  );
}
