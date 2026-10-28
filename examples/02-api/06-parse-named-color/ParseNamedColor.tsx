import { parseNamedColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function ParseNamedColor() {
  return (
    <FunctionExample
      params={[
        {
          name: "value",
          label: "Named color",
          type: "text",
          defaultValue: "rebeccapurple",
        },
      ]}
      run={parseNamedColor}
    />
  );
}
