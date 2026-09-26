import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSource = `:root {
  --brand: #635bff;
  --brand-muted: color-mix(in srgb, #635bff 35%, white);
  --surface: oklch(98% 0.01 250);
  --text: rebeccapurple;
  --danger: rgb(220 38 38);
}`;

const toCssColor = (color: { red: number; green: number; blue: number; alpha: number }) =>
  `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;

export default function DesignTokenExtraction() {
  const [source, setSource] = useState(initialSource);

  const tokens = useMemo(() => {
    const matches = extractCssColors(source);

    return matches.map((match) => {
      const before = source.slice(0, match.start);
      const declarationStart = before.lastIndexOf("--");
      const colon = before.lastIndexOf(":");
      const name =
        declarationStart >= 0 && colon > declarationStart
          ? before.slice(declarationStart, colon).trim()
          : "color";

      return {
        name,
        value: match.value,
        format: match.format,
        color: toCssColor(match.color),
      };
    });
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="token-source">CSS custom properties</label>
      <textarea
        id="token-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="token-grid">
        {tokens.map((token, index) => (
          <article className="token-card" key={`${token.name}-${index}`}>
            <span className="token-swatch" style={{ background: token.color }} />
            <div>
              <strong>{token.name}</strong>
              <code>{token.value}</code>
              <span>{token.format}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
