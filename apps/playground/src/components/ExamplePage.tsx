import { useState, type ReactNode } from "react";
import { CodeExample } from "./CodeExample";

export function ExamplePage({
  eyebrow,
  title,
  description,
  source,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  source: string;
  children: ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <>
      <div className="example-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-description">{description}</p>
      </div>

      <div className="example-demo">
        <div className="preview-toolbar">
          <span>
            <span className="live-dot" /> Interactive preview
          </span>
        </div>
        <div className="example-preview">{children}</div>
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
