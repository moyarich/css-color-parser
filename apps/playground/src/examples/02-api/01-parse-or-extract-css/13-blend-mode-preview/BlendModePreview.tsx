import { useMemo, useState, type CSSProperties } from "react";
import {
  formatCssColor,
  parseCssColor,
} from "@moyarich/css-color-parser";
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

export default function BlendModePreview() {
  const [foreground, setForeground] = useState("#dc7182");
  const [background, setBackground] = useState("#42bfd0");
  const [canvas, setCanvas] = useState("#f7eef8");
  const [mode, setMode] =
    useState<(typeof blendModes)[number]>("multiply");
  const [topLayer, setTopLayer] = useState<Layer>("foreground");

  const parsed = useMemo(() => {
    const foregroundResult = parseCssColor(foreground);
    const backgroundResult = parseCssColor(background);
    const canvasResult = parseCssColor(canvas);

    if (!foregroundResult || !backgroundResult || !canvasResult) return null;

    return {
      foreground: formatCssColor(foregroundResult.color),
      background: formatCssColor(backgroundResult.color),
      canvas: formatCssColor(canvasResult.color),
      foregroundPicker: formatCssColor(foregroundResult.color, {
        format: "hex",
      }).slice(0, 7),
      backgroundPicker: formatCssColor(backgroundResult.color, {
        format: "hex",
      }).slice(0, 7),
      canvasPicker: formatCssColor(canvasResult.color, {
        format: "hex",
      }).slice(0, 7),
      foregroundFormat: foregroundResult.format,
      backgroundFormat: backgroundResult.format,
      canvasFormat: canvasResult.format,
    };
  }, [foreground, background, canvas]);

  const generatedCss = parsed
    ? `.blend-demo {
  --blend-foreground: ${parsed.foreground};
  --blend-background: ${parsed.background};
  --blend-canvas: ${parsed.canvas};
  --blend-mode: ${mode};
  --foreground-z: ${topLayer === "foreground" ? 2 : 1};
  --background-z: ${topLayer === "background" ? 2 : 1};

  position: relative;
  isolation: isolate;
  background: var(--blend-canvas);
}

.blend-demo__foreground,
.blend-demo__background {
  position: absolute;
  border-radius: 50%;
}

.blend-demo__foreground {
  z-index: var(--foreground-z);
  background: var(--blend-foreground);
  ${topLayer === "foreground" ? "mix-blend-mode: var(--blend-mode);" : ""}
}

.blend-demo__background {
  z-index: var(--background-z);
  background: var(--blend-background);
  ${topLayer === "background" ? "mix-blend-mode: var(--blend-mode);" : ""}
}`
    : "";

  const previewStyle = parsed
    ? ({
        "--blend-foreground": parsed.foreground,
        "--blend-background": parsed.background,
        "--blend-canvas": parsed.canvas,
        "--blend-mode": mode,
      } as CSSProperties)
    : undefined;

  return (
    <div className="usage-example blend-mode-example">
      <div className="blend-workbench">
        <aside className="blend-sidebar">
          <div className="blend-sidebar__section">
            <span className="blend-sidebar__title">Colors</span>

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
              <label htmlFor="blend-canvas">Canvas</label>
              <div className="blend-color-input">
                <input
                  id="blend-canvas"
                  value={canvas}
                  onChange={(event) => setCanvas(event.target.value)}
                  spellCheck={false}
                />
                <input
                  type="color"
                  aria-label="Pick canvas color"
                  value={parsed?.canvasPicker ?? "#ffffff"}
                  onChange={(event) => setCanvas(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="blend-sidebar__section">
            <span className="blend-sidebar__title">Blend mode</span>
            <div className="blend-mode-grid" role="group" aria-label="Blend mode">
              {blendModes.map((blendMode) => (
                <button
                  key={blendMode}
                  type="button"
                  aria-pressed={mode === blendMode}
                  onClick={() => setMode(blendMode)}
                >
                  {blendMode}
                </button>
              ))}
            </div>
          </div>

          <div className="blend-sidebar__section">
            <span className="blend-sidebar__title">Top layer</span>
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
        </aside>

        <div className="blend-main">
          {parsed ? (
            <div
              className="blend-venn-preview"
              data-top-layer={topLayer}
              style={previewStyle}
            >
              <div className="blend-circle blend-circle--foreground" />
              <div className="blend-circle blend-circle--background" />
            </div>
          ) : (
            <div className="blend-invalid">
              Foreground, background, and canvas must resolve to supported CSS colors.
            </div>
          )}
        </div>
      </div>

      {parsed && (
        <>
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
              <span>Canvas</span>
              <code>{parsed.canvas}</code>
              <small>{parsed.canvasFormat}</small>
            </div>
            <div>
              <span>Blend mode</span>
              <code>{mode}</code>
              <small>CSS variable</small>
            </div>
            <div>
              <span>Top layer</span>
              <code>{topLayer}</code>
              <small>Controls stacking</small>
            </div>
          </div>

          <div className="blend-generated-css">
            <div className="output-label">Generated CSS</div>
            <pre>{generatedCss}</pre>
          </div>
        </>
      )}
    </div>
  );
}
