import { extractCssColors } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function Example() {
  return (
    <FunctionExample
      params={[
        {
          name: "source",
          label: "CSS source",
          type: "text",
          multiline: true,
          defaultValue: "color: #06c; background: rebeccapurple;",
        },
      ]}
      samples={[
        {
          label: "Gradient",
          values: [
            "background: linear-gradient(90deg, #635bff, oklch(72% 0.16 210));",
          ],
        },
        {
          label: "Repeated colors",
          values: ["border: 1px solid red; color: red;"],
        },
        {
          label: "Unresolved variable",
          values: ["color: var(--brand); background: #fff;"],
        },
      ]}
      run={extractCssColors}
    />
  );
}
