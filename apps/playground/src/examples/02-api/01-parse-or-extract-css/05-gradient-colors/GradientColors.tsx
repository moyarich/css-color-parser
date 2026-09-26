import { useMemo, useState } from "react";
import { extractCssColors } from "@moyarich/css-color-parser";

const initialGradient =
  "linear-gradient(135deg, #635bff, oklch(72% 0.16 210), rgb(255 120 80 / 85%), rebeccapurple)";

const toCssColor = (color: { red: number; green: number; blue: number; alpha: number }) =>
  `rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${color.alpha})`;

export default function GradientColors() {
  const [value, setValue] = useState(initialGradient);
  const matches = useMemo(() => extractCssColors(value), [value]);

  return (
    <div className="usage-example">
      <label htmlFor="gradient-source">Gradient or CSS expression</label>
      <textarea
        id="gradient-source"
        className="usage-textarea usage-textarea--compact"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        spellCheck={false}
      />

      <div className="gradient-preview" style={{ background: value }} />

      <div className="gradient-stops">
        {matches.map((match) => (
          <div className="gradient-stop" key={`${match.start}-${match.end}`}>
            <span
              className="gradient-stop-swatch"
              style={{ background: toCssColor(match.color) }}
            />
            <code>{match.value}</code>
            <span>[{match.start}, {match.end})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
