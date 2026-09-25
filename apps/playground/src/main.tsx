import { StrictMode, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import {
  extractCssColors,
  hslToRgb,
  parseAlpha,
  parseCssColor,
  parseFunctionalComponents,
  parseHexColor,
  parseHslColor,
  parseHue,
  parseNamedColor,
  parsePercentage,
  parseRgbChannel,
  parseRgbColor,
  type CssColorMatch,
  type RgbaColor,
} from "@moyarich/css-color-parser";
import "./styles.css";

(globalThis as typeof globalThis & { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    return label === "css" || label === "scss" || label === "less"
      ? new CssWorker()
      : new EditorWorker();
  },
};

const sampleSource = `:root {
  --brand: #06c;
  --accent: color-mix(in oklch, rebeccapurple 60%, white);
}

.button {
  color: oklch(60% 0.15 250);
  border-color: rgb(255 0 0 / 50%);
  background: linear-gradient(135deg, #fff, hwb(190 10% 15%));
}`;

const monacoUsageExample = `import * as monaco from "monaco-editor";
import { extractCssColors } from "@moyarich/css-color-parser";

monaco.languages.registerColorProvider("css", {
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

    return [{
      label: \`rgba(\${Math.round(red * 255)}, \${Math.round(green * 255)}, \${Math.round(blue * 255)}, \${alpha})\`,
    }];
  },
});

monaco.editor.create(document.querySelector("#editor")!, {
  value: ".button { color: rebeccapurple; }",
  language: "css",
  colorDecorators: true,
});`;

const toCssColor = (color: RgbaColor) =>
  `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;

function GitHubIcon() {
  return (
    <svg className="github-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.2c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.95 10.95 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.24c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  );
}

function CodeExample({
  value,
  ariaLabel,
}: {
  value: string;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!host.current) return;

    const instance = monaco.editor.create(host.current, {
      value,
      language: "typescript",
      theme: "vs",
      readOnly: true,
      domReadOnly: true,
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      folding: false,
      glyphMargin: false,
      overviewRulerLanes: 0,
      renderLineHighlight: "none",
      scrollBeyondLastLine: false,
      scrollbar: {
        vertical: "hidden",
        horizontal: "auto",
        alwaysConsumeMouseWheel: false,
      },
      wordWrap: "on",
      padding: { top: 14, bottom: 14 },
      fontSize: 13,
      lineHeight: 20,
    });

    editor.current = instance;
    return () => instance.dispose();
  }, []);

  useEffect(() => {
    const model = editor.current?.getModel();
    if (model && model.getValue() !== value) {
      model.setValue(value);
    }
  }, [value]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const height = Math.max(88, value.split("\n").length * 20 + 28);

  return (
    <div className="code-example">
      <button className="copy-button" type="button" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
      <div
        ref={host}
        className="code-editor"
        style={{ height }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

function ExampleDemo({
  preview,
  source,
  sourceLabel,
}: {
  preview: ReactNode;
  source: string;
  sourceLabel: string;
}) {
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setShowCode(false);
  }, [sourceLabel]);

  return (
    <div className="example-demo">
      <div className="example-preview">{preview}</div>
      <div className={`example-source${showCode ? " is-expanded" : ""}`}>
        <CodeExample value={source} ariaLabel={sourceLabel} />
        {!showCode && <div className="source-fade" aria-hidden="true" />}
        <button
          className="view-code-button"
          type="button"
          onClick={() => setShowCode((value) => !value)}
        >
          {showCode ? "Hide Code" : "View Code"}
        </button>
      </div>
    </div>
  );
}

const functionExamples = [
  {
    id: "parseCssColor",
    name: "parseCssColor",
    signature: "parseCssColor(value)",
    description:
      "Parse one complete CSS color value and return its detected format and RGBA channels.",
    params: [
      {
        name: "value",
        label: "CSS color value",
        type: "text",
        defaultValue: "oklch(60% 0.15 250)",
      },
    ],
    run: parseCssColor,
  },
  {
    id: "extractCssColors",
    name: "extractCssColors",
    signature: "extractCssColors(source)",
    description:
      "Find resolvable CSS colors in arbitrary source text and return exact UTF-16 ranges.",
    params: [
      {
        name: "source",
        label: "Source text",
        type: "text",
        defaultValue: "color: #06c; background: rebeccapurple;",
      },
    ],
    run: extractCssColors,
  },
  {
    id: "parseHexColor",
    name: "parseHexColor",
    signature: "parseHexColor(value)",
    description: "Parse #rgb, #rgba, #rrggbb, or #rrggbbaa into RGBA channels.",
    params: [
      { name: "value", label: "Hex color", type: "text", defaultValue: "#06c" },
    ],
    run: parseHexColor,
  },
  {
    id: "parseRgbColor",
    name: "parseRgbColor",
    signature: "parseRgbColor(value)",
    description: "Parse an rgb() or rgba() function into RGBA channels.",
    params: [
      {
        name: "value",
        label: "RGB color",
        type: "text",
        defaultValue: "rgb(255 0 0 / 50%)",
      },
    ],
    run: parseRgbColor,
  },
  {
    id: "parseHslColor",
    name: "parseHslColor",
    signature: "parseHslColor(value)",
    description: "Parse an hsl() or hsla() function and convert it to RGBA channels.",
    params: [
      {
        name: "value",
        label: "HSL color",
        type: "text",
        defaultValue: "hsl(220 80% 50% / 0.8)",
      },
    ],
    run: parseHslColor,
  },
  {
    id: "parseNamedColor",
    name: "parseNamedColor",
    signature: "parseNamedColor(value)",
    description: "Resolve a CSS named color from the built-in named-color table.",
    params: [
      {
        name: "value",
        label: "Named color",
        type: "text",
        defaultValue: "rebeccapurple",
      },
    ],
    run: parseNamedColor,
  },
  {
    id: "parseHue",
    name: "parseHue",
    signature: "parseHue(value)",
    description:
      "Parse a CSS hue and normalize degrees, turns, grads, or radians to 0–360 degrees.",
    params: [
      { name: "value", label: "Hue", type: "text", defaultValue: "0.5turn" },
    ],
    run: parseHue,
  },
  {
    id: "parseRgbChannel",
    name: "parseRgbChannel",
    signature: "parseRgbChannel(value)",
    description:
      "Parse and clamp one RGB numeric or percentage channel to the 0–255 range.",
    params: [
      {
        name: "value",
        label: "RGB channel",
        type: "text",
        defaultValue: "50%",
      },
    ],
    run: parseRgbChannel,
  },
  {
    id: "parsePercentage",
    name: "parsePercentage",
    signature: "parsePercentage(value)",
    description: "Parse a percentage token and return its numeric percentage value.",
    params: [
      {
        name: "value",
        label: "Percentage",
        type: "text",
        defaultValue: "62.5%",
      },
    ],
    run: parsePercentage,
  },
  {
    id: "parseAlpha",
    name: "parseAlpha",
    signature: "parseAlpha(value?)",
    description: "Parse and clamp an alpha number or percentage to the 0–1 range.",
    params: [
      {
        name: "value",
        label: "Alpha",
        type: "text",
        defaultValue: "75%",
        optional: true,
      },
    ],
    run: parseAlpha,
  },
  {
    id: "parseFunctionalComponents",
    name: "parseFunctionalComponents",
    signature: "parseFunctionalComponents(body)",
    description:
      "Split RGB/HSL-style functional color contents into three channels and optional alpha.",
    params: [
      {
        name: "body",
        label: "Function body",
        type: "text",
        defaultValue: "255 0 0 / 50%",
      },
    ],
    run: parseFunctionalComponents,
  },
  {
    id: "hslToRgb",
    name: "hslToRgb",
    signature: "hslToRgb(hue, saturation, lightness)",
    description: "Convert numeric HSL channels to an RGB tuple.",
    params: [
      { name: "hue", label: "Hue", type: "number", defaultValue: "220" },
      {
        name: "saturation",
        label: "Saturation",
        type: "number",
        defaultValue: "80",
      },
      {
        name: "lightness",
        label: "Lightness",
        type: "number",
        defaultValue: "50",
      },
    ],
    run: hslToRgb,
  },
] as const;

type FunctionExample = (typeof functionExamples)[number];

function FunctionPreview({ example }: { example: FunctionExample }) {
  const [values, setValues] = useState<string[]>(() =>
    example.params.map((param) => param.defaultValue),
  );

  useEffect(() => {
    setValues(example.params.map((param) => param.defaultValue));
  }, [example.id]);

  const runtimeArgs = example.params.map((param, index) => {
    const value = values[index] ?? "";

    if ("optional" in param && param.optional && value === "") {
      return undefined;
    }

    return param.type === "number" ? Number(value) : value;
  });

  let output: string;
  let source: string;

  try {
    const result = (example.run as (...args: any[]) => unknown)(...runtimeArgs);
    output = JSON.stringify(result, null, 2) ?? "undefined";

    const sourceArgs = runtimeArgs
      .map((value) => (value === undefined ? "undefined" : JSON.stringify(value)))
      .join(", ");

    source = `import { ${example.name} } from "@moyarich/css-color-parser";

const result = ${example.name}(${sourceArgs});

console.log(result);`;
  } catch (error) {
    output = error instanceof Error ? error.message : String(error);
    source = `import { ${example.name} } from "@moyarich/css-color-parser";

// Adjust the parameter values in the live preview.`;
  }

  const preview = (
    <div className="function-preview">
      <code className="api-signature">{example.signature}</code>
      <p className="api-description">{example.description}</p>

      <div className="api-parameters">
        {example.params.map((param, index) => {
          const id = `api-${example.name}-${param.name}`;

          return (
            <div className="api-parameter" key={param.name}>
              <label htmlFor={id}>
                {param.label}
                {"optional" in param && param.optional ? " (optional)" : ""}
              </label>
              <input
                id={id}
                type={param.type}
                value={values[index] ?? ""}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  setValues(next);
                }}
                spellCheck={false}
              />
            </div>
          );
        })}
      </div>

      <div className="output-label">Live result</div>
      <pre>{output}</pre>
    </div>
  );

  return (
    <ExampleDemo
      preview={preview}
      source={source}
      sourceLabel={`${example.name} source example`}
    />
  );
}

