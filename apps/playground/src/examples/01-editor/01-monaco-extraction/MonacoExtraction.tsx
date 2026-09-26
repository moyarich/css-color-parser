import { useEffect, useRef, useState } from "react";
import {
  extractCssColors,
  formatCssColor,
  type CssColorMatch,
} from "@moyarich/css-color-parser";
import { ensureCssColorProvider } from "../../../lib/cssColorProvider";
import { monaco } from "../../../lib/monaco";

export default function MonacoExtraction({
  source,
  title,
}: {
  source: string;
  title: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [matches, setMatches] = useState<CssColorMatch[]>(() =>
    extractCssColors(source),
  );

  useEffect(() => {
    if (!host.current) return;

    ensureCssColorProvider();

    const instance = monaco.editor.create(host.current, {
      value: source,
      language: "css",
      theme: "vs",
      automaticLayout: true,
      colorDecorators: true,
      fixedOverflowWidgets: true,
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: false },
      padding: { top: 14, bottom: 14 },
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: "on",
    });

    editor.current = instance;

    const updateMatches = () => {
      const model = instance.getModel();
      setMatches(model ? extractCssColors(model.getValue()) : []);
    };

    updateMatches();
    const subscription = instance.onDidChangeModelContent(updateMatches);

    return () => {
      subscription.dispose();
      instance.dispose();
      editor.current = null;
    };
  }, [source]);

  const reveal = (match: CssColorMatch) => {
    const model = editor.current?.getModel();
    if (!model || !editor.current) return;

    const start = model.getPositionAt(match.start);
    const end = model.getPositionAt(match.end);
    const range = new monaco.Range(
      start.lineNumber,
      start.column,
      end.lineNumber,
      end.column,
    );

    editor.current.setSelection(range);
    editor.current.revealRangeInCenterIfOutsideViewport(range);
    editor.current.focus();
  };

  return (
    <div className="workspace-grid">
      <div className="source-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CSS source</p>
            <h2>{title}</h2>
          </div>
          <span className="status">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </span>
        </div>
        <div
          ref={host}
          className="source-editor"
          aria-label={`${title} CSS source editor`}
        />
      </div>

      <div className="matches-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Live output</p>
            <h2>Extracted color matches</h2>
          </div>
        </div>

        <ol className="match-list">
          {matches.length ? (
            matches.map((match, index) => (
              <li
                className="match-item"
                key={`${match.start}-${match.end}-${index}`}
              >
                <button
                  className="match-button"
                  type="button"
                  onClick={() => reveal(match)}
                >
                  <span
                    className="swatch"
                    style={{ background: formatCssColor(match.color) }}
                  />
                  <span className="match-content">
                    <code>{match.value}</code>
                    <span className="match-meta">
                      {match.format} · [{match.start}, {match.end})
                    </span>
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="empty-state">No resolvable CSS colors found.</li>
          )}
        </ol>
      </div>
    </div>
  );
}
