import { getAlpha, getBlue, getGreen, getRed } from "color-bits";
import { parseCSS } from "color-bits/css";
import { CSS_COLOR_FUNCTION_FORMATS } from "./colorFunctions";
import { CSS_NAMED_COLORS } from "./namedColors";
import type { CssColorFormat, RgbaColor } from "./types";

export interface ParsedCssColor {
  value: string;
  format: CssColorFormat;
  color: RgbaColor;
}

export type CssCustomProperties =
  | Readonly<Record<string, string>>
  | ReadonlyMap<string, string>;

export interface ParseCssColorOptions {
  customProperties?: CssCustomProperties;
}

function getCustomProperty(
  customProperties: CssCustomProperties,
  name: string,
) {
  return customProperties instanceof Map
    ? customProperties.get(name)
    : customProperties[name];
}

function findClosingParenthesis(value: string, openIndex: number) {
  let depth = 0;

  for (let index = openIndex; index < value.length; index += 1) {
    const character = value[index];

    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function splitVarArguments(body: string) {
  let depth = 0;

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];

    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
    } else if (character === "," && depth === 0) {
      return [body.slice(0, index), body.slice(index + 1)] as const;
    }
  }

  return [body, undefined] as const;
}

function resolveCssVariablesInternal(
  value: string,
  customProperties: CssCustomProperties,
  resolving: ReadonlySet<string>,
): string | null {
  let output = "";
  let cursor = 0;

  while (cursor < value.length) {
    const match = /\bvar\s*\(/gi.exec(value.slice(cursor));

    if (!match) {
      output += value.slice(cursor);
      break;
    }

    const start = cursor + match.index;
    const open = start + match[0].lastIndexOf("(");
    const close = findClosingParenthesis(value, open);

    if (close < 0) {
      return null;
    }

    output += value.slice(cursor, start);

    const body = value.slice(open + 1, close);
    const [rawName, rawFallback] = splitVarArguments(body);
    const name = rawName.trim();

    if (!/^--[\w-]+$/.test(name)) {
      return null;
    }

    let replacement: string | null = null;

    if (!resolving.has(name)) {
      const customValue = getCustomProperty(customProperties, name);

      if (customValue !== undefined) {
        const nextResolving = new Set(resolving);
        nextResolving.add(name);
        replacement = resolveCssVariablesInternal(
          customValue,
          customProperties,
          nextResolving,
        );
      }
    }

    if (replacement === null && rawFallback !== undefined) {
      replacement = resolveCssVariablesInternal(
        rawFallback.trim(),
        customProperties,
        resolving,
      );
    }

    if (replacement === null) {
      return null;
    }

    output += replacement;
    cursor = close + 1;
  }

  return output;
}

/**
 * Resolves CSS var() references from an explicit custom-property context.
 *
 * Supports nested aliases, fallback values, and cycle detection. Returns null
 * when a referenced property cannot be resolved.
 */
export function resolveCssVariables(
  value: string,
  customProperties: CssCustomProperties,
) {
  return resolveCssVariablesInternal(value, customProperties, new Set());
}


const HEX_COLOR_PATTERN = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_COLOR_PATTERN = /^rgba?\(([\s\S]*)\)$/i;
const HSL_COLOR_PATTERN = /^hsla?\(([\s\S]*)\)$/i;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function parseHexByte(value: string) {
  return Number.parseInt(value, 16);
}

function expandHexDigit(value: string) {
  return value + value;
}

export function parseHexColor(value: string): RgbaColor | null {
  const match = HEX_COLOR_PATTERN.exec(value);
  const digits = match?.[1];

  if (!digits) {
    return null;
  }

  if (digits.length === 3 || digits.length === 4) {
    return {
      red: parseHexByte(expandHexDigit(digits[0] ?? "")),
      green: parseHexByte(expandHexDigit(digits[1] ?? "")),
      blue: parseHexByte(expandHexDigit(digits[2] ?? "")),
      alpha:
        digits.length === 4
          ? parseHexByte(expandHexDigit(digits[3] ?? "")) / 255
          : 1,
    };
  }

  return {
    red: parseHexByte(digits.slice(0, 2)),
    green: parseHexByte(digits.slice(2, 4)),
    blue: parseHexByte(digits.slice(4, 6)),
    alpha: digits.length === 8 ? parseHexByte(digits.slice(6, 8)) / 255 : 1,
  };
}

export function parsePercentage(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed.endsWith("%")) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed.slice(0, -1));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRgbChannel(value: string): number | null {
  const percentage = parsePercentage(value);

  if (percentage !== null) {
    return (clamp(percentage, 0, 100) / 100) * 255;
  }

  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? clamp(parsed, 0, 255) : null;
}

export function parseAlpha(value: string | undefined): number | null {
  if (value === undefined) {
    return 1;
  }

  const percentage = parsePercentage(value);

  if (percentage !== null) {
    return clamp(percentage / 100, 0, 1);
  }

  const parsed = Number.parseFloat(value.trim());
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : null;
}

export interface FunctionalComponents {
  components: string[];
  alpha?: string;
}

export function parseFunctionalComponents(body: string): FunctionalComponents | null {
  const slashParts = body.split("/");

  if (slashParts.length > 2) {
    return null;
  }

  const channels = slashParts[0]?.trim() ?? "";
  const slashAlpha = slashParts[1]?.trim();

  if (!channels) {
    return null;
  }

  if (channels.includes(",")) {
    const components = channels.split(",").map((component) => component.trim());
    let alpha: string | undefined = slashAlpha;

    if (alpha === undefined && components.length === 4) {
      const poppedAlpha = components.pop();

      if (poppedAlpha === undefined) {
        return null;
      }

      alpha = poppedAlpha;
    }

    if (components.length !== 3 || components.some((component) => !component)) {
      return null;
    }

    return { components, alpha };
  }

  const components = channels.split(/\s+/).filter(Boolean);

  if (components.length !== 3) {
    return null;
  }

  return { components, alpha: slashAlpha };
}

