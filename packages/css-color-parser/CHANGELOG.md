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

- Update the README and playground examples to demonstrate the expanded syntax.
- Add exact RGBA regression tests for weighted lists, transparency, rounding boundaries, malformed input, and source extraction.
- Add Playwright comparisons against Chromium-rendered colors, including compositing on black and white backgrounds. Newer syntax is explicitly skipped when the browser does not support it; browser CI verification is pending.

### Limitations

- Calculated mix percentages and custom interpolation spaces are not supported.
- Advanced color inputs and nested results still use the existing 8-bit sRGB representation; wide-gamut clipping and quantization can affect results.
- All-zero weights are rejected.

## 0.1.0

### Added

- Parse CSS color values and extract colors from CSS content.
- Support modern CSS color notations and color conversion utilities.
