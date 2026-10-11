import { useState } from "react";
import { parseCssColor } from "@moyarich/css-color-parser";

export default function NormalizedSwatch() {
  const [value, setValue] = useState("oklch(60% 0.15 250)");
  const parsed = parseCssColor(value);

  const normalized = parsed
    ? `rgba(${Math.round(parsed.color.red)}, ${Math.round(parsed.color.green)}, ${Math.round(parsed.color.blue)}, ${parsed.color.alpha})`
    : null;

  return (
    <div className="usage-example">
      <label htmlFor="normalized-swatch-input">CSS color</label>
      <input
        id="normalized-swatch-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
      />

      <div className="swatch-result">
        <div
          className="normalized-swatch"
          style={{ background: normalized ?? "transparent" }}
          aria-label={normalized ? `Preview of ${normalized}` : "Invalid color"}
        />
        <div>
          <strong>{parsed ? "Resolved color" : "Not resolved"}</strong>
          {parsed ? (
            <>
              <code>{normalized}</code>
              <span>{parsed.format}</span>
            </>
          ) : (
            <span>Enter a supported CSS color value.</span>
          )}
        </div>
      </div>
    </div>
  );
}
