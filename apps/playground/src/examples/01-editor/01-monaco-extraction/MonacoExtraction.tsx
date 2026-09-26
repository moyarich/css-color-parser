import { useEffect, useRef, useState } from "react";
import {
  extractCssColors,
  type CssColorMatch,
  type RgbaColor,
} from "@moyarich/css-color-parser";
import { monaco } from "../../../lib/monaco";

const sampleSource = `:root {
  --brand: #06c;
  --accent: color-mix(in oklch, rebeccapurple 60%, white);
}

.button {
  color: oklch(60% 0.15 250);
  border-color: rgb(255 0 0 / 50%);
  background: linear-gradient(135deg, #fff, hwb(190 10% 15%));
}`;

const toCssColor = (color: RgbaColor) =>
  `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;

type ProviderGlobal = typeof globalThis & {
  __cssColorParserProvider?: { dispose(): void };
};

function ensureColorProvider() {
  const globalState = globalThis as ProviderGlobal;
  // Monaco 0.56 exposes language defaults directly on the module.
  // Disable its CSS colors before registering our parser-backed provider.
  const cssDefaults = monaco.css.cssDefaults;
  if (cssDefaults.modeConfiguration.colors !== false) {
    cssDefaults.setModeConfiguration({
      ...cssDefaults.modeConfiguration,
      colors: false,
    });
  }

  if (globalState.__cssColorParserProvider) return;

  globalState.__cssColorParserProvider = monaco.languages.registerColorProvider(
    "css",
    {
      provideDocumentColors(model) {
        return extractCssColors(model.getValue()).map((match) => {
          const start = model.getPositionAt(match.start);
          const end = model.getPositionAt(match.end);

          return {
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              end.lineNumber,
              end.column,
            ),
            color: {
              red: match.color.red / 255,
              green: match.color.green / 255,
              blue: match.color.blue / 255,
              alpha: match.color.alpha,
            },
          };
        });
      },

      provideColorPresentations(_model, colorInfo) {
        const { red, green, blue, alpha } = colorInfo.color;

        return [
          {
            label: `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`,
          },
        ];
      },
    },
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    const globalState = globalThis as ProviderGlobal;
    globalState.__cssColorParserProvider?.dispose();
    delete globalState.__cssColorParserProvider;
  });
}

export default function MonacoExtraction() {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [matches, setMatches] = useState<CssColorMatch[]>(
    extractCssColors(sampleSource),
  );

  useEffect(() => {
    if (!host.current) return;

    ensureColorProvider();

    const instance = monaco.editor.create(host.current, {
      value: sampleSource,
      language: "css",
      theme: "vs",
      automaticLayout: true,
      colorDecorators: true,
      // Keep color pickers and suggestions outside the rounded containers' clipping.
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
  }, []);

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
            <h2>Editable Monaco editor</h2>
          </div>
          <span className="status">
            {matches.length} match{matches.length === 1 ? "" : "es"}
          </span>
        </div>
        <div
          ref={host}
          className="source-editor"
          aria-label="CSS source editor"
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
              <li className="match-item" key={index}>
                <button
                  className="match-button"
                  type="button"
                  onClick={() => reveal(match)}
                >
                  <span
                    className="swatch"
                    style={{ background: toCssColor(match.color) }}
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
