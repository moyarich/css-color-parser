import type { RgbaColor } from "./types";

export type CssColorOutputFormat = "rgb" | "hex";

export interface FormatCssColorOptions {
  /**
   * Output syntax. Defaults to modern rgb().
   */
  format?: CssColorOutputFormat;
  /**
   * Maximum decimal places used for alpha. Defaults to 3.
   */
  alphaPrecision?: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundChannel(value: number) {
  return Math.round(clamp(value, 0, 255));
}

function roundAlpha(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(clamp(value, 0, 1) * factor) / factor;
}

function hexByte(value: number) {
  return roundChannel(value).toString(16).padStart(2, "0");
}

/**
 * Serializes resolved RGBA channels back to valid CSS color syntax.
 *
 * Because parsing resolves colors to sRGB channels, serialization produces
 * normalized sRGB CSS rather than attempting to reconstruct the original
 * source syntax.
 */
export function formatCssColor(
  color: RgbaColor,
  options: FormatCssColorOptions = {},
) {
  const { format = "rgb", alphaPrecision = 3 } = options;
  const red = roundChannel(color.red);
  const green = roundChannel(color.green);
  const blue = roundChannel(color.blue);
  const alpha = roundAlpha(color.alpha, alphaPrecision);

  if (format === "hex") {
    const rgb = `#${hexByte(red)}${hexByte(green)}${hexByte(blue)}`;

    return alpha === 1
      ? rgb
      : `${rgb}${hexByte(alpha * 255)}`;
  }

  return alpha === 1
    ? `rgb(${red} ${green} ${blue})`
    : `rgb(${red} ${green} ${blue} / ${alpha})`;
}
