import { useMemo, useState } from "react";
import { parseCssColor } from "@moyarich/css-color-parser";

const blendModes = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

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

export default function BlendModePreview() {
  const [foreground, setForeground] = useState("oklch(60% 0.15 250)");
  const [background, setBackground] = useState("#f59e0b");
  const [mode, setMode] =
    useState<(typeof blendModes)[number]>("multiply");

  const parsed = useMemo(() => {
    const fg = parseCssColor(foreground);
    const bg = parseCssColor(background);

    if (!fg || !bg) return null;

    return {
      foreground: toCssColor(fg.color),
      background: toCssColor(bg.color),
      fgFormat: fg.format,
      bgFormat: bg.format,
    };
  }, [foreground, background]);

  return (
    <div className="usage-example">
      <div className="blend-controls">
        <div>
          <label htmlFor="blend-foreground">Foreground</label>
          <input
            id="blend-foreground"
            value={foreground}
            onChange={(event) => setForeground(event.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor="blend-background">Background</label>
          <input
            id="blend-background"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <label htmlFor="blend-mode">mix-blend-mode</label>
          <select
            id="blend-mode"
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as (typeof blendModes)[number])
            }
          >
            {blendModes.map((blendMode) => (
              <option key={blendMode} value={blendMode}>
                {blendMode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {parsed ? (
        <>
          <div
            className="blend-preview"
            style={{ background: parsed.background }}
          >
            <div
              className="blend-preview__foreground"
              style={{
                background: parsed.foreground,
                mixBlendMode: mode,
              }}
            />
          </div>

          <div className="blend-values">
            <div>
              <span>Foreground</span>
              <code>{parsed.foreground}</code>
              <small>{parsed.fgFormat}</small>
            </div>
            <div>
              <span>Background</span>
              <code>{parsed.background}</code>
              <small>{parsed.bgFormat}</small>
            </div>
            <div>
              <span>Blend mode</span>
              <code>{mode}</code>
              <small>Rendered by CSS</small>
            </div>
          </div>
        </>
      ) : (
        <p className="usage-message">
          Both foreground and background must resolve to supported CSS colors.
        </p>
      )}
    </div>
  );
}
