# @moyarich/css-color-parser

Framework-agnostic CSS color parsing and source extraction utilities for JavaScript and TypeScript.

`css` · `css-color-4` · `color-parser` · `color-mix` · `oklch` · `oklab` · `typescript`

The package parses CSS color values into RGBA data and can scan arbitrary source text for supported colors while preserving exact UTF-16 source offsets. It has no dependency on VS Code, Monaco, React, or browser DOM APIs.

## Features

- Parse classic and modern CSS color syntax.
- Resolve CSS Color 4 formats such as OKLCH, OKLab, Lab, LCH, HWB, and `color()`.
- Resolve `color-mix()`, including nested mixes, weights, alpha, and hue interpolation.
- Parse relative colors and `calc()` channels when they can be resolved without CSS cascade context.
- Extract complete color expressions from source text without overlapping nested argument ranges.
- Return editor-friendly UTF-16 `start` and `end` offsets.
- Preserve floating-point precision for simple RGB and HSL values.
- Stay independent of any editor, UI framework, or DOM runtime.

## Install

Until a package release is published, install directly from GitHub:

```bash
npm install github:moyarich/css-color-parser
```

Then import from the package normally:

```ts
import {
  extractCssColors,
  parseCssColor,
} from "@moyarich/css-color-parser";
```

## Parse a color

```ts
import { parseCssColor } from "@moyarich/css-color-parser";

parseCssColor("#06c");
```

Returns:

```ts
{
  value: "#06c",
  format: "hex",
  color: {
    red: 0,
    green: 102,
    blue: 204,
    alpha: 1,
  },
}
```

Modern CSS color functions work too:

```ts
parseCssColor("color-mix(in srgb, red, blue)");
// {
//   value: "color-mix(in srgb, red, blue)",
//   format: "color-mix",
//   color: { red: 128, green: 0, blue: 128, alpha: 1 },
// }

parseCssColor("oklch(60% 0.15 250)");
parseCssColor("oklab(from green l a b / 0.5)");
parseCssColor("hsl(from red calc(h + 120) s l)");
```

## Extract colors from source

```ts
import { extractCssColors } from "@moyarich/css-color-parser";

const source = `
.button {
  color: #06c;
  background: color-mix(in oklch, rebeccapurple 60%, white);
}
`;

const colors = extractCssColors(source);
```

Each match contains the original value, parsed format, RGBA color, and absolute UTF-16 offsets:

```ts
[
  {
    value: "#06c",
    start: 20,
    end: 24,
    format: "hex",
    color: {
      red: 0,
      green: 102,
      blue: 204,
      alpha: 1,
    },
  },
  // ...
]
```

A complete supported function is returned as one range. Nested colors inside that function are not emitted as overlapping matches.

That behavior is useful for editor integrations because replacing a color can replace the entire expression rather than one of its internal arguments.

## Supported color syntax

### Basic colors

- `#rgb`
- `#rgba`
- `#rrggbb`
- `#rrggbbaa`
- `rgb()`
- `rgba()`
- `hsl()`
- `hsla()`
- CSS named colors
- `transparent`

### CSS Color 4

- `hwb()`
- `lab()`
- `lch()`
- `oklab()`
- `oklch()`
- `color()`
- `color-mix()`
- relative color functions
- `calc()` channels inside resolvable color functions

Examples:

```css
hwb(190 10% 15%)
lab(60% 35 -40)
lch(60% 50 300)
oklch(60% 0.15 250)
color(display-p3 0.9 0.2 0.4)

color-mix(in srgb, red, blue)
color-mix(in oklch, red 40%, blue)
color-mix(in hsl longer hue, red, blue)

oklab(from green l a b / 0.5)
hsl(from red calc(h + 120) s l)
rgb(from #123456 r g b / 50%)
```

Advanced color functions are evaluated with [color-bits](https://github.com/romgrk/color-bits) and converted to 8-bit sRGB values. Wide-gamut values may therefore be clipped to sRGB.

## Context-dependent colors

The parser intentionally does not evaluate CSS cascade or DOM-dependent values.

These return `null` when a single color cannot be resolved without external context:

```css
var(--brand)
currentColor
Canvas
light-dark(red, blue)
color-mix(in srgb, var(--brand), white)
```

When extracting from a larger expression such as a gradient or `light-dark()`, independently resolvable literal arguments can still be discovered.

## API

### `parseCssColor(value)`

Parses one complete CSS color value.

Returns a `ParsedCssColor` or `null`.

### `extractCssColors(source)`

Finds supported colors inside arbitrary source text.

Returns `CssColorMatch[]` with UTF-16 `start` and `end` offsets.

### `CSS_NAMED_COLORS`

Exports the built-in named-color lookup table.

### Types

The package exports:

- `ParsedCssColor`
- `CssColorFormat`
- `CssColorMatch`
- `RgbaColor`

## Development

This repository is an npm workspace. The publishable parser stays at the repository root, while browser-facing development tools live under `apps/*`.

```text
src/             package source
tests/           root parser tests
apps/playground/ Vite workspace for exercising the public package API
```

Install every workspace dependency and run the same checks used by CI:

```bash
npm install
npm run check
```

Run the playground locally:

```bash
npm run dev:playground
```

Useful root scripts:

```bash
npm run typecheck
npm test
npm run test:watch
npm run build
npm run check:root
npm run check:workspaces
npm run check
```

`npm test` explicitly runs the root `tests/` suite. `npm run check` validates the root package first, then each workspace that provides a `check` script.

## License

MIT
