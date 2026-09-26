import { useEffect, useRef, useState } from "react";
import {
  extractCssColors,
  type CssColorMatch,
  type RgbaColor,
} from "@moyarich/css-color-parser";
import { monaco } from "../../../lib/monaco";
import { monacoExampleGroups } from "./exampleGroups";

const initialGroup = monacoExampleGroups[0];

const toCssColor = (color: RgbaColor) =>
  `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;

type ProviderGlobal = typeof globalThis & {
  __cssColorParserProvider?: { dispose(): void };
};

function ensureColorProvider() {
  const globalState = globalThis as ProviderGlobal;
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
  const [groupId, setGroupId] = useState(initialGroup.id);
  const [matches, setMatches] = useState<CssColorMatch[]>(
    extractCssColors(initialGroup.source),
  );

  const selectedGroup =
    monacoExampleGroups.find((group) => group.id === groupId) ?? initialGroup;

  useEffect(() => {
    if (!host.current) return;

    ensureColorProvider();

    const instance = monaco.editor.create(host.current, {
      value: initialGroup.source,
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
  }, []);

  const selectGroup = (nextGroupId: string) => {
    const nextGroup = monacoExampleGroups.find(
      (group) => group.id === nextGroupId,
    );

    if (!nextGroup) return;

    setGroupId(nextGroup.id);

    const model = editor.current?.getModel();
    if (model) {
      model.setValue(nextGroup.source);
      editor.current?.setPosition({ lineNumber: 1, column: 1 });
      editor.current?.revealLine(1);
      editor.current?.focus();
    } else {
      setMatches(extractCssColors(nextGroup.source));
    }
  };

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
    <div className="monaco-example">
      <div className="example-group-picker" aria-label="Runnable example groups">
        {monacoExampleGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={group.id === selectedGroup.id}
            onClick={() => selectGroup(group.id)}
          >
            {group.label}
          </button>
        ))}
      </div>

      <p className="example-group-description">{selectedGroup.description}</p>

      <div className="workspace-grid">
        <div className="source-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CSS source</p>
              <h2>{selectedGroup.label}</h2>
            </div>
            <span className="status">
              {matches.length} match{matches.length === 1 ? "" : "es"}
            </span>
          </div>
          <div
            ref={host}
            className="source-editor"
            aria-label={`${selectedGroup.label} CSS source editor`}
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
                <li className="match-item" key={`${match.start}-${match.end}-${index}`}>
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
    </div>
  );
}
