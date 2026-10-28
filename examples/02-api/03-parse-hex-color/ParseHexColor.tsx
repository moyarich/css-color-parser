import { parseHexColor } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function ParseHexColor() {
  return (
    <FunctionExample
      params={[
        {
          name: "value",
          label: "Hex color",
          type: "text",
          defaultValue: "#06c",
        },
      ]}
      run={parseHexColor}
    />
  );
}
