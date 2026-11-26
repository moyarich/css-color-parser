import { describe, expect, it } from "vitest";
import { extractCssColors, parseCssColor } from "../src/index";

describe("CSS Color 5 color-mix lists", () => {
  it("defaults to oklab", () => {
    const explicit = parseCssColor("color-mix(in oklab, red, blue)");
    expect(explicit).not.toBeNull();
    expect(parseCssColor("color-mix(red, blue)")?.color).toEqual(explicit?.color);
  });

  it.each([
    ["color-mix(in srgb, red)", [255, 0, 0, 1]],
    ["color-mix(in srgb, 40% red)", [255, 0, 0, 0.4]],
    ["color-mix(in srgb, red, lime, blue)", [85, 85, 85, 1]],
    ["color-mix(in srgb, 20% red, lime 30%, blue)", [51, 77, 128, 1]],
    ["color-mix(in srgb, red 50%, lime, blue)", [128, 64, 64, 1]],
    ["color-mix(in srgb, red 20%, lime 20%, blue 20%)", [85, 85, 85, 0.6]],
    ["color-mix(in srgb, red 100%, lime 100%, blue 100%)", [85, 85, 85, 1]],
    ["color-mix(in srgb, red, transparent, blue)", [128, 0, 128, 170 / 255]],
    ["color-mix(in srgb, red, lime, blue, white)", [128, 128, 128, 1]],
    ["color-mix(in srgb, color-mix(in srgb, red, red, red), blue)", [128, 0, 128, 1]],
  ] as const)("resolves %s", (value, [red, green, blue, alpha]) => {
    const parsed = parseCssColor(value);
    expect(parsed).toMatchObject({ value, format: "color-mix" });
    expect(parsed?.color.red).toBeCloseTo(red, 0);
    expect(parsed?.color.green).toBeCloseTo(green, 0);
    expect(parsed?.color.blue).toBeCloseTo(blue, 0);
    expect(parsed?.color.alpha).toBeCloseTo(alpha, 5);
  });

  it.each([
    "color-mix()",
    "color-mix(in srgb)",
    "color-mix(in srgb,)",
    "color-mix(red,,blue)",
    "color-mix(red, blue,)",
    "color-mix(red 101%, blue)",
    "color-mix(red -1%, blue)",
    "color-mix(red 10% 20%, blue)",
    "color-mix(in srgb longer hue, red, blue)",
    "color-mix(in imaginary, red)",
    "color-mix(red, currentColor, blue)",
    "color-mix(in srgb, red, lime, blue) trailing",
  ])("rejects %s", (value) => {
    expect(parseCssColor(value)).toBeNull();
  });

  it("preserves the complete source range with custom properties", () => {
    const value = "color-mix(in srgb, var(--brand), lime, blue)";
    const source = "/* 🎨 */ color: " + value + ";";
    const matches = extractCssColors(source, {
      customProperties: { "--brand": "red" },
    });
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      value,
      start: source.indexOf(value),
      end: source.indexOf(value) + value.length,
      color: { red: 85, green: 85, blue: 85, alpha: 1 },
    });
  });
});
