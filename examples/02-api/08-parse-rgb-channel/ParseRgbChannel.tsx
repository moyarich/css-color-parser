import { parseRgbChannel } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function ParseRgbChannel() {
  return (
    <FunctionExample
      params={[
        {
          name: "value",
          label: "RGB channel",
          type: "text",
          defaultValue: "50%",
        },
      ]}
      run={parseRgbChannel}
    />
  );
}
