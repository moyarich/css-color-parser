const source = ".card {\n  color: color-mix(\n    in srgb,\n    color-mix(in srgb, red, blue),\n    rgb(from white r g b)\n  );\n\n  border-color: color-mix(\n    in oklch,\n    oklch(65% 0.18 30) 35%,\n    hsl(from rebeccapurple calc(h + 45) s l)\n  );\n}";

export default source;
