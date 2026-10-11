import { parsePercentage } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../apps/playground/src/components/FunctionExample/FunctionExample";

export default function ParsePercentage() {
  return <FunctionExample params={[{ name: "value", label: "Percentage", type: "text", defaultValue: "62.5%" }]} run={parsePercentage} />;
}
