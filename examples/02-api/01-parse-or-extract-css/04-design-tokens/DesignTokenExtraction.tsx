import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSource = `:root {
  --brand: #635bff;
  --brand-alias: rgb(99 91 255);
  --brand-muted: color-mix(in srgb, #635bff 35%, white);
  --surface: oklch(98% 0.01 250);
  --text: rebeccapurple;
  --danger: rgb(220 38 38);
}

.card {
  border-color: hwb(210 12% 20%);
}`;

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

function toCssColor(color: Rgba) {
  return `rgb(${Math.round(color.red)} ${Math.round(color.green)} ${Math.round(
    color.blue,
  )}${color.alpha < 1 ? ` / ${Number(color.alpha.toFixed(3))}` : ""})`;
}

function colorKey(color: Rgba) {
  return [
    Math.round(color.red),
    Math.round(color.green),
    Math.round(color.blue),
    Number(color.alpha.toFixed(4)),
  ].join(",");
}

function findCustomProperty(source: string, start: number) {
  const before = source.slice(0, start);
  const declarationStart =
    Math.max(before.lastIndexOf(";"), before.lastIndexOf("{")) + 1;
  const declarationPrefix = before.slice(declarationStart);
  const match = declarationPrefix.match(/(--[\w-]+)\s*:\s*[^;]*$/);

  return match?.[1] ?? null;
}

export default function DesignTokenExtraction() {
  const [source, setSource] = useState(initialSource);

  const { palette, generatedCss } = useMemo(() => {
    const groups = new Map<
      string,
      {
        color: Rgba;
        format: string;
        values: Set<string>;
        names: Set<string>;
      }
    >();

    for (const match of extractCssColors(source)) {
      const key = colorKey(match.color);
      const group = groups.get(key) ?? {
        color: match.color,
        format: match.format,
        values: new Set<string>(),
        names: new Set<string>(),
      };

      group.values.add(match.value);

      const name = findCustomProperty(source, match.start);
      if (name) group.names.add(name);

      groups.set(key, group);
    }

    const palette = [...groups.values()].map((group, index) => ({
      ...group,
      names: [...group.names],
      values: [...group.values],
      normalized: toCssColor(group.color),
      fallbackName: `--color-${index + 1}`,
    }));

    const declarations = palette.flatMap((item) => {
      const names = item.names.length ? item.names : [item.fallbackName];

      return names.map((name) => `  ${name}: ${item.normalized};`);
    });

    return {
      palette,
      generatedCss: [":root {", ...declarations, "}"].join("\n"),
    };
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="token-source">Stylesheet or :root block</label>
      <textarea
        id="token-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="palette-summary">
        <strong>{palette.length} unique colors</strong>
        <span>Equivalent syntaxes are grouped by resolved RGBA.</span>
      </div>

      <div className="token-grid">
        {palette.map((item) => (
          <article className="token-card" key={item.normalized}>
            <span
              className="token-swatch"
              style={{ background: item.normalized }}
            />
            <div>
              <strong>
                {item.names.length
                  ? item.names.join(", ")
                  : item.fallbackName}
              </strong>
              <code>{item.normalized}</code>
              <span>
                {item.format} · {item.values.join(" · ")}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="generated-css">
        <div className="output-label">Generated normalized theme CSS</div>
        <pre>{generatedCss}</pre>
      </div>
    </div>
  );
}
