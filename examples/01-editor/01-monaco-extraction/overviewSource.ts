const source = ":root {\n  --brand: #06c;\n  --accent: color-mix(in oklch, rebeccapurple 60%, white);\n}\n\n.button {\n  color: oklch(60% 0.15 250);\n  border-color: rgb(255 0 0 / 50%);\n  background: linear-gradient(135deg, #fff, hwb(190 10% 15%));\n}";

export default source;
