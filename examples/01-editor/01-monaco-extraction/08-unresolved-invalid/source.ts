const source = ":root {\n  --custom-property: var(--brand);\n  --current: currentColor;\n  --bad-hex: #fffff;\n  --bad-rgb: rgb(1 2);\n  --bad-hsl: hsl(20 30 40);\n  --bad-mix: color-mix(in srgb, var(--brand), red);\n  --bad-space: color-mix(in imaginary, red, blue);\n  --contextual: light-dark(red, blue);\n}";

export default source;
