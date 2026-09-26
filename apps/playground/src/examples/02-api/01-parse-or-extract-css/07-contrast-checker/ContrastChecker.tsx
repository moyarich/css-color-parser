import { useMemo, useState } from "react";
import { parseCssColor } from "@moyarich/css-color-parser";

function channelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(red: number, green: number, blue: number) {
  return (
    0.2126 * channelToLinear(red) +
    0.7152 * channelToLinear(green) +
    0.0722 * channelToLinear(blue)
  );
}

function contrastRatio(
  foreground: { red: number; green: number; blue: number },
  background: { red: number; green: number; blue: number },
) {
  const lighter = Math.max(
    luminance(foreground.red, foreground.green, foreground.blue),
    luminance(background.red, background.green, background.blue),
  );
  const darker = Math.min(
    luminance(foreground.red, foreground.green, foreground.blue),
    luminance(background.red, background.green, background.blue),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

export default function ContrastChecker() {
  const [foreground, setForeground] = useState("oklch(25% 0.03 260)");
  const [background, setBackground] = useState("#ffffff");

  const result = useMemo(() => {
    const fg = parseCssColor(foreground);
    const bg = parseCssColor(background);

    if (!fg || !bg) return null;

    const ratio = contrastRatio(fg.color, bg.color);

    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      fg,
      bg,
    };
  }, [foreground, background]);

  return (
    <div className="usage-example">
      <div className="contrast-inputs">
        <div>
          <label htmlFor="contrast-foreground">Foreground</label>
          <input
            id="contrast-foreground"
            value={foreground}
            onChange={(event) => setForeground(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <label htmlFor="contrast-background">Background</label>
          <input
            id="contrast-background"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <div
        className="contrast-preview"
        style={{
          color: foreground,
          background,
        }}
      >
        Aa
      </div>

      {result ? (
        <div className="contrast-results">
          <strong>{result.ratio.toFixed(2)}:1</strong>
          <span>AA normal text: {result.aaNormal ? "Pass" : "Fail"}</span>
          <span>AA large text: {result.aaLarge ? "Pass" : "Fail"}</span>
        </div>
      ) : (
        <p className="usage-message">Both values must resolve to CSS colors.</p>
      )}
    </div>
  );
}
