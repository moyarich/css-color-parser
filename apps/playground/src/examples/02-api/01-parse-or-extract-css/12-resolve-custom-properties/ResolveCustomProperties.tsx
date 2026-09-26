import { useMemo, useState } from "react";
import { parseCssColor } from "@moyarich/css-color-parser";

const initialSource = `:root {
  --brand: oklch(60% 0.15 250);
  --accent: rebeccapurple;
  --surface: var(--brand);
}

.toy {
  color: var(--brand);
  border-color: var(--accent);
  background: var(--surface);
}

.unknown {
  color: var(--missing);
}`;

function toCssColor(color: {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}) {
  return `rgb(${Math.round(color.red)} ${Math.round(color.green)} ${Math.round(
    color.blue,
  )}${color.alpha < 1 ? ` / ${Number(color.alpha.toFixed(3))}` : ""})`;
}

function collectCustomProperties(source: string) {
  const declarations = new Map<string, string>();

  for (const match of source.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)\s*;/g)) {
    const [, name, value] = match;
    if (name && value) declarations.set(name, value.trim());
  }

  return declarations;
}

function resolveVariable(
  name: string,
  declarations: Map<string, string>,
  seen = new Set<string>(),
): string | null {
  if (seen.has(name)) return null;

  const raw = declarations.get(name);
  if (!raw) return null;

  const parsed = parseCssColor(raw);
  if (parsed) return toCssColor(parsed.color);

  const variable = raw.match(/^var\((--[\w-]+)\)$/);
  if (!variable?.[1]) return null;

  const nextSeen = new Set(seen);
  nextSeen.add(name);

  return resolveVariable(variable[1], declarations, nextSeen);
}

export default function ResolveCustomProperties() {
  const [source, setSource] = useState(initialSource);

  const result = useMemo(() => {
    const declarations = collectCustomProperties(source);
    const resolved = new Map<string, string>();

    for (const name of declarations.keys()) {
      const value = resolveVariable(name, declarations);
      if (value) resolved.set(name, value);
    }

    const output = source.replace(
      /var\((--[\w-]+)\)/g,
      (fullMatch, name: string) => resolved.get(name) ?? fullMatch,
    );

    return {
      output,
      resolved: [...resolved.entries()],
    };
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="resolve-custom-properties-source">CSS source</label>
      <textarea
        id="resolve-custom-properties-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="resolved-properties">
        {result.resolved.map(([name, value]) => (
          <div className="resolved-property-row" key={name}>
            <code>{name}</code>
            <span>→</span>
            <code>{value}</code>
          </div>
        ))}
      </div>

      <div className="output-label">CSS with resolvable variables inlined</div>
      <pre>{result.output}</pre>
    </div>
  );
}
