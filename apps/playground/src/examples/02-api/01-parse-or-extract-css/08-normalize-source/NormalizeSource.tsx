import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSource = `.card {
  color: rebeccapurple;
  border-color: #06c;
  background: linear-gradient(oklch(72% 0.16 210), rgb(255 120 80 / 85%));
}`;

function toRgba(color: {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}) {
  return `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${Number(color.alpha.toFixed(3))})`;
}

export default function NormalizeSource() {
  const [source, setSource] = useState(initialSource);

  const normalized = useMemo(() => {
    const matches = extractCssColors(source);
    let output = source;

    for (const match of [...matches].reverse()) {
      output =
        output.slice(0, match.start) +
        toRgba(match.color) +
        output.slice(match.end);
    }

    return { output, count: matches.length };
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="normalize-source-input">CSS source</label>
      <textarea
        id="normalize-source-input"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="output-label">
        Normalized source · {normalized.count} replacement
        {normalized.count === 1 ? "" : "s"}
      </div>
      <pre>{normalized.output}</pre>
    </div>
  );
}
