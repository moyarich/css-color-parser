import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSource = `.demo {
  color: #06c;
  border-color: rgb(255 0 0 / 50%);
  outline-color: rebeccapurple;
  background: linear-gradient(
    hwb(190 10% 15%),
    oklch(60% 0.15 250),
    color(display-p3 1 0.2 0.1)
  );
}`;

export default function FormatInventory() {
  const [source, setSource] = useState(initialSource);

  const inventory = useMemo(() => {
    const matches = extractCssColors(source);
    const counts = new Map<string, number>();

    for (const match of matches) {
      counts.set(match.format, (counts.get(match.format) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([format, count]) => ({ format, count }))
      .sort((left, right) => right.count - left.count);
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="format-inventory-source">CSS source</label>
      <textarea
        id="format-inventory-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="format-inventory">
        {inventory.map(({ format, count }) => (
          <div className="format-row" key={format}>
            <code>{format}</code>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
