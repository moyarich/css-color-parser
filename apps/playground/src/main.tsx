import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
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

function GitHubIcon() {
  return <span className="github-icon" aria-hidden="true">GH</span>;
}

const apiExamples = [
  ["parseCssColor","parseCssColor(value)","Parse any supported complete CSS color.",["oklch(60% 0.15 250)"],parseCssColor],
  ["extractCssColors","extractCssColors(source)","Extract resolvable CSS colors and their UTF-16 offsets.",["color: #06c; background: rebeccapurple;"],extractCssColors],
  ["parseHexColor","parseHexColor(value)","Parse a hexadecimal CSS color into RGBA channels.",["#06c"],parseHexColor],
  ["parseRgbColor","parseRgbColor(value)","Parse an rgb() or rgba() color.",["rgb(255 0 0 / 50%)"],parseRgbColor],
  ["parseHslColor","parseHslColor(value)","Parse an hsl() or hsla() color.",["hsl(220 80% 50% / 0.8)"],parseHslColor],
  ["parseNamedColor","parseNamedColor(value)","Resolve a CSS named color.",["rebeccapurple"],parseNamedColor],
  ["parseHue","parseHue(value)","Normalize a CSS hue to degrees.",["0.5turn"],parseHue],
  ["parseRgbChannel","parseRgbChannel(value)","Parse one RGB numeric or percentage channel.",["50%"],parseRgbChannel],
  ["parsePercentage","parsePercentage(value)","Parse a percentage token.",["62.5%"],parsePercentage],
  ["parseAlpha","parseAlpha(value)","Parse and clamp an alpha value.",["75%"],parseAlpha],
  ["parseFunctionalComponents","parseFunctionalComponents(body)","Split functional color channels and optional alpha.",["255 0 0 / 50%"],parseFunctionalComponents],
  ["hslToRgb","hslToRgb(hue, saturation, lightness)","Convert HSL channel values to RGB.",[220,80,50],hslToRgb],
] as const;

function ApiPlayground() {
  const [index,setIndex]=useState(0), example=apiExamples[index];
  const [args,setArgs]=useState(JSON.stringify(example[3]));
  useEffect(()=>setArgs(JSON.stringify(example[3])),[index]);
  let output: string;
  try { const values=JSON.parse(args); output=Array.isArray(values)?JSON.stringify((example[4] as (...a:any[])=>unknown)(...values),null,2)??"undefined":"Arguments must be a JSON array."; }
  catch(e){ output=e instanceof Error?e.message:String(e); }
  return <section className="card api-card"><div className="section-heading"><div><p className="eyebrow">JavaScript API</p><h2>Try every exported function</h2></div></div><div className="api-layout"><nav className="api-functions" aria-label="JavaScript API functions">{apiExamples.map((x,i)=><button key={x[0]} type="button" aria-pressed={i===index} onClick={()=>setIndex(i)}>{x[0]}</button>)}</nav><div className="api-runner"><code className="api-signature">{example[1]}</code><p className="api-description">{example[2]}</p><label htmlFor="api-args">Arguments (JSON array)</label><input id="api-args" value={args} onChange={e=>setArgs(e.target.value)} spellCheck={false}/><pre>{output}</pre></div></div></section>;
}

function SourcePlayground() {
  const host=useRef<HTMLDivElement>(null), editor=useRef<monaco.editor.IStandaloneCodeEditor|null>(null);
  const [matches,setMatches]=useState<CssColorMatch[]>(extractCssColors(sampleSource));
  useEffect(()=>{ if(!host.current)return; const ed=monaco.editor.create(host.current,{value:sampleSource,language:"css",theme:"vs",automaticLayout:true,colorDecorators:false,fontSize:14,lineHeight:22,minimap:{enabled:false},padding:{top:14,bottom:14},scrollBeyondLastLine:false,tabSize:2,wordWrap:"on"}); editor.current=ed; const sub=ed.onDidChangeModelContent(()=>setMatches(extractCssColors(ed.getValue()))); return()=>{sub.dispose();ed.dispose();}; },[]);
  const reveal=(m:CssColorMatch)=>{const model=editor.current?.getModel();if(!model||!editor.current)return;const a=model.getPositionAt(m.start),b=model.getPositionAt(m.end);const r=new monaco.Range(a.lineNumber,a.column,b.lineNumber,b.column);editor.current.setSelection(r);editor.current.revealRangeInCenterIfOutsideViewport(r);editor.current.focus();};
  return <section className="workspace-grid"><div className="card source-card"><div className="section-heading"><div><p className="eyebrow">extractCssColors()</p><h2>Source</h2></div><span className="status">{matches.length} match{matches.length===1?"":"es"}</span></div><div ref={host} className="source-editor" aria-label="CSS source editor"/></div><div className="card"><div className="section-heading"><div><p className="eyebrow">Matches</p><h2>Extracted colors</h2></div></div><ol className="match-list">{matches.length?matches.map((m,i)=><li className="match-item" key={i}><button className="match-button" type="button" onClick={()=>reveal(m)}><span className="swatch" style={{background:toCssColor(m.color)}}/><span className="match-content"><code>{m.value}</code><span className="match-meta">{m.format} · [{m.start}, {m.end})</span></span></button></li>):<li className="empty-state">No resolvable CSS colors found.</li>}</ol></div></section>;
}

function ParseColor() {
  const [value,setValue]=useState("color-mix(in oklch, rebeccapurple 60%, white)");
  const parsed=useMemo(()=>parseCssColor(value.trim()),[value]);
  return <section className="card"><div className="section-heading"><div><p className="eyebrow">parseCssColor()</p><h2>Parse one color</h2></div><span className="status">{parsed?.format??"Unresolved"}</span></div><label htmlFor="color-input">CSS color value</label><input id="color-input" value={value} onChange={e=>setValue(e.target.value)} spellCheck={false}/><div className="single-result"><span className="swatch" style={{background:parsed?toCssColor(parsed.color):"transparent"}}/><pre>{parsed?JSON.stringify(parsed,null,2):"null"}</pre></div></section>;
}

function App(){return <main className="page-shell"><header className="hero"><div className="hero-bar"><p className="eyebrow">@moyarich/css-color-parser</p><a className="github-link" href="https://github.com/moyarich/css-color-parser" target="_blank" rel="noreferrer" aria-label="View css-color-parser on GitHub"><GitHubIcon/><span>GitHub</span></a></div><h1>CSS color parser playground</h1><p>Exercise the package through its public API while developing the parser.</p></header><ParseColor/><ApiPlayground/><SourcePlayground/></main>;}

createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
