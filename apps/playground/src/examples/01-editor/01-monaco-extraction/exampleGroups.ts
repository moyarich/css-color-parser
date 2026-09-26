export interface MonacoExampleGroup {
  id: string;
  label: string;
  description: string;
  source: string;
}

export const monacoExampleGroups: readonly MonacoExampleGroup[] = [
  {
    id: "basic-colors",
    label: "Basic Colors",
    description: "Hex, RGB, HSL, named colors, and transparent.",
    source: `:root {
  --hex-short: #06c;
  --hex-alpha: #ff006680;
  --rgb-modern: rgb(255 0 127 / 50%);
  --rgb-legacy: rgba(0, 128, 255, 0.75);
  --hsl: hsl(120 100% 25% / 50%);
  --named: rebeccapurple;
  --transparent: transparent;
}`,
  },
  {
    id: "css-color-4",
    label: "CSS Color 4",
    description: "Modern color spaces supported by the parser.",
    source: `:root {
  --hwb: hwb(190 10% 15%);
  --lab: lab(50% 0 0);
  --lch: lch(55% 45 250);
  --oklab: oklab(60% 0.08 -0.08);
  --oklch: oklch(60% 0.15 250);
  --display-p3: color(display-p3 1 0.2 0.1);
}`,
  },
  {
    id: "color-mix",
    label: "Color Mix",
    description: "Weights, alpha, interpolation spaces, and hue modes.",
    source: `:root {
  --equal: color-mix(in srgb, red, blue);
  --weighted: color-mix(in srgb, red 25%, blue);
  --alpha: color-mix(in srgb, transparent, red);
  --oklch: color-mix(in oklch, red 40%, blue);
  --hue-mode: color-mix(in hsl longer hue, red, blue);
}`,
  },
  {
    id: "relative-colors",
    label: "Relative Colors",
    description: "Relative RGB, HSL, and OKLab colors including calc().",
    source: `:root {
  --rgb-relative: rgb(from #123456 r g b / 50%);
  --hsl-relative: hsl(from red calc(h + 120) s l);
  --oklab-relative: oklab(from green l a b / 0.5);
  --rgb-calc: rgb(calc(100 + 155) 0 0);
}`,
  },
  {
    id: "nested-expressions",
    label: "Nested Expressions",
    description: "Nested mixes and multiline color expressions.",
    source: `.card {
  color: color-mix(
    in srgb,
    color-mix(in srgb, red, blue),
    rgb(from white r g b)
  );

  border-color: color-mix(
    in oklch,
    oklch(65% 0.18 30) 35%,
    hsl(from rebeccapurple calc(h + 45) s l)
  );
}`,
  },
  {
    id: "source-extraction",
    label: "Source Extraction",
    description: "Multiple colors, gradients, source offsets, and UTF-16 text.",
    source: `/* 🎨 source offsets are UTF-16 */
.hero {
  color: #06c;
  border-color: rgb(255 0 0 / 50%);
  background: linear-gradient(
    135deg,
    rebeccapurple,
    oklch(60% 0.15 250),
    hwb(190 10% 15%)
  );
}`,
  },
  {
    id: "editor-edge-cases",
    label: "Editor Edge Cases",
    description: "Incomplete expressions, identifiers, and function-name boundaries.",
    source: `.red-button {
  color: red;
}

.example {
  color: color-mix(in srgb, red, blue;
  background: #06c;
  transform: rotate(calc(tan(45deg)));
  outline-color: tan;
}

.my-oklch-token {
  --value: my-oklch(60% 0.15 250);
}`,
  },
  {
    id: "unresolved-invalid",
    label: "Unresolved / Invalid Colors",
    description: "Context-dependent and malformed values that should remain unresolved.",
    source: `:root {
  --custom-property: var(--brand);
  --current: currentColor;
  --bad-hex: #fffff;
  --bad-rgb: rgb(1 2);
  --bad-hsl: hsl(20 30 40);
  --bad-mix: color-mix(in srgb, var(--brand), red);
  --bad-space: color-mix(in imaginary, red, blue);
  --contextual: light-dark(red, blue);
}`,
  },
];
