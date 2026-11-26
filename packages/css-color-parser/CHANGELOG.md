# Changelog

## Unreleased

Changes since November 25, 2026.

### Added

- Extend `color-mix()` to accept a single color or a list of two or more colors, with optional percentages before or after each color.
- Default to OKLab when the interpolation space is omitted; retain explicit rectangular and polar color spaces and hue interpolation methods.
- Resolve omitted weights, normalize totals above 100%, and apply an alpha multiplier when explicitly specified weights total less than 100%.

```css
color-mix(red, blue)
color-mix(in srgb, red)
color-mix(in srgb, 20% red, lime 30%, blue)
color-mix(in hsl longer hue, red, blue, lime)
```

### Fixed

- Use direct premultiplied weighted sums for rectangular color spaces to avoid accumulating rounding errors during multi-color interpolation.
- Preserve the existing RGBA output contract, custom-property resolution, and complete source ranges for nested color mixes.

### Documentation and testing

- Update the README to demonstrate the expanded syntax.
- Add exact RGBA regression tests for weighted lists, transparency, rounding boundaries, malformed input, and source extraction.
- Add Playwright comparisons against Chromium-rendered colors, including compositing on black and white backgrounds. Newer syntax is explicitly skipped when the browser does not support it; browser CI verification is pending.

### Limitations

- Calculated mix percentages and custom interpolation spaces are not supported.
- Advanced color inputs and nested results still use the existing 8-bit sRGB representation; wide-gamut clipping and quantization can affect results.
- All-zero weights are rejected.

## 0.1.0

Initial release. Includes changes through November 24, 2026, based on commit [`b70bb77`](https://github.com/moyarich/css-color-parser/commit/b70bb77df5007b75cff04b3a475564c2a006d6e9).

### Added

- Framework-independent JavaScript and TypeScript API for parsing CSS colors into RGBA values, with no browser DOM or editor dependency.
- Classic color syntax: short and long hex (including alpha), named colors, transparent, RGB/RGBA, and HSL/HSLA.
- Modern color syntax: HWB, Lab, LCH, OKLab, OKLCH, and predefined `color()` spaces, including Display-P3.
- Two-color `color-mix()` with an explicit interpolation space, optional percentage weights, alpha handling, hue interpolation, and nested mixes.
- Relative color expressions and resolvable `calc()` channels.
- `parseCssColor()` and `extractCssColors()`, including original expression text, format, RGBA data, and UTF-16 source offsets.
- `formatCssColor()` for normalized RGB and hex serialization, including alpha.
- `resolveCssVariables()` and custom-property contexts for parsing and extraction, backed by the shared `@moyarich/css-expand-collapse` resolver. Supports aliases, fallbacks, nested references, and cycle handling.
- Public TypeScript types, named-color lookup table, and low-level parsing and conversion helpers.

### Behavior

- Extract complete nested expressions without overlapping matches; skip unresolved mixes rather than presenting their arguments as the computed result.
- Preserve floating-point precision for simple RGB and HSL values. Advanced colors use the existing `color-bits` 8-bit sRGB conversion; wide-gamut colors may be clipped.
- Return `null` for invalid or context-dependent colors that cannot be resolved from supplied information.

### Packaging and documentation

- ESM and CommonJS builds with TypeScript declarations and GitHub Packages publishing configuration.
- Vitest regression coverage and workspace build/type-check commands.

### Usage

```ts
import {
  parseCssColor,
  extractCssColors,
  formatCssColor,
} from "@moyarich/css-color-parser";

const parsed = parseCssColor("color-mix(in srgb, red 25%, blue)");
if (parsed) formatCssColor(parsed.color, { format: "hex" });
extractCssColors("a { color: var(--brand); }", {
  customProperties: { "--brand": "#06c" },
});
```
