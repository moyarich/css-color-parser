import { useRef, useState } from "react";
import {
  extractCssColors,
  formatCssColor,
  type CssColorMatch,
} from "@moyarich/css-color-parser";
import { CssColorEditor } from "@moyarich/css-color-parser-monaco";
import type { editor } from "monaco-editor";

export default function MonacoExtraction({
  source,
  title,
}: {
  source: string;
  title: string;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [matches, setMatches] = useState<CssColorMatch[]>(() =>
    extractCssColors(source),
  );

  const reveal = (match: CssColorMatch) => {
    const model = editorRef.current?.getModel();
    if (!model || !editorRef.current) return;

    const start = model.getPositionAt(match.start);
    const end = model.getPositionAt(match.end);

    const range = {
      startLineNumber: start.lineNumber,
      startColumn: start.column,
      endLineNumber: end.lineNumber,
      endColumn: end.column,
    };

    editorRef.current.setSelection(range);
    editorRef.current.revealRangeInCenterIfOutsideViewport(range);
    editorRef.current.focus();
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

        <CssColorEditor
          files={[{ name: "example.css", value: source, language: "css" }]}
          height={400}
          theme="vs"
          onMount={(instance) => {
            editorRef.current = instance;
          }}
          onChange={(value) => {
            setMatches(extractCssColors(value ?? ""));
          }}
          options={{
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
          }}
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
