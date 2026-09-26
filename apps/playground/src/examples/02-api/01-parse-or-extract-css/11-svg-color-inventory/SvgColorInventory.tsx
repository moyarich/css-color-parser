import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSvg = `<svg viewBox="0 0 120 60">
  <rect width="120" height="60" fill="#0f172a" />
  <circle cx="30" cy="30" r="18" fill="oklch(72% 0.16 210)" />
  <circle cx="72" cy="30" r="18" fill="rebeccapurple" />
  <path d="M92 12 L112 30 L92 48 Z" fill="rgb(255 120 80)" />
</svg>`;

function rgba(color: {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}) {
  return `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;
}

export default function SvgColorInventory() {
  const [source, setSource] = useState(initialSvg);
  const matches = useMemo(() => extractCssColors(source), [source]);

  return (
    <div className="usage-example">
      <label htmlFor="svg-inventory-source">SVG markup</label>
      <textarea
        id="svg-inventory-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="svg-palette">
        {matches.map((match) => (
          <article className="svg-palette-item" key={`${match.start}-${match.end}`}>
            <span
              className="svg-palette-swatch"
              style={{ background: rgba(match.color) }}
            />
            <code>{match.value}</code>
            <span>{match.format}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
