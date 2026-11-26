import { test, expect } from "@playwright/test";
import { parseCssColor } from "../dist/index.js";

const cases = [
  "color-mix(in srgb, red, blue)",
  "color-mix(in srgb, red 25%, blue)",
  "color-mix(in srgb, 20% red, blue 20%)",
  "color-mix(in srgb, transparent, red)",
  "color-mix(in srgb, red 0%, blue)",
  "color-mix(in srgb, color-mix(in srgb, red, blue), white)",
  "color-mix(in srgb-linear, black, white)",
  "color-mix(in oklab, red, blue)",
  "color-mix(in hsl shorter hue, red, blue)",
  "color-mix(in hsl longer hue, red, blue)",
  "color-mix(in hsl increasing hue, red, blue)",
  "color-mix(in hsl decreasing hue, red, blue)",
];

const newerCases = [
  "color-mix(red, blue)",
  "color-mix(in srgb, red)",
  "color-mix(in srgb, 40% red)",
  "color-mix(in srgb, red, lime, blue)",
  "color-mix(in srgb, 20% red, lime 30%, blue)",
  "color-mix(in srgb, red, transparent, blue)",
  "color-mix(in srgb, red, lime, blue, white)",
];

async function compare(page, value, experimental = false) {
  const actual = await page.evaluate((css) => {
    if (!CSS.supports("color", css)) return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    // Opaque compositing avoids unpremultiplication noise for translucent colors.
    const element = document.createElement("span");
    element.style.color = css;
    document.body.append(element);
    const computed = getComputedStyle(element).color;
    element.remove();
    return ["black", "white"].map((background) => {
      context.fillStyle = background;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = computed;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data);
    });
  }, value);
  if (experimental) test.skip(actual === null, "Browser does not yet support this Color 5 syntax");
  expect(actual, value).not.toBeNull();
  const parsed = parseCssColor(value);
  expect(parsed, value).not.toBeNull();
  const { red, green, blue, alpha } = parsed.color;
  const expected = [0, 255].map((background) =>
    [red, green, blue].map((channel) =>
      Math.round(channel * alpha + background * (1 - alpha)),
    ),
  );
  for (let background = 0; background < 2; background++) {
    for (let channel = 0; channel < 3; channel++) {
      // Canvas compositing and the parser independently quantize to 8-bit.
      expect(Math.abs(actual[background][channel] - expected[background][channel]),
        value + " background=" + background + " channel=" + channel).toBeLessThanOrEqual(1);
    }
    expect(actual[background][3]).toBe(255);
  }
}

for (const value of cases) {
  test(value, async ({ page }) => compare(page, value));
}

for (const value of newerCases) {
  test(value, async ({ page }) => compare(page, value, true));
}

for (const value of [
  "color-mix(in imaginary, red, blue)",
  "color-mix(in srgb, red -10%, blue)",
  "color-mix(in srgb, red 101%, blue)",
  "color-mix(in srgb longer hue, red, blue)",
  "color-mix(in srgb, red,,blue)",
]) {
  test("rejects " + value, async ({ page }) => {
    expect(await page.evaluate((css) => CSS.supports("color", css), value)).toBe(false);
    expect(parseCssColor(value)).toBeNull();
  });
}
