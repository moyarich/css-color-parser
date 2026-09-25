import { parseHue } from "@moyarich/css-color-parser";
import { FunctionExample } from "../../../components/FunctionExample";

export default function ParseHue() {
  return <FunctionExample params={[{ name: "value", label: "Hue", type: "text", defaultValue: "0.5turn" }]} run={parseHue} />;
}