export function parseRgbColor(value: string): RgbaColor | null {
  const body = RGB_COLOR_PATTERN.exec(value)?.[1];

  if (body === undefined) {
    return null;
  }

  const parsed = parseFunctionalComponents(body);

  if (!parsed) {
    return null;
  }

  const red = parseRgbChannel(parsed.components[0] ?? "");
  const green = parseRgbChannel(parsed.components[1] ?? "");
  const blue = parseRgbChannel(parsed.components[2] ?? "");
  const alpha = parseAlpha(parsed.alpha);

  if (red === null || green === null || blue === null || alpha === null) {
    return null;
  }

  return { red, green, blue, alpha };
}

export function parseHue(value: string): number | null {
  const trimmed = value.trim().toLowerCase();
  const parsed = Number.parseFloat(trimmed);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  let degrees = parsed;

  if (trimmed.endsWith("turn")) {
    degrees = parsed * 360;
  } else if (trimmed.endsWith("grad")) {
    degrees = parsed * 0.9;
  } else if (trimmed.endsWith("rad")) {
    degrees = (parsed * 180) / Math.PI;
  } else if (trimmed.endsWith("deg")) {
    degrees = parsed;
  } else if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return null;
  }

  return ((degrees % 360) + 360) % 360;
}

function hueToRgb(p: number, q: number, hue: number) {
  let channel = hue;

  if (channel < 0) {
    channel += 1;
  }

  if (channel > 1) {
    channel -= 1;
  }

  if (channel < 1 / 6) {
    return p + (q - p) * 6 * channel;
  }

  if (channel < 1 / 2) {
    return q;
  }

  if (channel < 2 / 3) {
    return p + (q - p) * (2 / 3 - channel) * 6;
  }

  return p;
}

export function hslToRgb(hue: number, saturation: number, lightness: number) {
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  if (s === 0) {
    const gray = l * 255;
    return [gray, gray, gray] as const;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    hueToRgb(p, q, h + 1 / 3) * 255,
    hueToRgb(p, q, h) * 255,
    hueToRgb(p, q, h - 1 / 3) * 255,
  ] as const;
}

export function parseHslColor(value: string): RgbaColor | null {
  const body = HSL_COLOR_PATTERN.exec(value)?.[1];

  if (body === undefined) {
    return null;
  }

  const parsed = parseFunctionalComponents(body);

  if (!parsed) {
    return null;
  }

  const hue = parseHue(parsed.components[0] ?? "");
  const saturation = parsePercentage(parsed.components[1] ?? "");
  const lightness = parsePercentage(parsed.components[2] ?? "");
  const alpha = parseAlpha(parsed.alpha);

  if (
    hue === null ||
    saturation === null ||
    lightness === null ||
    alpha === null
  ) {
    return null;
  }

  const [red, green, blue] = hslToRgb(
    hue,
    clamp(saturation, 0, 100),
    clamp(lightness, 0, 100),
  );

  return { red, green, blue, alpha };
}

export function parseNamedColor(value: string): RgbaColor | null {
  const normalized = value.trim().toLowerCase();
  const hex = CSS_NAMED_COLORS[normalized as keyof typeof CSS_NAMED_COLORS];

  return hex ? parseHexColor(hex) : null;
}

/**
 * Parses one complete CSS color literal.
 *
 * Supports absolute and relative CSS color functions, color-mix(), hex,
 * transparent, named colors, and var() when customProperties are provided.
 * Other context-dependent expressions return null.
 */
export function parseCssColor(
  value: string,
  options: ParseCssColorOptions = {},
): ParsedCssColor | null {
  const original = value.trim();

  if (!original) {
    return null;
  }

  const trimmed = options.customProperties
    ? resolveCssVariables(original, options.customProperties)
    : original;

  if (!trimmed) {
    return null;
  }

  const hex = parseHexColor(trimmed);

  if (hex) {
    return { value: original, format: "hex", color: hex };
  }

  const rgb = parseRgbColor(trimmed);

  if (rgb) {
    return { value: original, format: "rgb", color: rgb };
  }

  const hsl = parseHslColor(trimmed);

  if (hsl) {
    return { value: original, format: "hsl", color: hsl };
  }

  const named = parseNamedColor(trimmed);

  if (named) {
    return { value: original, format: "named", color: named };
  }

  const functionName = /^([a-z-]+)\(/i.exec(trimmed)?.[1]?.toLowerCase();
  const format = functionName && CSS_COLOR_FUNCTION_FORMATS.get(functionName);

  const advancedRgbOrHsl = /\b(?:from|none)\b|\([^()]*\(/i.test(trimmed);
  if (format && ((format !== "rgb" && format !== "hsl") || advancedRgbOrHsl)) {
    try {
      // Retain the existing floating-point precision for simple RGB/HSL above.
      // Advanced colors use color-bits' 8-bit sRGB representation.
      const color = parseCSS(trimmed);
      return {
        value: original,
        format,
        color: {
          red: getRed(color),
          green: getGreen(color),
          blue: getBlue(color),
          alpha: getAlpha(color) / 255,
        },
      };
    } catch {
      // Incomplete edits and colors requiring a CSS cascade are not resolvable.
      return null;
    }
  }

  return null;
}
