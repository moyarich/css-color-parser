const source = ":root {\n  --rgb-relative: rgb(from #123456 r g b / 50%);\n  --hsl-relative: hsl(from red calc(h + 120) s l);\n  --oklab-relative: oklab(from green l a b / 0.5);\n  --rgb-calc: rgb(calc(100 + 155) 0 0);\n}";

export default source;
