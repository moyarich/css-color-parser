import { useMemo, useState } from "react";
import { parseCssColor } from "@moyarich/css-color-parser";
import "./BlendModePreview.css";

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

type Layer = "foreground" | "background";

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

function toHex(color: Rgba) {
  const channel = (value: number) =>
    Math.round(value).toString(16).padStart(2, "0");

  return `#${channel(color.red)}${channel(color.green)}${channel(color.blue)}`;
}

export default function BlendModePreview() {
  const [foreground, setForeground] = useState("#dc7182");
  const [background, setBackground] = useState("#42bfd0");
  const [mode, setMode] =
    useState<(typeof blendModes)[number]>("multiply");
  const [topLayer, setTopLayer] = useState<Layer>("foreground");

  const parsed = useMemo(() => {
    const foregroundResult = parseCssColor(foreground);
    const backgroundResult = parseCssColor(background);

    if (!foregroundResult || !backgroundResult) return null;

    return {
      foreground: toCssColor(foregroundResult.color),
      background: toCssColor(backgroundResult.color),
      foregroundPicker: toHex(foregroundResult.color),
      backgroundPicker: toHex(backgroundResult.color),
      foregroundFormat: foregroundResult.format,
      backgroundFormat: backgroundResult.format,
    };
  }, [foreground, background]);

  const generatedCss = parsed
    ? `.blend-demo {
  position: relative;
  isolation: isolate;
}

.blend-demo__foreground {
  background: ${parsed.foreground};
  ${topLayer === "foreground" ? `mix-blend-mode: ${mode};` : ""}
  z-index: ${topLayer === "foreground" ? 2 : 1};
}

.blend-demo__background {
  background: ${parsed.background};
  ${topLayer === "background" ? `mix-blend-mode: ${mode};` : ""}
  z-index: ${topLayer === "background" ? 2 : 1};
}`
    : "";

  return (
    <div className="usage-example blend-mode-example">
      <div className="blend-controls">
        <div className="blend-control">
          <label htmlFor="blend-foreground">Foreground</label>
          <div className="blend-color-input">
            <input
              id="blend-foreground"
              value={foreground}
              onChange={(event) => setForeground(event.target.value)}
              spellCheck={false}
            />
            <input
              type="color"
              aria-label="Pick foreground color"
              value={parsed?.foregroundPicker ?? "#000000"}
              onChange={(event) => setForeground(event.target.value)}
            />
          </div>
        </div>

        <div className="blend-control">
          <label htmlFor="blend-background">Background</label>
          <div className="blend-color-input">
            <input
              id="blend-background"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
              spellCheck={false}
            />
            <input
              type="color"
              aria-label="Pick background color"
              value={parsed?.backgroundPicker ?? "#ffffff"}
              onChange={(event) => setBackground(event.target.value)}
            />
          </div>
        </div>

        <div className="blend-control">
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

        <div className="blend-control">
          <span className="blend-control-label">Top layer</span>
          <div className="blend-layer-switch" role="group" aria-label="Top layer">
            {(["foreground", "background"] as const).map((layer) => (
              <button
                key={layer}
                type="button"
                aria-pressed={topLayer === layer}
                onClick={() => setTopLayer(layer)}
              >
                {layer === "foreground" ? "Foreground" : "Background"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {parsed ? (
        <>
          <div className="blend-venn-preview">
            <div
              className="blend-circle blend-circle--foreground"
              style={{
                background: parsed.foreground,
                mixBlendMode: topLayer === "foreground" ? mode : "normal",
                zIndex: topLayer === "foreground" ? 2 : 1,
              }}
            />
            <div
              className="blend-circle blend-circle--background"
              style={{
                background: parsed.background,
                mixBlendMode: topLayer === "background" ? mode : "normal",
                zIndex: topLayer === "background" ? 2 : 1,
              }}
            />
          </div>

          <div className="blend-values">
            <div>
              <span>Foreground</span>
              <code>{parsed.foreground}</code>
              <small>{parsed.foregroundFormat}</small>
            </div>
            <div>
              <span>Background</span>
              <code>{parsed.background}</code>
              <small>{parsed.backgroundFormat}</small>
            </div>
            <div>
              <span>Blend mode</span>
              <code>{mode}</code>
              <small>Rendered by CSS</small>
            </div>
            <div>
              <span>Top layer</span>
              <code>{topLayer}</code>
              <small>Switch to compare stacking</small>
            </div>
          </div>

          <div className="blend-generated-css">
            <div className="output-label">Generated CSS</div>
            <pre>{generatedCss}</pre>
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
