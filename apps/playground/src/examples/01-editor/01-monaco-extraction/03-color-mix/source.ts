const source = ":root {\n  --equal: color-mix(in srgb, red, blue);\n  --weighted: color-mix(in srgb, red 25%, blue);\n  --alpha: color-mix(in srgb, transparent, red);\n  --oklch: color-mix(in oklch, red 40%, blue);\n  --hue-mode: color-mix(in hsl longer hue, red, blue);\n}";

export default source;
