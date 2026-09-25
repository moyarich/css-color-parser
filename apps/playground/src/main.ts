import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker.js?worker";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import {
  extractCssColors,
  parseCssColor,
  type CssColorMatch,
  type RgbaColor,
} from "@moyarich/css-color-parser";
import "./styles.css";

type MonacoEnvironment = {
  getWorker(moduleId: string, label: string): Worker;
};

(
  globalThis as typeof globalThis & {
    MonacoEnvironment: MonacoEnvironment;
  }
).MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === "css" || label === "scss" || label === "less") {
      return new CssWorker();
    }

    return new EditorWorker();
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

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required playground element: ${selector}`);
  }

  return element;
}

const colorInput = requiredElement<HTMLInputElement>("#color-input");
const parseStatus = requiredElement<HTMLSpanElement>("#parse-status");
const singleSwatch = requiredElement<HTMLSpanElement>("#single-swatch");
const singleOutput = requiredElement<HTMLPreElement>("#single-output");
const sourceEditorHost = requiredElement<HTMLDivElement>("#source-editor");
const matchCount = requiredElement<HTMLSpanElement>("#match-count");
const matchList = requiredElement<HTMLOListElement>("#match-list");

const sourceEditor = monaco.editor.create(sourceEditorHost, {
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

function toCssColor(color: RgbaColor): string {
  return `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(
    color.blue,
  )}, ${color.alpha})`;
}

function updateSingleColor(): void {
  const parsed = parseCssColor(colorInput.value.trim());

  if (!parsed) {
    parseStatus.textContent = "Unresolved";
    singleSwatch.style.background = "transparent";
    singleOutput.textContent = "null";
    return;
  }

  parseStatus.textContent = parsed.format;
  singleSwatch.style.background = toCssColor(parsed.color);
  singleOutput.textContent = JSON.stringify(parsed, null, 2);
}

function revealMatch(match: CssColorMatch): void {
  const model = sourceEditor.getModel();

  if (!model) {
    return;
  }

  const start = model.getPositionAt(match.start);
  const end = model.getPositionAt(match.end);
  const range = new monaco.Range(
    start.lineNumber,
    start.column,
    end.lineNumber,
    end.column,
  );

  sourceEditor.setSelection(range);
  sourceEditor.revealRangeInCenterIfOutsideViewport(range);
  sourceEditor.focus();
}

function createMatchItem(match: CssColorMatch): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "match-item";

  const button = document.createElement("button");
  button.className = "match-button";
  button.type = "button";
  button.title = "Reveal this color in the editor";
  button.addEventListener("click", () => revealMatch(match));

  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = toCssColor(match.color);
  swatch.setAttribute("aria-hidden", "true");

  const content = document.createElement("span");
  content.className = "match-content";

  const value = document.createElement("code");
  value.textContent = match.value;

  const meta = document.createElement("span");
  meta.className = "match-meta";
  meta.textContent = `${match.format} · [${match.start}, ${match.end})`;

  content.append(value, meta);
  button.append(swatch, content);
  item.append(button);

  return item;
}

function updateMatches(): void {
  const matches = extractCssColors(sourceEditor.getValue());

  matchCount.textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;
  matchList.replaceChildren(...matches.map(createMatchItem));

  if (matches.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No resolvable CSS colors found.";
    matchList.append(empty);
  }
}

colorInput.addEventListener("input", updateSingleColor);
sourceEditor.onDidChangeModelContent(updateMatches);

updateSingleColor();
updateMatches();
