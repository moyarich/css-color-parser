import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialSource = `:root {
  --brand: #663399;
  --brand-name: rebeccapurple;
  --brand-rgb: rgb(102 51 153);
  --white-a: #fff;
  --white-b: rgb(255 255 255);
  --accent: #06c;
}`;

function keyOf(color: {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}) {
  return [
    Math.round(color.red),
    Math.round(color.green),
    Math.round(color.blue),
    Number(color.alpha.toFixed(4)),
  ].join(",");
}

export default function DuplicateColorAudit() {
  const [source, setSource] = useState(initialSource);

  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      ReturnType<typeof extractCssColors>
    >();

    for (const match of extractCssColors(source)) {
      const key = keyOf(match.color);
      const entries = grouped.get(key) ?? [];
      entries.push(match);
      grouped.set(key, entries);
    }

    return [...grouped.entries()]
      .filter(([, entries]) => entries.length > 1)
      .map(([key, entries]) => ({ key, entries }));
  }, [source]);

  return (
    <div className="usage-example">
      <label htmlFor="duplicate-audit-source">CSS source</label>
      <textarea
        id="duplicate-audit-source"
        className="usage-textarea"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
      />

      <div className="duplicate-groups">
        {groups.length ? (
          groups.map(({ key, entries }) => (
            <article className="duplicate-group" key={key}>
              <span
                className="token-swatch"
                style={{ background: entries[0]?.value }}
              />
              <div>
                <strong>{entries.length} syntaxes resolve to one color</strong>
                <div className="duplicate-values">
                  {entries.map((entry) => (
                    <code key={`${entry.start}-${entry.end}`}>
                      {entry.value}
                    </code>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="usage-message">No duplicate resolved colors found.</p>
        )}
      </div>
    </div>
  );
}