function MonacoPreview() {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [matches, setMatches] = useState<CssColorMatch[]>(
    extractCssColors(sampleSource),
  );

  useEffect(() => {
    if (!host.current) return;

    const instance = monaco.editor.create(host.current, {
      value: sampleSource,
      language: "css",
      theme: "vs",
      automaticLayout: true,
      colorDecorators: false,
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
      setMatches(extractCssColors(instance.getValue()));
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

  const preview = (
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

  return (
    <ExampleDemo
      preview={preview}
      source={monacoUsageExample}
      sourceLabel="Monaco extraction source example"
    />
  );
}

const examples = [
  { id: "monaco", label: "Monaco extraction", kind: "monaco" as const },
  ...functionExamples.map((example) => ({
    id: example.id,
    label: example.name,
    kind: "function" as const,
  })),
];

function Playground() {
  const [selectedId, setSelectedId] = useState(examples[0].id);
  const selectedFunction = functionExamples.find(
    (example) => example.id === selectedId,
  );

  return (
    <section className="playground-shell">
      <aside className="example-sidebar" aria-label="Playground examples">
        <div className="sidebar-heading">Examples</div>
        <nav className="example-list">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              aria-pressed={example.id === selectedId}
              onClick={() => setSelectedId(example.id)}
            >
              {example.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="playground-main">
        {selectedId === "monaco" ? (
          <>
            <div className="example-heading">
              <p className="eyebrow">Editor integration</p>
              <h2>Extract CSS colors with Monaco</h2>
              <p className="section-description">
                Edit the source and inspect the actual extractCssColors() result
                live. The source below shows the Monaco color-provider integration.
              </p>
            </div>
            <MonacoPreview />
          </>
        ) : selectedFunction ? (
          <>
            <div className="example-heading">
              <p className="eyebrow">Public JavaScript API</p>
              <h2>{selectedFunction.name}</h2>
              <p className="section-description">
                Edit the parameters to run the exported function live, then reveal
                the matching source example below.
              </p>
            </div>
            <FunctionPreview
              key={selectedFunction.id}
              example={selectedFunction}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

function App() {
  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero-bar">
          <p className="eyebrow">@moyarich/css-color-parser</p>
          <a
            className="github-link"
            href="https://github.com/moyarich/css-color-parser"
            target="_blank"
            rel="noreferrer"
            aria-label="View css-color-parser on GitHub"
          >
            <GitHubIcon />
            <span>GitHub</span>
          </a>
        </div>
        <h1>CSS color parser playground</h1>
        <p>
          Explore the live editor integration and every exported package function
          from one playground.
        </p>
      </header>

      <Playground />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
