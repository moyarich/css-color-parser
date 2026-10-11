import { parseCssColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function Example() {
  return (
    <FunctionExample
      params={[
        {
          name: "value",
          label: "CSS color value",
          type: "text",
          defaultValue: "oklch(60% 0.15 250)",
        },
      ]}
      samples={[
        { label: "Hex with alpha", values: ["#635bff80"] },
        { label: "RGB", values: ["rgb(255 120 80 / 50%)"] },
        { label: "Color mix", values: ["color-mix(in srgb, red 40%, blue)"] },
        { label: "Invalid", values: ["not-a-color"] },
      ]}
      run={parseCssColor}
    />
  );
}
