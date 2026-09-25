import { StrictMode, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import {
  extractCssColors, hslToRgb, parseAlpha, parseCssColor, parseFunctionalComponents,
  parseHexColor, parseHslColor, parseHue, parseNamedColor, parsePercentage,
  parseRgbChannel, parseRgbColor, type CssColorMatch, type RgbaColor,
} from "@moyarich/css-color-parser";
import "./styles.css";

(globalThis as typeof globalThis & { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    return label === "css" || label === "scss" || label === "less" ? new CssWorker() : new EditorWorker();
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

const toCssColor = (c: RgbaColor) => `rgba(${Math.round(c.red)}, ${Math.round(c.green)}, ${Math.round(c.blue)}, ${c.alpha})`;

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
      lineNumbers: "off",
      folding: false,
      glyphMargin: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
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
    if (model && model.getValue() !== value) model.setValue(value);
  }, [value]);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const height = Math.max(72, value.split("\n").length * 20 + 28);

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
function GitHubIcon() {
  return (
    <svg
      className="github-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.2c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.39.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.16 1.18a10.95 10.95 0 0 1 5.75 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.24c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"
      />
    </svg>
  );
}

const apiExamples = [
  {
    name: "parseCssColor",
    signature: "parseCssColor(value)",
    description: "Parse one complete CSS color value into its original value, detected format, and RGBA channels.",
    defaultArgs: ["oklch(60% 0.15 250)"],
    run: parseCssColor,
  },
  {
    name: "extractCssColors",
    signature: "extractCssColors(source)",
    description: "Find resolvable CSS colors in arbitrary source text and return their exact UTF-16 ranges.",
    defaultArgs: ["color: #06c; background: rebeccapurple;"],
    run: extractCssColors,
  },
] as const;

function ApiPlayground() {
  const [index,setIndex]=useState(0);
  const example=apiExamples[index];
  const [args,setArgs]=useState(JSON.stringify(example.defaultArgs));

  useEffect(()=>setArgs(JSON.stringify(example.defaultArgs)),[index]);

  let output: string;
  let exampleCode: string;

  try {
    const values = JSON.parse(args);

    if (!Array.isArray(values)) {
      throw new Error("Arguments must be a JSON array.");
    }

    const result = (example.run as (...values: any[]) => unknown)(...values);
    output = JSON.stringify(result, null, 2) ?? "undefined";

    const callArgs = values.map((value) => JSON.stringify(value)).join(", ");
    exampleCode = `import { ${example.name} } from "@moyarich/css-color-parser";

const result = ${example.name}(${callArgs});

console.log(result);`;
  } catch (error) {
    output = error instanceof Error ? error.message : String(error);
    exampleCode = `import { ${example.name} } from "@moyarich/css-color-parser";

// Enter valid JSON arguments in the live preview.`;
  }

  const preview = (
    <div className="api-layout">
      <nav className="api-functions" aria-label="Public JavaScript API functions">
        {apiExamples.map((item,i)=>
          <button
            key={item.name}
            type="button"
            aria-pressed={i===index}
            onClick={()=>setIndex(i)}
          >
            {item.name}
          </button>
        )}
      </nav>

      <div className="api-runner">
        <code className="api-signature">{example.signature}</code>
        <p className="api-description">{example.description}</p>

        <label htmlFor="api-args">Arguments (JSON array)</label>
        <input
          id="api-args"
          value={args}
          onChange={e=>setArgs(e.target.value)}
          spellCheck={false}
        />

        <div className="output-label">Live result</div>
        <pre>{output}</pre>
      </div>
    </div>
  );

  return (
    <section className="api-section">
      <div className="example-heading">
        <p className="eyebrow">Public JavaScript API</p>
        <h2>Run the package API in the browser</h2>
        <p className="section-description">
          Change the arguments and the selected package function runs immediately.
          The result below is the function’s actual return value.
        </p>
      </div>

      <ExampleDemo
        preview={preview}
        source={exampleCode}
        sourceLabel={`${example.name} source example`}
      />
    </section>
  );
}function SourcePlayground() {
  const host=useRef<HTMLDivElement>(null);
  const editor=useRef<monaco.editor.IStandaloneCodeEditor|null>(null);
  const [matches,setMatches]=useState<CssColorMatch[]>(extractCssColors(sampleSource));

  useEffect(()=>{
    if(!host.current) return;

    const ed=monaco.editor.create(host.current,{
      value:sampleSource,
      language:"css",
      theme:"vs",
      automaticLayout:true,
      colorDecorators:false,
      fontSize:14,
      lineHeight:22,
      minimap:{enabled:false},
      padding:{top:14,bottom:14},
      scrollBeyondLastLine:false,
      tabSize:2,
      wordWrap:"on"
    });

    editor.current=ed;

    const updateMatches = () => {
      setMatches(extractCssColors(ed.getValue()));
    };

    updateMatches();
    const sub=ed.onDidChangeModelContent(updateMatches);

    return()=>{
      sub.dispose();
      ed.dispose();
      editor.current=null;
    };
  },[]);

  const reveal=(m:CssColorMatch)=>{
    const model=editor.current?.getModel();
    if(!model||!editor.current)return;
    const a=model.getPositionAt(m.start),b=model.getPositionAt(m.end);
    const r=new monaco.Range(a.lineNumber,a.column,b.lineNumber,b.column);
    editor.current.setSelection(r);
    editor.current.revealRangeInCenterIfOutsideViewport(r);
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
            {matches.length} match{matches.length===1?"":"es"}
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
          {matches.length
            ? matches.map((m,i)=>
                <li className="match-item" key={i}>
                  <button
                    className="match-button"
                    type="button"
                    onClick={()=>reveal(m)}
                  >
                    <span
                      className="swatch"
                      style={{background:toCssColor(m.color)}}
                    />
                    <span className="match-content">
                      <code>{m.value}</code>
                      <span className="match-meta">
                        {m.format} · [{m.start}, {m.end})
                      </span>
                    </span>
                  </button>
                </li>
              )
            : <li className="empty-state">No resolvable CSS colors found.</li>}
        </ol>
      </div>
    </div>
  );

  return (
    <section className="example-block">
      <div className="example-heading">
        <p className="eyebrow">Color extraction</p>
        <h2>Find CSS colors in source code</h2>
        <p className="section-description">
          Edit the CSS and the live result updates from extractCssColors().
          The source below shows how to connect the parser to Monaco’s color provider.
        </p>
      </div>

      <ExampleDemo
        preview={preview}
        source={monacoUsageExample}
        sourceLabel="Monaco Editor integration source"
      />
    </section>
  );
}function ParseColor() {
  const [value,setValue]=useState("color-mix(in oklch, rebeccapurple 60%, white)");
  const parsed=useMemo(()=>parseCssColor(value.trim()),[value]);
  return <section className="card"><div className="section-heading"><div><p className="eyebrow">Single-value parsing</p><h2>Parse a CSS color value</h2></div><span className="status">{parsed?.format??"Unresolved"}</span></div><label htmlFor="color-input">CSS color value</label><input id="color-input" value={value} onChange={e=>setValue(e.target.value)} spellCheck={false}/><div className="single-result"><span className="swatch" style={{background:parsed?toCssColor(parsed.color):"transparent"}}/><pre>{parsed?JSON.stringify(parsed,null,2):"null"}</pre></div></section>;
}

function App(){return <main className="page-shell"><header className="hero"><div className="hero-bar"><p className="eyebrow">@moyarich/css-color-parser</p><a className="github-link" href="https://github.com/moyarich/css-color-parser" target="_blank" rel="noreferrer" aria-label="View css-color-parser on GitHub"><GitHubIcon/><span>GitHub</span></a></div><h1>CSS color parser playground</h1><p>Experiment with CSS color parsing, inspect extracted matches, and try every exported function in the package.</p></header><ParseColor/><SourcePlayground/><ApiPlayground/></main>;}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
