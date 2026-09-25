import * as monaco from "monaco-editor";
import CssWorker from "monaco-editor/language/css/css.worker?worker";
import EditorWorker from "monaco-editor/editor/editor.worker?worker";
import {
  CSS_NAMED_COLORS,
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
const apiFunctions = requiredElement<HTMLElement>("#api-functions");
const apiSignature = requiredElement<HTMLElement>("#api-signature");
const apiDescription = requiredElement<HTMLParagraphElement>("#api-description");
const apiArgs = requiredElement<HTMLInputElement>("#api-args");
const apiOutput = requiredElement<HTMLPreElement>("#api-output");

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

function parseWithSpecificParser(value: string) {
  if (value.startsWith("#")) return parseHexColor(value);
  if (/^rgba?\(/i.test(value)) return parseRgbColor(value);
  if (/^hsla?\(/i.test(value)) return parseHslColor(value);
  if (/^[a-z]+$/i.test(value)) return parseNamedColor(value);
  return null;
}

function updateSingleColor(): void {
  const input = colorInput.value.trim();
  const parsed = parseCssColor(input);
  const specific = parseWithSpecificParser(input);

  if (!parsed) {
    parseStatus.textContent = "Unresolved";
    singleSwatch.style.background = "transparent";
    singleOutput.textContent = "null";
    return;
  }

  parseStatus.textContent = parsed.format;
  singleSwatch.style.background = toCssColor(parsed.color);
  singleOutput.textContent = JSON.stringify(
    {
      parseCssColor: parsed,
      specificParser: specific,
    },
    null,
    2,
  );
}


type ApiExample = {
  name: string;
  signature: string;
  description: string;
  args: unknown[];
  run: (...args: any[]) => unknown;
};

const apiExamples: ApiExample[] = [
  { name: "parseCssColor", signature: "parseCssColor(value)", description: "Parse any supported complete CSS color.", args: ["oklch(60% 0.15 250)"], run: parseCssColor },
  { name: "extractCssColors", signature: "extractCssColors(source)", description: "Extract resolvable CSS colors and their UTF-16 offsets.", args: ["color: #06c; background: rebeccapurple;"], run: extractCssColors },
  { name: "parseHexColor", signature: "parseHexColor(value)", description: "Parse a hexadecimal CSS color into RGBA channels.", args: ["#06c"], run: parseHexColor },
  { name: "parseRgbColor", signature: "parseRgbColor(value)", description: "Parse an rgb() or rgba() color.", args: ["rgb(255 0 0 / 50%)"], run: parseRgbColor },
  { name: "parseHslColor", signature: "parseHslColor(value)", description: "Parse an hsl() or hsla() color.", args: ["hsl(220 80% 50% / 0.8)"], run: parseHslColor },
  { name: "parseNamedColor", signature: "parseNamedColor(value)", description: "Resolve a CSS named color.", args: ["rebeccapurple"], run: parseNamedColor },
  { name: "parseHue", signature: "parseHue(value)", description: "Normalize a CSS hue to degrees.", args: ["0.5turn"], run: parseHue },
  { name: "parseRgbChannel", signature: "parseRgbChannel(value)", description: "Parse one RGB numeric or percentage channel.", args: ["50%"], run: parseRgbChannel },
  { name: "parsePercentage", signature: "parsePercentage(value)", description: "Parse a percentage token.", args: ["62.5%"], run: parsePercentage },
  { name: "parseAlpha", signature: "parseAlpha(value)", description: "Parse and clamp an alpha value.", args: ["75%"], run: parseAlpha },
  { name: "parseFunctionalComponents", signature: "parseFunctionalComponents(body)", description: "Split functional color channels and optional alpha.", args: ["255 0 0 / 50%"], run: parseFunctionalComponents },
  { name: "hslToRgb", signature: "hslToRgb(hue, saturation, lightness)", description: "Convert HSL channel values to RGB.", args: [220, 80, 50], run: hslToRgb },
];

let activeApi = apiExamples[0]!;

function runApiExample(): void {
  try {
    const args = JSON.parse(apiArgs.value);
    if (!Array.isArray(args)) throw new Error("Arguments must be a JSON array.");
    apiOutput.textContent = JSON.stringify(activeApi.run(...args), null, 2) ?? "undefined";
  } catch (error) {
    apiOutput.textContent = error instanceof Error ? error.message : String(error);
  }
}

function selectApiExample(example: ApiExample): void {
  activeApi = example;
  apiSignature.textContent = example.signature;
  apiDescription.textContent = example.description;
  apiArgs.value = JSON.stringify(example.args);
  for (const button of apiFunctions.querySelectorAll<HTMLButtonElement>("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.api === example.name));
  }
  runApiExample();
}

for (const example of apiExamples) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.api = example.name;
  button.textContent = example.name;
  button.addEventListener("click", () => selectApiExample(example));
  apiFunctions.append(button);
}

apiArgs.addEventListener("input", runApiExample);
selectApiExample(activeApi);

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
