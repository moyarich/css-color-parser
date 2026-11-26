import { getAlpha, getBlue, getGreen, getRed, type ColorBits } from "color-bits";
import { colorModel, colorSpaceModel, parseCSS } from "color-bits/css";

const percentage = /^[+-]?(?:\d*\.?\d+)(?:e[+-]?\d+)?%$/i;
const interpolation = /^in\s+([\w-]+)(?:\s+(shorter|longer|increasing|decreasing)\s+hue)?$/i;

function invalid(): never {
  throw new Error("Invalid color-mix()");
}

/** Split only at the outer level, leaving nested functions intact. */
function split(value: string, commas: boolean): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === "(") depth++;
    else if (char === ")") {
      if (--depth < 0) invalid();
    } else if (depth === 0 && (commas ? char === "," : /\s/.test(char))) {
      const part = value.slice(start, i).trim();
      if (commas || part) parts.push(part);
      start = i + 1;
    }
  }
  if (depth !== 0) invalid();
  const last = value.slice(start).trim();
  if (commas || last) parts.push(last);
  return parts;
}

function huePair(a: number, b: number, method: string): [number, number] {
  const delta = b - a;
  if (method === "shorter") {
    if (delta > 180) a += 360;
    else if (delta < -180) b += 360;
  } else if (method === "longer") {
    if (delta > 0 && delta < 180) a += 360;
    else if (delta > -180 && delta <= 0) b += 360;
  } else if (method === "increasing" && b < a) b += 360;
  else if (method === "decreasing" && a < b) a += 360;
  return [a, b];
}

const wrapHue = (h: number) => ((h % 360) + 360) % 360;

/**
 * Resolve the Color 5 argument list using the existing color-bits conversion
 * models. Keep intermediate coordinates in the interpolation space.
 */
export function parseColorMix(value: string, depth = 0): ColorBits {
  if (depth > 32) invalid();
  const body = /^color-mix\(([\s\S]*)\)$/i.exec(value)?.[1];
  if (body === undefined) invalid();
  const groups = split(body.replace(/\/\*[\s\S]*?\*\//g, " "), true);
  let space = "oklab";
  let method = "shorter";
  let explicitHue = false;
  if (/^in(?:\s|$)/i.test(groups[0] ?? "")) {
    const clause = interpolation.exec(groups.shift() ?? "");
    if (!clause) invalid();
    space = clause[1].toLowerCase();
    explicitHue = clause[2] !== undefined;
    method = clause[2]?.toLowerCase() ?? method;
  }
  const model = colorSpaceModel(space) ?? colorModel(space);
  if (!model || groups.length === 0) invalid();
  const hue = model.hues.indexOf(true);
  if (explicitHue && hue < 0) invalid();

  const items = groups.map((group) => {
    const tokens = split(group, false);
    let weight: number | undefined;
    let color: string | undefined;
    for (const token of tokens) {
      if (percentage.test(token)) {
        if (weight !== undefined) invalid();
        weight = Number(token.slice(0, -1));
        if (!(weight >= 0 && weight <= 100)) invalid();
      } else {
        if (color !== undefined) invalid();
        color = token;
      }
    }
    if (!color) invalid();
    const bits = /^color-mix\(/i.test(color)
      ? parseColorMix(color, depth + 1)
      : parseCSS(color);
    const red = getRed(bits);
    const green = getGreen(bits);
    const blue = getBlue(bits);
    const channels = model.fromSrgb(
      red / 255,
      green / 255,
      blue / 255,
      new Float64Array(3),
    );
    if (hue >= 0 && red === green && green === blue) channels[hue] = NaN;
    return { channels, alpha: getAlpha(bits) / 255, weight };
  });

  const specified = items.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  const omitted = items.filter((item) => item.weight === undefined).length;
  const defaultWeight = omitted ? Math.max(0, 100 - specified) / omitted : 0;
  const weights = items.map((item) => item.weight ?? defaultWeight);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  // Match the MDN two-color zero-sum rule.
  if (total === 0) invalid();

  const mixed = items[0];
  let accumulated = weights[0];
  for (let i = 1; i < items.length; i++) {
    const next = items[i];
    const combined = accumulated + weights[i];
    const progress = combined === 0 ? 0.5 : weights[i] / combined;
    const previous = 1 - progress;
    const alpha = mixed.alpha * previous + next.alpha * progress;
    for (let channel = 0; channel < 3; channel++) {
      let a = mixed.channels[channel];
      let b = next.channels[channel];
      if (channel === hue) {
        if (Number.isNaN(a)) a = b;
        if (Number.isNaN(b)) b = a;
        if (!Number.isNaN(a)) {
          [a, b] = huePair(wrapHue(a), wrapHue(b), method);
        }
        mixed.channels[channel] = wrapHue(a * previous + b * progress);
      } else {
        const premultiplied =
          a * mixed.alpha * previous + b * next.alpha * progress;
        mixed.channels[channel] = alpha === 0 ? 0 : premultiplied / alpha;
      }
    }
    mixed.alpha = alpha;
    accumulated = combined;
  }
  return model.toColor(
    mixed.channels[0] || 0,
    mixed.channels[1] || 0,
    mixed.channels[2] || 0,
    Math.round(mixed.alpha * Math.min(1, total / 100) * 255),
  );
}
